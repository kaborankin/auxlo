'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface HomeTopbarProps {
  userEmail: string;
  userName?: string;
  userId?: string;
  unreadCount?: number;
}

export function HomeTopbar({ userEmail, userName, userId, unreadCount = 0 }: HomeTopbarProps) {
  return (
    <header className="border-b border-pajo-border bg-pajo-surface px-6 py-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <div>
          <h2 className="font-manrope text-lg font-bold text-pajo-primary">Dashboard</h2>
          <p className="text-xs font-medium text-pajo-secondary">{userName || userEmail}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {userId && <NotificationDropdown userId={userId} />}

          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-2 rounded-pajo border border-pajo-border bg-pajo-surface px-3 py-1.5 text-xs font-semibold text-pajo-primary transition hover:bg-pajo-bg"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

