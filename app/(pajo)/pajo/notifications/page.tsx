import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { Sidebar } from '@/components/pajo/Sidebar';
import { HomeTopbar } from '@/components/pajo/HomeTopbar';
import { Bell, CheckCircle2, XCircle, Info, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/dashboard/format';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/pajo/notifications');
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { email: session.user.email },
  });
  if (!userProfile) redirect('/api/auth/signin');

  const notifications = await prisma.notification.findMany({
    where: { userId: userProfile.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  // Mark all as read when visiting the page
  if (unreadCount > 0) {
    await prisma.notification.updateMany({
      where: { userId: userProfile.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  function getIcon(category: string) {
    switch (category) {
      case 'payment': return <CreditCard className="text-auxlo-lime" size={18} />;
      case 'payout': return <CheckCircle2 className="text-auxlo-lime" size={18} />;
      case 'invite': return <Info className="text-auxlo-warning" size={18} />;
      case 'system': return <Bell className="text-auxlo-muted" size={18} />;
      default: return <Bell className="text-auxlo-muted" size={18} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-auxlo-black text-auxlo-text">
      <Sidebar activePath="/pajo/notifications" isAdmin={true} />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <HomeTopbar userEmail={session.user.email} userName={userProfile.name} unreadCount={0} />
        
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <h1 className="font-manrope text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-auxlo-muted">Stay updated on your pots and payments.</p>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-auxlo-line bg-auxlo-surface p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-auxlo-black text-auxlo-muted">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm text-auxlo-muted">You don't have any notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`group relative flex items-start gap-4 rounded-xl border p-5 transition ${
                      !n.readAt ? 'border-auxlo-lime/30 bg-auxlo-lime/5' : 'border-auxlo-line bg-auxlo-surface'
                    }`}
                  >
                    <div className="mt-1 rounded-lg bg-auxlo-black p-2">
                      {getIcon(n.category)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-auxlo-text">{n.title}</h4>
                        <span className="text-[10px] text-auxlo-muted uppercase tracking-wider">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-sm text-auxlo-muted leading-relaxed">{n.message}</p>
                      
                      {n.ctaUrl && (
                        <div className="pt-2">
                          <Link 
                            href={n.ctaUrl}
                            className="inline-flex items-center gap-2 text-xs font-bold text-auxlo-lime hover:underline"
                          >
                            {n.ctaText || 'View Details'}
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {!n.readAt && (
                      <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-auxlo-lime shadow-[0_0_8px_rgba(180,255,0,0.5)]" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
