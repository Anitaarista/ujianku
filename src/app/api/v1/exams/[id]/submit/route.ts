import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// POST: Submit/finish exam
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat menyelesaikan ujian' } },
        { status: 403 }
      );
    }

    const { id } = await params;

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
        { status: 400 }
      );
    }

    const now = new Date();
    const durasiDetik = Math.floor(
      (now.getTime() - participant.mulaiPada!.getTime()) / 1000
    );

    // Calculate score
    const answers = await db.jawaban.findMany({
      where: { participantId: participant.id },
      include: {
        bankSoal: { select: { poin: true, tipeSoal: true, jawabanBenar: true } },
      },
    });

    const totalQuestions = await db.examSoal.count({ where: { examId: id } });
    const answeredQuestions = answers.filter((a) => a.jawaban).length;

    // Calculate scores for auto-gradable questions
    const autoGradableAnswers = answers.filter(
      (a) => a.bankSoal.tipeSoal === 'PILIHAN_GANDA' || a.bankSoal.tipeSoal === 'BENAR_SALAH'
    );
    const correctAnswers = autoGradableAnswers.filter((a) => a.isCorrect).length;
    const totalAutoGradablePoin = autoGradableAnswers.reduce((sum, a) => sum + a.bankSoal.poin, 0);
    const earnedPoin = autoGradableAnswers.reduce((sum, a) => sum + a.poin, 0);

    // Calculate percentage score for auto-gradable part
    let nilai: number | null = null;
    if (totalAutoGradablePoin > 0) {
      nilai = Math.round((earnedPoin / totalAutoGradablePoin) * 100 * 100) / 100;
    }

    // Check if there are essay questions that need manual grading
    const hasEssay = answers.some(
      (a) =>
        a.bankSoal.tipeSoal === 'ESSAY' ||
        a.bankSoal.tipeSoal === 'JAWABAN_SINGKAT' ||
        a.bankSoal.tipeSoal === 'MENJODOKKAN'
    );

    // Update participant
    const updatedParticipant = await db.examParticipant.update({
      where: { id: participant.id },
      data: {
        status: 'SELESAI',
        selesaiPada: now,
        durasi: durasiDetik,
        nilai: hasEssay ? null : nilai,
        totalNilai: hasEssay ? null : nilai,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        participant: updatedParticipant,
        summary: {
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          autoGradableTotal: autoGradableAnswers.length,
          nilai: hasEssay ? null : nilai,
          needsManualGrading: hasEssay,
          durasiDetik,
        },
      },
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
