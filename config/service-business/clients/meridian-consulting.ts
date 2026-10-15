import type { ClientConfig } from '@/types/service-business';

/**
 * HR & IT consultancy demo -- placeholder brand for a real prospect.
 * Swap copy, services and flow here when the actual brief arrives.
 */
export const meridianConsulting: ClientConfig = {
  slug: 'meridian-consulting',
  name: 'Meridian People & Systems',
  industry: 'HR & IT Consultancy',
  tagline: 'Your people. Your systems. Working together.',
  theme: 'healthcare',
  contact: {
    phone: '0118 496 0550',
    email: 'hello@meridianps.co.uk',
    location: 'Reading, Berkshire',
    hours: 'Mon-Fri, 9am-5:30pm',
  },
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'How we work', href: '#process' },
    { label: 'Clients', href: '#work' },
    { label: 'Reviews', href: '#reviews' },
  ],
  hero: {
    eyebrow: 'HR & IT Consultancy',
    title: 'Your people. Your systems. Working together.',
    description:
      'Practical HR and IT support for growing businesses - from day-to-day people issues to the systems your team runs on. One partner, fixed fees, straight answers.',
    primaryCta: 'Book a Discovery Call',
    primaryCtaTarget: 'booking',
    secondaryCta: 'Our Services',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    stats: [
      { value: '60+', label: 'Businesses supported' },
      { value: '24h', label: 'Response time' },
      { value: '15 yrs', label: 'Combined experience' },
    ],
  },
  trust: [
    'CIPD-qualified consultants',
    'Microsoft Partner',
    'Retained & project options',
    'Fixed, transparent pricing',
  ],
  services: [
    {
      name: 'HR Advisory & Retained Support',
      description: 'Day-to-day HR, contracts, policies and tricky people situations - handled properly.',
      priceHint: 'From £350/mo',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
    },
    {
      name: 'People Operations & HR Systems',
      description: 'HR software selection and rollout that your team will actually use.',
      priceHint: 'Fixed project fees',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    },
    {
      name: 'IT Strategy & Support',
      description: 'Roadmaps, supplier management and dependable support for growing teams.',
      priceHint: 'From £500/mo',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    },
    {
      name: 'Recruitment & Onboarding',
      description: 'Structured hiring and onboarding that makes good people stay.',
      priceHint: 'From £1,500 per hire',
      image: 'https://images.unsplash.com/photo-1560264357-8d9201b68755?w=600&q=80',
    },
  ],
  why: [
    {
      title: 'One partner for people and systems',
      description: 'HR and IT under one roof - no more being passed between suppliers who blame each other.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    },
    {
      title: 'Practical, not theoretical',
      description: 'Advice you can implement on Monday morning, written in plain English.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    },
    {
      title: 'Sized for growing businesses',
      description: 'Enterprise-grade thinking without the enterprise retainer.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    },
  ],
  process: [
    { title: 'Tell us what\'s happening', description: 'A few quick questions about your business and the situation.' },
    { title: 'We assess & prioritise', description: 'What\'s urgent, what\'s risky, and what can wait.' },
    { title: 'A clear proposal', description: 'Fixed-fee options with exactly what\'s included.' },
    { title: 'Ongoing support', description: 'Retained help that scales with your team.' },
  ],
  work: [
    { title: 'HR retainer for a 40-person manufacturer', category: 'HR Advisory', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
    { title: 'HRIS rollout for a tech scale-up', category: 'People Ops', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80' },
    { title: 'IT roadmap for an accountancy firm', category: 'IT Strategy', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80' },
    { title: 'Onboarding redesign for a charity', category: 'Recruitment', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80' },
  ],
  testimonials: [
    {
      quote:
        'We had no HR function and a growing team. Meridian gave us contracts, policies and a system in six weeks - and they answer the phone.',
      name: 'Helen Ford',
      role: 'Operations Director, manufacturing',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    },
    {
      quote:
        'They untangled our IT suppliers, cut our monthly spend and gave us a roadmap we actually follow. Rare combination of practical and strategic.',
      name: 'Oliver Nash',
      role: 'MD, property services',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
  ],
  cta: {
    title: 'Start with a discovery call.',
    description: 'Thirty minutes to understand your situation - honest advice, no obligation.',
    button: 'Book a Discovery Call',
  },
  enquiryFlow: [
    {
      id: 'service',
      type: 'service',
      title: 'What do you need help with?',
      required: true,
    },
    {
      id: 'company-size',
      type: 'options',
      title: 'How big is your team?',
      options: ['1-10 people', '11-50 people', '51-200 people', '200+ people'],
      required: true,
    },
    {
      id: 'situation',
      type: 'textarea',
      title: 'Tell us what\'s going on',
      description: 'A couple of sentences is plenty - it helps the right person respond.',
      inputLabel: 'Your situation',
      placeholder: 'e.g. We\'re 25 people, no HR function, and our IT is held together with tape...',
      required: true,
    },
    {
      id: 'timeline',
      type: 'options',
      title: 'When do you need help?',
      options: ['Urgent - this month', 'Next quarter', 'Exploring options'],
      required: true,
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Where should we send our response?',
      required: true,
    },
  ],
  booking: {
    enabled: true,
    heading: 'Book your discovery call',
    availableDays: [1, 2, 3, 4, 5],
    leadTimeDays: 1,
    horizonDays: 14,
    times: ['09:30', '11:00', '14:00', '16:00'],
    confirmationNote: '30 minutes, video or phone - your choice. No charge, no obligation.',
  },
};
