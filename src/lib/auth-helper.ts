import { createHash, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';
import { db } from './db';

// In-memory token store: token -> userId
const tokenStore = new Map<string, { userId: string; expiresAt: number }>();

// Token expiration: 24 hours
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Hash a password using SHA-256
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Generate a random token
 */
export function generateToken(userId: string): string {
  const token = randomBytes(32).toString('hex');
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + TOKEN_EXPIRY,
  });
  return token;
}

/**
 * Verify auth token from request headers
 * Returns userId if valid, null otherwise
 */
export async function verifyAuth(
  request: NextRequest
): Promise<{ userId: string; user: Awaited<ReturnType<typeof db.user.findUnique>> } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const stored = tokenStore.get(token);

  if (!stored) {
    return null;
  }

  // Check expiration
  if (Date.now() > stored.expiresAt) {
    tokenStore.delete(token);
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: stored.userId },
  });

  if (!user || !user.isActive) {
    tokenStore.delete(token);
    return null;
  }

  return { userId: stored.userId, user };
}

/**
 * Revoke a token (logout)
 */
export function revokeToken(token: string): boolean {
  return tokenStore.delete(token);
}

/**
 * Clean up expired tokens (can be called periodically)
 */
export function cleanupTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  user: { role: string },
  ...roles: string[]
): boolean {
  return roles.includes(user.role);
}

/**
 * Parse pagination params from request URL
 */
export function parsePagination(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build paginated response
 */
export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
