import { notFound } from 'next/navigation';
import { getPotLedger, getPotBySlug } from '@/lib/pajo/queries';
import { StatusPill } from '@/components/pajo/StatusPill';
import { formatDate } from '@/lib/dashboard/format';

function formatGBP(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return `${symbol}${value.toLocaleString('en-GB')}`;
}

/**
 * The full transparent contribution history — replaces "public list posted
 * in the group chat" and the "simple spreadsheet" per the group rules.
 * No secrets: every contribution across every cycle is visible here.
 */
export default async function LedgerPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const pot = await getPotBySlug(potSlug);
  if (!pot) notFound();

  const entries = await getPotLedger(potSlug);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-manrope text-lg font-bold text-auxlo-text">Public ledger</h3>
        <p className="mt-1 text-sm text-auxlo-muted">
          Every contribution and payout, visible to everyone — no secrets.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-auxlo-line bg-auxlo-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-auxlo-line text-left text-xs uppercase tracking-wide text-auxlo-muted">
              <th className="px-5 py-3">Week</th>
              <th className="px-5 py-3">Due date</th>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Paid</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-auxlo-muted">
                  No contributions recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={i} className="border-b border-auxlo-line last:border-0">
                  <td className="px-5 py-3 text-auxlo-muted">#{e.weekNumber}</td>
                  <td className="px-5 py-3 text-auxlo-muted">{formatDate(e.dueDate)}</td>
                  <td className="px-5 py-3 text-auxlo-text">{e.memberName}</td>
                  <td className="px-5 py-3 text-auxlo-muted">{formatGBP(e.amountDue, pot.currency)}</td>
                  <td className="px-5 py-3 text-auxlo-muted">{formatGBP(e.amountPaid, pot.currency)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={e.status} />
                  </td>
                  <td className="px-5 py-3 text-auxlo-muted">{e.reference ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
