import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { QRConfig, QRTemplate } from '../../types/qr';
import { QR_TEMPLATES } from '../../lib/templates';
import { TemplateVisualPreview } from './template-visual-preview';
import { Loader } from '../ui/loader';
import { Check, Search, Layers, ShieldCheck, X } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface TemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: QRConfig;
  onSelectTemplate: (template: QRTemplate) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'business', label: 'Business' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'social', label: 'Social' },
  { id: 'contact', label: 'Contact / vCard' },
  { id: 'event', label: 'Events' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'payment', label: 'Payment' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'personal', label: 'Personal' }
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  open,
  onOpenChange,
  config,
  onSelectTemplate
}) => {
  const [selectedCat, setSelectedCat] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [justAppliedId, setJustAppliedId] = React.useState<string | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setSelectedCat('all');
    }
  }, [open]);

  // Real-time filter templates by name, category, tags, or description
  const filtered = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return QR_TEMPLATES.filter(t => {
      // Category filter check
      const matchesCat = selectedCat === 'all' || t.category === selectedCat;

      // Search query check (matches name, category, tags, description)
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tag && t.tag.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [selectedCat, searchQuery]);

  const handleApply = (template: QRTemplate) => {
    onSelectTemplate(template);
    setJustAppliedId(template.id);
    setTimeout(() => {
      setJustAppliedId(null);
      onOpenChange(false);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Choose a Template"
      description="Pick a ready-made design. Your text and links stay the same."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Prominent Search Bar & Category Controls */}
        <div className="flex flex-col gap-3">
          {/* Real-time Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search templates (e.g. Business, Menu, Social, Event, Card)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape' && searchQuery) {
                  e.stopPropagation();
                  handleClearSearch();
                }
              }}
              className="h-9.5 text-xs sm:text-sm pl-9 pr-20 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search (Esc)"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 pointer-events-none hidden sm:inline">
                {filtered.length} found
              </span>
            )}
          </div>

          {/* Category Filter Pills & Results Counter */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <div className="flex gap-1.5 overflow-x-auto text-xs scrollbar-none py-0.5">
              {CATEGORIES.map(cat => {
                const count =
                  cat.id === 'all'
                    ? QR_TEMPLATES.length
                    : QR_TEMPLATES.filter(t => t.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5',
                      selectedCat === cat.id
                        ? 'bg-[#E64500] text-white shadow-xs font-semibold shadow-orange-500/25'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
                    )}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={cn(
                        'text-[10px] font-mono px-1 rounded-full',
                        selectedCat === cat.id
                          ? 'bg-white/20 text-white'
                          : 'text-neutral-400'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {searchQuery && (
              <div className="shrink-0 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono hidden md:block">
                Showing {filtered.length} of {QR_TEMPLATES.length}
              </div>
            )}
          </div>
        </div>

        {/* Content Preservation Banner */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Picking a template changes colors and styles. Your links and text are never changed.
          </span>
        </div>

        {/* Visual Templates Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[58vh] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map(template => {
              const isApplied = justAppliedId === template.id;
              const matchesCurrentPattern =
                config.pattern.type === template.config.pattern?.type &&
                config.colors.foreground === template.config.colors?.foreground;

              return (
                <div
                  key={template.id}
                  onClick={() => handleApply(template)}
                  className={cn(
                    'group relative flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md select-none',
                    isApplied
                      ? 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
                      : matchesCurrentPattern
                      ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/30 dark:bg-orange-950/30 ring-2 ring-[#E64500]/20 dark:ring-orange-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-neutral-900'
                  )}
                >
                  {/* Top Bar with Name, Tag & Category */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: template.previewColor }}
                      />
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {template.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {template.tag && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {template.tag}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-mono text-neutral-400">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL MINI QR PREVIEW STAGE */}
                  <div className="w-full py-2.5 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center mb-2.5 group-hover:scale-[1.02] transition-transform">
                    <TemplateVisualPreview template={template} size={115} />
                  </div>

                  {/* Template Description */}
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-snug mb-3 flex-1">
                    {template.description}
                  </p>

                  {/* Action & Style Tags */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-100 dark:border-neutral-800 text-neutral-500">
                    <span className="font-mono text-[10px] text-neutral-400">
                      {template.config.pattern?.type} · {template.config.frame?.preset || 'none'}
                    </span>

                    <button
                      type="button"
                      className={cn(
                        'font-semibold inline-flex items-center gap-1 transition-colors',
                        isApplied
                          ? 'text-emerald-600 font-bold'
                          : matchesCurrentPattern
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50'
                      )}
                    >
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600">
                          <Loader variant="inline" size="xs" />
                          <span>Applying...</span>
                        </span>
                      ) : matchesCurrentPattern ? (
                        <>
                          <Check className="w-3 h-3 text-neutral-500" />
                          <span>In Use</span>
                        </>
                      ) : (
                        <span>Use Template →</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-400 space-y-3">
            <Layers className="w-8 h-8 mx-auto stroke-1" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                No templates found matching "{searchQuery}"
              </p>
              <p className="text-[11px] text-neutral-400">
                Try searching for "Business", "Payment", "Social", "Event", or "Minimal"
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCat('all');
                searchInputRef.current?.focus();
              }}
              className="text-xs text-neutral-900 dark:text-neutral-100 underline font-medium hover:text-black dark:hover:text-white"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
