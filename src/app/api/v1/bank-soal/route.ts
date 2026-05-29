import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List questions (with filters)
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
    const mataPelajaranId = searchParams.get('subject');
    const tipeSoal = searchParams.get('type');
    const tingkatKesulitan = searchParams.get('difficulty');
    const guruId = searchParams.get('guruId');
    const isPublic = searchParams.get('public');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (mataPelajaranId) where.mataPelajaranId = mataPelajaranId;
    if (tipeSoal) where.tipeSoal = tipeSoal;
    if (tingkatKesulitan) where.tingkatKesulitan = tingkatKesulitan;
    if (isPublic === 'true') where.isPublic = true;
    if (search) {
      where.pertanyaan = { contains: search };
    }

    // Filter by guru access
    if (auth.user!.role === 'GURU') {
      if (guruId && guruId !== auth.userId) {
        // Guru can see their own questions + public ones
        where.OR = [
          { guruId, isPublic: true },
          { guruId: auth.userId },
        ];
      } else {
        where.guruId = auth.userId;
      }
    } else if (auth.user!.role === 'SISWA') {
      // Students can only see public questions
      where.isPublic = true;
    }
    // Admin can see all

    const [questions, total] = await Promise.all([
      db.bankSoal.findMany({
        where,
        include: {
          mataPelajaran: { select: { id: true, nama: true, kode: true } },
          guru: { select: { id: true, name: true } },
          _count: { select: { examSoal: true, jawaban: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.bankSoal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(questions, total, page, limit),
    });
  } catch (error) {
    console.error('List bank soal error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create question
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru atau admin yang dapat membuat soal' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      mataPelajaranId,
      tipeSoal,
      tingkatKesulitan,
      pertanyaan,
      opsiA,
      opsiB,
      opsiC,
      opsiD,
      opsiE,
      jawabanBenar,
      pembahasan,
      poin,
      gambar,
      isPublic,
    } = body;

    if (!mataPelajaranId || !pertanyaan) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Mata pelajaran dan pertanyaan wajib diisi' } },
        { status: 400 }
      );
    }

    // For multiple choice, require options
    if (tipeSoal === 'PILIHAN_GANDA' && (!opsiA || !opsiB || !opsiC || !opsiD)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Opsi A, B, C, D wajib diisi untuk soal pilihan ganda' } },
        { status: 400 }
      );
    }

    const question = await db.bankSoal.create({
      data: {
        mataPelajaranId,
        guruId: auth.userId,
        tipeSoal: tipeSoal || 'PILIHAN_GANDA',
        tingkatKesulitan: tingkatKesulitan || 'SEDANG',
        pertanyaan,
        opsiA: opsiA || null,
        opsiB: opsiB || null,
        opsiC: opsiC || null,
        opsiD: opsiD || null,
        opsiE: opsiE || null,
        jawabanBenar: jawabanBenar || null,
        pembahasan: pembahasan || null,
        poin: poin || 1,
        gambar: gambar || null,
        isPublic: isPublic ?? false,
      },
      include: {
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guru: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error) {
    console.error('Create bank soal error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
