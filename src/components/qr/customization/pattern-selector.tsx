import * as React from 'react';
import { PatternType, QRConfig } from '../../../types/qr';
import { cn } from '../../../lib/utils';

interface PatternSelectorProps {
  value: PatternType;
  onChange: (val: PatternType) => void;
  color: string;
}

interface PatternOption {
  id: PatternType;
  label: string;
  renderMini: (color: string) => React.ReactNode;
}

const PATTERN_OPTIONS: PatternOption[] = [
  {
    id: 'square',
    label: 'Square',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect x="2" y="2" width="10" height="10" fill={color} />
        <rect x="15" y="2" width="10" height="10" fill={color} />
        <rect x="28" y="2" width="10" height="10" fill={color} />
        <rect x="2" y="15" width="10" height="10" fill={color} />
        <rect x="15" y="15" width="10" height="10" fill={color} />
        <rect x="28" y="15" width="10" height="10" fill={color} />
        <rect x="2" y="28" width="10" height="10" fill={color} />
        <rect x="15" y="28" width="10" height="10" fill={color} />
        <rect x="28" y="28" width="10" height="10" fill={color} />
      </svg>
    )
  },
  {
    id: 'rounded',
    label: 'Rounded',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect x="2" y="2" width="10" height="10" rx="3" fill={color} />
        <rect x="15" y="2" width="10" height="10" rx="3" fill={color} />
        <rect x="28" y="2" width="10" height="10" rx="3" fill={color} />
        <rect x="2" y="15" width="10" height="10" rx="3" fill={color} />
        <rect x="15" y="15" width="10" height="10" rx="3" fill={color} />
        <rect x="28" y="15" width="10" height="10" rx="3" fill={color} />
        <rect x="2" y="28" width="10" height="10" rx="3" fill={color} />
        <rect x="15" y="28" width="10" height="10" rx="3" fill={color} />
        <rect x="28" y="28" width="10" height="10" rx="3" fill={color} />
      </svg>
    )
  },
  {
    id: 'extra-rounded',
    label: 'Extra Round',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect x="2" y="2" width="10" height="10" rx="5" fill={color} />
        <rect x="15" y="2" width="10" height="10" rx="5" fill={color} />
        <rect x="28" y="2" width="10" height="10" rx="5" fill={color} />
        <rect x="2" y="15" width="10" height="10" rx="5" fill={color} />
        <rect x="15" y="15" width="10" height="10" rx="5" fill={color} />
        <rect x="28" y="15" width="10" height="10" rx="5" fill={color} />
        <rect x="2" y="28" width="10" height="10" rx="5" fill={color} />
        <rect x="15" y="28" width="10" height="10" rx="5" fill={color} />
        <rect x="28" y="28" width="10" height="10" rx="5" fill={color} />
      </svg>
    )
  },
  {
    id: 'dots',
    label: 'Dots',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <circle cx="7" cy="7" r="5" fill={color} />
        <circle cx="20" cy="7" r="5" fill={color} />
        <circle cx="33" cy="7" r="5" fill={color} />
        <circle cx="7" cy="20" r="5" fill={color} />
        <circle cx="20" cy="20" r="5" fill={color} />
        <circle cx="33" cy="20" r="5" fill={color} />
        <circle cx="7" cy="33" r="5" fill={color} />
        <circle cx="20" cy="33" r="5" fill={color} />
        <circle cx="33" cy="33" r="5" fill={color} />
      </svg>
    )
  },
  {
    id: 'classy',
    label: 'Classy',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <path d="M2,2 h10 v5 a5,5 0 0,1 -5,5 h-5 z" fill={color} />
        <path d="M15,2 h10 v10 h-10 z" fill={color} />
        <path d="M28,2 h5 a5,5 0 0,1 5,5 v5 h-10 z" fill={color} />
        <path d="M2,15 h10 v10 h-10 z" fill={color} />
        <circle cx="20" cy="20" r="4.5" fill={color} />
        <path d="M28,15 h10 v10 h-10 z" fill={color} />
        <path d="M2,28 h10 v5 a5,5 0 0,1 -5,5 h-5 z" fill={color} />
        <path d="M15,28 h10 v10 h-10 z" fill={color} />
        <path d="M28,28 h5 a5,5 0 0,1 5,5 v5 h-10 z" fill={color} />
      </svg>
    )
  },
  {
    id: 'classy-rounded',
    label: 'Soft Rounded',
    renderMini: (color: string) => (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect x="2" y="2" width="10" height="10" rx="4" fill={color} />
        <circle cx="20" cy="7" r="4" fill={color} />
        <rect x="28" y="2" width="10" height="10" rx="4" fill={color} />
        <circle cx="7" cy="20" r="4" fill={color} />
        <rect x="15" y="15" width="10" height="10" rx="4" fill={color} />
        <circle cx="33" cy="20" r="4" fill={color} />
        <rect x="2" y="28" width="10" height="10" rx="4" fill={color} />
        <circle cx="20" cy="33" r="4" fill={color} />
        <rect x="28" y="28" width="10" height="10" rx="4" fill={color} />
      </svg>
    )
  }
];

export const PatternSelector: React.FC<PatternSelectorProps> = React.memo(({
  value,
  onChange,
  color
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PATTERN_OPTIONS.map(opt => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group',
              isSelected
                ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 shadow-xs ring-1 ring-[#E64500] dark:ring-orange-500'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-orange-300 dark:hover:border-orange-800'
            )}
          >
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/50 mb-2 group-hover:scale-105 transition-transform">
              {opt.renderMini(color || '#000000')}
            </div>
            <span
              className={cn(
                'text-xs truncate max-w-full font-medium',
                isSelected
                  ? 'text-[#E64500] dark:text-orange-300 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
});

PatternSelector.displayName = 'PatternSelector';

