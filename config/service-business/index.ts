import type { ClientConfig } from '@/types/service-business';
import { hartleyAndSons } from './clients/hartley-and-sons';
import { luminaDental } from './clients/lumina-dental';
import { velvetAesthetics } from './clients/velvet-aesthetics';
import { sterlingAccountants } from './clients/sterling-accountants';
import { meridianConsulting } from './clients/meridian-consulting';
import { safepointConsulting } from './clients/safepoint-consulting';
import { bangVisuals } from './clients/bang-visuals';

export * from './themes';

/**
 * Client registry — a new prospect demo is a new file in ./clients plus
 * one line here. Routes, components and flows never change.
 */
export const clients: ClientConfig[] = [
  hartleyAndSons,
  luminaDental,
  velvetAesthetics,
  sterlingAccountants,
  meridianConsulting,
  safepointConsulting,
  bangVisuals,
];

export function getClientConfig(slug: string): ClientConfig | undefined {
  return clients.find((client) => client.slug === slug);
}

export function getClientSlugs(): string[] {
  return clients.map((client) => client.slug);
}
