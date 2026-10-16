import type { ReactNode } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

interface TopbarProps {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
  userId?: string | null;
  role: 'admin' | 'member' | null;
  /** Mobile menu trigger, rendered before the title on small screens. */
  mobileNav?: ReactNode;
}

export function Topbar({ title, subtitle, userEmail, userId, role, mobileNav }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-pajo-border bg-pajo-surface px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {mobileNav}
        <div className="min-w-0">
          <h2 className="truncate font-manrope text-base font-bold text-pajo-primary sm:text-lg">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-pajo-secondary">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        {userId && <NotificationDropdown userId={userId} />}

        <div className="flex items-center gap-3">
          {role ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                role === 'admin'
                  ? 'bg-pajo-accent/10 text-pajo-accent'
                  : 'bg-pajo-bg text-pajo-secondary'
              }`}
            >
              {role === 'admin' ? 'Treasurer' : 'Member'}
            </span>
          ) : null}
          {/* The email is the biggest space thief on a phone — desktop only. */}
          {userEmail ? (
            <span className="hidden text-xs font-medium text-pajo-secondary lg:inline">
              {userEmail}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

