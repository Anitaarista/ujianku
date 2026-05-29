import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List available exams for student
export async function GET(request: NextRequest) {
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat melihat ujian tersedia' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get student's classes
    const siswaKelas = await db.siswaKelas.findMany({
      where: { siswaId: auth.userId },
      select: { kelasId: true },
    });
    const kelasIds = siswaKelas.map((sk) => sk.kelasId);

    if (kelasIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: paginatedResponse([], 0, page, limit),
      });
    }

    const where: Record<string, unknown> = {
      examKelas: { some: { kelasId: { in: kelasIds } } },
    };

    // Default: show published and ongoing exams
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['PUBLISHED', 'ONGOING', 'SELESAI'] };
    }

    const [exams, total] = await Promise.all([
      db.exam.findMany({
        where,
        include: {
          mataPelajaran: { select: { id: true, nama: true, kode: true } },
          guru: { select: { id: true, name: true } },
          examKelas: {
            include: { kelas: { select: { id: true, nama: true } } },
          },
          _count: { select: { examSoal: true } },
        },
        skip,
        take: limit,
        orderBy: { tanggalMulai: 'asc' },
      }),
      db.exam.count({ where }),
    ]);

    // Add participation status for each exam
    const examsWithStatus = await Promise.all(
      exams.map(async (exam) => {
        const participation = await db.examParticipant.findFirst({
          where: {
            examId: exam.id,
            siswaId: auth.userId,
          },
          orderBy: { attempt: 'desc' },
          select: {
            id: true,
            status: true,
            attempt: true,
            nilai: true,
            mulaiPada: true,
            selesaiPada: true,
          },
        });

        const now = new Date();
        const canStart =
          (exam.status === 'PUBLISHED' || exam.status === 'ONGOING') &&
          (!participation || participation.status === 'TERDAFTAR');

        const isOngoing = participation?.status === 'MULAI';

        return {
          ...exam,
          participation,
          canStart,
          isOngoing,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: paginatedResponse(examsWithStatus, total, page, limit),
    });
  } catch (error) {
    console.error('List siswa exams error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
