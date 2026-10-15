import type { Metric, SourceShare } from '../types';

/** Command-centre KPIs — pipeline value matches the CRM board exactly. */
export const commandCentreMetrics: Metric[] = [
  { label: 'Pipeline', value: '£18,420', change: '+12%', trend: 'up' },
  { label: 'Enquiries', value: '34', change: '+28%', trend: 'up' },
  { label: 'Qualified', value: '18', change: '+9%', trend: 'up' },
  { label: 'Consultations', value: '9', change: '+3', trend: 'up' },
  { label: 'Bookings', value: '6', change: '+2', trend: 'up' },
];

export const enquirySources: SourceShare[] = [
  { source: 'Website', percentage: 38 },
  { source: 'Instagram', percentage: 26 },
  { source: 'Google', percentage: 18 },
  { source: 'Facebook', percentage: 9 },
  { source: 'Referral', percentage: 9 },
];

/** Weekly enquiry volume for the reports trend chart. */
export const enquiryTrend = [
  { label: '22 Jun', enquiries: 12, qualified: 6 },
  { label: '29 Jun', enquiries: 15, qualified: 7 },
  { label: '6 Jul', enquiries: 14, qualified: 8 },
  { label: '13 Jul', enquiries: 19, qualified: 10 },
  { label: '20 Jul', enquiries: 17, qualified: 9 },
  { label: '27 Jul', enquiries: 22, qualified: 12 },
  { label: '3 Aug', enquiries: 26, qualified: 14 },
  { label: '10 Aug', enquiries: 34, qualified: 18 },
];

/** Open pipeline value created per month, for the reports bar chart. */
export const pipelineByMonth = [
  { label: 'Mar', value: 8200 },
  { label: 'Apr', value: 11400 },
  { label: 'May', value: 9800 },
  { label: 'Jun', value: 14200 },
  { label: 'Jul', value: 16900 },
  { label: 'Aug', value: 18420 },
];

export const reportMetrics: Metric[] = [
  { label: 'Open pipeline', value: '£18,420', change: '+12%', trend: 'up' },
  { label: 'Won this month', value: '£8.6K', change: '+31%', trend: 'up' },
  { label: 'Enquiry → booking', value: '26%', change: '+4pts', trend: 'up' },
  { label: 'Avg. first response', value: '14m', change: '-38m', trend: 'up' },
];

export function getCommandCentreMetrics(): Metric[] {
  return commandCentreMetrics;
}

export function getEnquirySources(): SourceShare[] {
  return enquirySources;
}

export function getEnquiryTrend() {
  return enquiryTrend;
}

export function getPipelineByMonth() {
  return pipelineByMonth;
}

export function getReportMetrics(): Metric[] {
  return reportMetrics;
}
