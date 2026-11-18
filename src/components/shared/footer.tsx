import * as React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Link } from '../../lib/router';
import { Dialog } from '../ui/dialog';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { MagneticWrapper } from '../ui/animated-primitives';
import { QrCode, ArrowUpRight, ShieldCheck, Compass, ArrowRight, Layers, Heart } from 'lucide-react';
import { usePrefersReducedMotion } from '../../lib/motion-system';

export const Footer: React.FC = () => {
  const [sitemapOpen, setSitemapOpen] = React.useState(false);
  const footerRef = React.useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Hardware-accelerated scroll reveal progress (0: just entering viewport, 1: fully in view)
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end']
  });

  // Silky spring physics for smooth, non-linear scroll-driven expansion
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    restDelta: 0.001
  });

  // Animated Background: Gradually reveals from subtle/hidden to radiant glow
  const glowOpacity = useTransform(smoothProgress, [0, 0.35, 1], [0.12, 0.45, 0.95]);
  const glowScale = useTransform(smoothProgress, [0, 1], [0.82, 1.06]);
  const glowY = useTransform(smoothProgress, [0, 1], [90, 0]);

  // Staggered content entrance translations & fades
  const headlineOpacity = useTransform(smoothProgress, [0.15, 0.55], [0, 1]);
  const headlineY = useTransform(smoothProgress, [0.15, 0.55], [42, 0]);

  const subtextOpacity = useTransform(smoothProgress, [0.25, 0.7], [0, 1]);
  const subtextY = useTransform(smoothProgress, [0.25, 0.7], [30, 0]);

  const actionsOpacity = useTransform(smoothProgress, [0.35, 0.8], [0, 1]);
  const actionsY = useTransform(smoothProgress, [0.35, 0.8], [24, 0]);

  const bottomBarOpacity = useTransform(smoothProgress, [0.45, 0.92], [0, 1]);
  const bottomBarY = useTransform(smoothProgress, [0.45, 0.92], [18, 0]);

  return (
    <>
      <footer
        ref={footerRef}
        className="w-full bg-white dark:bg-neutral-950 border-t border-neutral-200/80 dark:border-neutral-800/80 relative overflow-hidden transition-colors select-none"
      >
        {/* ========================================================================= */}
        {/* PREMIUM ANIMATED GLOWING BACKGROUND (Liquid Light & Clouds)              */}
        {/* ========================================================================= */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReduced
              ? { opacity: 0.75, scale: 1, y: 0 }
              : { opacity: glowOpacity, scale: glowScale, y: glowY }
          }
          className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-center"
        >
          {/* Layer 1: Core Vermilion & Orange Liquid Furnace (Center-Bottom) */}
          <div
            className="animate-liquid-primary absolute -bottom-24 sm:-bottom-32 md:-bottom-44 w-[380px] sm:w-[680px] md:w-[920px] lg:w-[1100px] h-[260px] sm:h-[420px] md:h-[540px] rounded-[100%] bg-gradient-to-tr from-[#E64500]/25 via-orange-500/20 to-amber-600/18 dark:from-[#E64500]/20 dark:via-orange-600/15 dark:to-amber-700/12 blur-[75px] sm:blur-[120px] md:blur-[160px] lg:blur-[180px]"
            style={{ willChange: 'transform' }}
          />

          {/* Layer 2: Deep Orange / Amber Orbital Blob (Right-Bottom) */}
          <div
            className="animate-liquid-coral absolute -bottom-16 sm:-bottom-24 -right-12 sm:-right-20 md:-right-28 w-[320px] sm:w-[540px] md:w-[720px] h-[240px] sm:h-[380px] md:h-[480px] rounded-[100%] bg-gradient-to-br from-orange-500/25 via-amber-500/20 to-[#E64500]/15 dark:from-orange-600/15 dark:via-amber-600/12 dark:to-orange-500/10 blur-[70px] sm:blur-[110px] md:blur-[150px]"
            style={{ willChange: 'transform' }}
          />

          {/* Layer 3: Soft Golden / Honey Blob (Left-Bottom) */}
          <div
            className="animate-liquid-amber absolute -bottom-16 sm:-bottom-24 -left-12 sm:-left-20 md:-left-28 w-[300px] sm:w-[500px] md:w-[680px] h-[230px] sm:h-[360px] md:h-[460px] rounded-[100%] bg-gradient-to-tr from-amber-500/25 via-[#E64500]/20 to-orange-400/15 dark:from-amber-600/15 dark:via-orange-500/12 dark:to-[#E64500]/10 blur-[70px] sm:blur-[110px] md:blur-[150px]"
            style={{ willChange: 'transform' }}
          />

          {/* Layer 4: Ethereal Pearlescent Misty Cloud (Upper-Center Highlight) */}
          <div
            className="animate-liquid-cloud absolute -bottom-4 sm:-bottom-8 w-[280px] sm:w-[480px] md:w-[620px] h-[180px] sm:h-[280px] md:h-[340px] rounded-[100%] bg-gradient-to-t from-orange-200/25 via-amber-100/20 to-transparent dark:from-orange-400/10 dark:via-amber-200/8 dark:to-transparent blur-[65px] sm:blur-[95px] md:blur-[130px]"
            style={{ willChange: 'transform, opacity' }}
          />

          {/* Layer 5: Bottom Horizon Edge Radiant Wash */}
          <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-40 bg-gradient-to-t from-[#E64500]/15 via-orange-400/8 to-transparent dark:from-[#E64500]/12 dark:via-orange-500/6 dark:to-transparent blur-md" />
        </motion.div>

        {/* ========================================================================= */}
        {/* SPACIOUS MAIN HERO CANVAS & TYPOGRAPHIC STATEMENT                        */}
        {/* ========================================================================= */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 flex flex-col items-center justify-center text-center">
          {/* Monumental Two-Line Brand Statement: "Tasteful Vectors." */}
          <motion.div
            style={
              prefersReduced
                ? { opacity: 1, y: 0 }
                : { opacity: headlineOpacity, y: headlineY }
            }
            className="flex flex-col items-center justify-center space-y-0 sm:space-y-1"
          >
            <p
              aria-label="Tasteful Vectors."
              className="flex flex-col items-center justify-center space-y-0 sm:space-y-1 m-0"
            >
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-extrabold tracking-[-0.045em] leading-[0.88] text-neutral-950 dark:text-neutral-50 drop-shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                Tasteful
              </span>
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-extrabold tracking-[-0.045em] leading-[0.88] text-neutral-950 dark:text-neutral-50 drop-shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                Vectors.
              </span>
            </p>
          </motion.div>

          {/* Minimalist Subtext with scroll-stagger */}
          <motion.p
            style={
              prefersReduced
                ? { opacity: 1, y: 0 }
                : { opacity: subtextOpacity, y: subtextY }
            }
            className="mt-8 sm:mt-10 max-w-md sm:max-w-lg text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans px-4"
          >
            Create clear, beautiful QR codes for print or screen. Easy to design, free to use, and your data stays on your device.
          </motion.p>

          {/* Quick Action Navigation CTAs with scroll-stagger */}
          <motion.div
            style={
              prefersReduced
                ? { opacity: 1, y: 0 }
                : { opacity: actionsOpacity, y: actionsY }
            }
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <MagneticWrapper>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all duration-200 group"
              >
                <span>Create QR</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticWrapper>

            <Link
              href="/templates"
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-white/80 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Layers className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E64500] transition-colors" />
              <span>View Templates</span>
            </Link>

            <BecomeSponsorButton
              href="/sponsor"
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-orange-50/90 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Heart className="w-3.5 h-3.5 text-[#E64500] dark:text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Become a Sponsor</span>
            </BecomeSponsorButton>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* RARE UI SIGNATURE HORIZONTAL BOTTOM BAR                                   */}
        {/* ========================================================================= */}
        <motion.div
          style={
            prefersReduced
              ? { opacity: 1, y: 0 }
              : { opacity: bottomBarOpacity, y: bottomBarY }
          }
          className="relative z-10 w-full border-t border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-neutral-500 dark:text-neutral-400">
            {/* Copyright */}
            <div className="font-medium text-neutral-700 dark:text-neutral-300 tracking-tight flex items-center gap-2">
              <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-neutral-950 shadow-2xs">
                <img
                  src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
                  alt="makeqrr logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
                />
              </div>
              <span>makeqrr © {new Date().getFullYear()}</span>
            </div>

            {/* Horizontal Links with Subtle '·' Separators & Animated Underline */}
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium"
            >
              <Link
                href="/help"
                className="animated-underline hover:text-neutral-950 dark:hover:text-neutral-100 hover:-translate-y-0.5 transition-all duration-150"
              >
                Help & Support
              </Link>

              <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>

              <Link
                href="/privacy"
                className="animated-underline hover:text-neutral-950 dark:hover:text-neutral-100 hover:-translate-y-0.5 transition-all duration-150"
              >
                Privacy Policy
              </Link>

              <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>

              <Link
                href="/terms"
                className="animated-underline hover:text-neutral-950 dark:hover:text-neutral-100 hover:-translate-y-0.5 transition-all duration-150"
              >
                Terms of Service
              </Link>

              <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>

              <button
                type="button"
                onClick={() => setSitemapOpen(true)}
                className="animated-underline hover:text-neutral-950 dark:hover:text-neutral-100 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
              >
                Sitemap
              </button>

              <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>

              <Link
                href="/sponsor"
                className="animated-underline hover:text-[#E64500] dark:hover:text-orange-400 hover:-translate-y-0.5 transition-all duration-150 inline-flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-300"
              >
                <span>Become a Sponsor</span>
              </Link>

              <span className="text-neutral-300 dark:text-neutral-700 select-none">·</span>

              <Link
                href="/about"
                className="animated-underline group hover:text-neutral-950 dark:hover:text-neutral-100 hover:-translate-y-0.5 transition-all duration-150 inline-flex items-center gap-0.5"
              >
                <span>About</span>
                <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-[#E64500] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </nav>
          </div>
        </motion.div>
      </footer>

      {/* Accessible Interactive Sitemap Dialog */}
      <Dialog
        open={sitemapOpen}
        onOpenChange={setSitemapOpen}
        title="Website Pages"
        description="Quick links to all pages on this website."
        maxWidth="lg"
      >
        <div className="space-y-6 pt-1 select-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Group 1: Creation & Templates */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-neutral-900 dark:text-neutral-100">
                <QrCode className="w-3.5 h-3.5" />
                <span>Create & Templates</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>Home – Free QR Generator</span>
                    <span className="text-[10px] font-mono text-neutral-400">/</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>Create Custom QR Code</span>
                    <span className="text-[10px] font-mono text-neutral-400">/create</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>50+ QR Code Templates</span>
                    <span className="text-[10px] font-mono text-neutral-400">/templates</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: Resources & Specs */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-neutral-900 dark:text-neutral-100">
                <Compass className="w-3.5 h-3.5" />
                <span>Guides & Help</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/about"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>About</span>
                    <span className="text-[10px] font-mono text-neutral-400">/about</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>Help & FAQ</span>
                    <span className="text-[10px] font-mono text-neutral-400">/help</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sponsor"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400 flex items-center justify-between"
                  >
                    <span className="font-medium text-[#E64500] dark:text-orange-400">Become a Sponsor</span>
                    <span className="text-[10px] font-mono text-[#E64500]">/sponsor</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    onClick={() => setSitemapOpen(false)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                  >
                    <span>Printing Guide</span>
                    <span className="text-[10px] font-mono text-neutral-400">/help</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 3: Legal & Standards */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2.5 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-neutral-900 dark:text-neutral-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy & Terms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Link
                  href="/privacy"
                  onClick={() => setSitemapOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                >
                  <span>Privacy Policy</span>
                  <span className="text-[10px] font-mono text-neutral-400">/privacy</span>
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setSitemapOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 flex items-center justify-between"
                >
                  <span>Terms of Service</span>
                  <span className="text-[10px] font-mono text-neutral-400">/terms</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
