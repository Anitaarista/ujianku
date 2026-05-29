import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: Exam results for guru's exams
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'GURU', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru yang dapat melihat hasil ujian' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const status = searchParams.get('status');

    // Get guru's exam IDs
    const guruExams = await db.exam.findMany({
      where: { guruId: auth.userId },
      select: { id: true },
    });
    const guruExamIds = guruExams.map((e) => e.id);

    if (guruExamIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: paginatedResponse([], 0, page, limit),
      });
    }

    const where: Record<string, unknown> = {
      examId: { in: guruExamIds },
    };

    if (examId) where.examId = examId;
    if (status) where.status = status;

    const [results, total] = await Promise.all([
      db.examParticipant.findMany({
        where,
        include: {
          exam: {
            select: {
              id: true,
              judul: true,
              tipeExam: true,
              status: true,
              mataPelajaran: { select: { nama: true, kode: true } },
            },
          },
          siswa: { select: { id: true, name: true, email: true, nipNis: true } },
          _count: { select: { jawaban: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.examParticipant.count({ where }),
    ]);

    // Calculate summary stats
    const completedResults = results.filter(
      (r) => r.status === 'SELESAI' || r.status === 'TIMEOUT'
    );
    const scores = completedResults
      .map((r) => r.nilai)
      .filter((s): s is number => s !== null);

    const summaryStats = {
      totalResults: total,
      completedCount: completedResults.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      highestScore: scores.length > 0 ? Math.max(...scores) : null,
      lowestScore: scores.length > 0 ? Math.min(...scores) : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...paginatedResponse(results, total, page, limit),
        summary: summaryStats,
      },
    });
  } catch (error) {
    console.error('List guru results error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
