import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isToday,
  isTomorrow,
  parseISO,
} from 'date-fns';

/** £18,420 */
export function formatGBP(value: number): string {
  return `£${value.toLocaleString('en-GB')}`;
}

/** £18.4K — compact form for dense stat tiles */
export function formatGBPCompact(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `£${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return formatGBP(value);
}

/**
 * Product-style relative time: "12m ago" / "2h ago" / "3d ago", then an
 * absolute date once it is older than a week so demo screenshots never rot.
 */
export function timeAgo(dateInput: string | Date, now: Date = new Date()): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;
  const days = differenceInCalendarDays(now, date);
  if (days < 7) return `${days}d ago`;
  return format(date, 'd MMM');
}

/** "Wed 19 Aug" — friendly label for calendar agenda headers */
export function formatDayLabel(isoDate: string): string {
  const date = parseISO(isoDate);
  if (isToday(date)) return `Today · ${format(date, 'd MMM')}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, 'd MMM')}`;
  return format(date, 'EEEE d MMM');
}

/** "19 Aug 2026" */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy');
}
