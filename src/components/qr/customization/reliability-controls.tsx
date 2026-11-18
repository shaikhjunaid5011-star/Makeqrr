import * as React from 'react';
import { ErrorCorrectionLevel, QRConfig } from '../../../types/qr';
import { Slider } from '../../ui/slider';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ReliabilityControlsProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
}

const ERROR_LEVELS: { id: ErrorCorrectionLevel; name: string; pct: string; desc: string }[] = [
  { id: 'L', name: 'Low', pct: '~7%', desc: 'Best for simple links on clean paper' },
  { id: 'M', name: 'Medium', pct: '~15%', desc: 'Standard balance for most uses' },
  { id: 'Q', name: 'High', pct: '~25%', desc: 'Great for outdoors, posters, or uneven surfaces' },
  { id: 'H', name: 'Maximum', pct: '~30%', desc: 'Best protection, strongly recommended with a logo' }
];

export const ReliabilityControls: React.FC<ReliabilityControlsProps> = React.memo(({ config, onChange }) => {
  const { errorCorrection, quietZone, logo } = config;

  return (
    <div className="space-y-4">
      {/* Error Correction Level */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Scan Safety
            </label>
            <p className="text-[11px] text-neutral-500">
              Helps your QR code scan even if scratched, smudged, or covered
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-[#E64500] dark:text-orange-400 px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/70 border border-orange-200/50 dark:border-orange-800/50">
            {errorCorrection}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {ERROR_LEVELS.map(lvl => {
            const isSelected = errorCorrection === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() =>
                  onChange(prev => ({
                    ...prev,
                    errorCorrection: lvl.id
                  }))
                }
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer',
                  isSelected
                    ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 font-semibold ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60'
                )}
              >
                <span className="text-xs font-bold">{lvl.id}</span>
                <span className="text-[10px] text-neutral-500">{lvl.pct}</span>
                <span className="text-[10px] truncate max-w-full font-normal">{lvl.name}</span>
              </button>
            );
          })}
        </div>

        {logo.enabled && errorCorrection === 'L' && (
          <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Your logo covers part of the QR code. Set Scan Safety to <strong>Q</strong> or <strong>H</strong> so it scans easily.
            </span>
          </div>
        )}
      </div>

      {/* Quiet Zone Slider */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        <Slider
          min={0}
          max={8}
          step={1}
          value={quietZone}
          unit=" dots"
          label="Space Around QR"
          onValueChange={val =>
            onChange(prev => ({
              ...prev,
              quietZone: val
            }))
          }
        />

        {quietZone < 4 && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Less space around the QR code can make it harder for some cameras to scan.
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ReliabilityControls.displayName = 'ReliabilityControls';

