import { CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import type { ContributionRow } from '@/lib/pajo/types';

interface TreasurerCommandCentreProps {
  potName: string;
  weekNumber: number;
  totalExpected: number;
  totalCollected: number;
  paidCount: number;
  expectedCount: number;
  currency: string;
  contributions: ContributionRow[];
}

/**
 * Treasurer-only summary card shown at the top of the pot overview page —
 * collection progress, member ledger split and the payout call-to-action
 * once collection is complete.
 */
export function TreasurerCommandCentre({
  weekNumber,
  totalExpected,
  totalCollected,
  paidCount,
  expectedCount,
  currency,
  contributions,
}: TreasurerCommandCentreProps) {
  const reportedCount = contributions.filter((c) => c.status === 'PAYMENT_REPORTED').length;
  const pendingCount = expectedCount - paidCount - reportedCount;
  const isReady = paidCount === expectedCount;

  function formatGBP(value: number): string {
    const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
    return symbol + value.toLocaleString('en-GB');
  }

  return (
    <div className="rounded-pajo border border-pajo-border bg-pajo-surface overflow-hidden shadow-sm">
      <div className="bg-pajo-bg/50 px-6 py-4 border-b border-pajo-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-pajo-accent/10 p-2 text-pajo-accent">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-pajo-primary">Treasurer Actions</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
              Week {weekNumber} Status
            </p>
          </div>
        </div>
        {isReady ? (
          <div className="flex items-center gap-2 text-pajo-success text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={16} /> Payout Ready
          </div>
        ) : (
          <div className="flex items-center gap-2 text-pajo-warning text-xs font-bold uppercase tracking-wider">
            <Clock size={16} /> Collection In Progress
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-pajo-border">
        <div className="p-6 space-y-3">
          <p className="text-[10px] text-pajo-secondary uppercase tracking-widest font-bold">Total Collected</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-pajo-primary">{formatGBP(totalCollected)}</span>
            <span className="text-sm font-medium text-pajo-secondary">/ {formatGBP(totalExpected)}</span>
          </div>
          <div className="w-full bg-pajo-bg h-2 rounded-full overflow-hidden">
            <div
              className="bg-pajo-success h-full transition-all duration-500"
              style={{ width: ((totalCollected / totalExpected) * 100 || 0) + '%' }}
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[10px] text-pajo-secondary uppercase tracking-widest font-bold">Member Ledger</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <p className="text-lg font-bold text-pajo-success">{paidCount}</p>
              <p className="text-[9px] font-bold text-pajo-secondary uppercase">Paid</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-pajo-warning">{reportedCount}</p>
              <p className="text-[9px] font-bold text-pajo-secondary uppercase">Reported</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-pajo-secondary">{pendingCount}</p>
              <p className="text-[9px] font-bold text-pajo-secondary uppercase">Pending</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-pajo-bg/30 flex flex-col justify-center">
          {reportedCount > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pajo-warning">
                <AlertCircle size={18} />
                <span className="text-sm font-bold">{reportedCount} to verify</span>
              </div>
              <p className="text-xs font-medium text-pajo-secondary">
                New payments reported. Verify these in the ledger below.
              </p>
            </div>
          ) : isReady ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pajo-success">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">Ready for Payout</span>
              </div>
              <p className="text-xs font-medium text-pajo-secondary">
                Collection complete. You can now process the payout.
              </p>
              <button className="w-full py-2.5 bg-pajo-accent text-white text-xs font-bold rounded-pajo hover:bg-pajo-accent/90 transition shadow-sm flex items-center justify-center gap-2">
                Process Payout <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-pajo-primary">Awaiting Payments</p>
              <p className="text-xs font-medium text-pajo-secondary">
                The collection window is open. Pajo will notify members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
