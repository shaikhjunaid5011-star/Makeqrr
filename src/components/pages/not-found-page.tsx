import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  QrCode,
  Home,
  ArrowLeft,
  RotateCcw,
  Layers,
  HelpCircle,
  Compass
} from 'lucide-react';
import { Link, usePathname, useGoBack } from '../../lib/router';
import { cn } from '../../lib/utils';

const BROKEN_MATRIX: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 2, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 2, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 2, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1]
];

const REPAIRED_MATRIX: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const NotFoundPage: React.FC = () => {
  const pathname = usePathname();
  const goBack = useGoBack();
  const prefersReduced = useReducedMotion();

  const [isRepaired, setIsRepaired] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const matrix = isRepaired ? REPAIRED_MATRIX : BROKEN_MATRIX;

  return (
    <section
      aria-labelledby="not-found-heading"
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center px-4 sm:px-6 py-10 sm:py-16 relative overflow-hidden"
    >
      {/* Subtle warm radial glow behind the QR illustration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10"
      >
        <div className="w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-[#E64500]/12 via-orange-500/6 to-transparent blur-3xl opacity-75 dark:opacity-50" />
      </div>

      {/* Small makeqrr Brand Header */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex items-center justify-center"
      >
        <Link
          href="/"
          aria-label="makeqrr Home"
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-neutral-900 dark:text-neutral-50 hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500]"
        >
          <span className="w-7 h-7 rounded-lg overflow-hidden bg-neutral-950 flex items-center justify-center shrink-0 shadow-xs">
            {logoError ? (
              <QrCode className="w-4 h-4 text-[#E64500]" />
            ) : (
              <img
                src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
                alt="makeqrr logo"
                width={28}
                height={28}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
              />
            )}
          </span>
          <span className="font-bold text-base tracking-tight">makeqrr</span>
        </Link>
      </motion.div>

      {/* Main Centered 404 Experience */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto py-8 sm:py-10 space-y-7"
      >
        {/* Interactive QR-Inspired 404 Visual */}
        <div className="relative group select-none">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-[#E64500]/18 via-orange-500/10 to-amber-500/15 blur-xl opacity-60 group-hover:opacity-100 transition-opacity"
          />

          <motion.button
            type="button"
            whileHover={prefersReduced ? undefined : { scale: 1.02 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            onClick={() => setIsRepaired(prev => !prev)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-pressed={isRepaired}
            aria-label={
              isRepaired
                ? 'QR code visual restored. Click to reset.'
                : 'Broken 404 QR code visual. Click to repair.'
            }
            className={cn(
              'relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
              isRepaired
                ? 'bg-white dark:bg-neutral-900 border-emerald-400/70 dark:border-emerald-500/50 shadow-emerald-500/10'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-orange-500/5 hover:border-[#E64500]/50'
            )}
          >
            {/* Sweeping Laser Scan Line */}
            {!prefersReduced && (
              <motion.div
                aria-hidden="true"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                  repeat: Infinity
                }}
                className={cn(
                  'absolute left-0 right-0 h-0.5 z-20 pointer-events-none',
                  isRepaired
                    ? 'bg-emerald-500 shadow-[0_0_12px_#10B981]'
                    : 'bg-[#E64500] shadow-[0_0_12px_#E64500]'
                )}
              >
                <div
                  className={cn(
                    'w-full h-7 -mt-3.5 opacity-25',
                    isRepaired
                      ? 'bg-gradient-to-b from-transparent via-emerald-400 to-transparent'
                      : 'bg-gradient-to-b from-transparent via-[#E64500] to-transparent'
                  )}
                />
              </motion.div>
            )}

            {/* 15-Column QR Matrix */}
            <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-[2px] p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
              {matrix.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isCornerEye =
                    (rIdx < 7 && cIdx < 7) ||
                    (rIdx < 7 && cIdx >= 8) ||
                    (rIdx >= 7 && cIdx < 7);

                  return (
                    <span
                      key={`${rIdx}-${cIdx}`}
                      className={cn(
                        'rounded-[1.5px] transition-all duration-300',
                        cell === 1 &&
                          !isCornerEye &&
                          (isRepaired
                            ? 'bg-neutral-900 dark:bg-neutral-100'
                            : 'bg-neutral-800 dark:bg-neutral-200'),
                        cell === 1 &&
                          isCornerEye &&
                          (isRepaired
                            ? 'bg-emerald-600 dark:bg-emerald-400'
                            : 'bg-[#E64500] dark:bg-[#ff6d33]'),
                        cell === 2 &&
                          cn(
                            'bg-[#E64500] dark:bg-[#ff6d33]',
                            !prefersReduced && 'animate-pulse'
                          ),
                        cell === 0 && 'bg-neutral-200/40 dark:bg-neutral-800/35 opacity-60'
                      )}
                    />
                  );
                })
              )}

              {/* Center Status Marker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={false}
                  animate={
                    prefersReduced
                      ? undefined
                      : {
                          scale: isHovered ? 1.06 : 1
                        }
                  }
                  transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                  className={cn(
                    'px-3 py-1 rounded-xl font-mono font-bold text-xs sm:text-sm tracking-wider shadow-md flex items-center gap-1.5 border',
                    isRepaired
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/25'
                      : 'bg-[#E64500] text-white border-orange-400 shadow-orange-500/25'
                  )}
                >
                  {isRepaired ? (
                    <>
                      <span>FIXED</span>
                    </>
                  ) : (
                    <span>404</span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Subtle interactive caption */}
            <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <RotateCcw
                className={cn(
                  'w-3 h-3 text-[#E64500]',
                  !prefersReduced && 'transition-transform duration-500',
                  isRepaired && 'rotate-180'
                )}
              />
              <span>{isRepaired ? 'Pattern restored · Tap to reset' : 'Tap QR code to repair'}</span>
            </div>
          </motion.button>
        </div>

        {/* Typographic 404 & Main Copy */}
        <div className="space-y-3 max-w-xl">
          <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-[#E64500]">
            404
          </div>

          <h1
            id="not-found-heading"
            className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Oops! This QR code leads nowhere.
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist, may have been moved, or the URL might be incorrect.
          </p>

          {pathname && pathname !== '/' && (
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 pt-1 break-all">
              Requested path:{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {pathname}
              </span>
            </p>
          )}
        </div>

        {/* Three Required Functional Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 w-full">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Go Home</span>
          </Link>

          <Link
            href="/create"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white shadow-xs active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <QrCode className="w-4 h-4 shrink-0 text-[#E64500]" />
            <span>Create QR Code</span>
          </Link>

          <button
            type="button"
            onClick={goBack}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Secondary Links */}
        <nav
          aria-label="Helpful destinations"
          className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 w-full max-w-md flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 py-1.5 hover:text-[#E64500] dark:hover:text-orange-400 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Templates</span>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 py-1.5 hover:text-[#E64500] dark:hover:text-orange-400 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>About</span>
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 py-1.5 hover:text-[#E64500] dark:hover:text-orange-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help &amp; FAQ</span>
          </Link>
        </nav>
      </motion.div>

      {/* Simple Lightweight Footer */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
        makeqrr · Free, privacy-first QR code generator
      </p>
    </section>
  );
};
