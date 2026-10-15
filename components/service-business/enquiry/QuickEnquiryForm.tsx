'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';
import { contactSchema } from '@/lib/service-business/validation';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * A compact, single-step enquiry form (contact details + an optional service
 * picker + a short message). Submits a full enquiry to the intake edge so it
 * flows into the same pipeline as the multi-step flow. Used by both the
 * contact section and the /enquire page.
 */
export function QuickEnquiryForm({ client, idPrefix }: { client: ClientConfig; idPrefix: string }) {
  const [service, setService] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputCls =
    'w-full rounded-sb-md border border-sb-border bg-sb-bg px-4 py-3 text-sm text-sb-text placeholder:text-sb-muted focus:border-sb-accent focus:outline-none';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const contactCheck = contactSchema.safeParse({ name, email, phone });
    const next: Record<string, string> = {};
    if (!contactCheck.success) {
      for (const issue of contactCheck.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!next[key]) next[key] = issue.message;
      }
    }
    if (message.trim().length === 1) next.message = 'Please add a little detail';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const answers: Record<string, string> = {};
      if (service) answers.service = service;
      if (message.trim()) answers.message = message.trim();

      const res = await fetch('/api/service-business/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'enquiry', clientSlug: client.slug, answers, contact: { name, email, phone } }),
      });
      const data = (await res.json()) as { ok: boolean; reference?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      // Deliverable builds (no intake pipeline): fall back to opening the
      // visitor's email client so the message still reaches the studio.
      if (data.reference === 'RECORDED') {
        const subject = `Shoot enquiry — ${service || 'General enquiry'}`;
        const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service || 'General enquiry'}\n\n${message}`;
        window.location.href = `mailto:${client.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      setReference(data.reference ?? null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="rounded-sb-lg border border-sb-border bg-sb-bg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sb-accent/15 text-sb-primary">
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <p className="sb-heading mt-4 text-xl font-bold text-sb-text">Thanks — we&apos;ve got it</p>
        <p className="mt-2 text-sm text-sb-muted">We&apos;ll be in touch shortly.</p>
        <p className="mt-4 inline-block rounded-sb-md border border-sb-border bg-sb-surface px-3 py-1.5 text-xs font-semibold text-sb-text">
          Reference: {reference}
        </p>
      </div>
    );
  }


  const fields = [
    { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', value: name, set: setName },
    { id: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', value: phone, set: setPhone },
  ] as const;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-service`} className="mb-1.5 block text-xs font-semibold text-sb-muted">
          What do you need help with?
        </label>
        <select id={`${idPrefix}-service`} value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
          <option value="">Select a service (optional)…</option>
          {client.services.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="General enquiry">General enquiry</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id}>
            <label htmlFor={`${idPrefix}-${f.id}`} className="mb-1.5 block text-xs font-semibold text-sb-muted">
              {f.label}
            </label>
            <input
              id={`${idPrefix}-${f.id}`}
              type={f.type}
              autoComplete={f.autoComplete}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className={inputCls}
            />
            {errors[f.id] ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors[f.id]}</p> : null}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-email`} className="mb-1.5 block text-xs font-semibold text-sb-muted">
          Email
        </label>
        <input id={`${idPrefix}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        {errors.email ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-message`} className="mb-1.5 block text-xs font-semibold text-sb-muted">
          How can we help? <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id={`${idPrefix}-message`}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
          placeholder="Tell us a little about your business and what you'd like support with…"
        />
        {errors.message ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.message}</p> : null}
      </div>

      {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}

      <div>
        <SbButton type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            'Send enquiry'
          )}
        </SbButton>
      </div>
    </form>
  );
}
