import type { ClientConfig } from '@/types/service-business';
import { SbButton } from '@/components/service-business/ui/Button';

/** The closing call-to-action band. */
export function FinalCTA({ client }: { client: ClientConfig }) {
  const base = `/system/${client.slug}`;
  const href =
    client.hero.primaryCtaTarget === 'booking' && client.booking.enabled
      ? `${base}/booking`
      : `${base}/enquire`;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
      <div className="rounded-sb-xl bg-sb-primary px-6 py-14 text-center sm:px-12">
        <h2 className="sb-heading mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {client.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">{client.cta.description}</p>
        <div className="mt-8 flex justify-center">
          <SbButton href={href} variant="accent" size="lg">
            {client.cta.button}
          </SbButton>
        </div>
      </div>
    </section>
  );
}
