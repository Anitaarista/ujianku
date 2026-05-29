import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List student's results
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat melihat hasil ujian mereka' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      siswaId: auth.userId,
    };

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
              showResult: true,
              durasi: true,
              mataPelajaran: { select: { nama: true, kode: true } },
              guru: { select: { name: true } },
              _count: { select: { examSoal: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.examParticipant.count({ where }),
    ]);

    // Filter results - only show if exam.showResult or exam is SELESAI
    const filteredResults = results.map((result) => {
      const canSeeScore =
        result.exam.showResult ||
        result.exam.status === 'SELESAI' ||
        result.status === 'SELESAI' ||
        result.status === 'TIMEOUT';

      return {
        id: result.id,
        examId: result.examId,
        status: result.status,
        attempt: result.attempt,
        mulaiPada: result.mulaiPada,
        selesaiPada: result.selesaiPada,
        durasi: result.durasi,
        nilai: canSeeScore ? result.nilai : null,
        totalNilai: canSeeScore ? result.totalNilai : null,
        exam: result.exam,
        canSeeScore,
      };
    });

    return NextResponse.json({
      success: true,
      data: paginatedResponse(filteredResults, total, page, limit),
    });
  } catch (error) {
    console.error('List siswa results error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
