import * as React from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, Palette, Sliders, Check, ShieldCheck, Heart } from 'lucide-react';
import { QR_TEMPLATES } from '../../lib/templates';
import { QRTemplate } from '../../types/qr';
import { TemplateVisualPreview } from '../qr/template-visual-preview';
import { Button } from '../ui/button';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { Link, useNavigate } from '../../lib/router';
import { cn } from '../../lib/utils';
import { triggerCelebration, staggerContainerVariants, staggerItemVariants } from '../../lib/motion-system';

interface TemplatesPageProps {
  onSelectTemplate: (template: QRTemplate) => void;
}

const CATEGORY_DEFINITIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Templates' },
  { id: 'business', label: 'Business' },
  { id: 'restaurant', label: 'Restaurant & Menu' },
  { id: 'social', label: 'Social Media' },
  { id: 'contact', label: 'Contact / vCard' },
  { id: 'event', label: 'Events' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'payment', label: 'Payment' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'personal', label: 'Personal' }
];

export const TemplatesPage: React.FC<TemplatesPageProps> = React.memo(({ onSelectTemplate }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [appliedTemplateId, setAppliedTemplateId] = React.useState<string | null>(null);

  // Category template counts for badges
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: QR_TEMPLATES.length };
    QR_TEMPLATES.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredTemplates = React.useMemo(() => {
    return QR_TEMPLATES.filter(template => {
      const matchCategory =
        selectedCategory === 'all' ||
        template.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        (template.tag && template.tag.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleApply = (template: QRTemplate, e?: React.MouseEvent) => {
    onSelectTemplate(template);
    setAppliedTemplateId(template.id);
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      triggerCelebration(rect.left / window.innerWidth + 0.1, rect.top / window.innerHeight);
    } else {
      triggerCelebration(0.5, 0.5);
    }
    setTimeout(() => {
      navigate('/create');
    }, 450);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready-Made Styles · {QR_TEMPLATES.length} Available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            QR Code Templates
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Choose a ready-to-use style. Using a template updates colors and shapes without changing your text or links.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <BecomeSponsorButton
            href="/sponsor"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold bg-orange-50/80 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 shadow-2xs transition-all"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Become a Sponsor</span>
          </BecomeSponsorButton>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs shadow-orange-500/25 transition-all"
          >
            <span>Create QR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {CATEGORY_DEFINITIONS.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "relative px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 z-10",
                    isActive
                      ? "text-white font-semibold"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-[#ff7a3d] hover:bg-orange-50/60 dark:hover:bg-orange-950/30"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="templates-page-cat-pill"
                      className="absolute inset-0 rounded-lg bg-[#E64500] shadow-xs shadow-orange-500/25 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 50+ templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#E64500] dark:focus:ring-[#ff6b2b] focus:border-[#E64500]"
            />
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <section aria-labelledby="templates-gallery-heading" className="space-y-4">
        <h2 id="templates-gallery-heading" className="sr-only">
          Customizable QR Code Design Templates
        </h2>
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Palette className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No templates found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your search terms or select another category above.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filteredTemplates.map(template => {
              const isApplied = appliedTemplateId === template.id;

              return (
                <motion.div
                  key={template.id}
                  variants={staggerItemVariants}
                  className="glow-card group flex flex-col justify-between bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden"
                >
                  {/* Visual Thumbnail */}
                  <div className="relative p-6 bg-neutral-50/80 dark:bg-neutral-950/60 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-center min-h-[200px] overflow-hidden">
                    <div className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                      <TemplateVisualPreview
                        template={template}
                        size={140}
                      />
                    </div>

                    {template.tag && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/95 dark:bg-neutral-900/95 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 shadow-xs">
                        {template.tag}
                      </span>
                    )}

                    <span
                      className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full border border-white dark:border-neutral-900 shadow-xs"
                      style={{ backgroundColor: template.previewColor }}
                      title={`Theme Accent: ${template.previewColor}`}
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                          {template.name}
                        </h3>
                        <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {/* Meta Specs */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Pattern: {template.config.pattern?.type || 'standard'}</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Scan Safe</span>
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button
                      type="button"
                      variant={isApplied ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => handleApply(template, e)}
                      loading={isApplied}
                      loadingText="Applying Preset..."
                      className={cn(
                        "w-full text-xs font-semibold gap-1.5 transition-all mt-1 cursor-pointer",
                        isApplied
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "hover:bg-[#E64500] hover:text-white dark:hover:bg-[#E64500] dark:hover:text-white hover:border-[#E64500]"
                      )}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Use Template</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* SEO & Best Practices Footer Section for Templates */}
      <section className="pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
            How QR Code Templates Work
          </h2>
          <p className="leading-relaxed">
            Every template in makeqrr applies pre-tested foreground and background color contrast, module dot shapes, corner eye frames, and call-to-action badges directly to your active QR code without overwriting your URL, Wi-Fi password, WhatsApp number, or vCard details.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
            Designed for Print &amp; Digital Marketing
          </h2>
          <p className="leading-relaxed">
            Whether you need a restaurant menu QR code, a vCard business card preset, or a UPI payment standee, you can further customize any template in our{' '}
            <Link href="/create" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
              QR Code Generator
            </Link>{' '}
            and export print-ready SVG or PNG files. Have questions? Visit our{' '}
            <Link href="/help" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
              Help &amp; FAQ guide
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
});

TemplatesPage.displayName = 'TemplatesPage';
