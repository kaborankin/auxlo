import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';
import { QuickEnquiryForm } from '@/components/service-business/enquiry/QuickEnquiryForm';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * The on-page contact / enquiry section — a real form, not just a CTA. Sits
 * at the #contact anchor. Left column sells the conversation and lists direct
 * contact routes; right column carries the enquiry form, with a secondary
 * route into booking when enabled.
 */
export function ContactSection({ client }: { client: ClientConfig }) {
  const base = `/system/${client.slug}`;

  return (
    <section id="contact" className="scroll-mt-20 border-t border-sb-border bg-sb-bg">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">Get in touch</p>
            <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
              {client.cta.title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-sb-muted">{client.cta.description}</p>

            <div className="mt-8">
              <SbButton href={`mailto:${client.contact.email}`} variant="outline">
                {client.contact.email}
              </SbButton>
            </div>

            {client.booking.enabled ? (
              <div className="mt-10 border-t border-sb-border pt-8">
                <p className="text-sm font-semibold text-sb-text">Prefer to book a time directly?</p>
                <div className="mt-4">
                  <SbButton href={`${base}/booking`} variant="outline">
                    Book a Consultation
                  </SbButton>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-sb-xl border border-sb-border bg-sb-surface p-6 shadow-sm sm:p-8">
            <h3 className="sb-heading text-lg font-bold text-sb-text">Send us an enquiry</h3>
            <p className="mt-1.5 text-sm text-sb-muted">
              Tell us a little about your business and we&apos;ll come back with next steps.
            </p>
            <div className="mt-6">
              <QuickEnquiryForm client={client} idPrefix="contact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
