import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Self-serve account creation for the credentials provider.
 * Creates a UserProfile with a bcrypt-hashed password. Access to specific
 * pots is granted afterwards by a treasurer linking the account via PotMember.
 */
export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';

  if (!name) {
    return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await prisma.userProfile.findUnique({ where: { email } });
  if (existing) {
    // If they signed up via Google before, let them set a password on the
    // same account rather than erroring out.
    if (!existing.hashedPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.userProfile.update({
        where: { email },
        data: { hashedPassword, name: existing.name || name, lastActiveAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { ok: false, error: 'An account with this email already exists — sign in instead' },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.userProfile.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name,
      hashedPassword,
      authProvider: 'credentials',
      source: 'pajo_signup',
      lastActiveAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
