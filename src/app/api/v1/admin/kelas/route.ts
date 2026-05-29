import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List classes
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'ADMIN', 'GURU', 'PENGAWAS')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const sekolahId = searchParams.get('sekolahId');
    const tingkat = searchParams.get('tingkat');
    const tahunAjaran = searchParams.get('tahunAjaran');

    const where: Record<string, unknown> = {};

    if (sekolahId) where.sekolahId = sekolahId;
    if (tingkat) where.tingkat = parseInt(tingkat);
    if (tahunAjaran) where.tahunAjaran = tahunAjaran;

    const [kelas, total] = await Promise.all([
      db.kelas.findMany({
        where,
        include: {
          sekolah: { select: { id: true, nama: true, npsn: true } },
          waliKelas: { select: { id: true, name: true, nipNis: true } },
          _count: { select: { siswaKelas: true, examKelas: true, subjectTeachers: true } },
        },
        skip,
        take: limit,
        orderBy: [{ tingkat: 'asc' }, { nama: 'asc' }],
      }),
      db.kelas.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(kelas, total, page, limit),
    });
  } catch (error) {
    console.error('List kelas error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create class
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat membuat kelas' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nama, tingkat, tahunAjaran, sekolahId, waliKelasId } = body;

    if (!nama || !tingkat || !tahunAjaran || !sekolahId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama, tingkat, tahun ajaran, dan sekolah wajib diisi' } },
        { status: 400 }
      );
    }

    const kelas = await db.kelas.create({
      data: {
        nama,
        tingkat: parseInt(tingkat),
        tahunAjaran,
        sekolahId,
        waliKelasId: waliKelasId || null,
      },
      include: {
        sekolah: { select: { id: true, nama: true } },
        waliKelas: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: kelas }, { status: 201 });
  } catch (error) {
    console.error('Create kelas error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
