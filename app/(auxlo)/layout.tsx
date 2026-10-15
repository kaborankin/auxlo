import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  metadataBase: new URL('https://auxlo.uk'),
  title: {
    default: 'Auxlo Systems | Growth, Enquiries & Operations',
    template: '%s | Auxlo Systems',
  },
  description:
    'Auxlo connects content, customer journeys and business operations into one practical operating layer for service businesses.',
  keywords: [
    'Auxlo',
    'service business systems',
    'customer journey automation',
    'business operations',
    'lead capture',
    'booking systems',
  ],
  applicationName: 'Auxlo',
  openGraph: {
    title: 'Auxlo Systems',
    description:
      'Turn attention into enquiries and keep operations moving with a connected customer journey system.',
    url: 'https://auxlo.uk/auxlo',
    siteName: 'Auxlo Systems',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auxlo Systems',
    description:
      'Content, customer journeys and operating systems connected into one practical layer for service businesses.',
  },
};

export default function AuxloRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {children}
    </div>
  );
}
