'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // Single SessionProvider for entire app using main NextAuth
  return <SessionProvider>{children}</SessionProvider>;
}
