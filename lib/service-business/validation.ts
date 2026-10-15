import { z } from 'zod';
import type { EnquiryStep } from '@/types/service-business';

export const phoneSchema = z
  .string()
  .regex(/^[0-9+\s()-]{7,20}$/, 'Enter a valid phone number');

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  phone: phoneSchema,
  email: z.string().email('Enter a valid email address'),
});

export type ContactValues = z.infer<typeof contactSchema>;

/** Zod schema for a single enquiry step's answer. */
export function stepSchema(step: EnquiryStep): z.ZodType<string | undefined> {
  const base =
    step.type === 'service' || step.type === 'options'
      ? z.string().min(1, 'Please choose an option to continue')
      : step.id === 'postcode'
        ? z
            .string()
            .min(3, 'Enter your postcode')
            .max(10, 'Enter a valid postcode')
        : z.string().min(2, 'Please add a little detail');
  return step.required === false ? base.optional().or(z.literal('')) : base;
}

/** RHF `validate` adapter: (value) => true | error message. */
export function rhfValidate(step: EnquiryStep) {
  const schema = stepSchema(step);
  return (value: unknown) => {
    if (!step.required && (value === undefined || value === '')) return true;
    const result = schema.safeParse(value);
    return result.success ? true : result.error.issues[0].message;
  };
}

/** Whole-submission schema for the API, built from the client's flow config. */
export function buildEnquirySubmissionSchema(flow: EnquiryStep[]) {
  const shape: Record<string, z.ZodType<string | undefined>> = {};
  for (const step of flow) {
    if (step.type !== 'contact') shape[step.id] = stepSchema(step);
  }
  return z.object({
    kind: z.literal('enquiry'),
    clientSlug: z.string().min(1),
    answers: z.object(shape),
    contact: contactSchema,
  });
}

export const bookingSubmissionSchema = z.object({
  kind: z.literal('booking'),
  clientSlug: z.string().min(1),
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
  customer: contactSchema,
});

/** Loose parse used to pick the submission shape before config-aware parsing. */
export const submissionKindSchema = z.object({ kind: z.enum(['enquiry', 'booking']) });
