import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, hasRole, hashPassword, parsePagination, paginatedResponse } from '@/lib/auth-helper';

// GET: List all users
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat melihat daftar user' } },
        { status: 403 }
      );
    }

    const { page, limit, skip } = parsePagination(request);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { nipNis: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
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
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: paginatedResponse(users, total, page, limit),
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}

// POST: Create user
export async function POST(request: NextRequest) {
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya admin yang dapat membuat user' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, nipNis, phone, isActive } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, password, nama, dan role wajib diisi' } },
        { status: 400 }
      );
    }

    const validRoles = ['ADMIN', 'GURU', 'PENGAWAS', 'SISWA'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Role harus salah satu dari: ${validRoles.join(', ')}` } },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: 'Email sudah terdaftar' } },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashPassword(password),
        name,
        role,
        nipNis: nipNis || null,
        phone: phone || null,
        isActive: isActive ?? true,
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

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' } },
      { status: 500 }
    );
  }
}
