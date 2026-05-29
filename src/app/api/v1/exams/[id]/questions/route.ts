import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// GET: Get exam questions (only for active participants)
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

    // For students: verify they have active participation
    if (hasRole(auth.user!, 'SISWA')) {
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
        // Auto-submit on timeout
        await db.examParticipant.update({
          where: { id: participant.id },
          data: {
            status: 'TIMEOUT',
            selesaiPada: now,
            durasi: Math.floor((now.getTime() - participant.mulaiPada!.getTime()) / 1000),
          },
        });
        return NextResponse.json(
          { success: false, error: { code: 'TIMEOUT', message: 'Waktu ujian telah habis' } },
          { status: 400 }
        );
      }
    }

    // Fetch exam questions
    const examSoal = await db.examSoal.findMany({
      where: { examId: id },
      include: {
        bankSoal: {
          select: {
            id: true,
            tipeSoal: true,
            pertanyaan: true,
            opsiA: true,
            opsiB: true,
            opsiC: true,
            opsiD: true,
            opsiE: true,
            poin: true,
            gambar: true,
            tingkatKesulitan: true,
            // Don't include jawabanBenar for students
          },
        },
      },
      orderBy: { urutan: 'asc' },
    });

    // For non-students, include answers
    if (!hasRole(auth.user!, 'SISWA')) {
      const examSoalWithAnswers = await db.examSoal.findMany({
        where: { examId: id },
        include: {
          bankSoal: {
            select: {
              id: true,
              tipeSoal: true,
              pertanyaan: true,
              opsiA: true,
              opsiB: true,
              opsiC: true,
              opsiD: true,
              opsiE: true,
              jawabanBenar: true,
              pembahasan: true,
              poin: true,
              gambar: true,
              tingkatKesulitan: true,
            },
          },
        },
        orderBy: { urutan: 'asc' },
      });
      return NextResponse.json({ success: true, data: examSoalWithAnswers });
    }

    // Get existing answers for this participant
    const participant = await db.examParticipant.findFirst({
      where: {
        examId: id,
        siswaId: auth.userId,
        status: 'MULAI',
      },
      orderBy: { attempt: 'desc' },
    });

    const existingAnswers = participant
      ? await db.jawaban.findMany({
          where: { participantId: participant.id },
          select: { bankSoalId: true, jawaban: true },
        })
      : [];

    const questionsWithAnswers = examSoal.map((es) => ({
      ...es,
      bankSoal: {
        ...es.bankSoal,
      },
      myAnswer: existingAnswers.find((a) => a.bankSoalId === es.bankSoalId)?.jawaban || null,
    }));

    return NextResponse.json({ success: true, data: questionsWithAnswers });
  } catch (error) {
    console.error('Get exam questions error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
