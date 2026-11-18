import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
  onValueChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  onValueChange,
  className,
  ...props
}) => {
  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <span>{label}</span>
          <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {value}{unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onValueChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E64500] dark:accent-[#ff6b2b] focus:outline-none"
        {...props}
      />
    </div>
  );
};

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className
}) => {
  return (
    <label
      className={cn(
        'inline-flex items-center justify-between gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {description}
            </span>
          )}
        </div>
      )}
      <div
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none shadow-xs',
          checked
            ? 'bg-[#E64500]'
            : 'bg-neutral-300 dark:bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out m-0.5',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
    </label>
  );
};
