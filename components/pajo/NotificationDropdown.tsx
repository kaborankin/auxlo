'use client';

import { useState, useEffect } from 'react';
import { Bell, CreditCard, CheckCircle2, Info, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/dashboard/format';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  readAt: string | null;
  createdAt: string;
  ctaUrl?: string;
}

export function NotificationDropdown({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/pajo/notifications?limit=5');
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  function getIcon(category: string) {
    switch (category) {
      case 'payment': return <CreditCard className="text-auxlo-lime" size={14} />;
      case 'payout': return <CheckCircle2 className="text-auxlo-lime" size={14} />;
      case 'invite': return <Info className="text-auxlo-warning" size={14} />;
      default: return <Bell className="text-auxlo-muted" size={14} />;
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-auxlo-muted hover:text-auxlo-text transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-auxlo-lime text-[10px] font-bold text-auxlo-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl border border-auxlo-line bg-auxlo-surface shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-auxlo-line flex items-center justify-between bg-auxlo-black/20">
              <h4 className="font-bold text-sm">Recent Notifications</h4>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-auxlo-lime hover:underline"
              >
                Close
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin text-auxlo-muted" size={20} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-auxlo-muted">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.ctaUrl || '/pajo/notifications'}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-4 border-b border-auxlo-line last:border-0 hover:bg-auxlo-black/40 transition ${
                      !n.readAt ? 'bg-auxlo-lime/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-auxlo-black p-1.5 h-fit">
                        {getIcon(n.category)}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className={`text-xs font-bold ${!n.readAt ? 'text-auxlo-text' : 'text-auxlo-muted'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-auxlo-muted line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-auxlo-muted/60 uppercase pt-1">
                          {timeAgo(new Date(n.createdAt))}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <Link
              href="/pajo/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 text-center text-xs font-bold text-auxlo-lime bg-auxlo-black/40 hover:bg-auxlo-black transition border-t border-auxlo-line"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
