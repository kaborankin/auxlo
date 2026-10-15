import type { ClientConfig } from '@/types/service-business';

/** Premium professional demo — enquiry only (booking deliberately disabled). */
export const sterlingAccountants: ClientConfig = {
  slug: 'sterling-accountants',
  name: 'Sterling & Co',
  industry: 'Accountants',
  tagline: 'Clear numbers. Calm businesses.',
  theme: 'professional',
  contact: {
    phone: '0118 496 0440',
    email: 'hello@sterlingandco.co.uk',
    location: 'Reading, Berkshire',
    hours: 'Mon–Fri, 9am–5:30pm',
  },
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'How we work', href: '#process' },
    { label: 'Clients', href: '#work' },
    { label: 'Reviews', href: '#reviews' },
  ],
  hero: {
    eyebrow: 'Chartered Accountants',
    title: 'Clear numbers. Calm businesses.',
    description:
      'Accounting, tax and advisory for owner-managed businesses across the Thames Valley. Straight answers, fixed fees, no jargon.',
    primaryCta: 'Request a Consultation',
    secondaryCta: 'Our Services',
    stats: [
      { value: '300+', label: 'Businesses supported' },
      { value: 'Fixed', label: 'Monthly fees' },
      { value: '24h', label: 'Response time' },
    ],
  },
  trust: ['ICAEW chartered', 'Fixed monthly fees', 'Xero & QuickBooks partners', 'Same-day responses'],
  services: [
    {
      name: 'Accounts & Compliance',
      description: 'Year-end accounts, corporation tax and Companies House — handled, on time.',
      priceHint: 'From £120/mo',
    },
    {
      name: 'Bookkeeping & VAT',
      description: 'Clean books every month, VAT returns filed without the panic.',
      priceHint: 'From £80/mo',
    },
    {
      name: 'Payroll & CIS',
      description: 'Payroll, pensions and construction industry scheme managed end-to-end.',
      priceHint: 'From £45/mo',
    },
    {
      name: 'Growth Advisory',
      description: 'Cash flow forecasts, pricing and structure advice for the next stage.',
      priceHint: 'Fixed project fees',
    },
  ],
  why: [
    {
      title: 'You’ll always know where you stand',
      description: 'Monthly numbers you actually understand, not a year-end surprise.',
    },
    {
      title: 'Fixed fees, agreed upfront',
      description: 'No hourly billing anxiety. The price we quote is the price you pay.',
    },
    {
      title: 'Advice before deadlines',
      description: 'We flag tax-saving opportunities through the year — not after it’s too late.',
    },
  ],
  process: [
    { title: 'Tell us about your business', description: 'A few questions about where you are and where you want to be.' },
    { title: 'We review your situation', description: 'Current setup, obligations and quick wins.' },
    { title: 'A clear proposal', description: 'Fixed-fee proposal with exactly what’s included.' },
    { title: 'Onboarding in days', description: 'We handle the switch from your current accountant.' },
  ],
  work: [
    { title: 'Construction firm, 22 staff', category: 'Full service' },
    { title: 'E-commerce brand, £1.4m turnover', category: 'Advisory' },
    { title: 'Consultancy, solo founder', category: 'Accounts & tax' },
    { title: 'Hospitality group, 3 sites', category: 'Bookkeeping & VAT' },
  ],
  testimonials: [
    {
      quote: 'Switching was embarrassingly easy. Within a month we had monthly reports we actually read.',
      name: 'Oliver Nash',
      role: 'Nash Properties',
    },
    {
      quote: 'They spotted a VAT issue our previous accountant missed for two years. Paid for themselves immediately.',
      name: 'Priya Shah',
      role: 'Director, retail',
    },
  ],
  cta: {
    title: 'Get a fixed-fee proposal.',
    description: 'Tell us about your business — we’ll come back within one working day.',
    button: 'Request a Consultation',
  },
  enquiryFlow: [
    {
      id: 'service',
      type: 'service',
      title: 'What do you need help with?',
      required: true,
    },
    {
      id: 'business',
      type: 'text',
      title: 'What’s your business?',
      description: 'Industry and rough size is plenty.',
      inputLabel: 'Business',
      placeholder: 'e.g. Electrical contractor, 4 staff, £400k turnover',
      required: true,
    },
    {
      id: 'timeline',
      type: 'options',
      title: 'When are you looking to move?',
      options: ['Immediately', 'Before year end', 'Next few months', 'Just comparing options'],
      required: true,
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Where should we send your proposal?',
      required: true,
    },
  ],
  booking: {
    enabled: false,
    heading: 'Book a discovery call',
    availableDays: [1, 2, 3, 4, 5],
    leadTimeDays: 1,
    horizonDays: 14,
    times: ['09:00', '11:00', '14:00', '16:00'],
    confirmationNote: 'A partner will call you at the scheduled time.',
  },
};
