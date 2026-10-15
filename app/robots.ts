import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://auxlo.uk/sitemap.xml',
    host: 'https://auxlo.uk',
  };
}
