import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List proctor sessions
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const examId = searchParams.get('examId');

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (examId) where.examId = examId;

    // Pengawas only sees their own sessions
    if (auth.user!.role === 'PENGAWAS') {
      where.pengawasId = auth.userId;
    }

    const [sessions, total] = await Promise.all([
      db.proctorSession.findMany({
        where,
        include: {
          exam: { select: { id: true, judul: true, tipeExam: true, status: true } },
          pengawas: { select: { id: true, name: true, email: true } },
          kelas: { select: { id: true, nama: true, tingkat: true } },
          _count: { select: { violations: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.proctorSession.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(sessions, total, page, limit),
    });
  } catch (error) {
    console.error('List proctor sessions error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create proctor session
export async function POST(request: NextRequest) {
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya pengawas atau admin yang dapat membuat sesi proctoring' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { examId, kelasId, catatan } = body;

    if (!examId || !kelasId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'examId dan kelasId wajib diisi' } },
        { status: 400 }
      );
    }

    // Verify exam exists and is ongoing
    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ujian tidak ditemukan' } },
        { status: 404 }
      );
    }

    if (exam.status !== 'ONGOING') {
      return NextResponse.json(
        { success: false, error: { code: 'EXAM_NOT_ONGOING', message: 'Ujian tidak sedang berlangsung' } },
        { status: 400 }
      );
    }

    // Check if there's already an active session for this exam and class
    const existingSession = await db.proctorSession.findFirst({
      where: { examId, kelasId, status: 'AKTIF' },
    });

    if (existingSession) {
      return NextResponse.json(
        { success: false, error: { code: 'SESSION_EXISTS', message: 'Sesi proctoring aktif sudah ada untuk ujian dan kelas ini' } },
        { status: 409 }
      );
    }

    const session = await db.proctorSession.create({
      data: {
        examId,
        pengawasId: auth.userId,
        kelasId,
        catatan: catatan || null,
        status: 'AKTIF',
      },
      include: {
        exam: { select: { id: true, judul: true, tipeExam: true } },
        pengawas: { select: { id: true, name: true, email: true } },
        kelas: { select: { id: true, nama: true, tingkat: true } },
      },
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    console.error('Create proctor session error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
