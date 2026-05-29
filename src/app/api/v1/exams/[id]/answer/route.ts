import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// POST: Submit answer for a question
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat menjawab soal' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { bankSoalId, jawaban } = body;

    if (!bankSoalId || !jawaban) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'bankSoalId dan jawaban wajib diisi' } },
        { status: 400 }
      );
    }

    // Find active participation
    const participant = await db.examParticipant.findFirst({
      where: {
        examId: id,
        siswaId: auth.userId,
        status: 'MULAI',
      },
      orderBy: { attempt: 'desc' },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_PARTICIPATING', message: 'Anda belum memulai ujian ini' } },
        { status: 403 }
      );
    }

    // Check time limit
    const exam = await db.exam.findUnique({ where: { id } });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ujian tidak ditemukan' } },
        { status: 404 }
      );
    }

    const now = new Date();
    const endTime = new Date(participant.mulaiPada!.getTime() + exam.durasi * 60 * 1000);
    if (now > endTime) {
      return NextResponse.json(
        { success: false, error: { code: 'TIMEOUT', message: 'Waktu ujian telah habis' } },
        { status: 400 }
      );
    }

    // Verify the question belongs to this exam
    const examSoal = await db.examSoal.findFirst({
      where: { examId: id, bankSoalId },
    });

    if (!examSoal) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_QUESTION', message: 'Soal tidak ditemukan dalam ujian ini' } },
        { status: 400 }
      );
    }

    // Get the correct answer for auto-grading
    const bankSoal = await db.bankSoal.findUnique({
      where: { id: bankSoalId },
      select: { jawabanBenar: true, poin: true, tipeSoal: true },
    });

    // Auto-grade for multiple choice
    let isCorrect: boolean | null = null;
    let poin = 0;

    if (bankSoal && bankSoal.tipeSoal === 'PILIHAN_GANDA') {
      isCorrect = bankSoal.jawabanBenar === jawaban;
      poin = isCorrect ? bankSoal.poin : 0;
    } else if (bankSoal && bankSoal.tipeSoal === 'BENAR_SALAH') {
      isCorrect = bankSoal.jawabanBenar === jawaban;
      poin = isCorrect ? bankSoal.poin : 0;
    }
    // Essay and other types: manual grading, don't auto-grade

    // Upsert answer
    const answer = await db.jawaban.upsert({
      where: {
        participantId_bankSoalId: {
          participantId: participant.id,
          bankSoalId,
        },
      },
      update: {
        jawaban,
        isCorrect,
        poin,
        waktuJawab: new Date(),
      },
      create: {
        participantId: participant.id,
        bankSoalId,
        jawaban,
        isCorrect,
        poin,
        waktuJawab: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: answer });
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
