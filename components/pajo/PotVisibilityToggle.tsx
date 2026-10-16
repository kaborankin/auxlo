'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Treasurer control over discovery. Off (the default) keeps the circle private
 * and invite-only. On advertises it in the /pajo discover list so other members
 * of the organisation can see the basics and request to join — publishing
 * never exposes the ledger, the member list or the bank details.
 */
export function PotVisibilityToggle({
  potSlug,
  initialOpen,
}: {
  potSlug: string;
  initialOpen: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !open;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/pots/${potSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openForJoining: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(data.pot?.openForJoining ?? next);
        router.refresh();
      } else {
        setError(data.error || 'Could not update visibility.');
      }
    } catch {
      setError('Connection error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-auxlo-line bg-auxlo-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-auxlo-text">
            {open ? <Eye size={16} /> : <EyeOff size={16} />}
            Discoverable to members
          </h4>
          <p className="mt-1 text-xs text-auxlo-muted">
            {open
              ? 'Listed on the dashboard of other members in your organisation. They see the name, contribution and member count, and can request to join — they get no access until you approve.'
              : 'Private. Only people you send an invite link to can see this circle.'}
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          aria-pressed={open}
          aria-label="Toggle discoverability"
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
            open ? 'bg-auxlo-lime' : 'bg-auxlo-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-auxlo-black transition ${
              open ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {error && <p className="mt-3 text-xs font-bold text-auxlo-warning">{error}</p>}
    </div>
  );
}
