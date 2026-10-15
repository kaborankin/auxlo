'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import type { ClientConfig, EnquiryStep } from '@/types/service-business';
import { contactSchema, rhfValidate } from '@/lib/service-business/validation';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * The multi-step enquiry experience. Walks the client's configured
 * `enquiryFlow` one step at a time, validating each before advancing, and ends
 * on contact capture. Submits the whole thing to the intake edge and shows a
 * reference on success.
 */
export function EnquiryFlow({ client }: { client: ClientConfig }) {
  const steps = client.enquiryFlow;
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState(false);

  const step: EnquiryStep = steps[index];
  const isLast = index === steps.length - 1;
  const isContact = step.type === 'contact';

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Record<string, string>>({ mode: 'onTouched' });

  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index, steps.length]);

  const optionsFor = (s: EnquiryStep): string[] =>
    s.type === 'service' ? client.services.map((svc) => svc.name) : (s.options ?? []);

  function fieldError(name: string): string | undefined {
    const err = name.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, errors as unknown);
    return err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : undefined;
  }

  async function goNext() {
    setStepError(false);
    setSubmitError(null);

    if (isContact) {
      const valid = await trigger(['contact.name', 'contact.email', 'contact.phone']);
      if (!valid) {
        setStepError(true);
        return;
      }
      await submit();
      return;
    }

    const valid = await trigger(step.id);
    if (!valid) {
      setStepError(true);
      return;
    }
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setStepError(false);
    setSubmitError(null);
    setIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const values = getValues();
      const answers: Record<string, string> = {};
      for (const s of steps) {
        if (s.type !== 'contact') answers[s.id] = values[s.id] ?? '';
      }
      const contact = contactSchema.parse(values.contact);

      const res = await fetch('/api/service-business/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'enquiry', clientSlug: client.slug, answers, contact }),
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
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="sb-heading mt-6 text-3xl font-bold tracking-tight text-sb-text">Thanks — we&apos;ve got it</h1>
        <p className="mt-3 text-base leading-relaxed text-sb-muted">
          Your enquiry has been received. We&apos;ll be in touch shortly to continue the conversation.
        </p>
        <p className="mt-6 inline-block rounded-sb-md border border-sb-border bg-sb-bg px-4 py-2 text-sm font-semibold text-sb-text">
          Reference: {reference}
        </p>
      </div>
    );
  }


  const inputCls =
    'w-full rounded-sb-md border border-sb-border bg-sb-bg px-4 py-3 text-sm text-sb-text placeholder:text-sb-muted focus:border-sb-accent focus:outline-none';

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-sb-muted">
          <span>
            Step {index + 1} of {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sb-border">
          <div
            className="h-full rounded-full bg-sb-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-sb-xl border border-sb-border bg-sb-surface p-6 sm:p-8">
        <h1 className="sb-heading text-2xl font-bold tracking-tight text-sb-text">{step.title}</h1>
        {step.description ? <p className="mt-2 text-sm text-sb-muted">{step.description}</p> : null}

        <div className="mt-6">
          {step.type === 'service' || step.type === 'options' ? (
            <div className="grid grid-cols-1 gap-3">
              {optionsFor(step).map((option) => {
                const selected = getValues(step.id) === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-sb-md border px-4 py-3 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-sb-primary bg-sb-primary/5 text-sb-text'
                        : 'border-sb-border bg-sb-bg text-sb-text hover:border-sb-accent'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option}
                      className="h-4 w-4 accent-[var(--sb-primary)]"
                      {...register(step.id, { validate: rhfValidate(step) })}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          ) : step.type === 'textarea' ? (
            <textarea
              rows={5}
              placeholder={step.placeholder}
              className={inputCls}
              {...register(step.id, { validate: rhfValidate(step) })}
            />
          ) : step.type === 'text' ? (
            <input
              type="text"
              placeholder={step.placeholder}
              className={inputCls}
              {...register(step.id, { validate: rhfValidate(step) })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(
                [
                  { name: 'contact.name', label: 'Full name', type: 'text', autoComplete: 'name' },
                  { name: 'contact.email', label: 'Email', type: 'email', autoComplete: 'email' },
                  { name: 'contact.phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                ] as const
              ).map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-xs font-semibold text-sb-muted" htmlFor={`enq-${f.name}`}>
                    {f.label}
                  </label>
                  <input
                    id={`enq-${f.name}`}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    className={inputCls}
                    {...register(f.name)}
                  />
                  {fieldError(f.name) ? (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{fieldError(f.name)}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {!isContact && fieldError(step.id) ? (
            <p className="mt-3 text-xs font-medium text-red-600">{fieldError(step.id)}</p>
          ) : null}
          {!isContact && stepError && !fieldError(step.id) ? (
            <p className="mt-3 text-xs font-medium text-red-600">Please complete this step to continue.</p>
          ) : null}
          {submitError ? <p className="mt-3 text-sm font-medium text-red-600">{submitError}</p> : null}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <SbButton variant="ghost" onClick={goBack} disabled={index === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" /> Back
          </SbButton>
          <SbButton onClick={goNext} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : isLast ? (
              'Send enquiry'
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </SbButton>
        </div>
      </div>
    </div>
  );
}
