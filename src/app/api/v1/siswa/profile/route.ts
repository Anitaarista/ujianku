import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// GET: Student profile with stats
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya siswa yang dapat melihat profil siswa' } },
        { status: 403 }
      );
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nipNis: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Get class info
    const siswaKelas = await db.siswaKelas.findMany({
      where: { siswaId: auth.userId },
      include: {
        kelas: {
          include: {
            sekolah: { select: { id: true, nama: true, npsn: true } },
            waliKelas: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Get exam participation stats
    const [
      totalExamsTaken,
      completedExams,
      ongoingExam,
      averageScore,
      highestScore,
      totalViolations,
    ] = await Promise.all([
      db.examParticipant.count({
        where: { siswaId: auth.userId },
      }),
      db.examParticipant.count({
        where: {
          siswaId: auth.userId,
          status: { in: ['SELESAI', 'TIMEOUT'] },
        },
      }),
      db.examParticipant.count({
        where: {
          siswaId: auth.userId,
          status: 'MULAI',
        },
      }),
      db.examParticipant.aggregate({
        where: {
          siswaId: auth.userId,
          nilai: { not: null },
        },
        _avg: { nilai: true },
      }),
      db.examParticipant.aggregate({
        where: {
          siswaId: auth.userId,
          nilai: { not: null },
        },
        _max: { nilai: true },
      }),
      db.proctorViolation.count({
        where: { siswaId: auth.userId },
      }),
    ]);

    // Recent results
    const recentResults = await db.examParticipant.findMany({
      where: {
        siswaId: auth.userId,
        status: { in: ['SELESAI', 'TIMEOUT'] },
      },
      include: {
        exam: {
          select: {
            id: true,
            judul: true,
            tipeExam: true,
            mataPelajaran: { select: { nama: true } },
          },
        },
      },
      take: 5,
      orderBy: { selesaiPada: 'desc' },
    });

    // Notifications
    const unreadNotifications = await db.notification.count({
      where: {
        userId: auth.userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        kelas: siswaKelas.map((sk) => ({
          id: sk.kelas.id,
          nama: sk.kelas.nama,
          tingkat: sk.kelas.tingkat,
          tahunAjaran: sk.tahunAjaran,
          sekolah: sk.kelas.sekolah,
          waliKelas: sk.kelas.waliKelas,
        })),
        stats: {
          totalExamsTaken,
          completedExams,
          ongoingExam,
          averageScore: averageScore._avg.nilai,
          highestScore: highestScore._max.nilai,
          totalViolations,
          unreadNotifications,
        },
        recentResults,
      },
    });
  } catch (error) {
    console.error('Get siswa profile error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
