const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-pajo-success/10 text-pajo-success',
  PAYMENT_REPORTED: 'bg-pajo-warning/10 text-pajo-warning',
  REJECTED: 'bg-pajo-danger/10 text-pajo-danger',
  PENDING: 'bg-pajo-bg text-pajo-secondary border border-pajo-border',
  LATE: 'bg-pajo-warning/10 text-pajo-warning',
  MISSED: 'bg-pajo-danger/10 text-pajo-danger',
  FORFEITED: 'bg-pajo-danger/10 text-pajo-danger',
  WAIVED: 'bg-pajo-bg text-pajo-secondary',
  EXEMPT_RECIPIENT: 'bg-pajo-bg text-pajo-accent border border-pajo-accent/20',
  ACTIVE: 'bg-pajo-success/10 text-pajo-success',
  FULFILLED: 'bg-pajo-success/10 text-pajo-success',
  LEFT: 'bg-pajo-bg text-pajo-secondary',
  REPLACED: 'bg-pajo-bg text-pajo-secondary',
  REMOVED: 'bg-pajo-danger/10 text-pajo-danger',
  upcoming: 'bg-pajo-bg text-pajo-secondary',
  open: 'bg-pajo-success/10 text-pajo-success',
  grace: 'bg-pajo-warning/10 text-pajo-warning',
  late: 'bg-pajo-danger/10 text-pajo-danger',
  closed: 'bg-pajo-bg text-pajo-secondary',
  'paid-out': 'bg-pajo-success/10 text-pajo-success',
};

export function StatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-pajo-bg text-pajo-secondary';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}

