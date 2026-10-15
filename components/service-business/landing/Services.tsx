import Image from 'next/image';
import type { ClientConfig } from '@/types/service-business';

/** The services grid. Each card optionally shows a thumbnail and price hint. */
export function Services({ client }: { client: ClientConfig }) {
  if (!client.services?.length) return null;

  return (
    <section id="services" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">What we do</p>
        <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
          Services built around your business
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {client.services.map((service) => (
          <article
            key={service.name}
            className="group flex h-full flex-col overflow-hidden rounded-sb-lg border border-sb-border bg-sb-surface transition-shadow hover:shadow-md"
          >
            {service.image ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="sb-heading text-lg font-bold text-sb-text">{service.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-sb-muted">{service.description}</p>
              {service.priceHint ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sb-primary">
                  {service.priceHint}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
