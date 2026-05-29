import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// POST: Start exam (creates participant record)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'SISWA')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat memulai ujian' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        examKelas: true,
        examSoal: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ujian tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Check exam status
    if (exam.status !== 'ONGOING' && exam.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: { code: 'EXAM_NOT_AVAILABLE', message: 'Ujian tidak tersedia untuk dikerjakan' } },
        { status: 400 }
      );
    }

    // Check if student is in the assigned class
    const siswaKelas = await db.siswaKelas.findFirst({
      where: {
        siswaId: auth.userId,
        kelasId: { in: exam.examKelas.map((ek) => ek.kelasId) },
      },
    });

    if (!siswaKelas) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_ASSIGNED', message: 'Anda tidak terdaftar di kelas untuk ujian ini' } },
        { status: 403 }
      );
    }

    // Check token if required
    if (exam.token) {
      const body = await request.json();
      if (body.token !== exam.token) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_TOKEN', message: 'Token ujian tidak valid' } },
          { status: 400 }
        );
      }
    }

    // Check existing participation
    const existingParticipation = await db.examParticipant.findFirst({
      where: {
        examId: id,
        siswaId: auth.userId,
      },
      orderBy: { attempt: 'desc' },
    });

    if (existingParticipation) {
      if (existingParticipation.status === 'MULAI') {
        // Already started - return existing participation
        return NextResponse.json({
          success: true,
          data: {
            participant: existingParticipation,
            message: 'Ujian sudah dimulai sebelumnya',
          },
        });
      }

      if (existingParticipation.status === 'SELESAI') {
        // Check if can retry
        if (existingParticipation.attempt >= exam.maxAttempt) {
          return NextResponse.json(
            { success: false, error: { code: 'MAX_ATTEMPT', message: 'Anda sudah mencapai batas percobaan maksimum' } },
            { status: 400 }
          );
        }
      }
    }

    const nextAttempt = (existingParticipation?.attempt || 0) + 1;

    // Create participant record
    const participant = await db.examParticipant.create({
      data: {
        examId: id,
        siswaId: auth.userId,
        status: 'MULAI',
        mulaiPada: new Date(),
        attempt: nextAttempt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        participant,
        exam: {
          id: exam.id,
          judul: exam.judul,
          durasi: exam.durasi,
          tanggalSelesai: exam.tanggalSelesai,
          acakSoal: exam.acakSoal,
          acakOpsi: exam.acakOpsi,
          antiCheat: exam.antiCheat,
          totalSoal: exam.examSoal.length,
        },
      },
    });
  } catch (error) {
    console.error('Start exam error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
