import type { Lead, LeadStage, PipelineStageSummary } from '../types';

/**
 * Demo leads for the reference business (Hartley & Sons — Building &
 * Landscaping, Reading). Open stages (new → follow-up) sum to £18,420 so the
 * pipeline KPI and the CRM board always agree.
 */
export const leads: Lead[] = [
  // — New (£5,700) —
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    service: 'Electrical Installation',
    source: 'Google',
    estimatedValue: 1800,
    stage: 'new',
    score: 68,
    location: 'Reading',
    email: 'sarah.mitchell@example.co.uk',
    phone: '07700 900461',
    lastActivityAt: '2026-08-14T09:30:00',
    nextAction: 'Call to qualify scope',
    notes: ['Enquired about a full rewire for a 3-bed semi.'],
  },
  {
    id: 'james-wilson',
    name: 'James Wilson',
    service: 'Property Renovation',
    source: 'Website',
    estimatedValue: 2500,
    stage: 'new',
    score: 74,
    location: 'Wokingham',
    email: 'james.wilson@example.co.uk',
    phone: '07700 900212',
    lastActivityAt: '2026-08-14T08:15:00',
    nextAction: 'Book site survey',
    notes: ['Kitchen extension + landscaping package.'],
  },
  {
    id: 'chloe-bennett',
    name: 'Chloe Bennett',
    service: 'Garden Redesign',
    source: 'Instagram',
    estimatedValue: 1400,
    stage: 'new',
    score: 55,
    location: 'Caversham',
    email: 'chloe.bennett@example.co.uk',
    phone: '07700 900873',
    lastActivityAt: '2026-08-13T17:42:00',
    nextAction: 'Send portfolio examples',
    notes: [],
  },
  // — Qualified (£7,800) —
  {
    id: 'sarah-taylor',
    name: 'Sarah Taylor',
    service: 'Garden Landscaping',
    source: 'Instagram',
    estimatedValue: 2500,
    stage: 'qualified',
    score: 82,
    location: 'Reading',
    email: 'sarah.taylor@example.co.uk',
    phone: '07700 900184',
    lastActivityAt: '2026-08-14T10:05:00',
    nextAction: 'Follow up today',
    notes: [
      'Qualified via website enquiry — budget confirmed £2,000–£5,000.',
      'Wants lawn, patio and raised beds for an 18m rear garden.',
    ],
  },
  {
    id: 'david-brown',
    name: 'David Brown',
    service: 'Maintenance Contract',
    source: 'Referral',
    estimatedValue: 3400,
    stage: 'qualified',
    score: 79,
    location: 'Twyford',
    email: 'david.brown@example.co.uk',
    phone: '07700 900335',
    lastActivityAt: '2026-08-13T14:20:00',
    nextAction: 'Send annual contract proposal',
    notes: ['Commercial client — office block grounds maintenance.'],
  },
  {
    id: 'amelia-clarke',
    name: 'Amelia Clarke',
    service: 'Patio & Decking',
    source: 'Facebook',
    estimatedValue: 1900,
    stage: 'qualified',
    score: 71,
    location: 'Henley-on-Thames',
    email: 'amelia.clarke@example.co.uk',
    phone: '07700 900546',
    lastActivityAt: '2026-08-12T11:10:00',
    nextAction: 'Confirm survey date',
    notes: [],
  },
];


leads.push(
  // — Contacted (£2,520) —
  {
    id: 'tom-richards',
    name: 'Tom Richards',
    service: 'Fencing',
    source: 'Google',
    estimatedValue: 1120,
    stage: 'contacted',
    score: 63,
    location: 'Reading',
    email: 'tom.richards@example.co.uk',
    phone: '07700 900667',
    lastActivityAt: '2026-08-12T09:05:00',
    nextAction: 'Chase for measurements',
    notes: ['Left voicemail 12 Aug — awaiting callback.'],
  },
  {
    id: 'priya-shah',
    name: 'Priya Shah',
    service: 'Driveway',
    source: 'Website',
    estimatedValue: 1400,
    stage: 'contacted',
    score: 66,
    location: 'Earley',
    email: 'priya.shah@example.co.uk',
    phone: '07700 900778',
    lastActivityAt: '2026-08-11T16:40:00',
    nextAction: 'Send quote breakdown',
    notes: [],
  },
  // — Follow-up (£2,400) —
  {
    id: 'michael-osei',
    name: 'Michael Osei',
    service: 'Kitchen Garden',
    source: 'Instagram',
    estimatedValue: 1600,
    stage: 'follow-up',
    score: 58,
    location: 'Reading',
    email: 'michael.osei@example.co.uk',
    phone: '07700 900889',
    lastActivityAt: '2026-08-10T13:25:00',
    nextAction: 'Automated follow-up scheduled',
    notes: ['Engaged with 3 reels before enquiring.'],
  },
  {
    id: 'hannah-webb',
    name: 'Hannah Webb',
    service: 'Tree Surgery',
    source: 'Referral',
    estimatedValue: 800,
    stage: 'follow-up',
    score: 49,
    location: 'Woodley',
    email: 'hannah.webb@example.co.uk',
    phone: '07700 900990',
    lastActivityAt: '2026-08-09T10:55:00',
    nextAction: 'Second follow-up due Friday',
    notes: [],
  },
  // — Booked (£3,200) —
  {
    id: 'daniel-lee',
    name: 'Daniel Lee',
    service: 'Full Garden Landscaping',
    source: 'Website',
    estimatedValue: 3200,
    stage: 'booked',
    score: 88,
    location: 'Henley-on-Thames',
    email: 'daniel.lee@example.co.uk',
    phone: '07700 900101',
    lastActivityAt: '2026-08-13T09:15:00',
    nextAction: 'Site visit booked · 19 Aug',
    notes: ['Consultation converted to site visit within 24 hours.'],
  },
  // — Won (£2,800) —
  {
    id: 'rachel-adams',
    name: 'Rachel Adams',
    service: 'Lawn & Planting',
    source: 'Google',
    estimatedValue: 2800,
    stage: 'won',
    score: 91,
    location: 'Reading',
    email: 'rachel.adams@example.co.uk',
    phone: '07700 900202',
    lastActivityAt: '2026-08-08T15:30:00',
    nextAction: 'Request review after completion',
    notes: ['Job won 8 Aug — starts September.'],
  },
);

const OPEN_STAGES: LeadStage[] = ['new', 'qualified', 'contacted', 'follow-up'];

export function getLeads(): Lead[] {
  return leads;
}

export function getLead(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function getPipelineSummary(): PipelineStageSummary[] {
  const order: { key: LeadStage; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'qualified', label: 'Qualified' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'follow-up', label: 'Follow-up' },
    { key: 'booked', label: 'Booked' },
    { key: 'won', label: 'Won' },
  ];
  return order.map(({ key, label }) => {
    const inStage = leads.filter((lead) => lead.stage === key);
    return {
      key,
      label,
      count: inStage.length,
      value: inStage.reduce((sum, lead) => sum + lead.estimatedValue, 0),
    };
  });
}

/** Open pipeline = every opportunity not yet booked or won. */
export function getOpenPipelineValue(): number {
  return leads
    .filter((lead) => OPEN_STAGES.includes(lead.stage))
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);
}
