import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

// GET: Get exam result
export async function GET(
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    // Build where clause based on role
    let participantWhere: Record<string, unknown>;

    if (auth.user!.role === 'SISWA') {
      participantWhere = {
        examId: id,
        siswaId: auth.userId,
      };
    } else if (participantId) {
      participantWhere = {
        id: participantId,
        examId: id,
      };
    } else {
      // For guru/admin: get all participants
      const participants = await db.examParticipant.findMany({
        where: { examId: id },
        include: {
          siswa: { select: { id: true, name: true, email: true, nipNis: true } },
          jawaban: {
            include: {
              bankSoal: {
                select: {
                  id: true,
                  pertanyaan: true,
                  tipeSoal: true,
                  jawabanBenar: true,
                  pembahasan: true,
                  poin: true,
                  opsiA: true,
                  opsiB: true,
                  opsiC: true,
                  opsiD: true,
                  opsiE: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const exam = await db.exam.findUnique({
        where: { id },
        include: {
          mataPelajaran: { select: { nama: true, kode: true } },
          examSoal: { select: { id: true } },
        },
      });

      // Calculate statistics
      const completedParticipants = participants.filter((p) => p.status === 'SELESAI' || p.status === 'TIMEOUT');
      const scores = completedParticipants
        .map((p) => p.nilai)
        .filter((s): s is number => s !== null);

      const stats = {
        totalPeserta: participants.length,
        totalSelesai: completedParticipants.length,
        rataRata: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
        nilaiTertinggi: scores.length > 0 ? Math.max(...scores) : null,
        nilaiTerendah: scores.length > 0 ? Math.min(...scores) : null,
      };

      return NextResponse.json({
        success: true,
        data: {
          exam,
          participants,
          stats,
        },
      });
    }

    // Single participant (student or specific participant)
    const participant = await db.examParticipant.findFirst({
      where: participantWhere,
      orderBy: { attempt: 'desc' },
      include: {
        siswa: { select: { id: true, name: true, email: true, nipNis: true } },
        jawaban: {
          include: {
            bankSoal: {
              select: {
                id: true,
                pertanyaan: true,
                tipeSoal: true,
                jawabanBenar: true,
                pembahasan: true,
                poin: true,
                opsiA: true,
                opsiB: true,
                opsiC: true,
                opsiD: true,
                opsiE: true,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Hasil ujian tidak ditemukan' } },
        { status: 404 }
      );
    }

    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        mataPelajaran: { select: { nama: true, kode: true } },
        examSoal: { select: { id: true } },
      },
    });

    // For students: only show results if exam.showResult is true or exam is SELESAI
    if (
      auth.user!.role === 'SISWA' &&
      !exam?.showResult &&
      exam?.status !== 'SELESAI'
    ) {
      return NextResponse.json({
        success: true,
        data: {
          participant: {
            id: participant.id,
            status: participant.status,
            mulaiPada: participant.mulaiPada,
            selesaiPada: participant.selesaiPada,
            durasi: participant.durasi,
          },
          message: 'Hasil ujian belum tersedia',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        exam,
        participant,
      },
    });
  } catch (error) {
    console.error('Get exam result error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
