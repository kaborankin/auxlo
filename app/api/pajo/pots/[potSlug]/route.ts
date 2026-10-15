import { NextResponse } from 'next/server';
import { validatePotInvitation } from '@/lib/pajo/access';

/**
 * Public pot preview for the join page. Deliberately requires the
 * invitation token: a slug alone must never reveal that a pot exists, its
 * name, contribution amount, etc. — that's information a private pot's
 * treasurer expects to control via the invite link, not via a guessable
 * URL. Missing/wrong/expired token all return the same generic 404 so the
 * response can't be used to enumerate pots or distinguish failure modes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ potSlug: string }> }
) {
  const { potSlug } = await params;
  const token = new URL(request.url).searchParams.get('token');

  try {
    const result = await validatePotInvitation(potSlug, token);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: 'Invitation not found or no longer valid' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, pot: result.pot });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

