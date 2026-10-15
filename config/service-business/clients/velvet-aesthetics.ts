import type { ClientConfig } from '@/types/service-business';

/** Luxury beauty demo — consultation-led flow, editorial typography. */
export const velvetAesthetics: ClientConfig = {
  slug: 'velvet-aesthetics',
  name: 'Velvet Aesthetics',
  industry: 'Aesthetic Clinic',
  tagline: 'Subtle work. Beautiful results.',
  theme: 'beauty',
  contact: {
    phone: '0118 496 0330',
    email: 'hello@velvetaesthetics.co.uk',
    location: 'Henley-on-Thames',
    hours: 'Tue–Sat, 9am–6pm',
  },
  nav: [
    { label: 'Treatments', href: '#services' },
    { label: 'Your journey', href: '#process' },
    { label: 'Results', href: '#work' },
    { label: 'Kind words', href: '#reviews' },
  ],
  hero: {
    eyebrow: 'Aesthetic Clinic · Henley',
    title: 'Subtle work. Beautiful results.',
    description:
      'Doctor-led aesthetic treatments in a calm, private clinic. Every face is different — every plan starts with a proper consultation.',
    primaryCta: 'Book a Consultation',
    secondaryCta: 'Explore Treatments',
    stats: [
      { value: 'Doctor-led', label: 'Every treatment' },
      { value: '6 yrs', label: 'In Henley' },
      { value: '4.9', label: 'Client rating' },
    ],
  },
  trust: ['Doctor-led clinic', 'Save Face accredited', 'Prescriber on site', 'Discreet private setting'],
  services: [
    {
      name: 'Anti-Wrinkle Treatments',
      description: 'Softening lines while keeping natural expression — never frozen.',
      priceHint: 'From £180',
    },
    {
      name: 'Dermal Fillers',
      description: 'Careful restoration and balance, always conservative.',
      priceHint: 'From £250',
    },
    {
      name: 'Skin Rejuvenation',
      description: 'Polynucleotides, skin boosters and medical-grade skincare plans.',
      priceHint: 'From £220',
    },
    {
      name: 'Facials & Peels',
      description: 'Clinical facials and peels tailored to your skin goals.',
      priceHint: 'From £85',
    },
  ],
  why: [
    {
      title: 'Consultation before anything',
      description: 'No treatment is ever sold before your face, goals and medical history are understood.',
    },
    {
      title: 'Natural first',
      description: 'The best compliment our clients get is “you look well” — never “what have you had done?”.',
    },
    {
      title: 'Honest advice',
      description: 'If a treatment isn’t right for you, we’ll tell you — and suggest what is.',
    },
  ],
  process: [
    { title: 'Tell us your goals', description: 'A few questions about what you’d like to achieve.' },
    { title: 'Private consultation', description: 'One-to-one with the doctor — assessment and honest options.' },
    { title: 'Your treatment plan', description: 'A considered plan with pricing, never pressured.' },
    { title: 'Treatment & review', description: 'Gentle treatment with a complimentary review appointment.' },
  ],
  work: [
    { title: 'Full-face rejuvenation plan', category: 'Skin' },
    { title: 'Lip restoration, subtle volume', category: 'Fillers' },
    { title: 'Forehead & frown softening', category: 'Anti-wrinkle' },
    { title: 'Polynucleotide course', category: 'Skin' },
  ],
  testimonials: [
    {
      quote: 'I was talked out of a treatment I didn’t need and into one that actually suited me. That’s why I trust them completely.',
      name: 'Amelia Clarke',
      role: 'Client of 3 years',
    },
    {
      quote: 'The consultation alone was worth it. Everything felt considered, calm and completely unhurried.',
      name: 'Hannah Webb',
      role: 'Client',
    },
  ],
  cta: {
    title: 'Start with a conversation.',
    description: 'A private, unhurried consultation — advice first, treatment only if it’s right.',
    button: 'Book a Consultation',
  },
  enquiryFlow: [
    {
      id: 'service',
      type: 'service',
      title: 'Which treatment are you considering?',
      required: true,
    },
    {
      id: 'goals',
      type: 'textarea',
      title: 'What would you like to achieve?',
      description: 'In your own words — there’s no wrong answer.',
      inputLabel: 'Your goals',
      placeholder: 'e.g. I look tired all the time and would like to look fresher, but still like myself…',
      required: true,
    },
    {
      id: 'preferred-date',
      type: 'options',
      title: 'When would you like to come in?',
      options: ['As soon as possible', 'In the next couple of weeks', 'This month', 'Just researching for now'],
      required: true,
    },
    {
      id: 'consultation',
      type: 'options',
      title: 'Have you had aesthetic treatments before?',
      options: ['Yes, regularly', 'Once or twice', 'Never — this would be my first'],
      required: true,
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Where should we send your consultation details?',
      description: 'Completely confidential, always.',
      required: true,
    },
  ],
  booking: {
    enabled: true,
    heading: 'Book your consultation',
    availableDays: [2, 3, 4, 5, 6],
    leadTimeDays: 1,
    horizonDays: 14,
    times: ['09:30', '11:00', '13:30', '15:00', '16:30'],
    confirmationNote: 'Consultations are 45 minutes with the doctor. No deposit taken online.',
  },
};
