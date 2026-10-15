import type { ClientConfig } from '@/types/service-business';

/**
 * Trades & construction demo — shares its business data with the Auxlo
 * backend demo (/auxlo/dashboard), so an enquiry submitted here can be
 * shown landing in that CRM.
 */
export const hartleyAndSons: ClientConfig = {
  slug: 'hartley-and-sons',
  name: 'Hartley & Sons',
  industry: 'Building & Landscaping',
  tagline: 'Reliable work. Done properly.',
  theme: 'trades',
  contact: {
    phone: '0118 496 0100',
    email: 'hello@hartleyandsons.co.uk',
    location: 'Reading, Berkshire',
    hours: 'Mon–Fri, 8am–5pm',
  },
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Work', href: '#work' },
    { label: 'Reviews', href: '#reviews' },
  ],
  hero: {
    eyebrow: 'Building & Landscaping',
    title: 'Reliable work. Done properly.',
    description:
      'Building, electrical and landscaping work for homes and businesses across Berkshire. One team, one point of contact, no chasing.',
    primaryCta: 'Request a Quote',
    secondaryCta: 'View Services',
    stats: [
      { value: '12+', label: 'Years trading' },
      { value: '240+', label: 'Projects completed' },
      { value: '5.0', label: 'Average rating' },
    ],
  },
  trust: ['Fully insured', 'NICEIC registered', '12 years experience', 'Free written quotes'],
  services: [
    {
      name: 'Building Work',
      description: 'Extensions, renovations and structural work — managed from drawings to handover.',
      priceHint: 'From £5,000',
    },
    {
      name: 'Electrical Installation',
      description: 'Domestic and commercial electrical work, certified and tested.',
      priceHint: 'From £150',
    },
    {
      name: 'Garden Landscaping',
      description: 'Complete garden transformations — patios, lawns, decking and planting.',
      priceHint: 'From £2,000',
    },
    {
      name: 'Maintenance',
      description: 'Planned and reactive maintenance for landlords, offices and homes.',
      priceHint: 'Contracts available',
    },
  ],
  why: [
    {
      title: 'One team for the whole job',
      description: 'Building, electrical and landscaping under one roof — no subcontractor merry-go-round.',
    },
    {
      title: 'Fixed written quotes',
      description: 'Every quote is itemised and fixed. No day-rate drift, no surprise extras.',
    },
    {
      title: 'You always know what’s next',
      description: 'Structured updates at every stage, so you never have to chase for an answer.',
    },
  ],
  process: [
    { title: 'Tell us what you need', description: 'Answer a few quick questions about the work.' },
    { title: 'We review your enquiry', description: 'We check scope, access and budget fit properly.' },
    { title: 'We get back to you', description: 'A real response within one working day.' },
    { title: 'Book the work', description: 'Site visit or start date agreed — job scheduled.' },
  ],
  work: [
    { title: 'Rear extension & garden, Wokingham', category: 'Building' },
    { title: 'Full rewire, 3-bed semi, Reading', category: 'Electrical' },
    { title: 'Porcelain patio & lawn, Henley', category: 'Landscaping' },
    { title: 'Office maintenance contract, Twyford', category: 'Maintenance' },
  ],
  testimonials: [
    {
      quote:
        'The first firm we’ve used where we never had to chase. Quote on Tuesday, started the following month, finished on the day they said.',
      name: 'Rachel Adams',
      role: 'Homeowner, Reading',
    },
    {
      quote:
        'They handle both the building and electrical side of our office work. One call, one invoice, zero hassle.',
      name: 'David Brown',
      role: 'Brownfield Offices',
    },
  ],
  cta: {
    title: 'Tell us what you need done.',
    description: 'Two minutes of questions. A proper, considered response — not a missed call.',
    button: 'Request a Quote',
  },
  enquiryFlow: [
    {
      id: 'service',
      type: 'service',
      title: 'What can we help you with?',
      required: true,
    },
    {
      id: 'description',
      type: 'textarea',
      title: 'Tell us about the work',
      description: 'The more detail, the more accurate our first response.',
      inputLabel: 'Project details',
      placeholder: 'e.g. Overgrown rear garden, approx. 18m — want it cleared with a new patio and lawn…',
      required: true,
    },
    {
      id: 'urgency',
      type: 'options',
      title: 'How soon do you need help?',
      options: ['Emergency', 'Within the next few weeks', 'Within the next few months', 'Just getting a quote'],
      required: true,
    },
    {
      id: 'postcode',
      type: 'text',
      title: 'Where is the work?',
      inputLabel: 'Postcode',
      placeholder: 'RG1 1AA',
      required: true,
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'How can we reach you?',
      description: 'We’ll only use these details to respond to your enquiry.',
      required: true,
    },
  ],
  booking: {
    enabled: true,
    heading: 'Book a site visit or consultation',
    availableDays: [1, 2, 3, 4, 5],
    leadTimeDays: 2,
    horizonDays: 14,
    times: ['09:00', '10:30', '13:00', '15:00'],
    confirmationNote: 'We’ll confirm the exact time by phone within one working day.',
  },
};
