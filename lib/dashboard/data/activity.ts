import type { ActivityItem } from '../types';

export const activity: ActivityItem[] = [
  {
    id: 'a-01',
    kind: 'enquiry',
    text: 'New enquiry from Emma Hughes — garden maintenance in Twyford',
    at: '2026-08-14T11:26:00',
  },
  {
    id: 'a-02',
    kind: 'lead',
    text: 'Sarah Taylor qualified with a lead score of 82',
    at: '2026-08-14T10:05:00',
  },
  {
    id: 'a-03',
    kind: 'automation',
    text: 'Follow-up sent to Michael Osei via the enquiry workflow',
    at: '2026-08-14T09:00:00',
  },
  {
    id: 'a-04',
    kind: 'booking',
    text: 'Site visit confirmed for Daniel Lee on 19 Aug',
    at: '2026-08-13T09:15:00',
  },
  {
    id: 'a-05',
    kind: 'content',
    text: 'Instagram story published — morning materials run',
    at: '2026-08-14T08:10:00',
  },
  {
    id: 'a-06',
    kind: 'lead',
    text: 'James Wilson moved to New after website enquiry',
    at: '2026-08-14T08:15:00',
  },
  {
    id: 'a-07',
    kind: 'client',
    text: 'David Brown added as an active maintenance client',
    at: '2026-08-13T14:20:00',
  },
  {
    id: 'a-08',
    kind: 'booking',
    text: 'Quote discussion requested by David Lee for 17 Aug',
    at: '2026-08-12T17:44:00',
  },
];

export function getActivity(): ActivityItem[] {
  return activity;
}
