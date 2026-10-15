'use client';

import Link from 'next/link';
import { Users, CircleDollarSign } from 'lucide-react';

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
      <div className="rounded-full bg-auxlo-surface p-4 text-auxlo-muted">
        <Users size={48} />
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="font-manrope text-xl font-bold text-auxlo-text">Ready to join your first circle?</h3>
        <p className="text-sm text-auxlo-muted">
          Pajo works via private invites. If you've been invited, use the link sent by your treasurer. 
          If you want to start your own circle, you can create a new pot below.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/pajo/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-auxlo-lime px-6 py-3 text-sm font-bold text-auxlo-black transition hover:opacity-90"
        >
          <CircleDollarSign size={18} />
          Create a new Pot
        </Link>
        <button
          onClick={() => {
            alert('Please check your WhatsApp or Email for the invite link provided by your Treasurer.');
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-auxlo-line bg-auxlo-black px-6 py-3 text-sm font-bold text-auxlo-text transition hover:border-auxlo-muted"
        >
          <Users size={18} />
          I have an invite link
        </button>
      </div>
    </div>
  );
}