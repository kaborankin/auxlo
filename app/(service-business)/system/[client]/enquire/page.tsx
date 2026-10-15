import { notFound } from 'next/navigation';
import { getClientConfig } from '@/config/service-business';
import { EnquiryFlow } from '@/components/service-business/enquiry/EnquiryFlow';
import { QuickEnquiryForm } from '@/components/service-business/enquiry/QuickEnquiryForm';

/**
 * The enquiry page. Leads with a direct contact/enquiry form, then offers the
 * guided multi-step flow for visitors who'd rather answer a few questions.
 * Both submit into the same intake pipeline.
 */
export default async function EnquirePage({
  params,
}: {
  params: Promise<{ client: string }>;
}) {
  const { client: slug } = await params;
  const config = getClientConfig(slug);
  if (!config) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">{config.name}</p>
          <h1 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
            Send us an enquiry
          </h1>
          <p className="mt-3 text-base leading-relaxed text-sb-muted">
            Tell us a little about your business and what you need — we&apos;ll come back with next steps.
          </p>
        </div>

        <div className="mt-10 rounded-sb-xl border border-sb-border bg-sb-surface p-6 shadow-sm sm:p-8">
          <QuickEnquiryForm client={config} idPrefix="enquire" />
        </div>

        <div className="my-12 flex items-center gap-4" role="separator">
          <span className="h-px flex-1 bg-sb-border" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sb-muted">
            Or answer a few quick questions
          </span>
          <span className="h-px flex-1 bg-sb-border" />
        </div>

        <EnquiryFlow client={config} />
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-sb-muted">
        Prefer to talk? Call{' '}
        <a
          href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
          className="font-semibold text-sb-text underline underline-offset-4"
        >
          {config.contact.phone}
        </a>{' '}
        — {config.contact.hours}
      </p>
    </div>
  );
}

