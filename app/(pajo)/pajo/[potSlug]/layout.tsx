import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/db';
import { getPajoAccess, isPajoPreviewMode } from '@/lib/pajo/access';
import { Sidebar } from '@/components/pajo/Sidebar';
import { Topbar } from '@/components/pajo/Topbar';

/**
 * Pajo dashboard shell. Redesigned for Pajo Design v2.
 * Uses the light/financial aesthetic.
 */
export default async function PotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ potSlug: string }>;
}) {
  const { potSlug } = await params;

  const headerList = await headers();
  const activePath = headerList.get('x-pathname') ?? '';

  // The invitation/join route is the entry point for people who are NOT yet
  // members of this pot - and who may not even be signed in yet. It renders its
  // own full-screen chrome and re-validates the invite token server-side, so it
  // must bypass this layout's shell AND its access checks. Without this, an
  // invited person either loses the ?token= when redirected to sign-in, or -
  // once signed in but not yet a PotMember - hits notFound() (a 404) on the very
  // page that is meant to let them join.
  if (activePath.endsWith('/join')) {
    return <>{children}</>;
  }

  const session = await getServerSession(authOptions);

  const preview = !session?.user?.email && isPajoPreviewMode();
  if (!session?.user?.email && !preview) {
    redirect(`/api/auth/signin?callbackUrl=/pajo/${potSlug}`);
  }

  let potName: string;
  let role: 'admin' | 'member' | null = null;
  let userId: string | null = null;

  if (preview) {
    const pot = await prisma.pot.findUnique({
      where: { slug: potSlug },
      select: { name: true },
    });
    if (!pot) notFound();
    potName = pot.name;
  } else {
    if (!session?.user?.email) redirect(`/api/auth/signin?callbackUrl=/pajo/${potSlug}`);
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: session.user.email as string },
    });
    if (!userProfile) redirect('/api/auth/signin');

    const access = await getPajoAccess(userProfile.id, potSlug);
    if (!access) notFound();
    potName = access.pot.name;
    role = access.role;
    userId = userProfile.id;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        potSlug={potSlug}
        potName={potName}
        activePath={activePath}
        isAdmin={role === 'admin' || preview}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={potName}
          subtitle={preview ? 'Preview mode — sign in for full access' : undefined}
          role={role}
          userEmail={session?.user?.email ?? null}
          userId={userId}
        />
        <main className="flex-1 overflow-y-auto bg-pajo-bg p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

