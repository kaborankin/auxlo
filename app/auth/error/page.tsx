'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have access to sign in.',
  Verification: 'The sign-in link is no longer valid.',
  OAuthCallback: 'The sign-in provider could not complete the request.',
  Default: 'Something went wrong while signing you in.',
};

function ErrorBody() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = MESSAGES[error] ?? MESSAGES.Default;

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-auxlo-line bg-auxlo-surface p-8 text-center">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-auxlo-lime">Pajo</p>
        <h1 className="mt-2 font-manrope text-2xl font-bold text-auxlo-text">Sign-in error</h1>
        <p className="mt-2 text-sm text-auxlo-muted">{message}</p>
      </div>
      <Link
        href="/auth/signin?callbackUrl=/pajo"
        className="inline-block rounded-lg bg-auxlo-lime px-6 py-3 text-sm font-bold text-auxlo-black transition hover:opacity-90"
      >
        Back to sign in
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-auxlo-black px-6 py-12">
      <Suspense fallback={<div className="text-auxlo-muted">Loading…</div>}>
        <ErrorBody />
      </Suspense>
    </div>
  );
}
