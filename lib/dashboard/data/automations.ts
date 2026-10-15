import type { Automation } from '../types';

export const automations: Automation[] = [
  {
    id: 'new-enquiry-follow-up',
    name: 'New enquiry follow-up',
    description:
      'Turns every website or social enquiry into a qualified lead, notifies the team, confirms receipt with the customer and keeps following up until they respond.',
    status: 'active',
    stats: { active: 12, waiting: 4, dueToday: 7, completedThisMonth: 26 },
    steps: [
      {
        id: 's1',
        label: 'New enquiry',
        description: 'Website, Instagram or Facebook qualifier submitted',
        kind: 'trigger',
      },
      {
        id: 's2',
        label: 'Create lead',
        description: 'Structured lead added to the pipeline with source and budget',
        kind: 'action',
      },
      {
        id: 's3',
        label: 'Notify team',
        description: 'WhatsApp + email alert with lead score attached',
        kind: 'action',
      },
      {
        id: 's4',
        label: 'Send confirmation',
        description: 'Customer gets an instant branded confirmation message',
        kind: 'action',
      },
      {
        id: 's5',
        label: 'Schedule follow-up',
        description: 'Follow-up queued for the next working morning',
        kind: 'action',
      },
      {
        id: 's6',
        label: 'Customer responds?',
        description: 'Checks for a reply before each follow-up step',
        kind: 'condition',
      },
      {
        id: 's7',
        label: 'Stop automation',
        description: 'Conversation handed back to the team',
        kind: 'end',
      },
    ],
  },
  {
    id: 'review-request',
    name: 'Review request',
    description:
      'After a job is marked complete, waits two days then asks the customer for a Google review with a direct link.',
    status: 'active',
    stats: { active: 3, waiting: 3, dueToday: 1, completedThisMonth: 9 },
    steps: [
      { id: 's1', label: 'Job completed', kind: 'trigger' },
      { id: 's2', label: 'Wait 2 days', kind: 'action' },
      { id: 's3', label: 'Send review request', kind: 'action' },
      { id: 's4', label: 'Review received?', kind: 'condition' },
      { id: 's5', label: 'Stop automation', kind: 'end' },
    ],
  },
  {
    id: 're-engage-cold-leads',
    name: 'Re-engage cold leads',
    description:
      'Leads with no activity for 14 days receive a gentle check-in with recent project photos before being archived.',
    status: 'paused',
    stats: { active: 0, waiting: 0, dueToday: 0, completedThisMonth: 14 },
    steps: [
      { id: 's1', label: 'Lead inactive 14 days', kind: 'trigger' },
      { id: 's2', label: 'Send check-in message', kind: 'action' },
      { id: 's3', label: 'Customer responds?', kind: 'condition' },
      { id: 's4', label: 'Archive lead', kind: 'end' },
    ],
  },
];

export function getAutomations(): Automation[] {
  return automations;
}
