import { NotificationDropdown } from './NotificationDropdown';

interface TopbarProps {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
  userId?: string | null;
  role: 'admin' | 'member' | null;
}

export function Topbar({ title, subtitle, userEmail, userId, role }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-pajo-border bg-pajo-surface px-6 py-4">
      <div>
        <h2 className="font-manrope text-lg font-bold text-pajo-primary">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-pajo-secondary">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-5">
        {userId && <NotificationDropdown userId={userId} />}

        <div className="flex items-center gap-3">
          {role ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                role === 'admin'
                  ? 'bg-pajo-accent/10 text-pajo-accent'
                  : 'bg-pajo-bg text-pajo-secondary'
              }`}
            >
              {role === 'admin' ? 'Treasurer' : 'Member'}
            </span>
          ) : null}
          {userEmail ? <span className="text-xs font-medium text-pajo-secondary">{userEmail}</span> : null}
        </div>
      </div>
    </header>
  );
}

