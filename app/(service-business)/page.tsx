import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { clients, getTheme } from '@/config/service-business';

export const metadata: Metadata = {
  title: 'The Service Business System | Auxlo',
  description:
    'One reusable website, enquiry and booking system — configured per client, never rebuilt. Four industries, four themes, one codebase.',
};

/**
 * Portfolio index for the reusable system. This page is Auxlo-branded; the
 * client experiences it links to are deliberately not.
 */
export default function SystemIndexPage() {
  return (
    <div className="min-h-screen bg-auxlo-black font-inter text-auxlo-text">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/auxlo" className="font-manrope text-lg font-extrabold tracking-tight">
            Auxlo<span className="text-auxlo-lime">.</span>
          </Link>
          <Link
            href="/auxlo/dashboard"
            className="text-xs font-semibold text-auxlo-muted transition-colors hover:text-auxlo-lime"
          >
            View the operations layer →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-auxlo-lime">
          The Service Business System
        </p>
        <h1 className="mt-4 max-w-3xl font-manrope text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          One system. Any service business.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-auxlo-muted sm:text-lg">
          Every demo below is the same application — same components, same enquiry engine, same
          booking flow. Only the configuration changes: brand, colours, typography, services and
          questions.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {clients.map((client) => {
            const theme = getTheme(client.theme);
            return (
              <Link
                key={client.slug}
                href={`/system/${client.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-auxlo-lime/30 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-auxlo-muted">
                      {client.industry}
                    </p>
                    <h2 className="mt-2 font-manrope text-2xl font-extrabold tracking-tight text-auxlo-text group-hover:text-auxlo-lime">
                      {client.name}
                    </h2>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-auxlo-muted transition-colors group-hover:text-auxlo-lime" />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-auxlo-muted">{client.tagline}</p>

                <div className="mt-6 flex items-center gap-2">
                  {Object.values({
                    background: theme.colors.background,
                    primary: theme.colors.primary,
                    accent: theme.colors.accent,
                  }).map((color) => (
                    <span
                      key={color}
                      className="h-6 w-6 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                  ))}
                  <span className="ml-2 text-[11px] font-semibold text-auxlo-muted">
                    {theme.name} theme
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-white/5 pt-4 text-xs font-semibold text-auxlo-muted">
                  {client.enquiryFlow.length}-step enquiry
                  <span className="text-auxlo-muted/40">·</span>
                  {client.booking.enabled ? 'Online booking' : 'Enquiry only'}
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-auxlo-lime/20 bg-auxlo-lime/[0.05] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-auxlo-lime">
            The full loop
          </p>
          <p className="mt-3 max-w-2xl font-manrope text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            Website → Enquiry → Lead → Follow-up → Booking → Client
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-auxlo-muted">
            Submit an enquiry on the Hartley &amp; Sons demo, then open{' '}
            <Link href="/auxlo/dashboard" className="font-semibold text-auxlo-lime hover:underline">
              the Auxlo command centre
            </Link>{' '}
            — the CRM is populated with exactly the data this front end captures.
          </p>
        </div>
      </main>
    </div>
  );
}
