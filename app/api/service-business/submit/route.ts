import { NextResponse } from 'next/server';
import { getClientConfig } from '@/config/service-business';
import { createBooking, createEnquiry } from '@/lib/service-business/enquiries';
import {
  bookingSubmissionSchema,
  buildEnquirySubmissionSchema,
  submissionKindSchema,
} from '@/lib/service-business/validation';

/**
 * The single intake edge for every service-business client.
 *
 * The body is first loosely parsed to learn its kind, then validated against a
 * schema built from that client's own enquiry-flow config, then handed to the
 * CRM seam. Nothing client-specific lives here — it all derives from config.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const kind = submissionKindSchema.safeParse(body);
  if (!kind.success) {
    return NextResponse.json({ ok: false, error: 'Unknown submission kind' }, { status: 400 });
  }

  if (kind.data.kind === 'booking') {
    const parsed = bookingSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 422 },
      );
    }
    const booking = await createBooking(parsed.data);
    return NextResponse.json({ ok: true, reference: booking.reference });
  }

  // Enquiry — the answer schema depends on the client's configured flow.
  const clientSlug =
    typeof body === 'object' && body !== null && 'clientSlug' in body
      ? String((body as { clientSlug: unknown }).clientSlug)
      : '';
  const config = getClientConfig(clientSlug);
  if (!config) {
    return NextResponse.json({ ok: false, error: 'Unknown client' }, { status: 404 });
  }

  const schema = buildEnquirySubmissionSchema(config.enquiryFlow);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  // The config-built schema yields an index-signatured answers map; normalise
  // it to the CRM seam's string-valued EnquiryAnswers shape.
  const answers: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data.answers)) {
    answers[key] = value ?? '';
  }
  const enquiry = await createEnquiry({
    clientSlug: parsed.data.clientSlug,
    answers,
    contact: parsed.data.contact,
  });
  return NextResponse.json({ ok: true, reference: enquiry.reference });
}
