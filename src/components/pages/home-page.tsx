import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from '../../lib/router';
import { QRTemplate } from '../../types/qr';
import { QR_TEMPLATES } from '../../lib/templates';
import { TemplateVisualPreview } from '../qr/template-visual-preview';
import { RippleGrid } from '../shared/ripple-grid';
import { Button } from '../ui/button';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { MagneticWrapper, AnimatedCounter, AnimatedDivider } from '../ui/animated-primitives';
import {
  staggerContainerVariants,
  staggerItemVariants,
  scrollRevealVariants
} from '../../lib/motion-system';
import {
  ArrowRight,
  ShieldCheck,
  Palette,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Maximize2,
  Eye,
  Zap,
  Heart,
  Globe,
  Wifi,
  MessageSquare,
  User,
  MapPin,
  Mail,
  Phone,
  FileText,
  Download,
  Camera,
  HelpCircle
} from 'lucide-react';
import { FaqAccordion, FAQS } from '../shared/faq-accordion';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface HomePageProps {
  onSelectTemplate: (template: QRTemplate) => void;
}

// Interactive showcase sample presets for the hero section
const HERO_PRESETS = [
  {
    id: 'executive-dark',
    name: 'Obsidian Noir',
    badge: 'Executive',
    pattern: 'rounded',
    color: '#09090b',
    gradient: '#18181b',
    outerEye: 'rounded',
    innerEye: 'dot',
    eyeColor: '#18181b',
    frameText: 'SCAN FOR PORTFOLIO',
    frameColor: '#09090b'
  },
  {
    id: 'nordic-consulting',
    name: 'Nordic Fjord',
    badge: 'Advisory',
    pattern: 'rounded',
    color: '#0c4a6e',
    gradient: '#0284c7',
    outerEye: 'rounded',
    innerEye: 'diamond',
    eyeColor: '#0284c7',
    frameText: 'CONNECT WITH PARTNER',
    frameColor: '#0c4a6e'
  },
  {
    id: 'sushi-omakase',
    name: 'Omakase Emerald',
    badge: 'Gourmet',
    pattern: 'classy',
    color: '#18181b',
    gradient: '#15803d',
    outerEye: 'rounded',
    innerEye: 'leaf',
    eyeColor: '#15803d',
    frameText: 'CHEF TASTING MENU',
    frameColor: '#15803d'
  },
  {
    id: 'fintech-violet',
    name: 'Cyber Violet',
    badge: 'Fintech',
    pattern: 'dots',
    color: '#5b21b6',
    gradient: '#7c3aed',
    outerEye: 'extra-rounded',
    innerEye: 'dot',
    eyeColor: '#7c3aed',
    frameText: 'INSTANT SECURE PAY',
    frameColor: '#5b21b6'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onSelectTemplate }) => {
  const navigate = useNavigate();
  const [activeHeroPreset, setActiveHeroPreset] = React.useState(HERO_PRESETS[0]);

  // Featured templates for the preview gallery section
  const featuredTemplates = React.useMemo(() => {
    const featuredIds = [
      'nordic-consulting',
      'sushi-omakase',
      'velvet-room-speakeasy',
      'executive-dark',
      'contactless-tap-pay',
      'airport-lounge-wifi',
      'cinema-anamorphic-reel',
      'festival-sunset'
    ];
    return QR_TEMPLATES.filter(t => featuredIds.includes(t.id)).slice(0, 8);
  }, []);

  const handleApplyPreset = (template: QRTemplate) => {
    onSelectTemplate(template);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
    navigate('/create');
  };

  const handleHeroPresetJump = () => {
    const matched = QR_TEMPLATES.find(t => t.id === activeHeroPreset.id) || QR_TEMPLATES[0];
    handleApplyPreset(matched);
  };

  return (
    <div className="w-full relative overflow-hidden bg-white dark:bg-neutral-950">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (INTERACTIVE RIPPLE GRID HERO)            */}
      {/* ========================================================= */}
      <div className="relative w-full overflow-hidden bg-white dark:bg-neutral-950">
        {/* Layer 1: Background Ripple Grid Canvas (independent interactive layer) */}
        <RippleGrid />

        {/* Subtle Ambient Orange Glow (#E64500) behind Hero */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[340px] sm:w-[620px] h-[220px] sm:h-[320px] rounded-full bg-gradient-to-tr from-[#E64500]/12 via-orange-500/8 to-amber-500/10 dark:from-[#E64500]/18 dark:via-orange-500/10 dark:to-amber-500/8 blur-[90px] sm:blur-[130px] pointer-events-none -z-5"
          aria-hidden="true"
        />

        {/* Layer 2: Clean Readability Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none -z-5 bg-gradient-to-b from-white/0 via-transparent to-white dark:from-transparent dark:via-transparent dark:to-neutral-950"
          aria-hidden="true"
        />

        {/* Layer 3: Content Layer */}
        <section className="relative z-10 pt-6 sm:pt-12 md:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Hero Headline - Smooth Blur-to-Clear & Staggered Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[1.04] text-neutral-950 dark:text-neutral-50 max-w-5xl">
              Create Custom QR Codes That{' '}
              <span className="animate-gradient-text bg-gradient-to-r from-orange-600 via-[#E64500] to-amber-600 dark:from-orange-400 dark:via-[#ff7a3d] dark:to-amber-400 bg-clip-text text-transparent">
                Look Great Anywhere.
              </span>
            </h1>
          </motion.div>

          {/* Hero Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center"
          >
            <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
              Create high-quality QR codes with custom colors, dot patterns, frames, and logos. Free forever, never expires, and your data stays on your device.
            </p>
          </motion.div>

          {/* CTA Buttons with Magnetic Primary Effect */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center"
          >
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <MagneticWrapper className="w-full sm:w-auto">
                <Link
                  href="/create"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group cursor-pointer"
                >
                  <span>Create QR</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </MagneticWrapper>

              <Link
                href="/templates"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-neutral-500 group-hover:text-[#E64500] transition-colors" />
                <span>View Templates</span>
              </Link>

              <BecomeSponsorButton
                href="/sponsor"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-orange-50/80 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#E64500] dark:text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Become a Sponsor</span>
              </BecomeSponsorButton>
            </div>
          </motion.div>

          {/* Trust Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-neutral-500 dark:text-neutral-400"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Private</span>
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Never Expires</span>
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Free SVG & PNG Download</span>
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Works on Any Phone</span>
            </span>
          </motion.div>

          {/* Interactive Hero QR Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 sm:mt-16 w-full max-w-4xl flex justify-center"
          >
            <div className="w-full">
              <div className="relative rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white/75 dark:bg-neutral-900/65 backdrop-blur-xl shadow-2xl p-6 sm:p-10 overflow-hidden">
                {/* Subtle Ambient Corner Glow inside Showcase */}
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#E64500]/10 blur-3xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Top Toolbar */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80 text-left">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#E64500] dark:text-[#ff7a3d] font-bold block">
                      Live Preview
                    </span>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      Free Custom QR Code Generator
                    </h2>
                  </div>

                  {/* Style Presets Chips with Animated Active Pill */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto max-w-full">
                    {HERO_PRESETS.map(preset => {
                      const isActive = activeHeroPreset.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setActiveHeroPreset(preset)}
                          className={cn(
                            'relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 z-10',
                            isActive
                              ? 'text-white'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                          )}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="hero-preset-active-pill"
                              className="absolute inset-0 rounded-lg bg-[#E64500] shadow-xs -z-10"
                              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            />
                          )}
                          <span
                            className="w-2 h-2 rounded-full shrink-0 border border-white/40"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Showcase Stage */}
                <div className="relative z-10 pt-8 sm:pt-10 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
                  {/* Left: Simulated QR Visual Badge */}
                  <div className="relative group cursor-pointer" onClick={handleHeroPresetJump}>
                    {/* Decorative floating pills */}
                    <div className="animate-float-subtle absolute -top-3 -right-3 z-20 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Easy to Scan</span>
                    </div>

                    <div className="animate-float-subtle-delayed absolute -bottom-3 -left-3 z-20 px-2.5 py-1 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E64500]" />
                      <span>{activeHeroPreset.badge} Style</span>
                    </div>

                    {/* Card Container */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:border-[#E64500]/50 shadow-xl transition-all duration-300 group-hover:scale-[1.03]">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                          makeqrr
                        </span>

                        {/* QR Code Canvas with Smooth Style Switch Transition */}
                        <div className="w-48 h-48 sm:w-56 sm:h-56 p-2 rounded-xl bg-white flex items-center justify-center border border-neutral-100 shadow-inner overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeHeroPreset.id}
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                              className="flex items-center justify-center"
                            >
                              {(() => {
                                const matched =
                                  QR_TEMPLATES.find(t => t.id === activeHeroPreset.id) ||
                                  QR_TEMPLATES[0];
                                return <TemplateVisualPreview template={matched} size={200} />;
                              })()}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Callout Frame */}
                        <div
                          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white tracking-wider text-center w-full transition-colors duration-300"
                          style={{ backgroundColor: activeHeroPreset.frameColor }}
                        >
                          {activeHeroPreset.frameText}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Feature Highlights & Direct Studio Jump */}
                  <div className="text-left space-y-4 max-w-sm">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                        About This Style
                      </span>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {activeHeroPreset.name} Style
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Designed with high contrast and safe spacing so phones can scan it quickly and easily.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Clean {activeHeroPreset.pattern} dot shape</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>High contrast two-color look</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Includes text frame and strong scan safety</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="default"
                        size="default"
                        onClick={handleHeroPresetJump}
                        className="w-full gap-2 text-xs font-semibold cursor-pointer group"
                      >
                        <span>Customize This Style</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 2. FEATURE BENTO GRID SECTION                             */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-20"
        >
          <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
            Customize Every Detail
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Design QR Codes Your Way
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Make your QR code stand out with custom shapes, colors, center logos, emojis, and frames while keeping it easy for phones to scan.
          </p>
        </motion.div>

        {/* Bento Grid with Staggered Scroll Entrance & Glowing Hover Cards */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Card 1: Matrix Patterns */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-[#ff7a3d] border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                Custom Dot Shapes
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Choose from rounded, dots, classy, and square shapes instead of plain black blocks.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                <AnimatedCounter value={6} /> Dot Shapes
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Crisp & Clear
              </span>
            </div>
          </motion.div>

          {/* Card 2: Custom Eye Geometry */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-[#ff7a3d] border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                Corner Eye Shapes
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Pick different inner and outer shapes for the three corner markers, with custom colors.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Inner & Outer Shapes
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Custom Colors
              </span>
            </div>
          </motion.div>

          {/* Card 3: Brand Logos & Center Icons */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                Add Your Logo
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload a logo or choose a popular icon. We center it and keep enough space so it scans smoothly.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                High Safety
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Auto Centered
              </span>
            </div>
          </motion.div>

          {/* Card 4: Vivid Palettes & Gradients */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                Color Gradients
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Blend two colors smoothly across your QR code. We will warn you if colors are too hard to scan.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Two-Color Blends
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Color Contrast Check
              </span>
            </div>
          </motion.div>

          {/* Card 5: Designer Frames & Callouts */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                Frames & Text
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Add a frame with text like "SCAN ME" or "VIEW MENU" to tell people where the code leads.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                <AnimatedCounter value={6} /> Frame Types
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Custom Text
              </span>
            </div>
          </motion.div>

          {/* Card 6: 10+ Dynamic Content Types */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-[#ff7a3d] border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                <AnimatedCounter value={10} suffix="+" /> Information Types
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Share websites, digital business cards, Wi-Fi, phone numbers, WhatsApp chats, email, and plain text.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Permanent
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Never Expires
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 3. TEMPLATES PREVIEW SECTION                              */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16"
        >
          <div className="space-y-3 max-w-2xl text-left">
            <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
              <AnimatedCounter value={50} suffix="+" /> Ready-Made Designs
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
              Explore Beautiful QR Code Templates
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Pick from tested, easy-to-scan templates for businesses, restaurants, Wi-Fi networks, events, and digital vCard business cards.
            </p>
          </div>

          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:-translate-y-0.5 transition-all shrink-0 self-start md:self-end"
          >
            <span>View All 50+ Templates</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Templates Grid with Staggered Reveal & Smooth Preview Zoom */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredTemplates.map(template => (
            <motion.div
              key={template.id}
              variants={staggerItemVariants}
              className="glow-card p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* SVG Visual Preview Box with Smooth Hover Zoom */}
                <div className="aspect-square w-full rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center p-4 relative overflow-hidden">
                  <div className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                    <TemplateVisualPreview template={template} size={150} />
                  </div>
                  {template.tag && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 shadow-xs">
                      {template.tag}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                      {template.name}
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyPreset(template)}
                  className="w-full text-xs font-semibold gap-1.5 cursor-pointer hover:bg-[#E64500] hover:text-white hover:border-[#E64500] dark:hover:bg-[#E64500] dark:hover:text-white dark:hover:border-[#E64500]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 4. HOW IT WORKS SECTION                                   */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-3xl mx-auto space-y-3 mb-16"
        >
          <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
            Simple Steps
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            How to Create Your QR Code
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Create, customize, test, and download your QR code online in less than a minute—free and without signing up.
          </p>
        </motion.div>

        {/* 4 Step Cards with Staggered Reveal */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Step 1 */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left space-y-3 relative group"
          >
            <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors block">
              01
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Enter Your Info
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Type your website URL, vCard contact details, Wi-Fi network credentials, WhatsApp number, or location.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left space-y-3 relative group"
          >
            <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors block">
              02
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Customize Every Detail
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Pick custom colors, dot patterns, corner eyes, frames, and add your own logo, image, or emoji in the center.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left space-y-3 relative group"
          >
            <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors block">
              03
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Verify Scan Safety
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Check the live contrast and logo size safety guard, then test scan with your camera or uploaded image.
            </p>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            variants={staggerItemVariants}
            className="glow-card p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left space-y-3 relative group"
          >
            <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors block">
              04
            </span>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Download PNG or SVG
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Download high-quality QR codes as PNG or JPG for screens, or scalable vector SVG for sharp printing.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 5. CREATE QR CODES FOR DIFFERENT PURPOSES                 */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-14"
        >
          <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
            All-In-One QR Code Maker
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Create QR Codes for Different Purposes
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Generate permanent static QR codes for websites, Wi-Fi networks, WhatsApp chats, digital business cards, and locations without any login or scan limits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            {
              icon: Globe,
              title: 'URL & Website QR Code Generator',
              desc: 'Link directly to any website, online menu, portfolio, product page, or social profile with instant camera recognition.'
            },
            {
              icon: Wifi,
              title: 'Wi-Fi QR Code Generator',
              desc: 'Create Wi-Fi QR codes for free using your network SSID, password, and WPA/WPA2 encryption so guests connect in one scan.'
            },
            {
              icon: MessageSquare,
              title: 'WhatsApp QR Code Generator',
              desc: 'Generate WhatsApp QR codes with mandatory international country codes and pre-filled chat messages using direct wa.me links.'
            },
            {
              icon: User,
              title: 'Contact & vCard QR Code Generator',
              desc: 'Share digital business cards with your name, company, job title, phone number, email, and address ready to save to contacts.'
            },
            {
              icon: MapPin,
              title: 'Location & Google Maps QR Code',
              desc: 'Create location QR codes with latitude, longitude, or place queries so visitors can open directions in Google Maps.'
            },
            {
              icon: Mail,
              title: 'Email QR Code Generator',
              desc: 'Pre-fill recipient email addresses, subject lines, and message bodies for fast customer support and inquiries.'
            },
            {
              icon: Phone,
              title: 'Phone & SMS QR Code Generator',
              desc: 'Let customers dial your business phone number or send a pre-written SMS text message directly from their smartphone camera.'
            },
            {
              icon: FileText,
              title: 'Plain Text & Event QR Codes',
              desc: 'Encode offline notes, serial numbers, coupon codes, or calendar events with start and end times that work without internet.'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href="/create"
                className="glow-card group p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between space-y-4 text-left"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-[#ff7a3d] border border-orange-200/50 dark:border-orange-800/50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E64500] dark:text-orange-400">
                  <span>Create in Studio</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 6. WHY CHOOSE MAKEQRR & PRACTICAL QR GUIDES               */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Why Choose makeqrr */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
              Privacy-First & Permanent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
              Why Choose makeqrr?
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Most online QR generators lock high-resolution vector files behind subscriptions or route your links through third-party tracking redirects that expire. makeqrr encodes your data directly into the QR matrix inside your browser.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100">QR Code Generator Without Login:</strong> Start designing immediately with no account, email wall, or watermark.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100">100% Client-Side Privacy:</strong> Your Wi-Fi passwords, vCard contacts, and uploaded logos never leave your device.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100">Automatic Scan Safety & Logo Sizing:</strong> Built-in Reed-Solomon error correction (up to Level H 30%) calculates the maximum safe center logo, icon, or emoji size automatically.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100">Print-Ready SVG & High-DPI PNG:</strong> Export crisp vector SVG files for packaging, signage, and business cards, or high-resolution PNG and JPG files for web and social sharing.
                </span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors"
              >
                <span>Open QR Code Designer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <span>Learn How It Works</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Topical Authority Guides */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <article className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                What Is a QR Code & How Does It Work?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                A Quick Response (QR) code is a two-dimensional matrix barcode that stores data horizontally and vertically. Three corner finder eyes let smartphone cameras detect the angle instantly, while Reed-Solomon error correction ensures the code still scans even when styled or paired with a center logo.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                How to Create a QR Code with a Logo
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                In the{' '}
                <Link href="/create" className="text-[#E64500] dark:text-orange-400 font-semibold hover:underline">
                  QR Code Generator
                </Link>
                , open the Logo tab to upload your brand image, choose a built-in vector icon, or place an emoji in the center. Adjust the size slider up to the calculated safe scan limit so important finder patterns stay unobstructed.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                How to Create WhatsApp & Wi-Fi QR Codes
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                For WhatsApp, select your international dialing code (such as +91 or +1) and enter your phone number to generate a universal <code className="font-mono text-[11px]">wa.me</code> chat link. For Wi-Fi, enter your network name (SSID), security type, and password so guests connect without typing.
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Downloading PNG vs. SVG for Business Print
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Use high-resolution PNG images for websites, emails, and social media posts. When printing restaurant tabletop menus, product packaging, flyers, or banners, download the SVG vector format so your QR code remains razor-sharp at any physical dimension.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS SECTION                     */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-bold tracking-wider text-[#E64500] dark:text-[#ff7a3d] uppercase">
            Quick Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            Common questions about creating, customizing, scanning, and downloading custom QR codes.
          </p>
        </div>

        <FaqAccordion items={FAQS.slice(0, 6)} defaultOpenIndex={null} />

        <div className="mt-8 text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 hover:border-[#E64500] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#E64500]" />
            <span>View All Frequently Asked Questions & Printing Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Animated Glowing Divider */}
      <AnimatedDivider />

      {/* ========================================================= */}
      {/* 5. FINAL CALL TO ACTION                                   */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={scrollRevealVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white p-8 sm:p-14 md:p-20 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl"
        >
          {/* Ambient Glow behind CTA */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[500px] sm:w-[700px] h-[300px] sm:h-[400px] rounded-full bg-gradient-to-r from-orange-600/30 via-[#E64500]/20 to-amber-600/25 blur-[100px] opacity-75" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 border border-white/10 text-xs font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E64500] animate-pulse" />
              <span>Get Started in Seconds</span>
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Ready to create your custom QR code?
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-neutral-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Design and download high-quality QR codes in your browser. Free forever, no sign up needed.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-col items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <MagneticWrapper className="w-full sm:w-auto">
                <Link
                  href="/create"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-white text-neutral-950 hover:bg-neutral-100 shadow-xl hover:scale-105 active:scale-95 transition-all duration-150"
                >
                  <span>Create QR</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </MagneticWrapper>

              <Link
                href="/templates"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-150"
              >
                <Layers className="w-4 h-4" />
                <span>Browse Templates</span>
              </Link>
            </div>

            <BecomeSponsorButton
              href="/sponsor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <Heart className="w-4 h-4" />
              <span>Become a Sponsor</span>
            </BecomeSponsorButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
