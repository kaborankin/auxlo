'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';
import { SbButton } from '@/components/service-business/ui/Button';

/**
 * The persistent client header. Brand (logo or name), anchor nav, and the
 * primary CTA. Collapses to a hamburger on mobile. Everything derives from
 * the client config and theme CSS variables.
 */
export function Header({ client }: { client: ClientConfig }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const base = `/system/${client.slug}`;
  const isLanding = pathname === base;

  // Anchor links only work on the landing page; elsewhere, route back to it.
  const navHref = (href: string) => (href.startsWith('#') ? (isLanding ? href : `${base}${href}`) : href);

  const ctaHref =
    client.hero.primaryCtaTarget === 'booking' && client.booking.enabled
      ? `${base}/booking`
      : `${base}/enquire`;

  // When a logo is present the header sits on the page background so the
  // logo blends into the bar (no boxed tile, no contrasting strip). Only
  // the wordmark word "Visuals" picks up the accent colour.
  const [firstWord, ...restWords] = client.name.split(' ');
  const restName = restWords.join(' ');

  return (
    <header className="sticky top-0 z-40 border-b border-sb-border/60 bg-sb-bg/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-24 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={base} className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          {client.logo ? (
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16">
              <Image src={client.logo} alt={`${client.name} logo`} fill className="object-cover" sizes="64px" />
            </span>
          ) : null}
          <span className="sb-heading truncate text-xl font-bold tracking-tight text-sb-text sm:text-2xl">
            {client.logo && restName ? (
              <>
                {firstWord} <span className="text-sb-accent">{restName}</span>
              </>
            ) : (
              client.name
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {client.nav.map((link) => (
            <Link
              key={link.href}
              href={navHref(link.href)}
              className="text-sm font-medium text-sb-muted transition-colors hover:text-sb-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <SbButton href={ctaHref} size="sm">
            {client.hero.primaryCta}
          </SbButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sb-sm text-sb-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-sb-border/60 bg-sb-bg md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8" aria-label="Mobile">
            {client.nav.map((link) => (
              <Link
                key={link.href}
                href={navHref(link.href)}
                onClick={() => setOpen(false)}
                className="rounded-sb-sm px-3 py-2.5 text-base font-medium text-sb-text hover:bg-sb-surface"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3">
              <SbButton href={ctaHref} size="md" className="w-full" onClick={() => setOpen(false)}>
                {client.hero.primaryCta}
              </SbButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
