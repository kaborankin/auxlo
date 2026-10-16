interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-pajo-primary',
  success: 'text-pajo-success',
  warning: 'text-pajo-warning',
  danger: 'text-pajo-danger',
};

/**
 * Compact, text-only statistic tile. Deliberately icon-free — the label and
 * value carry the meaning, which keeps the mobile grid clean at two columns.
 */
export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-pajo border border-pajo-border bg-pajo-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-pajo-secondary sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-2 font-manrope text-xl font-bold tracking-tight sm:mt-3 sm:text-2xl ${toneClasses[tone]}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] font-medium text-pajo-secondary sm:text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

