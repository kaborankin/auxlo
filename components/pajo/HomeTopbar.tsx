'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { MobileNav } from './MobileNav';

interface HomeTopbarProps {
  userEmail: string;
  userName?: string;
  userId?: string;
  unreadCount?: number;
}

export function HomeTopbar({ userEmail, userName, userId, unreadCount = 0 }: HomeTopbarProps) {
  return (
    <header className="border-b border-pajo-border bg-pajo-surface px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileNav isAdmin />
          <div className="min-w-0">
            <h2 className="truncate font-manrope text-base font-bold text-pajo-primary sm:text-lg">
              Dashboard
            </h2>
            <p className="truncate text-xs font-medium text-pajo-secondary">{userName || userEmail}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {userId && <NotificationDropdown userId={userId} />}

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-2 rounded-pajo border border-pajo-border bg-pajo-surface px-2.5 py-1.5 text-xs font-semibold text-pajo-primary transition hover:bg-pajo-bg sm:px-3"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

