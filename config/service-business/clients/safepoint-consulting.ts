import type { ClientConfig } from '@/types/service-business';

/**
 * SafePoint Consulting Ltd — Health & Safety consultancy for SMEs.
 *
 * Positioning: "Professional health & safety expertise without the cost or
 * commitment of a full-time in-house advisor." The site is the front door to
 * the SafePoint system (enquiry → dashboard → consultation → relationship),
 * not a brochure. Rebranded around the existing charcoal + green logo.
 */
export const safepointConsulting: ClientConfig = {
  slug: 'safepoint-consulting',
  name: 'SafePoint Consulting',
  industry: 'Health & Safety Consultancy',
  tagline: 'Practical health & safety support for growing businesses.',
  theme: 'safepoint',
  logo: '/safepoint/safepoint logo.jpeg',
  contact: {
    phone: '+44 7710 162332', // Placeholder — update when available
    email: 'enquire@safepointconsulting.com',
    location: 'United Kingdom',
    hours: 'Mon–Fri, 9am–5:00pm',
  },
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'How we help', href: '#how' },
    { label: 'About', href: '#why' },
    { label: 'Contact', href: '#contact' },
  ],
  hero: {
    eyebrow: 'Practical Health & Safety Consultancy',
    title: 'Confidence in your compliance. Clarity in what comes next.',
    description:
      'SafePoint Consulting helps SMEs understand their health & safety position, identify compliance gaps and put practical systems in place that work in the real world - without the need for a full-time in-house advisor.',
    primaryCta: 'Book a Consultation',
    primaryCtaTarget: 'booking',
    secondaryCta: 'Explore Services',
    supportLine: 'Compliance Assessments · Risk Management · Fire Safety · ISO 45001 · Ongoing Support',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    stats: [
      { value: 'SME', label: 'Focused Support' },
      { value: 'ISO 45001', label: 'Specialist' },
      { value: 'Practical', label: 'Not Just Paperwork' },
    ],
  },
  problem: {
    title: 'Know where you stand. Know what needs attention.',
    description:
      'Health & safety requirements can become increasingly complex as a business grows. SafePoint provides an independent view of your current arrangements — helping you understand what’s working, where gaps may exist and what practical steps can strengthen your approach.',
    pillars: [
      { title: 'Assess', description: 'Understand your current level of compliance.' },
      { title: 'Improve', description: 'Identify gaps and prioritise corrective actions.' },
      { title: 'Embed', description: 'Put practical processes in place that your team can actually follow.' },
    ],
  },
  trust: [
    'Independent, practical advice',
    'Extensive audit & inspection experience',
    'ISO 45001 support',
    'Fire safety & RRFSO expertise',
    'Ongoing consultancy, on your terms',
  ],
  services: [
    {
      name: 'Compliance Gap Assessments',
      description:
        'A structured review of your current health & safety arrangements to identify gaps, risks and opportunities for improvement.',
      priceHint: 'Free initial conversation',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    },
    {
      name: 'Policies & Risk Management',
      description:
        'Developing practical policies, procedures and risk management systems suited to how your operation actually runs.',
      priceHint: 'Fixed project fees',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
    },
    {
      name: 'Workplace Audits & Inspections',
      description:
        'Independent audits and inspections to assess compliance and identify the areas requiring attention.',
      priceHint: 'Custom quotes',
      image: '/safepoint/workplace.png',
    },
    {
      name: 'Fire Safety',
      description:
        'Support with fire safety arrangements, including fire risk assessment and practical, workable controls.',
      priceHint: 'RRFSO aligned',
      image: '/safepoint/fire.png',
    },
    {
      name: 'Accident & Incident Investigations',
      description:
        'Structured investigation and reporting to understand what happened and identify the right corrective actions.',
      priceHint: 'RIDDOR aware',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    },
    {
      name: 'ISO 45001 Support',
      description:
        'Practical support for businesses developing, implementing or improving an ISO 45001 management system.',
      priceHint: 'Gap to certification',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    },
    {
      name: 'Ongoing Consultancy',
      description:
        'Flexible health & safety support when you need professional expertise without employing a full-time advisor.',
      priceHint: 'Retained options',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    },
  ],
  why: [
    {
      title: 'Expertise that works beyond the paperwork',
      description:
        'Health & safety shouldn’t simply be about producing policies and ticking boxes. SafePoint focuses on practical solutions that can be understood, implemented and maintained by the people responsible for them.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    },
    {
      title: 'An independent view',
      description:
        'A fresh, objective assessment of your arrangements — so you know what’s working, where gaps may exist and what to prioritise first.',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80',
    },
    {
      title: 'Built for growing businesses',
      description:
        'Professional health & safety expertise for SMEs that don’t need — or can’t justify — a full-time in-house advisor.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    },
    {
      title: 'Clarity, not complexity',
      description:
        'Clear, data-driven reports and straightforward recommendations your leadership and your team can actually act on.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    },
  ],
  process: [
    {
      title: 'Informal conversation',
      description: 'We discuss your business and your current health & safety arrangements — no jargon, no obligation.',
    },
    {
      title: 'Independent assessment',
      description: 'We review where you stand, identifying compliance gaps and immediate risks.',
    },
    {
      title: 'Practical systems',
      description: 'We put practical, workable policies and processes in place that your team can follow.',
    },
    {
      title: 'Ongoing support',
      description: 'Consultancy, audits and reviews that keep you compliant as you grow.',
    },
  ],
  work: [
    {
      title: 'ISO 45001 Implementation',
      category: 'Compliance',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    },
    {
      title: 'Fire Risk Assessment',
      category: 'Fire Safety',
      image: '/safepoint/fire.png',
    },
  ],
  about: {
    name: 'Yewande Adeliyi',
    role: 'Principal Consultant',
    bio: `A compliance-focused Health & Safety professional with extensive experience conducting audits, inspections, and risk reviews across multiple sectors. I specialise in preparing practical health and safety policies, operational procedures, and conducting thorough fire risk assessments.

My approach is built on establishing strong, collaborative working relationships. I pride myself on being approachable and proactive, helping businesses navigate the complexities of RRFO requirements and ISO standards with clarity and confidence.

I focus on developing practical solutions and embedding compliant working practices that produce clear, data-driven results for leadership teams, ensuring health and safety is a benefit to your operation, not a hurdle.`,
    image: '/safepoint/safepoint logo.jpeg',
  },
  testimonials: [
    {
      quote:
        "SafePoint provided exactly the kind of practical, no-nonsense advice we needed. Their ability to translate complex health and safety requirements into workable processes has been invaluable for our team's confidence and compliance.",
      name: 'Growing SME Client',
      role: 'Operations Director',
      image: '/safepoint/safepoint logo.jpeg',
    },
  ],
  cta: {
    title: 'Ready for a safer, more confident business?',
    description:
      'If you’re not completely confident about your health & safety arrangements, let’s have an informal conversation - no jargon, no obligation.',
  },
  enquiryFlow: [
    { id: 'service', type: 'service', title: 'What health & safety support do you need?', required: true },
    {
      id: 'industry',
      type: 'options',
      title: 'What kind of business do you run?',
      options: ['Construction / Trades', 'Office / Professional', 'Manufacturing / Industrial', 'Retail / Hospitality', 'Other'],
      required: true,
    },
    {
      id: 'compliance-level',
      type: 'options',
      title: 'How would you describe your current position?',
      options: [
        'I need an independent review',
        'Mostly in place, but gaps exist',
        'Working towards ISO 45001',
        'Just exploring options',
      ],
      required: true,
    },
    { id: 'contact', type: 'contact', title: 'Where should we send our response?', required: true },
  ],
  booking: {
    enabled: true,
    heading: 'Book your health & safety consultation',
    availableDays: [1, 2, 3, 4, 5],
    leadTimeDays: 1,
    horizonDays: 14,
    times: ['10:00', '11:30', '14:30', '16:00'],
    confirmationNote: 'An informal conversation about your arrangements and the practical next steps.',
  },
};

