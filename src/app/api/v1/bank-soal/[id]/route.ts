import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth-helper';

// GET: Question detail
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
    const question = await db.bankSoal.findUnique({
      where: { id },
      include: {
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guru: { select: { id: true, name: true } },
        _count: { select: { examSoal: true, jawaban: true } },
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Soal tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Students can only see public questions without answers
    if (auth.user!.role === 'SISWA') {
      if (!question.isPublic) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses ke soal ini' } },
          { status: 403 }
        );
      }
      const { jawabanBenar, pembahasan, ...publicQuestion } = question;
      return NextResponse.json({ success: true, data: publicQuestion });
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Get bank soal detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// PUT: Update question
export async function PUT(
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

    if (!hasRole(auth.user!, 'GURU', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru atau admin yang dapat mengubah soal' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await db.bankSoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Soal tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Guru can only update their own questions
    if (auth.user!.role === 'GURU' && existing.guruId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda hanya dapat mengubah soal milik Anda' } },
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

    const question = await db.bankSoal.update({
      where: { id },
      data: {
        ...(mataPelajaranId && { mataPelajaranId }),
        ...(tipeSoal && { tipeSoal }),
        ...(tingkatKesulitan && { tingkatKesulitan }),
        ...(pertanyaan && { pertanyaan }),
        ...(opsiA !== undefined && { opsiA }),
        ...(opsiB !== undefined && { opsiB }),
        ...(opsiC !== undefined && { opsiC }),
        ...(opsiD !== undefined && { opsiD }),
        ...(opsiE !== undefined && { opsiE }),
        ...(jawabanBenar !== undefined && { jawabanBenar }),
        ...(pembahasan !== undefined && { pembahasan }),
        ...(poin !== undefined && { poin }),
        ...(gambar !== undefined && { gambar }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guru: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Update bank soal error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// DELETE: Delete question
export async function DELETE(
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

    if (!hasRole(auth.user!, 'GURU', 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya guru atau admin yang dapat menghapus soal' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await db.bankSoal.findUnique({
      where: { id },
      include: { _count: { select: { examSoal: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Soal tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Guru can only delete their own questions
    if (auth.user!.role === 'GURU' && existing.guruId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Anda hanya dapat menghapus soal milik Anda' } },
        { status: 403 }
      );
    }

    // Check if question is used in any exam
    if (existing._count.examSoal > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'IN_USE', message: 'Soal sedang digunakan dalam ujian dan tidak dapat dihapus' } },
        { status: 400 }
      );
    }

    await db.bankSoal.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Soal berhasil dihapus' },
    });
  } catch (error) {
    console.error('Delete bank soal error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
