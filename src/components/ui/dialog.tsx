import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { dialogVariants } from '../../lib/motion-system';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'bottom-sheet';
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'md',
  variant = 'default',
  className
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  const isBottomSheet = variant === 'bottom-sheet';

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center',
            isBottomSheet
              ? 'items-end sm:items-center p-0 sm:p-4'
              : 'items-center p-2.5 sm:p-4'
          )}
        >
          {/* Backdrop with smooth blur fade */}
          <motion.div
            variants={dialogVariants.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Modal Container with Spring Pop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            variants={dialogVariants.content}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh]',
              isBottomSheet
                ? 'rounded-t-3xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl border-b-0 sm:border-b max-sm:pb-6'
                : 'rounded-2xl',
              widthClasses[maxWidth],
              className
            )}
          >
            {isBottomSheet && (
              <div className="w-10 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto -mt-1 mb-3 sm:hidden shrink-0" />
            )}
            <div className="flex items-start justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
              <div className="min-w-0 flex-1">
                {title && (
                  <h2 id="dialog-title" className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 sm:line-clamp-none">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="pt-3 sm:pt-4 overflow-y-auto pr-1 flex-1 min-h-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    primary: 'bg-[#E64500] text-white shadow-xs',
    accent: 'bg-orange-50 text-[#E64500] dark:bg-orange-950/70 dark:text-[#ff7a3d] border border-orange-200/80 dark:border-orange-800/80',
    secondary: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
    outline: 'border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    destructive: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 shadow-xs',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';
