import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// GET: Live monitoring data (students status, violations)
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

    if (!hasRole(auth.user!, 'PENGAWAS', 'ADMIN', 'GURU')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke monitoring' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const session = await db.proctorSession.findUnique({
      where: { id },
      include: {
        exam: { select: { id: true, judul: true, durasi: true } },
        kelas: {
          select: {
            id: true,
            nama: true,
            siswaKelas: {
              include: {
                siswa: { select: { id: true, name: true, nipNis: true } },
              },
            },
          },
        },
      },
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

    // Get all students in the class with their participation status
    const studentIds = session.kelas.siswaKelas.map((sk) => sk.siswa.id);

    const participants = await db.examParticipant.findMany({
      where: {
        examId: session.examId,
        siswaId: { in: studentIds },
      },
      include: {
        siswa: { select: { id: true, name: true, nipNis: true } },
        _count: { select: { jawaban: true } },
      },
    });

    // Get recent violations for this session
    const violations = await db.proctorViolation.findMany({
      where: { sessionId: id },
      include: {
        siswa: { select: { id: true, name: true, nipNis: true } },
      },
      orderBy: { waktu: 'desc' },
      take: 50,
    });

    // Build monitoring data for each student
    const monitoringData = studentIds.map((studentId) => {
      const student = session.kelas.siswaKelas.find(
        (sk) => sk.siswa.id === studentId
      )!.siswa;
      const participant = participants.find((p) => p.siswaId === studentId);
      const studentViolations = violations.filter(
        (v) => v.siswaId === studentId
      );

      return {
        student,
        participation: participant
          ? {
              status: participant.status,
              mulaiPada: participant.mulaiPada,
              answeredQuestions: participant._count.jawaban,
              durasi: participant.durasi,
            }
          : null,
        violationCount: studentViolations.length,
        recentViolations: studentViolations.slice(0, 5),
      };
    });

    const stats = {
      totalSiswa: studentIds.length,
      sedangMengerjakan: participants.filter((p) => p.status === 'MULAI').length,
      sudahSelesai: participants.filter((p) => p.status === 'SELESAI').length,
      belumMulai: studentIds.length - participants.length,
      totalViolations: violations.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          status: session.status,
          exam: session.exam,
          kelas: { id: session.kelas.id, nama: session.kelas.nama },
        },
        stats,
        monitoring: monitoringData,
      },
    });
  } catch (error) {
    console.error('Monitor proctor session error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
