import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List guru's questions
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru yang dapat melihat daftar soal mereka' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const mataPelajaranId = searchParams.get('subject');
    const tipeSoal = searchParams.get('type');
    const tingkatKesulitan = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      guruId: auth.userId,
    };

    if (mataPelajaranId) where.mataPelajaranId = mataPelajaranId;
    if (tipeSoal) where.tipeSoal = tipeSoal;
    if (tingkatKesulitan) where.tingkatKesulitan = tingkatKesulitan;
    if (search) where.pertanyaan = { contains: search };

    const [questions, total] = await Promise.all([
      db.bankSoal.findMany({
        where,
        include: {
          mataPelajaran: { select: { id: true, nama: true, kode: true } },
          _count: { select: { examSoal: true, jawaban: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.bankSoal.count({ where }),
    ]);

    // Summary stats
    const [totalQuestions, byType, byDifficulty] = await Promise.all([
      db.bankSoal.count({ where: { guruId: auth.userId } }),
      db.bankSoal.groupBy({
        by: ['tipeSoal'],
        where: { guruId: auth.userId },
        _count: true,
      }),
      db.bankSoal.groupBy({
        by: ['tingkatKesulitan'],
        where: { guruId: auth.userId },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...paginatedResponse(questions, total, page, limit),
        summary: {
          totalQuestions,
          byType: byType.map((b) => ({ type: b.tipeSoal, count: b._count })),
          byDifficulty: byDifficulty.map((b) => ({
            difficulty: b.tingkatKesulitan,
            count: b._count,
          })),
        },
      },
    });
  } catch (error) {
    console.error('List guru bank soal error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
