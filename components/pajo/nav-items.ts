import { LayoutDashboard, Users, Wallet, BookText, ScrollText, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PajoNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for Pajo navigation. Shared by the desktop sidebar
 * and the mobile drawer so the two lists can never drift apart.
 *
 * With no `potSlug` these are the organisation-level tabs; with one they are
 * the tabs for that circle (Settings only for admins).
 */
export function getPajoNavItems({
  potSlug,
  isAdmin,
}: {
  potSlug?: string;
  isAdmin: boolean;
}): PajoNavItem[] {
  if (!potSlug) {
    return [
      { label: 'Home', href: '/pajo', icon: LayoutDashboard },
      { label: 'New Circle', href: '/pajo/new', icon: Settings },
    ];
  }

  const base = `/pajo/${potSlug}`;
  const items: PajoNavItem[] = [
    { label: 'Overview', href: base, icon: LayoutDashboard },
    { label: 'Ledger', href: `${base}/ledger`, icon: BookText },
    { label: 'Members', href: `${base}/members`, icon: Users },
    { label: 'Payouts', href: `${base}/payouts`, icon: Wallet },
    { label: 'Rules', href: `${base}/rules`, icon: ScrollText },
  ];

  if (isAdmin) {
    items.push({ label: 'Settings', href: `${base}/settings`, icon: Settings });
  }

  return items;
}

/** Whether a nav item should render as the active tab for the current path. */
export function isPajoNavActive({
  item,
  activePath,
  isGlobal,
  base,
}: {
  item: PajoNavItem;
  activePath: string;
  isGlobal: boolean;
  base: string;
}): boolean {
  return (
    activePath === item.href ||
    (!isGlobal && item.href !== base && activePath.startsWith(item.href))
  );
}
