import { notFound } from 'next/navigation';
import { getPotMembers, getPotBySlug } from '@/lib/pajo/queries';
import { StatusPill } from '@/components/pajo/StatusPill';

function formatGBP(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return `${symbol}${value.toLocaleString('en-GB')}`;
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const pot = await getPotBySlug(potSlug);
  if (!pot) notFound();

  const members = await getPotMembers(potSlug);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-manrope text-lg font-bold text-auxlo-text">Roster &amp; payout order</h3>
        <p className="mt-1 text-sm text-auxlo-muted">
          Strikes: 1st = reminder, 2nd = £{pot.lateFeeAmount} fee, 3rd = payout turn forfeited.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-auxlo-line bg-auxlo-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-auxlo-line text-left text-xs uppercase tracking-wide text-auxlo-muted">
              <th className="px-5 py-3">Position</th>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Contributed</th>
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">Strikes</th>
              <th className="px-5 py-3">Rules accepted</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.memberId} className="border-b border-auxlo-line last:border-0">
                <td className="px-5 py-3 text-auxlo-muted">
                  {m.position ?? '—'}
                  {m.hasReceivedPayout ? (
                    <span className="ml-2 text-[10px] font-bold uppercase text-auxlo-success">Paid</span>
                  ) : null}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-auxlo-text">{m.name}</p>
                  <p className="text-xs text-auxlo-muted">{m.email}</p>
                </td>
                <td className="px-5 py-3 text-auxlo-muted">{formatGBP(m.totalContributed, pot.currency)}</td>
                <td className="px-5 py-3 text-auxlo-muted">{formatGBP(m.totalReceived, pot.currency)}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      m.strikes >= 3
                        ? 'font-bold text-auxlo-danger'
                        : m.strikes === 2
                        ? 'font-bold text-auxlo-warning'
                        : 'text-auxlo-muted'
                    }
                  >
                    {m.strikes}
                  </span>
                </td>
                <td className="px-5 py-3 text-auxlo-muted">{m.rulesAccepted ? '✓' : '—'}</td>
                <td className="px-5 py-3">
                  <StatusPill status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
