import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List subjects with guru info
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'ADMIN', 'GURU')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const kelompok = searchParams.get('kelompok');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (kelompok) where.kelompok = kelompok;
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { kode: { contains: search } },
      ];
    }

    const [subjects, total] = await Promise.all([
      db.mataPelajaran.findMany({
        where,
        include: {
          _count: {
            select: {
              bankSoal: true,
              exams: true,
              guruSubjects: true,
            },
          },
          guruSubjects: {
            include: {
              guru: { select: { id: true, name: true, nipNis: true } },
              kelas: { select: { id: true, nama: true, tingkat: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      db.mataPelajaran.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(subjects, total, page, limit),
    });
  } catch (error) {
    console.error('List mata pelajaran error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create subject
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat membuat mata pelajaran' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { kode, nama, kkm, kelompok } = body;

    if (!kode || !nama) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Kode dan nama mata pelajaran wajib diisi' } },
        { status: 400 }
      );
    }

    // Check kode uniqueness
    const existing = await db.mataPelajaran.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: 'Kode mata pelajaran sudah terdaftar' } },
        { status: 409 }
      );
    }

    const subject = await db.mataPelajaran.create({
      data: {
        kode,
        nama,
        kkm: kkm || 75,
        kelompok: kelompok || null,
      },
    });

    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error('Create mata pelajaran error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
