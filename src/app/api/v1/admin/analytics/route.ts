import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// GET: System-wide analytics
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat melihat analitik' } },
        { status: 403 }
      );
    }

    // User statistics
    const [
      totalUsers,
      totalAdmin,
      totalGuru,
      totalPengawas,
      totalSiswa,
      activeUsers,
      totalSekolah,
      totalKelas,
      totalMataPelajaran,
      totalBankSoal,
      totalExams,
      totalExamParticipants,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { role: 'GURU' } }),
      db.user.count({ where: { role: 'PENGAWAS' } }),
      db.user.count({ where: { role: 'SISWA' } }),
      db.user.count({ where: { isActive: true } }),
      db.sekolah.count(),
      db.kelas.count(),
      db.mataPelajaran.count(),
      db.bankSoal.count(),
      db.exam.count(),
      db.examParticipant.count(),
    ]);

    // Exam statistics by status
    const [draftExams, publishedExams, ongoingExams, completedExams] =
      await Promise.all([
        db.exam.count({ where: { status: 'DRAFT' } }),
        db.exam.count({ where: { status: 'PUBLISHED' } }),
        db.exam.count({ where: { status: 'ONGOING' } }),
        db.exam.count({ where: { status: 'SELESAI' } }),
      ]);

    // Bank soal by type
    const bankSoalByType = await db.bankSoal.groupBy({
      by: ['tipeSoal'],
      _count: true,
    });

    // Bank soal by difficulty
    const bankSoalByDifficulty = await db.bankSoal.groupBy({
      by: ['tingkatKesulitan'],
      _count: true,
    });

    // Participant status distribution
    const participantByStatus = await db.examParticipant.groupBy({
      by: ['status'],
      _count: true,
    });

    // Proctor sessions
    const [activeProctorSessions, totalViolations] = await Promise.all([
      db.proctorSession.count({ where: { status: 'AKTIF' } }),
      db.proctorViolation.count(),
    ]);

    // Violations by type
    const violationsByType = await db.proctorViolation.groupBy({
      by: ['tipe'],
      _count: true,
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentExams,
      recentParticipants,
      recentQuestions,
      recentViolations,
    ] = await Promise.all([
      db.exam.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      db.examParticipant.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      db.bankSoal.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      db.proctorViolation.count({
        where: { waktu: { gte: sevenDaysAgo } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: totalAdmin,
          guru: totalGuru,
          pengawas: totalPengawas,
          siswa: totalSiswa,
          active: activeUsers,
        },
        academic: {
          sekolah: totalSekolah,
          kelas: totalKelas,
          mataPelajaran: totalMataPelajaran,
        },
        exams: {
          total: totalExams,
          draft: draftExams,
          published: publishedExams,
          ongoing: ongoingExams,
          completed: completedExams,
          participants: totalExamParticipants,
        },
        bankSoal: {
          total: totalBankSoal,
          byType: bankSoalByType.map((b) => ({
            type: b.tipeSoal,
            count: b._count,
          })),
          byDifficulty: bankSoalByDifficulty.map((b) => ({
            difficulty: b.tingkatKesulitan,
            count: b._count,
          })),
        },
        proctor: {
          activeSessions: activeProctorSessions,
          totalViolations,
          violationsByType: violationsByType.map((v) => ({
            type: v.tipe,
            count: v._count,
          })),
        },
        participantsByStatus: participantByStatus.map((p) => ({
          status: p.status,
          count: p._count,
        })),
        recentActivity: {
          examsCreated: recentExams,
          participantsJoined: recentParticipants,
          questionsCreated: recentQuestions,
          violationsReported: recentViolations,
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
