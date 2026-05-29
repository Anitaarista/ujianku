import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

// GET: Exam detail with questions
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
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guru: { select: { id: true, name: true, email: true } },
        examKelas: {
          include: { kelas: { select: { id: true, nama: true, tingkat: true } } },
        },
        examSoal: {
          include: {
            bankSoal: {
              select: {
                id: true,
                tipeSoal: true,
                tingkatKesulitan: true,
                poin: true,
                // Don't include answers for students
              },
            },
          },
          orderBy: { urutan: 'asc' },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ujian tidak ditemukan' } },
        { status: 404 }
      );
    }

    // For SISWA, don't show correct answers
    if (auth.user!.role === 'SISWA') {
      const sanitizedExamSoal = exam.examSoal.map((es) => ({
        ...es,
        bankSoal: {
          id: es.bankSoal.id,
          tipeSoal: es.bankSoal.tipeSoal,
          tingkatKesulitan: es.bankSoal.tingkatKesulitan,
          poin: es.bankSoal.poin,
        },
      }));
      (exam as Record<string, unknown>).examSoal = sanitizedExamSoal;
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error('Exam detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
