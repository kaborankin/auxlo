import type { ClientConfig } from '@/types/service-business';

/**
 * The positive "know where you stand" framing — a headline, supporting copy
 * and three pillars (e.g. Assess / Improve / Embed). Anchored as "How we
 * help". Rendered only when the client config provides a `problem` block.
 */
export function Problem({ client }: { client: ClientConfig }) {
  const problem = client.problem;
  if (!problem) return null;

  return (
    <section id="how" className="scroll-mt-20 border-b border-sb-border bg-sb-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <h2 className="sb-heading text-3xl font-bold tracking-tight text-sb-text sm:text-4xl">{problem.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-sb-muted">{problem.description}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {problem.pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="rounded-sb-lg border border-sb-border bg-sb-bg p-7 transition-shadow hover:shadow-sm"
            >
              <span className="sb-heading text-sm font-bold uppercase tracking-[0.2em] text-sb-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="sb-heading mt-3 text-xl font-bold text-sb-text">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sb-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
