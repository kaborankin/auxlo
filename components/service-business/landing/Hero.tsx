import Image from 'next/image';
import type { ClientConfig } from '@/types/service-business';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * The landing hero: eyebrow, headline, supporting copy, dual CTAs, an optional
 * image and a row of proof stats. CTA targets honour `primaryCtaTarget`.
 */
export function Hero({ client }: { client: ClientConfig }) {
  const base = `/system/${client.slug}`;
  const primaryHref =
    client.hero.primaryCtaTarget === 'booking' && client.booking.enabled
      ? `${base}/booking`
      : `${base}/enquire`;

  const hasImage = Boolean(client.hero.image);

  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed background image + legibility overlay */}
      {hasImage ? (
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={client.hero.image as string}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
      ) : null}

      {/* Left-aligned content column, contained but pulled to the left edge */}
      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className={`max-w-2xl py-14 sm:py-28 ${hasImage ? '' : 'pt-12 sm:pt-24'}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sb-accent sm:text-xs">
            {client.hero.eyebrow}
          </p>
          <h1
            className={`sb-heading mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:mt-5 sm:text-5xl lg:text-6xl ${
              hasImage ? 'text-white' : 'text-sb-text'
            }`}
          >
            {client.hero.title}
          </h1>
          <p
            className={`mt-4 max-w-xl text-base leading-relaxed sm:mt-6 sm:text-lg ${
              hasImage ? 'text-white/90' : 'text-sb-muted'
            }`}
          >
            {client.hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <SbButton href={primaryHref} variant="accent" size="lg">
              {client.hero.primaryCta}
            </SbButton>
            <SbButton
              href="#services"
              variant="outline"
              size="lg"
              className={
                hasImage
                  ? 'border-white/40 bg-transparent text-white hover:border-white hover:text-white'
                  : ''
              }
            >
              {client.hero.secondaryCta}
            </SbButton>
          </div>

          {client.hero.supportLine ? (
            <p
              className={`mt-10 text-sm font-medium tracking-wide ${
                hasImage ? 'text-white/70' : 'text-sb-muted'
              }`}
            >
              {client.hero.supportLine}
            </p>
          ) : null}

          {client.hero.stats?.length ? (
            <dl
              className={`mt-12 grid max-w-xl grid-cols-3 gap-8 border-t pt-8 ${
                hasImage ? 'border-white/20' : 'border-sb-border'
              }`}
            >
              {client.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dd className={`sb-heading text-2xl font-bold sm:text-3xl ${hasImage ? 'text-white' : 'text-sb-primary'}`}>
                    {stat.value}
                  </dd>
                  <dt
                    className={`mt-1 text-xs font-medium uppercase tracking-wide ${
                      hasImage ? 'text-white/70' : 'text-sb-muted'
                    }`}
                  >
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
