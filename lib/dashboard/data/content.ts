import type { Channel, ContentItem, Metric } from '../types';

export const channels: Channel[] = ['Instagram', 'Facebook', 'LinkedIn'];

/** Week commencing Mon 17 Aug 2026. */
export const contentItems: ContentItem[] = [
  {
    id: 'c-01',
    title: 'Before/after: Caversham garden clearance',
    channel: 'Instagram',
    kind: 'Reel',
    status: 'scheduled',
    date: '2026-08-17',
  },
  {
    id: 'c-02',
    title: 'Site diary: week 3 of the Wokingham extension',
    channel: 'Facebook',
    kind: 'Post',
    status: 'approved',
    date: '2026-08-17',
  },
  {
    id: 'c-03',
    title: '5 questions to ask before hiring a landscaper',
    channel: 'Instagram',
    kind: 'Carousel',
    status: 'review',
    date: '2026-08-19',
  },
  {
    id: 'c-04',
    title: 'Why we quote fixed prices, not day rates',
    channel: 'LinkedIn',
    kind: 'Article',
    status: 'draft',
    date: '2026-08-18',
  },
  {
    id: 'c-05',
    title: 'Time-lapse: porcelain patio in two days',
    channel: 'Instagram',
    kind: 'Reel',
    status: 'draft',
    date: '2026-08-21',
  },
  {
    id: 'c-06',
    title: 'Meet the team: Friday site walkthrough',
    channel: 'Facebook',
    kind: 'Post',
    status: 'approved',
    date: '2026-08-21',
  },
  {
    id: 'c-07',
    title: 'Case study: Henley new-build garden',
    channel: 'LinkedIn',
    kind: 'Post',
    status: 'scheduled',
    date: '2026-08-21',
  },
  {
    id: 'c-08',
    title: 'Behind the scenes: morning materials run',
    channel: 'Instagram',
    kind: 'Story',
    status: 'published',
    date: '2026-08-14',
  },
];

export const contentPerformance: Metric[] = [
  { label: 'Reach', value: '24.8K', change: '+12%', trend: 'up' },
  { label: 'Engagement', value: '1.2K', change: '+8%', trend: 'up' },
  { label: 'Profile visits', value: '620', change: '+5%', trend: 'up' },
  { label: 'Enquiries generated', value: '87', change: '+21%', trend: 'up' },
];

export function getContentItems(): ContentItem[] {
  return contentItems;
}

export function getChannels(): Channel[] {
  return channels;
}

export function getContentPerformance(): Metric[] {
  return contentPerformance;
}
