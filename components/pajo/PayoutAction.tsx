'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function formatMoney(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : `${currency.toUpperCase()} `;
  return `${symbol}${value.toLocaleString('en-GB')}`;
}

/**
 * Admin action for confirming a payout. When there is an outstanding balance
 * the first click asks for explicit confirmation ("pay despite £X outstanding")
 * and the confirmed click sends `confirmDespiteOutstanding: true`, which the
 * server checks and records in the audit trail.
 */
export function PayoutAction({
  weekId,
  disabled,
  outstanding = 0,
  currency = 'gbp',
}: {
  weekId: string;
  disabled: boolean;
  outstanding?: number;
  currency?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaidOut() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/weeks/${weekId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDespiteOutstanding: confirming && outstanding > 0 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not record the payout');
        setConfirming(false);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const needsConfirm = outstanding > 0 && !confirming;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => (needsConfirm ? setConfirming(true) : markPaidOut())}
        disabled={disabled || loading}
        className={`w-full rounded-md px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          needsConfirm
            ? 'bg-auxlo-warning/20 text-auxlo-warning hover:bg-auxlo-warning/30'
            : 'bg-auxlo-lime text-auxlo-black hover:opacity-90'
        }`}
      >
        {loading
          ? 'Recording…'
          : needsConfirm
            ? `Confirm payout despite ${formatMoney(outstanding, currency)} outstanding`
            : confirming
              ? 'Yes — record the payout'
              : 'Mark paid out'}
      </button>
      {confirming && !loading ? (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="mt-1 w-full text-[11px] text-auxlo-muted underline"
        >
          Cancel
        </button>
      ) : null}
      {error ? <p className="mt-2 text-[11px] text-auxlo-danger">{error}</p> : null}
    </div>
  );
}
