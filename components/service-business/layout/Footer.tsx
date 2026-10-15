import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import type { ClientConfig } from '@/types/service-business';

/**
 * The client footer: brand, quick nav, and contact details. Anchored contact
 * section id lets the nav "Contact" link land here.
 */
export function Footer({ client }: { client: ClientConfig }) {
  const base = `/system/${client.slug}`;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sb-border bg-sb-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-4">
              {client.logo ? (
                <span className="relative block h-14 w-14 overflow-hidden rounded-full">
                  <Image src={client.logo} alt={`${client.name} logo`} fill className="object-cover" sizes="56px" />
                </span>
              ) : null}
              <span className="sb-heading text-xl font-bold tracking-tight text-sb-text">{client.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sb-muted">{client.tagline}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sb-muted">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {client.nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href.startsWith('#') ? `${base}${link.href}` : link.href}
                    className="text-sm font-medium text-sb-text transition-colors hover:text-sb-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sb-muted">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-sb-text">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sb-accent" strokeWidth={1.8} />
                <a href={`tel:${client.contact.phone.replace(/\s/g, '')}`} className="hover:text-sb-primary">
                  {client.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sb-accent" strokeWidth={1.8} />
                <a href={`mailto:${client.contact.email}`} className="hover:text-sb-primary">
                  {client.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sb-accent" strokeWidth={1.8} />
                <span>{client.contact.location}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sb-accent" strokeWidth={1.8} />
                <span>{client.contact.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-sb-border pt-6 text-xs text-sb-muted sm:flex-row">
          <p>
            © {year} {client.name}. All rights reserved.
          </p>
          <p>{client.industry}</p>
        </div>
      </div>
    </footer>
  );
}
