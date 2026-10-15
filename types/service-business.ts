/**
 * Service Business Experience System — domain model.
 *
 * Everything a client deployment can configure is typed here. Components
 * never contain business copy, colours, fonts or industry logic — only
 * these shapes. Change config, not code.
 */

/* ——— Theme ——— */

export type ThemeKey = 'professional' | 'healthcare' | 'beauty' | 'trades' | 'safepoint' | 'bang';

export type FontKey = 'inter' | 'manrope' | 'dm-sans' | 'space-grotesk' | 'cormorant';

export interface Theme {
  key: ThemeKey;
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
    muted: string;
    border: string;
  };
  radius: { sm: string; md: string; lg: string; xl: string };
  fonts: { heading: FontKey; body: FontKey };
}

/* ——— Business content ——— */

export interface Service {
  name: string;
  description: string;
  priceHint?: string;
  /** Optional image URL (service card thumbnail / icon) */
  image?: string;
}

export interface NavLink {
  label: string;
  href: string; // anchor on the landing page, e.g. "#services"
}

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  /** Optional avatar image URL */
  image?: string;
}

export interface WorkItem {
  title: string;
  category: string;
  /** Optional project image URL */
  image?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

/* ——— Enquiry flow ——— */

export type EnquiryStepType = 'service' | 'options' | 'textarea' | 'text' | 'contact';

export interface EnquiryStep {
  id: string;
  type: EnquiryStepType;
  title: string;
  description?: string;
  required?: boolean;
  /** 'service' falls back to client.services; 'options' requires this list */
  options?: string[];
  /** 'text' / 'textarea' */
  inputLabel?: string;
  placeholder?: string;
}

export type EnquiryAnswers = Record<string, string>;

export interface Enquiry {
  clientSlug: string;
  reference: string;
  answers: EnquiryAnswers;
  contact: { name: string; phone: string; email: string };
  submittedAt: string; // ISO
}

/* ——— Booking ——— */

export interface BookingConfig {
  enabled: boolean;
  heading: string;
  /** days of week slots are offered (0 = Sun … 6 = Sat) */
  availableDays: number[];
  /** minimum days ahead a slot can be booked */
  leadTimeDays: number;
  /** how many days of availability to show */
  horizonDays: number;
  times: string[];
  confirmationNote: string;
}

export interface Booking {
  clientSlug: string;
  reference: string;
  service: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  customer: Customer;
  submittedAt: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface WhyItem {
  title: string;
  description: string;
  /** Optional decorative image URL */
  image?: string;
}

/* ——— Client configuration (the file that changes per deployment) ——— */

export interface ClientConfig {
  slug: string;
  name: string;
  industry: string;
  tagline: string;
  theme: ThemeKey;
  contact: { phone: string; email: string; location: string; hours: string };
  nav: NavLink[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    /** Where the primary CTA leads — defaults to the enquiry flow. */
    primaryCtaTarget?: 'enquire' | 'booking';
    secondaryCta: string;
    /** Small credibility line under the CTAs, e.g. "Audits · ISO 45001 · …" */
    supportLine?: string;
    stats: { value: string; label: string }[];
    /** Optional hero image URL (displayed beside the text) */
    image?: string;
  };
  /**
   * Positive "know where you stand" framing — a headline plus three pillars
   * (e.g. Assess / Improve / Embed). Rendered as its own landing section.
   */
  problem?: {
    title: string;
    description: string;
    pillars: { title: string; description: string }[];
  };
  /** Optional logo URL (displayed in the header) */
  logo?: string;
  trust: string[];
  services: Service[];
  why: WhyItem[];
  /** Optional personal bio section (About the professional) — hidden when omitted. */
  about?: {
    name: string;
    role: string;
    bio: string;
    /** Optional portrait image URL */
    image?: string;
  };
  process: ProcessStep[];
  work: WorkItem[];
  /** Optional — the section is hidden when empty or omitted. */
  testimonials?: Testimonial[];
  /** Closing call-to-action framing. `button` is optional — used only where a standalone CTA button is rendered. */
  cta: { title: string; description: string; button?: string };
  enquiryFlow: EnquiryStep[];
  booking: BookingConfig;
}
