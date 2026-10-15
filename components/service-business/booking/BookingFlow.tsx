'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck2, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';
import { contactSchema } from '@/lib/service-business/validation';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * The self-serve booking experience. Picks a service, an available day
 * (derived from `availableDays`, `leadTimeDays`, `horizonDays`) and a time
 * slot, captures contact details, then posts to the intake edge and confirms
 * with a reference.
 */

interface Slot {
  date: string; // yyyy-mm-dd
  label: string; // e.g. "Mon 2 Sep"
}

const DAY = 24 * 60 * 60 * 1000;

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function BookingFlow({ client }: { client: ClientConfig }) {
  const cfg = client.booking;
  const [service, setService] = useState<string>('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [time, setTime] = useState<string>('');
  const [offset, setOffset] = useState(0); // weeks of horizon to page through
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Build the bookable day list once from the config rules.
  const days = useMemo<Slot[]>(() => {
    const out: Slot[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const from = new Date(start.getTime() + cfg.leadTimeDays * DAY);
    for (let i = 0; i < cfg.horizonDays; i++) {
      const d = new Date(from.getTime() + i * DAY);
      if (!cfg.availableDays.includes(d.getDay())) continue;
      out.push({
        date: toISO(d),
        label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return out;
  }, [cfg.availableDays, cfg.leadTimeDays, cfg.horizonDays]);

  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(days.length / pageSize));
  const page = days.slice(offset * pageSize, offset * pageSize + pageSize);
  const canSubmit = service && slot && time && !submitting;

  function validateContact(): boolean {
    const result = contactSchema.safeParse({ name, email, phone });
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  async function submit() {
    setSubmitError(null);
    if (!service || !slot || !time) {
      setSubmitError('Please choose a service, day and time.');
      return;
    }
    if (!validateContact()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/service-business/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'booking',
          clientSlug: client.slug,
          service,
          date: slot.date,
          time,
          customer: { name, email, phone },
        }),
      });
      const data = (await res.json()) as { ok: boolean; reference?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      setReference(data.reference ?? null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-xl rounded-sb-xl border border-sb-border bg-sb-surface p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sb-accent/15 text-sb-primary">
          <CalendarCheck2 className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h2 className="sb-heading mt-6 text-3xl font-bold tracking-tight text-sb-text">You&apos;re booked in</h2>
        <p className="mt-3 text-base leading-relaxed text-sb-muted">
          {service} — {slot?.label} at {time}. {cfg.confirmationNote}
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-sb-md border border-sb-border bg-sb-bg px-4 py-2 text-sm font-semibold text-sb-text">
          <CheckCircle2 className="h-4 w-4 text-sb-accent" /> Reference: {reference}
        </p>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-sb-md border border-sb-border bg-sb-bg px-4 py-3 text-sm text-sb-text placeholder:text-sb-muted focus:border-sb-accent focus:outline-none';

  const choiceBtn = (selected: boolean) =>
    `rounded-sb-md border px-3 py-3.5 text-sm font-medium transition-colors sm:py-2.5 ${
      selected
        ? 'border-sb-primary bg-sb-primary text-white'
        : 'border-sb-border bg-sb-surface text-sb-text hover:border-sb-accent'
    }`;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
      <div className="space-y-10 lg:col-span-3">
        <div>
          <h2 className="sb-heading text-lg font-bold text-sb-text">1. Choose a service</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {client.services.map((svc) => (
              <button
                key={svc.name}
                type="button"
                onClick={() => setService(svc.name)}
                className={choiceBtn(service === svc.name)}
              >
                {svc.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="sb-heading text-lg font-bold text-sb-text">2. Pick a day</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOffset((o) => Math.max(0, o - 1))}
                disabled={offset === 0}
                aria-label="Previous days"
                className="flex h-8 w-8 items-center justify-center rounded-sb-sm border border-sb-border text-sb-text disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOffset((o) => Math.min(pageCount - 1, o + 1))}
                disabled={offset >= pageCount - 1}
                aria-label="Next days"
                className="flex h-8 w-8 items-center justify-center rounded-sb-sm border border-sb-border text-sb-text disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          {page.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {page.map((d) => (
                <button key={d.date} type="button" onClick={() => setSlot(d)} className={choiceBtn(slot?.date === d.date)}>
                  {d.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-sb-muted">No availability in this window — try the next page.</p>
          )}
        </div>

        <div>
          <h2 className="sb-heading text-lg font-bold text-sb-text">3. Pick a time</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cfg.times.map((t) => (
              <button key={t} type="button" onClick={() => setTime(t)} className={choiceBtn(time === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-sb-xl border border-sb-border bg-sb-surface p-6 sm:p-7 lg:sticky lg:top-24">
          <h2 className="sb-heading text-lg font-bold text-sb-text">4. Your details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="bk-name" className="mb-1.5 block text-xs font-semibold text-sb-muted">
                Full name
              </label>
              <input id="bk-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              {errors.name ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="bk-email" className="mb-1.5 block text-xs font-semibold text-sb-muted">
                Email
              </label>
              <input id="bk-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              {errors.email ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor="bk-phone" className="mb-1.5 block text-xs font-semibold text-sb-muted">
                Phone
              </label>
              <input id="bk-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              {errors.phone ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone}</p> : null}
            </div>
          </div>

          <div className="mt-6 rounded-sb-md border border-sb-border bg-sb-bg p-4 text-sm text-sb-muted">
            <p className="font-semibold text-sb-text">{service || 'Select a service'}</p>
            <p className="mt-1">{slot ? `${slot.label} at ${time || '…'}` : 'Choose a day and time'}</p>
          </div>

          {submitError ? <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p> : null}

          <div className="mt-6">
            <SbButton onClick={submit} disabled={!canSubmit} className="w-full" size="lg">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                </>
              ) : (
                'Confirm booking'
              )}
            </SbButton>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-sb-muted">{cfg.confirmationNote}</p>
        </div>
      </div>
    </div>
  );
}


