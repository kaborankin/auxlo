import type { Booking } from '../types';

/** Week commencing Mon 17 Aug 2026, plus history. */
export const bookings: Booking[] = [
  {
    id: 'b-01',
    customer: 'Sarah Taylor',
    service: 'Garden Landscaping',
    date: '2026-08-17',
    startTime: '10:00',
    endTime: '10:45',
    type: 'Consultation',
    status: 'confirmed',
    location: 'Reading',
    value: 2500,
  },
  {
    id: 'b-02',
    customer: 'James Smith',
    service: 'Property Renovation',
    date: '2026-08-17',
    startTime: '11:30',
    endTime: '12:30',
    type: 'Site visit',
    status: 'confirmed',
    location: 'Wokingham',
    value: 2500,
  },
  {
    id: 'b-03',
    customer: 'David Lee',
    service: 'Maintenance Contract',
    date: '2026-08-17',
    startTime: '14:00',
    endTime: '14:30',
    type: 'Quote discussion',
    status: 'pending',
  },
  {
    id: 'b-04',
    customer: 'Priya Shah',
    service: 'Driveway',
    date: '2026-08-18',
    startTime: '09:30',
    endTime: '10:00',
    type: 'Follow-up call',
    status: 'confirmed',
  },
  {
    id: 'b-05',
    customer: 'Daniel Lee',
    service: 'Full Garden Landscaping',
    date: '2026-08-19',
    startTime: '10:00',
    endTime: '11:00',
    type: 'Site visit',
    status: 'confirmed',
    location: 'Henley-on-Thames',
    value: 3200,
  },
  {
    id: 'b-06',
    customer: 'Marcus Cole',
    service: 'Fence Installation',
    date: '2026-08-20',
    startTime: '13:00',
    endTime: '13:30',
    type: 'Consultation',
    status: 'pending',
    location: 'Reading',
  },
  {
    id: 'b-07',
    customer: 'Rachel Adams',
    service: 'Lawn & Planting',
    date: '2026-08-10',
    startTime: '09:00',
    endTime: '09:45',
    type: 'Consultation',
    status: 'completed',
    value: 2800,
  },
  {
    id: 'b-08',
    customer: 'Amelia Clarke',
    service: 'Patio & Decking',
    date: '2026-08-11',
    startTime: '15:00',
    endTime: '15:45',
    type: 'Site visit',
    status: 'completed',
    location: 'Henley-on-Thames',
  },
];

export function getBookings(): Booking[] {
  return bookings;
}

export function getUpcomingBookings(): Booking[] {
  return bookings
    .filter((booking) => booking.status === 'confirmed' || booking.status === 'pending')
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
}

export function getBookingsForDate(isoDate: string): Booking[] {
  return bookings
    .filter((booking) => booking.date === isoDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}
