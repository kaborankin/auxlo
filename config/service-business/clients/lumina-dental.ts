import type { ClientConfig } from '@/types/service-business';

/** Healthcare demo — booking-first flow with new/existing patient routing. */
export const luminaDental: ClientConfig = {
  slug: 'lumina-dental',
  name: 'Lumina Dental',
  industry: 'Dental Practice',
  tagline: 'Modern dentistry, gently done.',
  theme: 'healthcare',
  contact: {
    phone: '0118 496 0220',
    email: 'hello@luminadental.co.uk',
    location: 'Caversham, Reading',
    hours: 'Mon–Sat, 8am–6pm',
  },
  nav: [
    { label: 'Treatments', href: '#services' },
    { label: 'Your visit', href: '#process' },
    { label: 'Results', href: '#work' },
    { label: 'Reviews', href: '#reviews' },
  ],
  hero: {
    eyebrow: 'Private Dental Practice',
    title: 'Modern dentistry, gently done.',
    description:
      'Calm, judgement-free dental care in Caversham. New patients welcome — book online in under a minute.',
    primaryCta: 'Book an Appointment',
    secondaryCta: 'Explore Treatments',
    stats: [
      { value: '4.9', label: 'Patient rating' },
      { value: '8k+', label: 'Patients cared for' },
      { value: 'Same week', label: 'Appointments' },
    ],
  },
  trust: ['GDC registered clinicians', 'Denplan accepted', 'Sedation available', 'Evening appointments'],
  services: [
    {
      name: 'Check-ups & Hygiene',
      description: 'Comprehensive examinations, hygiene therapy and preventative care.',
      priceHint: 'From £68',
    },
    {
      name: 'Invisalign & Orthodontics',
      description: 'Discreet teeth straightening with 3D treatment planning.',
      priceHint: 'From £1,950',
    },
    {
      name: 'Composite Bonding & Veneers',
      description: 'Natural-looking cosmetic improvements, usually in one or two visits.',
      priceHint: 'From £250',
    },
    {
      name: 'Dental Implants',
      description: 'Permanent replacements for missing teeth, planned digitally.',
      priceHint: 'From £2,400',
    },
  ],
  why: [
    {
      title: 'Nervous patients welcome',
      description: 'Slower appointments, sedation options and a team that explains everything first.',
    },
    {
      title: 'Transparent pricing',
      description: 'A written treatment plan with exact costs before anything begins.',
    },
    {
      title: 'Same-week appointments',
      description: 'Online booking with real availability — no phone tag.',
    },
  ],
  process: [
    { title: 'Book online', description: 'Choose a treatment and a time that suits you.' },
    { title: 'Meet your clinician', description: 'A relaxed first visit — examination and honest advice.' },
    { title: 'Your plan, in writing', description: 'Options, costs and timings laid out clearly.' },
    { title: 'Treatment & aftercare', description: 'Gentle treatment with follow-ups included.' },
  ],
  work: [
    { title: 'Invisalign, 8 months', category: 'Orthodontics' },
    { title: 'Composite edge bonding', category: 'Cosmetic' },
    { title: 'Single implant, lower molar', category: 'Implants' },
    { title: 'Hygiene transformation', category: 'Hygiene' },
  ],
  testimonials: [
    {
      quote: 'I avoided dentists for six years. The team at Lumina made the whole thing feel easy — booked online, seen the same week.',
      name: 'Sophie Turner',
      role: 'Patient',
    },
    {
      quote: 'Everything was explained before it happened, including the cost. First practice I’ve actually recommended to friends.',
      name: 'James Wilson',
      role: 'Patient',
    },
  ],
  cta: {
    title: 'Book your first visit.',
    description: 'Real availability, confirmed instantly. New patients always welcome.',
    button: 'Book an Appointment',
  },
  enquiryFlow: [
    {
      id: 'service',
      type: 'service',
      title: 'Which treatment are you interested in?',
      required: true,
    },
    {
      id: 'patient-type',
      type: 'options',
      title: 'Are you a new or existing patient?',
      options: ['New patient', 'Existing patient'],
      required: true,
    },
    {
      id: 'preference',
      type: 'options',
      title: 'When would you prefer to be seen?',
      options: ['As soon as possible', 'Morning appointments', 'Evening appointments', 'Saturday appointments'],
      required: true,
    },
    {
      id: 'requirements',
      type: 'textarea',
      title: 'Anything we should know?',
      description: 'Symptoms, concerns or nervousness — it helps us prepare.',
      inputLabel: 'Notes for the team',
      placeholder: 'e.g. Chipped front tooth, some sensitivity when drinking cold water…',
      required: false,
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Your contact details',
      description: 'We’ll confirm your appointment by text and email.',
      required: true,
    },
  ],
  booking: {
    enabled: true,
    heading: 'Book your appointment',
    availableDays: [1, 2, 3, 4, 5, 6],
    leadTimeDays: 1,
    horizonDays: 14,
    times: ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'],
    confirmationNote: 'Instant confirmation — we’ll text you a reminder the day before.',
  },
};
