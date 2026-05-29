import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List violations
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'PENGAWAS', 'ADMIN', 'GURU')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke data pelanggaran' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const siswaId = searchParams.get('siswaId');
    const tipe = searchParams.get('type');

    const where: Record<string, unknown> = {};

    if (sessionId) where.sessionId = sessionId;
    if (siswaId) where.siswaId = siswaId;
    if (tipe) where.tipe = tipe;

    // Pengawas sees violations from their sessions only
    if (auth.user!.role === 'PENGAWAS') {
      const sessions = await db.proctorSession.findMany({
        where: { pengawasId: auth.userId },
        select: { id: true },
      });
      where.sessionId = { in: sessions.map((s) => s.id) };
    }

    const [violations, total] = await Promise.all([
      db.proctorViolation.findMany({
        where,
        include: {
          siswa: { select: { id: true, name: true, nipNis: true } },
          session: {
            select: {
              id: true,
              exam: { select: { id: true, judul: true } },
              kelas: { select: { id: true, nama: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { waktu: 'desc' },
      }),
      db.proctorViolation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(violations, total, page, limit),
    });
  } catch (error) {
    console.error('List violations error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Report violation
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    // Students can report violations (self-reporting from client-side proctor)
    // Pengawas and Admin can also report
    if (!hasRole(auth.user!, 'SISWA', 'PENGAWAS', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk melaporkan pelanggaran' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, siswaId, tipe, deskripsi, screenshot } = body;

    if (!sessionId || !tipe || !deskripsi) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'sessionId, tipe, dan deskripsi wajib diisi' } },
        { status: 400 }
      );
    }

    const validTypes = [
      'TAB_SWITCH',
      'COPY_PASTE',
      'FACE_NOT_DETECTED',
      'MULTIPLE_FACES',
      'PHONE_DETECTED',
      'SCREEN_RECORDING',
      'LEAVE_FULLSCREEN',
      'SUSPICIOUS_BEHAVIOR',
    ];

    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Tipe pelanggaran harus salah satu dari: ${validTypes.join(', ')}` } },
        { status: 400 }
      );
    }

    // Verify session exists and is active
    const session = await db.proctorSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sesi proctoring tidak ditemukan' } },
        { status: 404 }
      );
    }

    if (session.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_INACTIVE', message: 'Sesi proctoring sudah tidak aktif' } },
        { status: 400 }
      );
    }

    // If student is reporting, use their own ID
    const reportedSiswaId = hasRole(auth.user!, 'SISWA')
      ? auth.userId
      : siswaId;

    if (!reportedSiswaId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'siswaId wajib diisi' } },
        { status: 400 }
      );
    }

    const violation = await db.proctorViolation.create({
      data: {
        sessionId,
        siswaId: reportedSiswaId,
        tipe,
        deskripsi,
        screenshot: screenshot || null,
      },
      include: {
        siswa: { select: { id: true, name: true, nipNis: true } },
        session: {
          select: {
            id: true,
            exam: { select: { id: true, judul: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: violation }, { status: 201 });
  } catch (error) {
    console.error('Report violation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
