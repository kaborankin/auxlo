import Image from 'next/image';
import { Quote } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';

/** Testimonials / professional summary quotes. */
export function Testimonials({ client }: { client: ClientConfig }) {
  if (!client.testimonials?.length) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">What people say</p>
        <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
          Trusted by the businesses we support
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {client.testimonials.map((t, i) => (
          <figure
            key={`${t.name}-${i}`}
            className="flex h-full flex-col rounded-sb-lg border border-sb-border bg-sb-surface p-7"
          >
            <Quote className="h-7 w-7 text-sb-accent" strokeWidth={1.5} aria-hidden />
            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-sb-text">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-sb-border pt-5">
              {t.image ? (
                <span className="relative block h-11 w-11 overflow-hidden rounded-full border border-sb-border bg-sb-bg">
                  <Image src={t.image} alt={t.name} fill className="object-cover" sizes="44px" />
                </span>
              ) : null}
              <div>
                <p className="text-sm font-bold text-sb-text">{t.name}</p>
                {t.role ? <p className="text-xs text-sb-muted">{t.role}</p> : null}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
