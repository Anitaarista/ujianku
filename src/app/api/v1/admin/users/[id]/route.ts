import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, hashPassword } from '@/lib/auth-helper';

// GET: User detail
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

    if (!hasRole(auth.user!, 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat melihat detail user' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nipNis: true,
        phone: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            examCreators: true,
            examParticipants: true,
            bankSoal: true,
            siswaKelas: true,
            proctorSessions: true,
            proctorViolations: true,
            notifications: true,
          },
        },
        siswaKelas: {
          include: {
            kelas: { select: { id: true, nama: true, tingkat: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// PUT: Update user
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

    if (!hasRole(auth.user!, 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat mengubah user' } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await db.user.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, nipNis, phone, isActive } = body;

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const emailExists = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE', message: 'Email sudah digunakan' } },
          { status: 409 }
        );
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(password && { password: hashPassword(password) }),
        ...(name && { name }),
        ...(role && { role }),
        ...(nipNis !== undefined && { nipNis }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nipNis: true,
        phone: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (soft delete - deactivate)
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

    if (!hasRole(auth.user!, 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat menghapus user' } },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === auth.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_DELETE', message: 'Anda tidak dapat menghapus akun sendiri' } },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Soft delete - deactivate instead of deleting
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'User berhasil dinonaktifkan' },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
