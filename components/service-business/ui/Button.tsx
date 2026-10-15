import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The single service-business button. Renders as a Link when `href` is given,
 * otherwise a native button. All colour/radius come from the active theme's
 * CSS variables, so it never hard-codes a brand.
 */

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sb-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary:
    'bg-sb-primary text-white shadow-sm hover:opacity-90 hover:shadow-md active:opacity-100',
  accent:
    'bg-sb-accent text-white shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95 active:shadow-inner',
  outline:
    'border border-sb-border bg-sb-surface/50 backdrop-blur-sm text-sb-text hover:border-sb-accent hover:text-sb-primary hover:bg-sb-surface',
  ghost: 'text-sb-primary hover:bg-sb-surface',
};

const sizes: Record<Size, string> = {
  sm: 'rounded-sb-sm px-3.5 py-2 text-sm',
  md: 'rounded-sb-md px-5 py-2.5 text-sm',
  lg: 'rounded-sb-md px-7 py-3.5 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type SbButtonProps = CommonProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function SbButton(props: SbButtonProps) {
  const { variant = 'primary', size = 'md', className = '', children } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();

  if ('href' in props && props.href !== undefined) {
    const { href, ...rest } = props as CommonProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...rest } = props as CommonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
