import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List schools
export async function GET(request: NextRequest) {
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat melihat daftar sekolah' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { npsn: { contains: search } },
      ];
    }

    const [sekolah, total] = await Promise.all([
      db.sekolah.findMany({
        where,
        include: {
          _count: { select: { kelas: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.sekolah.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(sekolah, total, page, limit),
    });
  } catch (error) {
    console.error('List sekolah error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create school
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat membuat sekolah' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nama, alamat, npsn, logo } = body;

    if (!nama) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama sekolah wajib diisi' } },
        { status: 400 }
      );
    }

    // Check NPSN uniqueness
    if (npsn) {
      const existing = await db.sekolah.findUnique({ where: { npsn } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE', message: 'NPSN sudah terdaftar' } },
          { status: 409 }
        );
      }
    }

    const sekolah = await db.sekolah.create({
      data: {
        nama,
        alamat: alamat || null,
        npsn: npsn || null,
        logo: logo || null,
      },
    });

    return NextResponse.json({ success: true, data: sekolah }, { status: 201 });
  } catch (error) {
    console.error('Create sekolah error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
