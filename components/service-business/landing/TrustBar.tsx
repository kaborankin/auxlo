import { CheckCircle2 } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';

/** A compact strip of trust signals directly under the hero. */
export function TrustBar({ client }: { client: ClientConfig }) {
  if (!client.trust?.length) return null;

  return (
    <section aria-label="Why you can trust us" className="border-y border-sb-border bg-sb-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {client.trust.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm font-medium text-sb-text">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sb-accent" strokeWidth={2} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
