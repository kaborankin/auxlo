'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ContributionActionsProps {
  contributionId: string;
  status: string;
  isAdmin: boolean;
  isOwn: boolean;
}

/**
 * Row-level action buttons for a contribution. Members can report their own
 * pending/late/rejected payment as paid; admins can confirm a reported
 * payment. PAID/EXEMPT_RECIPIENT/WAIVED contributions render a verified
 * badge instead of actions.
 */
export function ContributionActions({ contributionId, status, isAdmin, isOwn }: ContributionActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function call(action: string) {
    setLoading(action);
    try {
      await fetch(`/api/pajo/contributions/${contributionId}/${action}`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (status === 'PAID' || status === 'EXEMPT_RECIPIENT' || status === 'WAIVED') {
    return <span className="text-xs font-bold text-pajo-success/60">✓ Verified</span>;
  }

  const buttons: JSX.Element[] = [];

  if (isOwn && (status === 'PENDING' || status === 'LATE' || status === 'REJECTED')) {
    buttons.push(
      <button
        key="report"
        onClick={() => call('report')}
        disabled={loading !== null}
        className="rounded-pajo bg-pajo-accent px-3 py-1 text-xs font-bold text-white transition hover:bg-pajo-accent/90 disabled:opacity-50 shadow-sm"
      >
        {loading === 'report' ? '…' : 'I have paid'}
      </button>
    );
  }

  if (isAdmin && status === 'PAYMENT_REPORTED') {
    buttons.push(
      <button
        key="confirm"
        onClick={() => call('confirm')}
        disabled={loading !== null}
        className="rounded-pajo bg-pajo-success px-3 py-1 text-xs font-bold text-white transition shadow-sm"
      >
        Confirm
      </button>
    );
  }

  return <div className="flex gap-2">{buttons}</div>;
}

