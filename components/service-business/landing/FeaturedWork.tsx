import Image from 'next/image';
import type { ClientConfig } from '@/types/service-business';

/** Featured work / case highlights. */
export function FeaturedWork({ client }: { client: ClientConfig }) {
  if (!client.work?.length) return null;

  return (
    <section id="work" className="scroll-mt-20 border-y border-sb-border bg-sb-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">Recent work</p>
          <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
            Where we&apos;ve made a difference
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {client.work.map((item) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-sb-lg border border-sb-border"
            >
              {item.image ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
              ) : null}
              <div className={item.image ? 'absolute inset-x-0 bottom-0 p-5' : 'p-5'}>
                <p
                  className={`text-xs font-bold uppercase tracking-[0.18em] ${
                    item.image ? 'text-white/80' : 'text-sb-accent'
                  }`}
                >
                  {item.category}
                </p>
                <h3
                  className={`sb-heading mt-1.5 text-xl font-bold ${
                    item.image ? 'text-white' : 'text-sb-text'
                  }`}
                >
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
