import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List guru's exams
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru yang dapat melihat daftar ujian mereka' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tipeExam = searchParams.get('type');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      guruId: auth.userId,
    };

    if (status) where.status = status;
    if (tipeExam) where.tipeExam = tipeExam;
    if (search) where.judul = { contains: search };

    const [exams, total] = await Promise.all([
      db.exam.findMany({
        where,
        include: {
          mataPelajaran: { select: { id: true, nama: true, kode: true } },
          examKelas: {
            include: { kelas: { select: { id: true, nama: true, tingkat: true } } },
          },
          _count: {
            select: {
              examSoal: true,
              participants: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.exam.count({ where }),
    ]);

    // Add participant completion stats
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const completedParticipants = await db.examParticipant.count({
          where: {
            examId: exam.id,
            status: { in: ['SELESAI', 'TIMEOUT'] },
          },
        });

        const avgScore = await db.examParticipant.aggregate({
          where: {
            examId: exam.id,
            nilai: { not: null },
          },
          _avg: { nilai: true },
        });

        return {
          ...exam,
          stats: {
            completedParticipants,
            averageScore: avgScore._avg.nilai,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: paginatedResponse(examsWithStats, total, page, limit),
    });
  } catch (error) {
    console.error('List guru exams error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
