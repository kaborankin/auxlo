import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientConfig, getClientSlugs, getTheme } from '@/config/service-business';
import type { FontKey } from '@/types/service-business';
import { Header } from '@/components/service-business/layout/Header';
import { Footer } from '@/components/service-business/layout/Footer';

const fontVars: Record<FontKey, string> = {
  inter: 'var(--font-inter)',
  manrope: 'var(--font-manrope)',
  'dm-sans': 'var(--font-dm-sans)',
  'space-grotesk': 'var(--font-space-grotesk)',
  cormorant: 'var(--font-cormorant)',
};

export function generateStaticParams() {
  return getClientSlugs().map((client) => ({ client }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>;
}): Promise<Metadata> {
  const { client: slug } = await params;
  const config = getClientConfig(slug);
  if (!config) return {};
  return {
    title: `${config.name} — ${config.tagline}`,
    description: config.hero.description,
    robots: { index: false, follow: false },
  };
}

/**
 * Injects the active client's theme as CSS custom properties. Everything
 * below this point — Header, Footer, every section and flow — renders from
 * these variables, so swapping clients never touches a component.
 */
export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ client: string }>;
}) {
  const { client: slug } = await params;
  const config = getClientConfig(slug);
  if (!config) notFound();

  const theme = getTheme(config.theme);
  const style = {
    '--sb-bg': theme.colors.background,
    '--sb-surface': theme.colors.surface,
    '--sb-primary': theme.colors.primary,
    '--sb-accent': theme.colors.accent,
    '--sb-text': theme.colors.text,
    '--sb-muted': theme.colors.muted,
    '--sb-border': theme.colors.border,
    '--sb-radius-sm': theme.radius.sm,
    '--sb-radius-md': theme.radius.md,
    '--sb-radius-lg': theme.radius.lg,
    '--sb-radius-xl': theme.radius.xl,
    '--sb-font-heading': fontVars[theme.fonts.heading],
    '--sb-font-body': fontVars[theme.fonts.body],
  } as CSSProperties;

  return (
    <div className="sb-shell min-h-screen text-[16px] antialiased" style={style}>
      <Header client={config} />
      <main>{children}</main>
      <Footer client={config} />
    </div>
  );
}
