import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { QRConfig } from '../../types/qr';
import { loadRecentDesigns, clearSavedDesigns } from '../../lib/storage';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

interface RecentDesignsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadDesign: (design: QRConfig) => void;
}

export const RecentDesignsModal: React.FC<RecentDesignsModalProps> = ({
  open,
  onOpenChange,
  onLoadDesign
}) => {
  const [designs, setDesigns] = React.useState<QRConfig[]>([]);
  const [isConfirming, setIsConfirming] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDesigns(loadRecentDesigns());
      setIsConfirming(false);
    } else {
      setIsConfirming(false);
    }
  }, [open]);

  const executeClearAll = () => {
    clearSavedDesigns();
    setDesigns([]);
    setIsConfirming(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Saved Designs"
      description="Your saved QR codes on this device. No account needed."
      maxWidth="md"
    >
      <div className="space-y-4">
        {designs.length > 0 ? (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {designs.map((d, index) => {
              const dateStr = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Recent';
              return (
                <div
                  key={d.id || index}
                  onClick={() => {
                    onLoadDesign(d);
                    onOpenChange(false);
                  }}
                  className="group flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-750 bg-white dark:bg-neutral-900 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-mono font-bold"
                      style={{ backgroundColor: d.colors.background, color: d.colors.foreground }}
                    >
                      QR
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span>{d.title || `${d.type.toUpperCase()} Code`}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">
                          {dateStr}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[220px]">
                        {d.type === 'url' ? d.content.url.url : d.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-neutral-400 group-hover:text-[#E64500] dark:group-hover:text-orange-400 font-medium">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">No saved designs yet.</p>
            <p className="text-[11px]">When you create and download QR codes, they are saved here automatically.</p>
          </div>
        )}

        {designs.length > 0 && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center gap-2">
            <span className="text-[11px] text-neutral-400 truncate">
              {designs.length} saved on this device
            </span>
            {isConfirming ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 animate-in fade-in duration-150">
                <span className="text-[11px] text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                  Clear all saved designs?
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfirming(false)}
                  className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={executeClearAll}
                  className="h-7 px-2.5 text-xs font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white cursor-pointer shadow-xs"
                >
                  Clear all
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirming(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60 gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
