'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, CircleDollarSign } from 'lucide-react';

/**
 * Only allow relative, in-app redirects for `returnTo` — never an absolute
 * URL, which could be used to bounce a freshly authenticated user off-site
 * (open redirect). Falls back to the Pajo home page.
 */
function safeReturnTo(value: string | null): string {
  if (!value) return '/pajo';
  if (!value.startsWith('/') || value.startsWith('//')) return '/pajo';
  return value;
}

type Role = 'treasurer' | 'member';

function OnboardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const returnTo = safeReturnTo(searchParams.get('returnTo'));

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOnboard() {
    if (!role) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Refresh the session so the new `status: 'onboarded'` is reflected in
      // the token before we redirect — otherwise middleware bounces the
      // user straight back here.
      await update();

      if (role === 'treasurer') {
        router.push('/pajo/new');
      } else {
        router.push(returnTo);
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg space-y-8 rounded-2xl border border-pajo-border bg-pajo-surface p-10 shadow-xl">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pajo-accent shadow-sm">
          <span className="text-xl font-bold text-white">P</span>
        </div>
        <h1 className="font-manrope text-2xl font-bold tracking-tight text-pajo-primary">
          Welcome to Pajo
        </h1>
        <p className="mt-2 text-sm font-medium text-pajo-secondary">
          Tell us how you&apos;ll be using Pajo to finish setting up your account.
        </p>
      </div>

      {error && (
        <p className="rounded-pajo bg-pajo-danger/10 px-4 py-3 text-xs font-bold text-pajo-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole('treasurer')}
          className={`flex flex-col items-start gap-3 rounded-pajo border p-5 text-left transition-all ${
            role === 'treasurer'
              ? 'border-pajo-accent bg-pajo-accent/5 ring-1 ring-pajo-accent'
              : 'border-pajo-border bg-pajo-bg/50 hover:border-pajo-accent/40'
          }`}
        >
          <div className="rounded-lg bg-pajo-accent/10 p-2 text-pajo-accent">
            <CircleDollarSign size={20} />
          </div>
          <div>
            <p className="font-bold text-pajo-primary">I&apos;m a Treasurer</p>
            <p className="mt-1 text-xs font-medium text-pajo-secondary">
              I want to create and manage a savings circle for my group.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('member')}
          className={`flex flex-col items-start gap-3 rounded-pajo border p-5 text-left transition-all ${
            role === 'member'
              ? 'border-pajo-accent bg-pajo-accent/5 ring-1 ring-pajo-accent'
              : 'border-pajo-border bg-pajo-bg/50 hover:border-pajo-accent/40'
          }`}
        >
          <div className="rounded-lg bg-pajo-accent/10 p-2 text-pajo-accent">
            <Users size={20} />
          </div>
          <div>
            <p className="font-bold text-pajo-primary">I&apos;m a Member</p>
            <p className="mt-1 text-xs font-medium text-pajo-secondary">
              I&apos;ve been invited to join someone else&apos;s circle.
            </p>
          </div>
        </button>
      </div>

      <button
        type="button"
        disabled={!role || loading}
        onClick={handleOnboard}
        className="w-full rounded-pajo bg-pajo-accent px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-pajo-accent/90 disabled:opacity-50"
      >
        {loading ? 'Setting up your account…' : 'Continue'}
      </button>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pajo-bg px-6 py-12">
      <Suspense
        fallback={
          <div className="text-pajo-secondary font-bold uppercase tracking-widest text-[10px]">
            Securely loading…
          </div>
        }
      >
        <OnboardForm />
      </Suspense>
    </div>
  );
}
