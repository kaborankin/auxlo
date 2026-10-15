import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess, isPajoPreviewMode } from '@/lib/pajo/access';
import { getPotBySlug, getPotOverview } from '@/lib/pajo/queries';
import { SettingsActions } from '@/components/pajo/SettingsActions';
import { InviteLinkCard } from '@/components/pajo/InviteLinkCard';

/** Admin-only settings: bank details, cadence, and cycle status. */
export default async function PotSettingsPage({
  params,
}: {
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;
  const session = await getServerSession(authOptions);

  const preview = !session?.user?.email && isPajoPreviewMode();
  if (!session?.user?.email && !preview) redirect('/api/auth/signin');

  let pot = null;

  if (preview) {
    pot = await getPotBySlug(potSlug);
  } else {
    if (!session?.user?.email) redirect('/api/auth/signin');
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: session.user.email as string },
    });
    if (!userProfile) redirect('/api/auth/signin');

    const access = await getPajoAccess(userProfile.id, potSlug);
    if (!access || access.role !== 'admin') notFound();

    pot = await getPotBySlug(potSlug);
  }
  if (!pot) notFound();

  const overview = await getPotOverview(potSlug);
  if (!overview) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsActions 
        potId={pot.id}
        potSlug={potSlug}
        memberCount={overview.memberCount}
        memberTarget={pot.memberTarget}
        hasActiveCycle={!!overview.activeCycle}
      />

      {!preview ? <InviteLinkCard potSlug={potSlug} /> : null}

      <div>
        <h3 className="font-manrope text-lg font-bold text-auxlo-text">Pot settings</h3>
        <p className="mt-1 text-sm text-auxlo-muted">Treasurer-only configuration.</p>
      </div>

      <div className="rounded-lg border border-auxlo-line bg-auxlo-surface p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-auxlo-muted">Contribution</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">
              £{pot.contributionAmount} / {pot.frequency}
            </dd>
          </div>
          <div>
            <dt className="text-auxlo-muted">Members</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">{pot.memberTarget}</dd>
          </div>
          <div>
            <dt className="text-auxlo-muted">Due</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][pot.dueDay]} · {pot.dueTime}
            </dd>
          </div>
          <div>
            <dt className="text-auxlo-muted">Grace period</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">{pot.graceHours}h</dd>
          </div>
          <div>
            <dt className="text-auxlo-muted">Late fee</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">£{pot.lateFeeAmount}</dd>
          </div>
          <div>
            <dt className="text-auxlo-muted">Payout order</dt>
            <dd className="mt-1 font-semibold text-auxlo-text">{pot.payoutMethod}</dd>
          </div>
        </dl>
      </div>

      {pot.bankDetails ? (
        <div className="rounded-lg border border-auxlo-line bg-auxlo-surface p-6">
          <h4 className="text-sm font-bold text-auxlo-text">Payment details</h4>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-auxlo-muted">
            {JSON.stringify(pot.bankDetails, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
