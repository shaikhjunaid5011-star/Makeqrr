import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReset: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  open,
  onOpenChange,
  onConfirmReset
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear all QR data?"
      description="This will clear all entered content, phone numbers, logos, colors, and styles, resetting the QR Studio back to a clean blank slate."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              This action cannot be undone.
            </p>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              All entered links, contact info, uploaded logos, custom colors, patterns, and frames will be removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirmReset();
              onOpenChange(false);
            }}
            className="text-xs gap-1.5 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

