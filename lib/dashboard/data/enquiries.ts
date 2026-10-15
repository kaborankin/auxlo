import type { Enquiry } from '../types';

/**
 * Structured enquiries as produced by the public-facing qualifier flow:
 * Service → Project details → Budget → Location → Contact → Confirmation.
 */
export const enquiries: Enquiry[] = [
  {
    id: 'sarah-taylor',
    name: 'Sarah Taylor',
    service: 'Garden landscaping',
    projectDetails:
      '3-bed semi with an overgrown 18m rear garden. Wants the space cleared, a new lawn, a porcelain patio and two raised beds. Has a side gate for access and would like work to start before autumn.',
    budget: '£2,000–£5,000',
    location: 'Reading',
    source: 'Instagram',
    score: 82,
    status: 'qualified',
    nextAction: 'Follow up today',
    receivedAt: '2026-08-14T10:05:00',
    contact: {
      email: 'sarah.taylor@example.co.uk',
      phone: '07700 900184',
      preferred: 'WhatsApp',
    },
  },
  {
    id: 'daniel-lee',
    name: 'Daniel Lee',
    service: 'Full garden landscaping',
    projectDetails:
      'New-build property with a blank 22m plot. Looking for a complete design-and-build: patio, lawn, planting borders and lighting. Happy to phase the work if needed.',
    budget: '£5,000–£10,000',
    location: 'Henley-on-Thames',
    source: 'Website',
    score: 88,
    status: 'converted',
    nextAction: 'Site visit booked · 19 Aug',
    receivedAt: '2026-08-12T19:48:00',
    contact: {
      email: 'daniel.lee@example.co.uk',
      phone: '07700 900101',
      preferred: 'Email',
    },
  },
  {
    id: 'james-wilson',
    name: 'James Wilson',
    service: 'Property renovation',
    projectDetails:
      'Kitchen extension (approx. 4m) plus landscaping of the rear garden once building work completes. Already has drawings and is comparing three local firms.',
    budget: '£10,000+',
    location: 'Wokingham',
    source: 'Website',
    score: 74,
    status: 'qualified',
    nextAction: 'Book site survey',
    receivedAt: '2026-08-14T08:15:00',
    contact: {
      email: 'james.wilson@example.co.uk',
      phone: '07700 900212',
      preferred: 'Phone',
    },
  },
  {
    id: 'emma-hughes',
    name: 'Emma Hughes',
    service: 'Garden maintenance',
    projectDetails:
      'Fortnightly maintenance for a large mature garden — lawns, hedges and borders. Current gardener retiring at the end of the month.',
    budget: '£500–£1,000 / year',
    location: 'Twyford',
    source: 'Referral',
    score: 71,
    status: 'new',
    nextAction: 'Call to qualify',
    receivedAt: '2026-08-14T11:26:00',
    contact: {
      email: 'emma.hughes@example.co.uk',
      phone: '07700 900314',
      preferred: 'Phone',
    },
  },
  {
    id: 'marcus-cole',
    name: 'Marcus Cole',
    service: 'Fence installation',
    projectDetails:
      'Approx. 14m of close-board fencing along the rear boundary, plus one gate. Old panels came down in the last storm.',
    budget: '£1,000–£2,000',
    location: 'Reading',
    source: 'Google',
    score: 63,
    status: 'new',
    nextAction: 'Send availability',
    receivedAt: '2026-08-13T16:02:00',
    contact: {
      email: 'marcus.cole@example.co.uk',
      phone: '07700 900415',
      preferred: 'WhatsApp',
    },
  },
  {
    id: 'sophie-turner',
    name: 'Sophie Turner',
    service: 'Decking repair',
    projectDetails:
      'Several rotten boards on a raised composite deck. Unsure whether it needs repair or partial replacement — mentioned a tight budget.',
    budget: 'Under £1,000',
    location: 'Caversham',
    source: 'Facebook',
    score: 41,
    status: 'needs-info',
    nextAction: 'Request photos of damage',
    receivedAt: '2026-08-12T12:37:00',
    contact: {
      email: 'sophie.turner@example.co.uk',
      phone: '07700 900516',
      preferred: 'Email',
    },
  },
];

export function getEnquiries(): Enquiry[] {
  return enquiries;
}

export function getEnquiry(id: string): Enquiry | undefined {
  return enquiries.find((enquiry) => enquiry.id === id);
}
