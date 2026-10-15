import type { LucideIcon } from 'lucide-react';

/**
 * Auxlo backend domain model.
 *
 * Every dashboard page consumes these interfaces via the getters in
 * `lib/dashboard/data/*`. When a real client deployment wires up Prisma/API
 * data, only the data layer changes — the components and routes stay identical.
 */

export type Trend = 'up' | 'down' | 'neutral';

export type LeadStage =
  | 'new'
  | 'qualified'
  | 'contacted'
  | 'follow-up'
  | 'booked'
  | 'won';

export type LeadSource = 'Website' | 'Instagram' | 'Google' | 'Facebook' | 'Referral';

export interface Lead {
  id: string;
  name: string;
  service: string;
  source: LeadSource;
  estimatedValue: number; // GBP
  stage: LeadStage;
  score: number; // 0–100 lead score
  location: string;
  email: string;
  phone: string;
  lastActivityAt: string; // ISO date
  nextAction: string;
  notes: string[];
}

export type EnquiryStatus = 'new' | 'qualified' | 'needs-info' | 'converted' | 'archived';

export interface Enquiry {
  id: string;
  name: string;
  service: string;
  projectDetails: string;
  budget: string;
  location: string;
  source: LeadSource;
  score: number;
  status: EnquiryStatus;
  nextAction: string;
  receivedAt: string; // ISO date
  contact: {
    email: string;
    phone: string;
    preferred: 'Email' | 'Phone' | 'WhatsApp';
  };
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type BookingType =
  | 'Consultation'
  | 'Site visit'
  | 'Quote discussion'
  | 'Follow-up call';

export interface Booking {
  id: string;
  customer: string;
  service: string;
  date: string; // ISO yyyy-mm-dd
  startTime: string; // "10:00"
  endTime?: string;
  type: BookingType;
  status: BookingStatus;
  location?: string;
  value?: number;
}

export type AutomationStepKind = 'trigger' | 'action' | 'condition' | 'end';

export interface AutomationStep {
  id: string;
  label: string;
  description?: string;
  kind: AutomationStepKind;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  steps: AutomationStep[];
  stats: {
    active: number;
    waiting: number;
    dueToday: number;
    completedThisMonth: number;
  };
}

export type ClientStatus = 'active' | 'prospect' | 'past';

export interface Client {
  id: string;
  name: string;
  business?: string;
  service: string;
  status: ClientStatus;
  totalValue: number; // GBP lifetime value
  bookingsCount: number;
  location: string;
  email: string;
  phone: string;
  lastActivityAt: string; // ISO date
}

export type Channel = 'Instagram' | 'Facebook' | 'LinkedIn';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
export type ContentKind = 'Reel' | 'Carousel' | 'Post' | 'Article' | 'Story';

export interface ContentItem {
  id: string;
  title: string;
  channel: Channel;
  kind: ContentKind;
  status: ContentStatus;
  date: string; // ISO yyyy-mm-dd
}

export type ActivityKind =
  | 'enquiry'
  | 'lead'
  | 'booking'
  | 'automation'
  | 'content'
  | 'client';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
  at: string; // ISO date
}

export interface Metric {
  label: string;
  value: string;
  change?: string;
  trend?: Trend;
}

export interface PipelineStageSummary {
  key: LeadStage;
  label: string;
  count: number;
  value: number; // GBP total estimated value in stage
}

export interface SourceShare {
  source: LeadSource;
  percentage: number; // 0–100
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}
