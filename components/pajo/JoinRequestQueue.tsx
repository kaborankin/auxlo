'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, UserPlus } from 'lucide-react';

export interface PendingJoinRequest {
  id: string;
  message: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
}

/**
 * Treasurer review queue for people asking to join an advertised circle.
 * Approving is what actually creates the PotMember (server-side, in one
 * transaction) — nothing here grants access on its own.
 */
export function JoinRequestQueue({ requests }: { requests: PendingJoinRequest[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const visible = requests.filter((r) => !done[r.id]);
  if (visible.length === 0) return null;

  async function review(id: string, decision: 'APPROVED' | 'REJECTED') {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/join-requests/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone((s) => ({ ...s, [id]: decision }));
        router.refresh();
      } else {
        setError(data.error || 'Could not review the request.');
      }
    } catch {
      setError('Connection error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-auxlo-lime/20 bg-auxlo-lime/5 p-6">
      <div className="flex items-center gap-3 text-auxlo-lime">
        <UserPlus size={20} />
        <h4 className="font-bold">Join requests ({visible.length})</h4>
      </div>
      <p className="mt-2 text-sm text-auxlo-text/80">
        Approving adds the person to this circle and gives them access to the ledger.
      </p>

      {error && <p className="mt-3 text-xs font-bold text-auxlo-warning">{error}</p>}

      <ul className="mt-4 space-y-3">
        {visible.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-auxlo-line bg-auxlo-surface p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-auxlo-text">
                {r.user.name || r.user.email}
              </p>
              <p className="truncate text-xs text-auxlo-muted">{r.user.email}</p>
              {r.message ? (
                <p className="mt-1 text-xs italic text-auxlo-muted">&ldquo;{r.message}&rdquo;</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => review(r.id, 'APPROVED')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1 rounded-lg bg-auxlo-lime px-3 py-2 text-xs font-bold text-auxlo-black transition hover:opacity-90 disabled:opacity-50"
              >
                <Check size={14} /> {busy === r.id ? 'Working…' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => review(r.id, 'REJECTED')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1 rounded-lg border border-auxlo-line px-3 py-2 text-xs font-bold text-auxlo-text transition hover:border-auxlo-warning disabled:opacity-50"
              >
                <X size={14} /> Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
