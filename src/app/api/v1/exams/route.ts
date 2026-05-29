import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List exams with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(request);
    const status = searchParams.get('status');
    const mataPelajaranId = searchParams.get('subject');
    const kelasId = searchParams.get('class');
    const tipeExam = searchParams.get('type');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (mataPelajaranId) where.mataPelajaranId = mataPelajaranId;
    if (tipeExam) where.tipeExam = tipeExam;
    if (search) {
      where.judul = { contains: search };
    }

    // If user is GURU, only show their exams
    if (auth.user!.role === 'GURU') {
      where.guruId = auth.userId;
    }

    // If user is SISWA, show exams for their classes
    if (auth.user!.role === 'SISWA') {
      const siswaKelas = await db.siswaKelas.findMany({
        where: { siswaId: auth.userId },
        select: { kelasId: true },
      });
      const kelasIds = siswaKelas.map((sk) => sk.kelasId);
      where.examKelas = { some: { kelasId: { in: kelasIds } } };
      // Only show published/ongoing exams for students
      if (!status) {
        where.status = { in: ['PUBLISHED', 'ONGOING'] };
      }
    }

    if (kelasId) {
      where.examKelas = { some: { kelasId } };
    }

    const [exams, total] = await Promise.all([
      db.exam.findMany({
        where,
        include: {
          mataPelajaran: { select: { id: true, nama: true, kode: true } },
          guru: { select: { id: true, name: true } },
          examKelas: {
            include: { kelas: { select: { id: true, nama: true, tingkat: true } } },
          },
          _count: { select: { participants: true, examSoal: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.exam.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(exams, total, page, limit),
    });
  } catch (error) {
    console.error('List exams error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create exam
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' } },
        { status: 401 }
      );
    }

    if (!hasRole(auth.user!, 'GURU', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru atau admin yang dapat membuat ujian' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      judul,
      deskripsi,
      mataPelajaranId,
      durasi,
      tipeExam,
      token,
      tanggalMulai,
      tanggalSelesai,
      acakSoal,
      acakOpsi,
      showResult,
      antiCheat,
      maxAttempt,
      passingGrade,
      kelasIds,
      bankSoalIds,
    } = body;

    if (!judul || !mataPelajaranId || !durasi || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Judul, mata pelajaran, durasi, tanggal mulai dan selesai wajib diisi' } },
        { status: 400 }
      );
    }

    if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Tanggal mulai harus sebelum tanggal selesai' } },
        { status: 400 }
      );
    }

    // Create exam with related records
    const exam = await db.exam.create({
      data: {
        judul,
        deskripsi: deskripsi || null,
        mataPelajaranId,
        guruId: auth.userId,
        durasi,
        tipeExam: tipeExam || 'UTS',
        token: token || null,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        acakSoal: acakSoal ?? true,
        acakOpsi: acakOpsi ?? true,
        showResult: showResult ?? false,
        antiCheat: antiCheat ?? true,
        maxAttempt: maxAttempt || 1,
        passingGrade: passingGrade || null,
        status: 'DRAFT',
        examKelas: kelasIds
          ? { create: kelasIds.map((kId: string) => ({ kelasId: kId })) }
          : undefined,
        examSoal: bankSoalIds
          ? {
              create: bankSoalIds.map((bsId: string, index: number) => ({
                bankSoalId: bsId,
                urutan: index + 1,
              })),
            }
          : undefined,
      },
      include: {
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guru: { select: { id: true, name: true } },
        examKelas: { include: { kelas: true } },
        examSoal: { include: { bankSoal: true } },
      },
    });

    return NextResponse.json({ success: true, data: exam }, { status: 201 });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
