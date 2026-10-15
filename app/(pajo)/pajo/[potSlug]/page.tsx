import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { CircleDollarSign, Users, Trophy, Wallet, UserPlus } from 'lucide-react';
import { authOptions } from '@/lib/auth-config';
import { getPotOverview } from '@/lib/pajo/queries';
import { getPajoAccess, isPajoPreviewMode } from '@/lib/pajo/access';
import prisma from '@/lib/db';
import { StatusPill } from '@/components/pajo/StatusPill';
import { StatCard } from '@/components/pajo/StatCard';
import { TreasurerCommandCentre } from '@/components/pajo/TreasurerCommandCentre';
import { ContributionActions } from '@/components/pajo/ContributionActions';
import { InviteBox } from '@/components/pajo/InviteBox';

function formatGBP(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return symbol + value.toLocaleString('en-GB');
}

export default async function PotOverviewPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const overview = await getPotOverview(potSlug);
  if (!overview) notFound();

  const { pot, activeCycle, currentWeek, nextRecipient, memberCount, weeklyPayout } = overview;

  const session = await getServerSession(authOptions);
  const preview = !session?.user?.email && isPajoPreviewMode();
  const userProfile = session?.user?.email
    ? await prisma.userProfile.findUnique({ where: { email: session.user.email } })
    : null;
  const access = userProfile ? await getPajoAccess(userProfile.id, potSlug) : null;
  const isAdmin = access?.role === 'admin' || preview;

  return (
    <div className="space-y-8">
      {isAdmin && memberCount < pot.memberTarget && (
        <div className="rounded-pajo border border-pajo-accent/20 bg-pajo-accent/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-pajo-accent font-bold text-lg flex items-center gap-2">
              <UserPlus size={20} /> Finish setting up your pot
            </h3>
            <p className="text-sm font-medium text-pajo-secondary mt-1">
              You need {pot.memberTarget - memberCount} more members to start the first cycle. Share this
              invite link with them:
            </p>
          </div>
          <InviteBox potSlug={potSlug} />
        </div>
      )}

      {isAdmin && currentWeek && (
        <TreasurerCommandCentre
          potName={pot.name}
          weekNumber={currentWeek.weekNumber}
          totalExpected={currentWeek.totalExpected}
          totalCollected={currentWeek.totalCollected}
          paidCount={currentWeek.paidCount}
          expectedCount={currentWeek.expectedCount}
          currency={pot.currency}
          contributions={currentWeek.contributions}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Payout Amount"
          value={formatGBP(weeklyPayout, pot.currency)}
          hint={'Expected: ' + formatGBP(weeklyPayout, pot.currency)}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Members"
          value={memberCount + ' / ' + pot.memberTarget}
          hint={activeCycle ? 'Cycle ' + activeCycle.cycleNumber : 'Waiting to start'}
          icon={Users}
        />
        <StatCard
          label="Week Collection"
          value={currentWeek ? formatGBP(currentWeek.totalCollected, pot.currency) : '—'}
          hint={currentWeek ? 'of ' + formatGBP(currentWeek.totalExpected, pot.currency) : undefined}
          icon={Wallet}
          tone={
            currentWeek && currentWeek.totalCollected < currentWeek.totalExpected ? 'warning' : 'success'
          }
        />
        <StatCard
          label="Next Recipient"
          value={nextRecipient?.name ?? '—'}
          hint={nextRecipient ? 'Position #' + (nextRecipient.position ?? '—') : 'Final week'}
          icon={Trophy}
        />
      </div>

      <div className="rounded-pajo border border-pajo-border bg-pajo-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-pajo-border px-6 py-4 bg-pajo-bg/30">
          <h3 className="font-manrope text-base font-bold text-pajo-primary">
            {currentWeek ? 'Week ' + currentWeek.weekNumber + ' — Contribution Ledger' : 'No Active Week'}
          </h3>
          {currentWeek ? <StatusPill status={currentWeek.liveStatus} /> : null}
        </div>
        {currentWeek ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pajo-border text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Due</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pajo-border">
                {currentWeek.contributions.map((c) => (
                  <tr key={c.contributionId} className="group hover:bg-pajo-bg/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-pajo-primary">{c.memberName}</td>
                    <td className="px-6 py-4 text-pajo-secondary font-medium">
                      {formatGBP(c.amountDue, pot.currency)}
                    </td>
                    <td className="px-6 py-4 text-pajo-secondary font-medium">
                      {formatGBP(c.amountPaid, pot.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-pajo-secondary text-xs">{c.reference ?? '—'}</td>
                    <td className="px-6 py-4">
                      <ContributionActions
                        contributionId={c.contributionId}
                        status={c.status}
                        isAdmin={isAdmin}
                        isOwn={userProfile?.id === c.userId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-pajo-secondary">
              This pot doesn&apos;t have an active cycle yet. Start one from Settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
