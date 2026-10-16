'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { getPajoNavItems, isPajoNavActive } from './nav-items';

interface MobileNavProps {
  potSlug?: string;
  potName?: string;
  isAdmin: boolean;
  activePath?: string;
}

/**
 * Mobile navigation. The desktop sidebar is hidden below `lg`, which previously
 * left phones with no way to move around the app at all. This renders a
 * hamburger that opens a slide-over drawer built from the *same* nav definition
 * as the sidebar.
 */
export function MobileNav({ potSlug, potName, isAdmin, activePath }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isGlobal = !potSlug;
  const base = isGlobal ? '/pajo' : `/pajo/${potSlug}`;
  const current = activePath || pathname || '';
  const navItems = getPajoNavItems({ potSlug, isAdmin });

  // Escape closes the drawer, and background scrolling is locked while open.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pajo border border-pajo-border text-pajo-primary transition hover:bg-pajo-bg lg:hidden"
      >
        <Menu size={18} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-pajo-primary/40"
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-pajo-surface shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-pajo-border px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-manrope text-base font-bold text-pajo-primary">
                  {isGlobal ? 'Dashboard' : potName || 'Pajo'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                  {isGlobal ? 'Pajo' : 'Pajo · Circle'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pajo text-pajo-secondary transition hover:bg-pajo-bg"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isPajoNavActive({ item, activePath: current, isGlobal, base });
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-pajo px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-pajo-bg text-pajo-accent'
                        : 'text-pajo-secondary hover:bg-pajo-bg/50 hover:text-pajo-primary'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-pajo-accent' : 'text-pajo-secondary'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-pajo-border p-4">
              {!isGlobal ? (
                <Link
                  href="/pajo"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-pajo-secondary transition-colors hover:text-pajo-primary"
                >
                  ← Back to all pots
                </Link>
              ) : null}
              <div className="mt-2 rounded-pajo bg-pajo-bg p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">
                  Powered by
                </p>
                <p className="text-xs font-bold text-pajo-primary opacity-60">Auxlo Systems</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
