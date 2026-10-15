import type { Metadata } from "next";
import { Bebas_Neue, Inter, Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Auxlo Systems",
    template: "%s · Auxlo Systems",
  },
  description:
    "Auxlo Systems — software products by Auxlo. Pajo, our first product, is a rotation savings pot (susu/ajo) platform for community thrift groups.",
  // Add cache control meta tags
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${bebas.variable} ${manrope.variable}`}>
      <body
        className="antialiased"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
