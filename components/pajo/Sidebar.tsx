import Link from 'next/link';
import { getPajoNavItems, isPajoNavActive } from './nav-items';

interface SidebarProps {
  potSlug?: string;
  potName?: string;
  activePath: string;
  isAdmin: boolean;
}

/**
 * Pajo dashboard sidebar. Desktop only — phones get the same tabs via
 * MobileNav, both drawing from components/pajo/nav-items.ts.
 */
export function Sidebar({ potSlug, potName, activePath, isAdmin }: SidebarProps) {
  const isGlobal = !potSlug;
  const base = isGlobal ? '/pajo' : `/pajo/${potSlug}`;
  const navItems = getPajoNavItems({ potSlug, isAdmin });

  return (
    <aside className="hidden w-64 shrink-0 border-r border-pajo-border bg-pajo-surface lg:flex lg:flex-col">
      <div className="px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-pajo-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="truncate font-manrope text-xl font-bold text-pajo-primary tracking-tight">
            Pajo
          </h1>
        </div>
        {!isGlobal && (
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-pajo-secondary">
            {potName}
          </p>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = isPajoNavActive({ item, activePath, isGlobal, base });
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-pajo px-3 py-2 text-sm font-medium transition-all ${
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
        {!isGlobal && (
          <Link 
            href="/pajo" 
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-pajo-secondary hover:text-pajo-primary transition-colors"
          >
            ← Back to all pots
          </Link>
        )}
        <div className="mt-2 rounded-pajo bg-pajo-bg p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-pajo-secondary">Powered by</p>
          <p className="text-xs font-bold text-pajo-primary opacity-60">Auxlo Systems</p>
        </div>
      </div>
    </aside>
  );
}

