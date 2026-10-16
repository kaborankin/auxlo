'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, CheckCircle2, Info } from 'lucide-react';

/**
 * A pot the signed-in user may *discover* but is not yet a member of.
 * Metadata only — this is exactly what the API is allowed to expose.
 */
export interface DiscoverablePotCard {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  contributionAmount: number;
  currency: string;
  frequency: string;
  memberTarget: number;
  memberCount: number;
  payoutMethod: string;
  organizationName: string;
  myRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

function money(value: number, currency: string) {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : currency.toUpperCase() + ' ';
  return symbol + value.toLocaleString('en-GB');
}

/**
 * Advertised circles the user has not joined. Deliberately offers no link into
 * /pajo/<slug>: a non-member cannot enter a pot, they can only ask to join and
 * wait for the treasurer's approval.
 */
export function DiscoverPots({ pots }: { pots: DiscoverablePotCard[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (pots.length === 0) return null;

  async function requestToJoin(slug: string) {
    setBusy(slug);
    setError(null);
    try {
      const res = await fetch(`/api/pajo/pots/${slug}/join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOverrides((s) => ({ ...s, [slug]: 'PENDING' }));
        router.refresh();
      } else {
        setError(data.error || 'Could not send your request.');
      }
    } catch {
      setError('Connection error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <div className="mb-4">
        <h3 className="font-manrope text-lg font-bold">Discover circles</h3>
        <p className="mt-1 text-sm font-medium text-pajo-secondary">
          These circles are open for new members. You can see the basics, but you&apos;ll only get
          access to the ledger once the treasurer approves your request.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-pajo bg-pajo-danger/10 px-4 py-3 text-xs font-bold text-pajo-danger">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pots.map((pot) => {
          const status = overrides[pot.slug] ?? pot.myRequestStatus;
          const isFull = pot.memberCount >= pot.memberTarget;

          return (
            <div
              key={pot.id}
              className="flex flex-col justify-between rounded-pajo border border-pajo-border bg-pajo-surface p-6 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-manrope text-base font-bold text-pajo-primary">{pot.name}</h4>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                      {pot.organizationName}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pajo-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                    <Users size={11} />
                    {pot.memberCount}/{pot.memberTarget}
                  </span>
                </div>

                {pot.description ? (
                  <p className="mt-3 text-sm font-medium text-pajo-secondary">{pot.description}</p>
                ) : null}

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                      Contribution
                    </dt>
                    <dd className="mt-0.5 font-bold text-pajo-primary">
                      {money(pot.contributionAmount, pot.currency)}
                      <span className="font-medium text-pajo-secondary"> / {pot.frequency}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                      Payout order
                    </dt>
                    <dd className="mt-0.5 font-bold uppercase text-pajo-primary">{pot.payoutMethod}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5">
                {status === 'PENDING' ? (
                  <div className="flex items-center gap-2 rounded-pajo bg-pajo-warning/10 px-4 py-3 text-xs font-bold text-pajo-warning">
                    <Clock size={14} /> Request pending treasurer approval
                  </div>
                ) : isFull ? (
                  <div className="flex items-center gap-2 rounded-pajo bg-pajo-bg px-4 py-3 text-xs font-bold text-pajo-secondary">
                    <Info size={14} /> This circle is already full
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => requestToJoin(pot.slug)}
                    disabled={busy !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-pajo bg-pajo-accent px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-pajo-accent/90 disabled:opacity-60"
                  >
                    {busy === pot.slug ? (
                      'Sending request…'
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        {status === 'REJECTED' ? 'Request again' : 'Request to join'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
