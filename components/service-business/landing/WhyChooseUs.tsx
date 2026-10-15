import Image from 'next/image';
import type { ClientConfig } from '@/types/service-business';

/** The "why choose us" differentiators. */
export function WhyChooseUs({ client }: { client: ClientConfig }) {
  if (!client.why?.length) return null;

  return (
    <section className="scroll-mt-20 border-y border-sb-border bg-sb-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">Why {client.name}</p>
          <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
            The difference is in how we work
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {client.why.map((item) => (
            <div key={item.title}>
              {item.image ? (
                <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-sb-lg border border-sb-border">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : null}
              <h3 className="sb-heading text-xl font-bold text-sb-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sb-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
