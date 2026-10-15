'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { HomeTopbar } from '@/components/pajo/HomeTopbar';
import { Users, CheckCircle2 } from 'lucide-react';

/**
 * Pot join/invitation page. The token in the URL is the invitation's bearer
 * credential — it is passed to the (unauthenticated) preview endpoint to
 * show pot details, and again to the (authenticated) join endpoint to
 * actually create the PotMember. The server independently re-validates the
 * token at every step; this page never decides on its own that an
 * invitation is valid.
 *
 * Both Google and email/password entry points preserve this exact URL
 * (including the token) as the callback/return destination, so a
 * brand-new signup doesn't lose the invitation on its way through
 * onboarding — see middleware.ts (`returnTo`) and app/auth/onboard/page.tsx.
 */
function JoinPotForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const potSlug = params.potSlug as string;
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [potInfo, setPotInfo] = useState<any>(null);
  const [checkedPreview, setCheckedPreview] = useState(false);

  useEffect(() => {
    async function fetchPot() {
      if (!token) {
        setError('This invitation link is missing its token.');
        setCheckedPreview(true);
        return;
      }
      const res = await fetch(`/api/pajo/pots/${potSlug}?token=${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setPotInfo(data.pot);
      } else {
        setError('This invitation is invalid or has expired.');
      }
      setCheckedPreview(true);
    }
    if (potSlug) fetchPot();
  }, [potSlug, token]);

  // The exact current URL (path + query, including token) — this is what
  // we ask NextAuth to send the user back to after sign-in/signup, so the
  // invitation survives the auth round-trip.
  const callbackUrl = typeof window !== 'undefined' ? window.location.href : `/pajo/${potSlug}/join`;

  async function handleJoin() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pajo/pots/${potSlug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push(`/pajo/${potSlug}`);
      } else {
        setError(data.error || 'Failed to join pot');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  if (checkedPreview && error && !potInfo) {
    return (
      <div className="min-h-screen bg-auxlo-black text-auxlo-text flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-auxlo-warning">{error}</h1>
        <p className="mt-2 text-sm text-auxlo-muted">Ask the treasurer for a fresh invite link.</p>
        <button onClick={() => router.push('/pajo')} className="mt-4 text-auxlo-lime hover:underline">Go back to dashboard</button>
      </div>
    );
  }

  if (!potInfo) {
    return <div className="min-h-screen bg-auxlo-black text-auxlo-muted p-10 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-auxlo-black text-auxlo-text flex flex-col">
      <HomeTopbar userEmail={session?.user?.email || ''} userName={session?.user?.name || ''} />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-auxlo-line bg-auxlo-surface p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-auxlo-lime/10 flex items-center justify-center text-auxlo-lime">
            <Users size={32} />
          </div>
          
          <div>
            <h1 className="font-manrope text-2xl font-bold">Join {potInfo.name}</h1>
            <p className="mt-2 text-sm text-auxlo-muted">You&apos;ve been invited to join this rotation savings circle.</p>
          </div>

          <div className="space-y-4 rounded-xl border border-auxlo-line bg-auxlo-black p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-auxlo-muted">Contribution:</span>
              <span className="font-bold">£{potInfo.contributionAmount} / {potInfo.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-auxlo-muted">Target Members:</span>
              <span className="font-bold">{potInfo.memberTarget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-auxlo-muted">Payout Method:</span>
              <span className="font-bold uppercase">{potInfo.payoutMethod}</span>
            </div>
          </div>

          {error ? <p className="text-sm text-auxlo-warning">{error}</p> : null}

          <div className="pt-2 space-y-3">
            {status === 'authenticated' ? (
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full rounded-lg bg-auxlo-lime px-6 py-4 text-sm font-bold text-auxlo-black transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Accept Invitation & Join Pot'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => signIn('google', { callbackUrl })}
                  className="w-full rounded-lg bg-auxlo-lime px-6 py-4 text-sm font-bold text-auxlo-black transition hover:opacity-90"
                >
                  Continue with Google
                </button>
                <Link
                  href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="block w-full rounded-lg border border-auxlo-line px-6 py-4 text-sm font-bold text-auxlo-text transition hover:border-auxlo-lime"
                >
                  Sign up with email
                </Link>
                <p className="text-xs text-auxlo-muted">
                  Already have an account?{' '}
                  <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-auxlo-lime hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
            <p className="mt-4 text-[10px] text-auxlo-muted uppercase tracking-widest font-bold">Secure community savings by Auxlo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinPotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-auxlo-black text-auxlo-muted p-10 flex items-center justify-center">Loading...</div>}>
      <JoinPotForm />
    </Suspense>
  );
}
