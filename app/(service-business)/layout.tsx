import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Space_Grotesk } from 'next/font/google';

/**
 * Fonts for the Service Business Experience System. Loaded only inside this
 * route group and exposed as CSS variables; each client theme maps its
 * configured fonts onto --sb-font-heading / --sb-font-body.
 */
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Service Business System',
    template: '%s',
  },
  robots: { index: false, follow: false },
};

export default function ServiceBusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${spaceGrotesk.variable} ${cormorant.variable}`}>
      {children}
    </div>
  );
}
