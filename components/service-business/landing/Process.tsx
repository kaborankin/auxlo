import type { ClientConfig } from '@/types/service-business';

/** The numbered "how we work" process steps. */
export function Process({ client }: { client: ClientConfig }) {
  if (!client.process?.length) return null;

  return (
    <section id="process" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sb-accent">How we work</p>
        <h2 className="sb-heading mt-3 text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">
          A straightforward, honest process
        </h2>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {client.process.map((step, index) => (
          <li key={step.title} className="relative">
            <span className="sb-heading text-4xl font-bold text-sb-accent/60">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="sb-heading mt-3 text-lg font-bold text-sb-text">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-sb-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
