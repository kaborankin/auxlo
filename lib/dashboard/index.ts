/**
 * Auxlo backend data layer.
 *
 * Pages import from here and nowhere else. Each getter currently returns
 * realistic typed demo data; swapping in Prisma/API queries per deployment
 * requires no component or route changes.
 */
export * from './types';
export * from './format';
export * from './data/leads';
export * from './data/enquiries';
export * from './data/bookings';
export * from './data/automations';
export * from './data/content';
export * from './data/clients';
export * from './data/activity';
export * from './data/metrics';
