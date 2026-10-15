'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/pajo';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const inputCls =
    'w-full rounded-pajo border border-pajo-border bg-pajo-surface px-4 py-3 text-sm text-pajo-primary placeholder:text-pajo-secondary/50 focus:border-pajo-accent focus:ring-1 focus:ring-pajo-accent focus:outline-none transition-all';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading('credentials');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setLoading(null);
      setError(data.error || 'Failed to create account.');
      return;
    }
    await signIn('credentials', { email, password, callbackUrl });
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-pajo-border bg-pajo-surface p-10 shadow-xl">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pajo-accent shadow-sm">
          <span className="text-xl font-bold text-white">P</span>
        </div>
        <h1 className="font-manrope text-2xl font-bold tracking-tight text-pajo-primary">Join Pajo</h1>
        <p className="mt-2 text-sm font-medium text-pajo-secondary">Start saving with your circle today.</p>
      </div>

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => signIn('google', { callbackUrl })}
        className="flex w-full items-center justify-center gap-3 rounded-pajo border border-pajo-border bg-pajo-bg/50 px-4 py-3 text-sm font-bold text-pajo-primary transition hover:bg-pajo-border disabled:opacity-60 shadow-sm"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-pajo-border" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">or with email</span>
        <span className="h-px flex-1 bg-pajo-border" />
      </div>

      {error ? <p className="rounded-pajo bg-pajo-danger/10 px-4 py-3 text-xs font-bold text-pajo-danger">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
        <input
          type="email"
          required
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        <input
          type="password"
          required
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
        />
        <button
          type="submit"
          disabled={loading !== null}
          className="w-full rounded-pajo bg-pajo-accent px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-pajo-accent/90 disabled:opacity-60"
        >
          {loading === 'credentials' ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs font-medium text-pajo-secondary">
        Already have an account?{' '}
        <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="ml-1 font-bold text-pajo-accent hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pajo-bg px-6 py-12">
      <Suspense fallback={<div>Loading…</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

