import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoHomeDashboard } from '@/lib/pajo/queries';
import { StatCard } from '@/components/pajo/StatCard';
import { isPajoPreviewMode, getDiscoverablePotsForUser } from '@/lib/pajo/access';
import { StatusPill } from '@/components/pajo/StatusPill';
import { HomeTopbar } from '@/components/pajo/HomeTopbar';
import { Sidebar } from '@/components/pajo/Sidebar';
import { EmptyDashboard } from '@/components/pajo/EmptyDashboard';
import { DiscoverPots } from '@/components/pajo/DiscoverPots';
import { timeAgo } from '@/lib/dashboard/format';
import { CircleDollarSign, Users, Wallet, ArrowUpRight, AlertTriangle } from 'lucide-react';

function formatGBP(value: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return symbol + value.toLocaleString('en-GB');
}

export default async function PajoHomePage() {
  const session = await getServerSession(authOptions);
  const preview = !session?.user?.email && isPajoPreviewMode();

  let userId: string | null = null;
  let displayName = 'there';

  if (!preview) {
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: session?.user?.email as string },
    });
    if (!userProfile) redirect('/api/auth/signin');
    userId = userProfile.id;
    displayName = userProfile.name ?? userProfile.email.split('@')[0];
    if (userProfile.status === 'new') redirect('/auth/onboard');
  }

  const dashboard = await getPajoHomeDashboard(userId, displayName);
  const { summary, circles, activity } = dashboard;
  // Advertised circles this user is NOT a member of (metadata only, see access.ts).
  const discoverablePots = userId ? await getDiscoverablePotsForUser(userId) : [];
  const headerList = await headers();
  const activePath = headerList.get('x-pathname') ?? '/pajo';

  return (
    <div className="flex h-screen overflow-hidden bg-pajo-bg text-pajo-primary">
      {!preview && <Sidebar activePath={activePath} isAdmin={true} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!preview && (
          <HomeTopbar
            userEmail={session?.user?.email || ''}
            userName={displayName}
            userId={userId || undefined}
          />
        )}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-10">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-manrope text-3xl font-bold tracking-tight">
                  {preview ? 'Your circles' : 'Good morning, ' + displayName.split(' ')[0]}
                </h1>
                <p className="mt-2 text-sm font-medium text-pajo-secondary">
                  Manage your community savings and contributions in one place.
                </p>
              </div>
              {!preview && (
                <Link
                  href="/pajo/new"
                  className="inline-flex items-center justify-center gap-2 rounded-pajo bg-pajo-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-pajo-accent/90"
                >
                  <CircleDollarSign size={16} /> New Circle
                </Link>
              )}
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Active Pots"
                value={summary.activePots.toString()}
                icon={Users}
              />
              <StatCard
                label="This Week Collected"
                value={formatGBP(summary.thisWeekCollected, summary.currency)}
                icon={Wallet}
                tone="success"
                hint="Across all pots"
              />
              <StatCard
                label="Upcoming Payouts"
                value={formatGBP(summary.upcomingPayouts, summary.currency)}
                icon={CircleDollarSign}
              />
              <StatCard
                label="Outstanding"
                value={formatGBP(summary.outstanding, summary.currency)}
                icon={AlertTriangle}
                tone={summary.outstanding > 0 ? 'warning' : 'default'}
                hint="Not yet collected this week"
              />
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-manrope text-lg font-bold">My Pots</h3>
              </div>
              {circles.length === 0 ? (
                <div className="rounded-pajo border border-pajo-border bg-pajo-surface p-1 shadow-sm">
                  <EmptyDashboard />
                </div>
              ) : (
                <div className="overflow-hidden rounded-pajo border border-pajo-border bg-pajo-surface shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-pajo-border bg-pajo-bg/50 text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                          <th className="px-6 py-4">Pot</th>
                          <th className="px-6 py-4">Contribution</th>
                          <th className="px-6 py-4">Progress</th>
                          <th className="px-6 py-4">Next Payout</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pajo-border">
                        {circles.map((c) => (
                          <tr key={c.potId} className="group transition-colors hover:bg-pajo-bg/30">
                            <td className="px-6 py-4">
                              <Link
                                href={'/pajo/' + c.slug}
                                className="font-bold text-pajo-primary group-hover:text-pajo-accent"
                              >
                                {c.name}
                              </Link>
                              <p className="text-[10px] font-medium text-pajo-secondary">
                                {c.memberCount} / {c.memberTarget} members
                              </p>
                            </td>
                            <td className="px-6 py-4 text-pajo-secondary font-medium">
                              {formatGBP(c.contributionAmount, c.currency)}
                              <span className="ml-1 text-[10px] opacity-70">/ {c.frequency}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-32">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-pajo-secondary">
                                    {Math.round((c.thisWeekCollected / (c.thisWeekExpected || 1)) * 100)}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-pajo-bg">
                                  <div
                                    className="h-full rounded-full bg-pajo-success transition-all"
                                    style={{
                                      width:
                                        Math.min(100, (c.thisWeekCollected / (c.thisWeekExpected || 1)) * 100) + '%',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-pajo-secondary font-medium">
                              {c.nextPayoutAmount !== null ? formatGBP(c.nextPayoutAmount, c.currency) : '—'}
                              {c.nextRecipientName ? (
                                <p className="text-[10px] font-medium text-pajo-accent">
                                  → {c.nextRecipientName}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-6 py-4">
                              <StatusPill status={c.liveStatus || 'closed'} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={'/pajo/' + c.slug}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-pajo-secondary hover:bg-pajo-bg hover:text-pajo-accent transition-colors"
                              >
                                <ArrowUpRight size={18} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <DiscoverPots pots={discoverablePots} />

            {activity.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-manrope text-lg font-bold">Recent Activity</h3>
                </div>
                <div className="rounded-pajo border border-pajo-border bg-pajo-surface shadow-sm divide-y divide-pajo-border">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-pajo-primary">{item.message}</p>
                        {item.potName ? (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                            {item.potName}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs font-medium text-pajo-secondary whitespace-nowrap">
                        {timeAgo(item.at)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

