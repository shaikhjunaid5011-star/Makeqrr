import * as React from 'react';
import { cn } from '../../lib/utils';
import { Loader } from './loader';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  disableRipple?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      loadingText,
      disableRipple = false,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const [ripple, setRipple] = React.useState<{ x: number; y: number; key: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
          const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
          setRipple({ x, y, key: Date.now() });
        }
      }
      onClick?.(e);
    };

    const base =
      'relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] dark:focus-visible:ring-[#ff6b2b] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      default:
        'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      primary:
        'bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs hover:shadow-md hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      secondary:
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      outline:
        'border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-800 hover:text-[#E64500] dark:hover:text-[#ff7a3d] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      ghost:
        'text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/70 dark:hover:bg-orange-950/40 hover:text-[#E64500] dark:hover:text-[#ff7a3d] active:scale-[0.98]',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
      accent:
        'bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs hover:shadow-md hover:shadow-orange-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-lg px-6 text-base',
      icon: 'h-9 w-9 p-0'
    };

    const spinnerSize = size === 'sm' || size === 'icon' ? 'xs' : 'sm';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? 'true' : undefined}
        onClick={handleClick}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait opacity-80',
          className
        )}
        {...props}
      >
        {ripple && (
          <span
            key={ripple.key}
            style={{ left: ripple.x, top: ripple.y }}
            onAnimationEnd={() => setRipple(null)}
            className="button-ripple-circle"
            aria-hidden="true"
          />
        )}
        {loading ? (
          <span className="inline-flex items-center gap-2 relative z-10">
            <Loader variant="inline" size={spinnerSize} />
            <span>{loadingText || children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
