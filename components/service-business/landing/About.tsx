import Image from 'next/image';
import type { ClientConfig } from '@/types/service-business';

/**
 * A standalone section for the professional behind the business.
 * Anchored as "About".
 */
export function About({ client }: { client: ClientConfig }) {
  const about = client.about;
  if (!about) return null;

  return (
    <section id="why" className="scroll-mt-20 border-t border-sb-border bg-sb-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Image Column */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sb-surface lg:aspect-auto lg:h-[600px]">
            {about.image ? (
              <Image
                src={about.image}
                alt={about.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sb-muted">
                {about.name}
              </div>
            )}
          </div>

          {/* Content Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">About the Professional</p>
            <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
              {about.name}
            </h2>
            <p className="mt-1 text-lg font-medium text-sb-muted">{about.role}</p>
            
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-sb-text/80">
              {about.bio.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
