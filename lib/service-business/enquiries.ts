import type { Booking, Customer, Enquiry, EnquiryAnswers } from '@/types/service-business';

/**
 * The CRM seam.
 *
 * Submissions are validated at the API edge, normalised here, and returned
 * with a human-friendly reference. Persistence is intentionally mocked for
 * demos — swapping in Prisma (or a webhook into the Auxlo dashboard's lead
 * pipeline) is a drop-in change to these two functions, nothing else.
 */

export function generateReference(prefix: 'ENQ' | 'BK'): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${digits}`;
}

export async function createEnquiry(input: {
  clientSlug: string;
  answers: EnquiryAnswers;
  contact: Customer;
}): Promise<Enquiry> {
  const enquiry: Enquiry = {
    clientSlug: input.clientSlug,
    reference: generateReference('ENQ'),
    answers: input.answers,
    contact: input.contact,
    submittedAt: new Date().toISOString(),
  };

  // TODO(production): prisma.enquiry.create({ data: enquiry }) and trigger
  // the "New enquiry follow-up" automation in the Auxlo backend.
  console.info('[service-business] enquiry received', enquiry.reference, enquiry.clientSlug);

  return enquiry;
}

export async function createBooking(input: {
  clientSlug: string;
  service: string;
  date: string;
  time: string;
  customer: Customer;
}): Promise<Booking> {
  const booking: Booking = {
    clientSlug: input.clientSlug,
    reference: generateReference('BK'),
    service: input.service,
    date: input.date,
    time: input.time,
    customer: input.customer,
    submittedAt: new Date().toISOString(),
  };

  // TODO(production): prisma.booking.create({ data: booking }) + calendar sync.
  console.info('[service-business] booking received', booking.reference, booking.clientSlug);

  return booking;
}
