import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Auxlo Systems | Growth, Enquiries & Operations',
    template: '%s | Auxlo Systems',
  },
  description:
    'Auxlo connects content, customer journeys and business operations into one practical operating layer for service businesses.',
  alternates: {
    canonical: 'https://auxlo.uk/auxlo',
  },
  openGraph: {
    title: 'Auxlo Systems',
    description:
      'Turn attention into enquiries and keep operations moving with a connected customer journey system.',
    url: 'https://auxlo.uk/auxlo',
    siteName: 'Auxlo Systems',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/auxlo/logo.png',
        width: 1024,
        height: 512,
        alt: 'Auxlo Systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auxlo Systems',
    description:
      'Content, customer journeys and operating systems connected into one practical layer for service businesses.',
  },
};

export default function AuxloLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
