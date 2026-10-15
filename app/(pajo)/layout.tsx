import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';
import { isPajoPreviewMode } from '@/lib/pajo/access';

/**
 * Shared layout for all Pajo routes.
 * Sets the base background and text colors for the Pajo design system.
 */
export default async function PajoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const preview = !session?.user?.email && isPajoPreviewMode();

  return (
    <div className="min-h-screen bg-pajo-bg text-pajo-primary font-sans">
      {children}
    </div>
  );
}
