import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-pajo-primary',
  success: 'text-pajo-success',
  warning: 'text-pajo-warning',
  danger: 'text-pajo-danger',
};

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-pajo border border-pajo-border bg-pajo-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-pajo-secondary">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-pajo-secondary" /> : null}
      </div>
      <p className={`mt-3 font-manrope text-2xl font-bold tracking-tight ${toneClasses[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-pajo-secondary">{hint}</p> : null}
    </div>
  );
}

