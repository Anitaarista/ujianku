import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// POST: End proctor session
export async function POST(
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

    if (!hasRole(auth.user!, 'PENGAWAS', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya pengawas atau admin yang dapat mengakhiri sesi' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const session = await db.proctorSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sesi proctoring tidak ditemukan' } },
        { status: 404 }
      );
    }

    if (session.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_INACTIVE', message: 'Sesi sudah tidak aktif' } },
        { status: 400 }
      );
    }

    // Pengawas can only end their own sessions
    if (auth.user!.role === 'PENGAWAS' && session.pengawasId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda hanya dapat mengakhiri sesi milik Anda' } },
        { status: 403 }
      );
    }

    const updatedSession = await db.proctorSession.update({
      where: { id },
      data: { status: 'SELESAI' },
      include: {
        exam: { select: { id: true, judul: true } },
        pengawas: { select: { id: true, name: true } },
        kelas: { select: { id: true, nama: true } },
        _count: { select: { violations: true } },
      },
    });

    return NextResponse.json({ success: true, data: updatedSession });
  } catch (error) {
    console.error('End proctor session error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
