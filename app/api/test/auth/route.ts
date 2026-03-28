/**
 * Endpoint de autenticación para testing E2E
 *
 * SOLO disponible cuando NODE_ENV !== 'production'
 * Permite setear una sesión de usuario sin pasar por Google OAuth.
 *
 * POST /api/test/auth
 * Body: { email: "carlos.irigoyen@me.com" }
 *
 * Retorna una cookie de sesión JWT válida para Auth.js v5.
 */
import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'AUTH_SECRET not configured' }, { status: 500 });
  }

  // Generar JWT compatible con Auth.js v5
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret,
    salt: 'authjs.session-token',
  });

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });

  // Setear cookie de sesión (nombre usado por Auth.js v5 en desarrollo)
  const cookieName = (process.env.NODE_ENV as string) === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });

  return response;
}
