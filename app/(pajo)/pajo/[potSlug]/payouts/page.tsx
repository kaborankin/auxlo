import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPotSchedule, getPotBySlug } from '@/lib/pajo/queries';
import { getPajoAccess } from '@/lib/pajo/access';
import { StatusPill } from '@/components/pajo/StatusPill';
import { PayoutAction } from '@/components/pajo/PayoutAction';
import { formatDate } from '@/lib/dashboard/format';

function formatGBP(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return `${symbol}${value.toLocaleString('en-GB')}`;
}

export default async function PayoutsPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const pot = await getPotBySlug(potSlug);
  if (!pot) notFound();

  const weeks = await getPotSchedule(potSlug);

  const session = await getServerSession(authOptions);
  const userProfile = session?.user?.email
    ? await prisma.userProfile.findUnique({ where: { email: session.user.email } })
    : null;
  const access = userProfile ? await getPajoAccess(userProfile.id, potSlug) : null;
  const isAdmin = access?.role === 'admin';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-manrope text-lg font-bold text-auxlo-text">Cycle schedule</h3>
        <p className="mt-1 text-sm text-auxlo-muted">
          One recipient per week — they don't contribute that week, so the payout equals what the
          other members pay in. Once a member has been paid out, they still contribute every other
          week until the cycle finishes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {weeks.map((w) => (
          <div key={w.weekId} className="rounded-lg border border-auxlo-line bg-auxlo-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-auxlo-muted">
                Week {w.weekNumber}
              </span>
              <StatusPill status={w.liveStatus} />
            </div>
            <p className="mt-3 font-manrope text-lg font-bold text-auxlo-text">
              {w.recipientName ?? 'Unassigned'}
            </p>
            <p className="text-xs text-auxlo-muted">Due {formatDate(w.dueDate)}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-auxlo-muted">Collected</span>
              <span className="font-semibold text-auxlo-text">
                {formatGBP(w.totalCollected, pot.currency)} / {formatGBP(w.totalExpected, pot.currency)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-auxlo-muted">Payout</span>
              <span className="font-semibold text-auxlo-lime">{formatGBP(w.payoutAmount, pot.currency)}</span>
            </div>
            {isAdmin && w.liveStatus !== 'paid-out' ? (
              <PayoutAction
                weekId={w.weekId}
                disabled={false}
                outstanding={Math.max(0, w.totalExpected - w.totalCollected)}
                currency={pot.currency}
              />
            ) : null}
          </div>
        ))}
        {weeks.length === 0 ? (
          <p className="text-sm text-auxlo-muted">No active cycle yet.</p>
        ) : null}
      </div>
    </div>
  );
}
