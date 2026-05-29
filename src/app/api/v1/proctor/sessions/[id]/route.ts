import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

// GET: Session detail
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
    const session = await db.proctorSession.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            judul: true,
            tipeExam: true,
            status: true,
            durasi: true,
            tanggalMulai: true,
            tanggalSelesai: true,
          },
        },
        pengawas: { select: { id: true, name: true, email: true } },
        kelas: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
            siswaKelas: {
              include: {
                siswa: { select: { id: true, name: true, nipNis: true } },
              },
            },
          },
        },
        violations: {
          include: {
            siswa: { select: { id: true, name: true, nipNis: true } },
          },
          orderBy: { waktu: 'desc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Sesi proctoring tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Pengawas can only see their own sessions
    if (auth.user!.role === 'PENGAWAS' && session.pengawasId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke sesi ini' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error('Get proctor session detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
