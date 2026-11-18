import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Handshake,
  Award,
  Building2,
  Heart,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { buildGmailComposeUrl } from '../../lib/action-dispatcher';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

const CONTACT_EMAIL = 'heythisisjunaid@gmail.com';

const SUGGESTED_STARTERS = [
  {
    title: 'Sponsorship & Brand Collaboration',
    icon: Handshake
  },
  {
    title: 'Supporter Recognition Inquiry',
    icon: Award
  },
  {
    title: 'Custom Brand Collaboration',
    icon: Building2
  },
  {
    title: 'General Project Backing',
    icon: Heart
  }
];

// -----------------------------------------------------------------------------
// 1. Interactive Animated QR Canvas / Background
// -----------------------------------------------------------------------------
const SponsorInteractiveBackground: React.FC = React.memo(() => {
  const prefersReduced = useReducedMotion();
  const [mousePos, setMousePos] = React.useState({ x: 0.5, y: 0.5 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parallax strictly on decorative background layers ONLY - NEVER on foreground text or UI!
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    },
    [prefersReduced]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Dynamic Glowing Orange Ambient Radial Orbs */}
      <motion.div
        animate={
          prefersReduced
            ? {}
            : {
                x: (mousePos.x - 0.5) * 40,
                y: (mousePos.y - 0.5) * 30
              }
        }
        transition={{ type: 'spring', damping: 40, stiffness: 120 }}
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-gradient-to-b from-[#E64500]/15 via-orange-500/8 to-transparent dark:from-[#E64500]/20 dark:via-orange-600/10 dark:to-transparent blur-[110px]"
      />

      <motion.div
        animate={
          prefersReduced
            ? {}
            : {
                x: (mousePos.x - 0.5) * -50,
                y: (mousePos.y - 0.5) * -30
              }
        }
        transition={{ type: 'spring', damping: 35, stiffness: 100 }}
        className="absolute top-96 right-10 w-[420px] h-[350px] rounded-full bg-gradient-to-tr from-amber-500/10 via-[#E64500]/8 to-transparent dark:from-amber-600/10 dark:via-[#E64500]/12 dark:to-transparent blur-[120px]"
      />

      {/* Subtle Vector Dot Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_70%,transparent_100%)] opacity-70" />

      {/* Decorative Floating QR Geometric Shapes */}
      {!prefersReduced && (
        <>
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 left-8 sm:left-24 w-14 h-14 border border-orange-500/20 dark:border-orange-500/30 rounded-xl flex items-center justify-center p-2 backdrop-blur-2xs"
          >
            <div className="w-5 h-5 rounded-md bg-[#E64500]/20 dark:bg-[#E64500]/30" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 16, 0],
              rotate: [0, -6, 0]
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-64 right-12 sm:right-28 w-16 h-16 border border-neutral-300 dark:border-neutral-700/60 rounded-2xl flex items-center justify-center p-2.5 backdrop-blur-2xs"
          >
            <div className="w-6 h-6 rounded-lg border-2 border-[#E64500]/40" />
          </motion.div>
        </>
      )}
    </div>
  );
});
SponsorInteractiveBackground.displayName = 'SponsorInteractiveBackground';

// -----------------------------------------------------------------------------
// 2. Animated QR Matrix Graphic for the Hero
// -----------------------------------------------------------------------------
const HeroQRMatrixGraphic: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [scanKey, setScanKey] = React.useState(0);

  // 7x7 Decorative QR Finder Grid representation
  const modules = React.useMemo(() => {
    const list: { id: number; active: boolean; delay: number }[] = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        // Keep corner eyes and specific modules active for a realistic QR layout
        const isCorner =
          (r < 2 && c < 2) ||
          (r < 2 && c > 4) ||
          (r > 4 && c < 2);
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const active = isCorner || isCenter || (r + c * 2) % 3 === 0;
        list.push({
          id: r * 7 + c,
          active,
          delay: (r + c) * 0.03
        });
      }
    }
    return list;
  }, []);

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center select-none">
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#E64500]/20 via-orange-500/10 to-amber-500/20 blur-xl scale-95" />

      {/* Main Frosted Matrix Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full rounded-3xl p-5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-orange-500/5 flex flex-col items-center justify-between"
      >
        {/* Corner Targets */}
        <div className="w-full flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg border-2 border-[#E64500] p-1 flex items-center justify-center">
            <div className="w-3 h-3 rounded-xs bg-[#E64500]" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open Tool</span>
          </div>
          <div className="w-8 h-8 rounded-lg border-2 border-[#E64500] p-1 flex items-center justify-center">
            <div className="w-3 h-3 rounded-xs bg-[#E64500]" />
          </div>
        </div>

        {/* 7x7 Modules Grid */}
        <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-neutral-100/60 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 my-auto">
          {modules.map(mod => (
            <motion.div
              key={mod.id}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.15 + mod.delay,
                ease: 'easeOut'
              }}
              className={cn(
                'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs transition-colors duration-300',
                mod.active
                  ? 'bg-neutral-900 dark:bg-neutral-100 shadow-2xs'
                  : 'bg-neutral-200/40 dark:bg-neutral-800/40'
              )}
            />
          ))}
        </div>

        {/* Scanning Sweep Line */}
        {!prefersReduced && (
          <motion.div
            key={scanKey}
            initial={{ top: '15%', opacity: 0 }}
            animate={{
              top: ['15%', '85%', '15%'],
              opacity: [0.2, 0.9, 0.2]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#E64500] to-transparent shadow-[0_0_12px_rgba(230,69,0,0.8)] pointer-events-none"
          />
        )}

        {/* Bottom Corner Eye & Status */}
        <div className="w-full flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg border-2 border-[#E64500] p-1 flex items-center justify-center">
            <div className="w-3 h-3 rounded-xs bg-[#E64500]" />
          </div>
          <button
            type="button"
            onClick={() => setScanKey(prev => prev + 1)}
            title="Trigger scanner pulse"
            className="text-[11px] font-sans font-medium text-neutral-500 hover:text-[#E64500] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Interactive</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const SponsorPage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const [copied, setCopied] = React.useState(false);

  const contactRef = React.useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      if (!prefersReduced) {
        confetti({
          particleCount: 28,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#E64500', '#F97316', '#FBBF24']
        });
      }
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div className="relative w-full overflow-hidden select-none pb-16">
      {/* 1. Ambient Background Animation */}
      <SponsorInteractiveBackground />

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 md:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Project Sponsorship Kicker (Clean unboxed text) */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400"
            >
              <span className="w-2 h-2 rounded-full bg-[#E64500]" />
              <span className="text-[#E64500] dark:text-orange-400 font-bold uppercase tracking-wider text-[11px]">
                Project Sponsorship
              </span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span>Independent & Open Tool</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.05]"
            >
              Become a <span className="text-[#E64500]">Sponsor</span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal"
            >
              Help keep makeqrr free, fast, and better for everyone.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <BecomeSponsorButton
                type="button"
                onClick={scrollToContact}
                className="h-12 px-6 rounded-full text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Become a Sponsor</span>
                <ArrowRight className="w-4 h-4" />
              </BecomeSponsorButton>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={scrollToContact}
                className="h-12 px-6 rounded-full text-sm font-semibold border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-neutral-500" />
                <span>Contact Us</span>
              </Button>
            </motion.div>

            {/* Value Note */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="pt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center lg:justify-start gap-4"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-side & Private</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct email response</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Abstract QR Graphic */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroQRMatrixGraphic />
          </div>
        </div>
      </section>



      {/* 4. Final Large Sponsor CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-neutral-200/70 dark:border-neutral-800/70">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 sm:p-12 md:p-16 bg-neutral-900 text-white text-center space-y-6 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Support makeqrr?
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              Let's talk about how your support can help us keep building and improving the project.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <BecomeSponsorButton
              type="button"
              onClick={scrollToContact}
              className="h-12 px-8 rounded-full text-sm font-bold bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Become a Sponsor</span>
              <ArrowRight className="w-4 h-4" />
            </BecomeSponsorButton>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=makeqrr%20Sponsorship%20Inquiry`}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full text-sm font-bold border border-neutral-700 bg-neutral-800/90 text-white hover:bg-neutral-700 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-orange-400" />
              <span>Email Us</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* 5. Sponsorship Contact Section */}
      <section
        ref={contactRef}
        id="contact"
        className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-neutral-200/70 dark:border-neutral-800/70"
      >
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-8 text-center"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E64500]">
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Communication</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
              Sponsorship Contact
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              We respond promptly to all sponsorship conversations and proposals. Start by sending us a brief message.
            </p>
          </div>

          {/* Interactive Email Action Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/90 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <span className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider mb-1">
                Direct Sponsorship Email
              </span>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=makeqrr%20-%20Sponsorship%20Inquiry`}
                className="text-base sm:text-xl font-bold font-mono text-neutral-950 dark:text-neutral-50 hover:text-[#E64500] dark:hover:text-orange-400 transition-colors inline-flex items-center gap-1.5 group cursor-pointer break-all sm:break-normal"
              >
                <span>{CONTACT_EMAIL}</span>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E64500] group-hover:translate-x-1 transition-all shrink-0" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyEmail}
                className="h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer active:scale-95 transition-transform"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-500" />
                    <span>Copy Email</span>
                  </>
                )}
              </Button>

              <a
                href={`mailto:${CONTACT_EMAIL}?subject=makeqrr%20-%20Sponsorship%20Inquiry`}
                className="h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors shadow-xs cursor-pointer active:scale-95"
                title="Launch default email app (Outlook, Windows Mail)"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Mail</span>
              </a>

              <a
                href={buildGmailComposeUrl(
                  CONTACT_EMAIL,
                  'makeqrr - Sponsorship Inquiry',
                  'Hi Junaid,\n\nI would like to explore sponsoring makeqrr.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
                title="Open directly in Gmail (browser webmail)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                <span>Open in Gmail</span>
              </a>
            </div>
          </div>

          {/* Quick email subject ideas / Suggested conversation starters */}
          <div className="space-y-3 text-left pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#E64500]" />
                Suggested conversation starters:
              </span>
              <span className="text-[11px] text-neutral-400 font-normal hidden sm:inline">
                Click any topic to start an email
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUGGESTED_STARTERS.map((starter) => {
                const Icon = starter.icon;
                return (
                  <a
                    key={starter.title}
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                      `makeqrr - ${starter.title}`
                    )}`}
                    className={cn(
                      "group relative flex items-center justify-between gap-3 p-3 sm:py-3 sm:px-3.5",
                      "rounded-xl border border-neutral-200/90 dark:border-neutral-800",
                      "bg-white dark:bg-neutral-900/80 hover:bg-orange-50/50 dark:hover:bg-neutral-800/90",
                      "shadow-xs hover:shadow-sm",
                      "hover:border-[#E64500]/50 dark:hover:border-orange-500/40",
                      "transition-all duration-200 ease-out",
                      "cursor-pointer active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
                    )}
                    title={`Send email: "${starter.title}"`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 text-[#E64500] dark:text-orange-400 group-hover:bg-[#E64500] group-hover:text-white group-hover:border-[#E64500] transition-colors duration-200">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[#E64500] dark:group-hover:text-orange-300 transition-colors leading-snug">
                        {starter.title}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center text-neutral-400 group-hover:text-[#E64500] dark:group-hover:text-orange-400 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
