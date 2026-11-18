import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Share2,
  QrCode,
  Layers,
  HelpCircle,
  Info,
  Clock,
  ArrowRight,
  Home,
  ShieldCheck,
  FileText,
  Compass,
  Heart,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { MagneticWrapper } from '../ui/animated-primitives';
import { useTheme, Theme } from '../../lib/theme-context';
import { ThemeToggle } from './theme-toggle';
import { Link, useRouter } from '../../lib/router';
import { cn } from '../../lib/utils';

export interface TopNavProps {
  currentView?: 'studio' | 'landing';
  onNavigate?: (view: 'studio' | 'landing') => void;
  onOpenTemplates?: () => void;
  onOpenRecent: () => void;
  onOpenExport: () => void;
  onOpenShare?: () => void;
  theme?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
  bannerOffset?: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  exact?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    exact: true,
    icon: Home
  },
  {
    id: 'create',
    label: 'Create QR',
    href: '/create',
    icon: QrCode
  },
  {
    id: 'sponsor',
    label: 'Become a Sponsor',
    href: '/sponsor',
    icon: Heart
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: Layers
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    icon: Info
  },
  {
    id: 'help',
    label: 'Help & FAQ',
    href: '/help',
    icon: HelpCircle
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    href: '/privacy',
    icon: ShieldCheck
  },
  {
    id: 'terms',
    label: 'Terms of Service',
    href: '/terms',
    icon: FileText
  }
];

export const TopNav: React.FC<TopNavProps> = ({
  onOpenRecent,
  onOpenExport,
  onOpenShare,
  onToggleTheme,
  bannerOffset = 0
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const { theme, resolvedTheme, setTheme } = useTheme();
  const { pathname, navigate } = useRouter();

  // Scroll listener for subtle floating bar elevation
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling while navigation menu is open
  React.useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // Close menu on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Close menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode; desc?: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
      desc: 'Crisp day theme'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-3.5 h-3.5 text-orange-400" />,
      desc: 'Deep modern theme'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />,
      desc: `Sync with OS (${resolvedTheme})`
    }
  ];

  const isCreateRoute = pathname === '/create';
  const desktopQuickLinks = NAV_ITEMS.filter(item => item.id !== 'sponsor').slice(0, 4);

  return (
    <header
      style={{
        transform: bannerOffset ? `translateY(${bannerOffset}px)` : 'translateY(0px)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 select-none transition-shadow duration-300",
        "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80",
        isScrolled ? "shadow-xs" : "",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      {/* ========================================================================= */}
      {/* FULL-WIDTH TOP NAVIGATION BAR (NO ROUNDED BORDER, FLUSH EDGES)            */}
      {/* ========================================================================= */}
      <nav
        aria-label="Main Navigation"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4"
      >
        {/* Left: Brand Identity & Route Home Link */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="group flex items-center gap-2 sm:gap-2.5 text-neutral-900 dark:text-neutral-100 hover:opacity-90 transition-opacity shrink min-w-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] rounded-xl"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg] bg-neutral-950">
            <img
              src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
              alt="makeqrr logo"
              width={36}
              height={36}
              className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs sm:text-sm tracking-tight leading-tight truncate">
              makeqrr
            </span>
            <span className="text-[10px] text-neutral-400 font-mono hidden xs:inline leading-none truncate">
              Free QR Code Maker
            </span>
          </div>
        </Link>

        {/* Center: Desktop Quick Navigation Links with Animated Underlines */}
        <div className="hidden xl:flex items-center gap-5">
          {desktopQuickLinks.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                exact={item.exact}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "relative py-1 text-xs font-semibold transition-colors animated-underline",
                  isActive
                    ? "text-[#E64500] dark:text-[#ff7a3d]"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-active-dot"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#E64500]"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Quick Action + Theme Toggle + Cross-Click Navigation Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Context Action Button (Desktop/Tablet) */}
          {isCreateRoute && onOpenShare && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMenuOpen(false);
                onOpenShare();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold text-[#E64500] dark:text-orange-400 border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer active:scale-90 active:rotate-[-1deg] transition-transform shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share QR</span>
            </Button>
          )}

          {/* Sponsor Link (Desktop) */}
          <BecomeSponsorButton
            href="/sponsor"
            onClick={() => setMenuOpen(false)}
            className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#E64500] dark:hover:text-orange-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
          >
            <Heart className="w-3.5 h-3.5 text-[#E64500] dark:text-orange-400 transition-transform duration-200 group-hover:scale-110" />
            <span>Become a Sponsor</span>
          </BecomeSponsorButton>

          <MagneticWrapper strength={0.2} className="hidden md:inline-flex">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setMenuOpen(false);
                if (isCreateRoute) {
                  onOpenExport();
                } else {
                  navigate('/create');
                }
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold bg-[#E64500] hover:bg-[#cc3d00] active:bg-[#b33500] text-white shadow-xs hover:shadow-orange-500/20 cursor-pointer active:scale-95 transition-all"
            >
              {isCreateRoute ? (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Create QR</span>
                </>
              )}
            </Button>
          </MagneticWrapper>

          {/* Animated Physical Theme Toggle (All Screens: 320px to Desktop) */}
          <ThemeToggle size="md" align="right" />

          {/* ========================================================================= */}
          {/* EXACT HAMBURGER → CROSS ANIMATION BUTTON (EVERY SCREEN SIZE)               */}
          {/* ========================================================================= */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full transition-all duration-300",
              "w-9.5 h-9.5 sm:w-10 sm:h-10",
              "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700",
              "border border-neutral-800 dark:border-neutral-700 shadow-sm",
              "focus-within:ring-2 focus-within:ring-[#E64500] focus-within:ring-offset-2 dark:focus-within:ring-offset-neutral-900",
              menuOpen && "ring-2 ring-[#E64500] shadow-lg shadow-orange-500/25 bg-neutral-950 dark:bg-neutral-800"
            )}
          >
            <label
              className="hamburger flex items-center justify-center w-full h-full text-[10px] sm:text-[11px] cursor-pointer select-none"
              title={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <input
                type="checkbox"
                checked={menuOpen}
                onChange={(e) => setMenuOpen(e.target.checked)}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
              />
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path
                  className="line line-top-bottom"
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                />
                <path className="line" d="M7 16 27 16" />
              </svg>
            </label>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* FULL NAVIGATION MENU / OVERLAY (RESPONSIVE FOR ALL SCREEN SIZES)           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* 1. Backdrop Blur Overlay (Clicking outside closes the menu) */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 dark:bg-black/75 backdrop-blur-md z-40 pointer-events-auto"
              aria-hidden="true"
            />

            {/* 2. Floating Navigation Command Panel */}
            <motion.div
              key="nav-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Site Navigation Menu"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              style={{
                top: bannerOffset ? `calc(4.5rem + ${bannerOffset}px)` : undefined
              }}
              className="fixed z-50 left-1/2 -translate-x-1/2 top-16 sm:top-20 md:top-22 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] max-w-3xl pointer-events-auto max-h-[calc(100vh-5.25rem)] flex flex-col"
            >
              <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-full">
                {/* Header Strip inside Menu */}
                <div className="px-4 sm:px-6 py-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-neutral-950 shadow-2xs">
                      <img
                        src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
                        alt="makeqrr icon"
                        width={20}
                        height={20}
                        className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
                      />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                      Menu
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Close menu"
                    title="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Navigation Body */}
                <div className="overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4">
                  {/* Grid of Navigation Links (1 column on mobile, 2 columns on tablet/desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {NAV_ITEMS.map((item, idx) => {
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.18 }}
                        >
                          <Link
                            href={item.href}
                            exact={item.exact}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "group w-full px-3.5 py-2.5 sm:py-3 rounded-2xl flex items-center justify-between transition-all duration-150 border cursor-pointer select-none",
                              isActive
                                ? "bg-orange-50/90 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800/80 shadow-xs"
                                : "bg-neutral-50/60 dark:bg-neutral-800/40 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                  isActive
                                    ? "bg-[#E64500] text-white shadow-xs shadow-orange-500/25"
                                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/50 border border-neutral-200/60 dark:border-neutral-700/60"
                                )}
                              >
                                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <span
                                  className={cn(
                                    "text-xs sm:text-sm font-semibold truncate block",
                                    isActive
                                      ? "text-[#E64500] dark:text-[#ff7a3d]"
                                      : "text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d]"
                                  )}
                                >
                                  {item.label}
                                </span>
                                {isActive && (
                                  <div className="h-0.5 w-6 bg-[#E64500] rounded-full mt-0.5" />
                                )}
                              </div>
                            </div>

                            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Quick Utilities Section */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenRecent();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-800 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#E64500] shrink-0" />
                      <span className="font-medium truncate">Saved Designs</span>
                    </button>
                  </div>
                </div>

                {/* Footer Controls: Theme Mode Picker & Primary Action */}
                <div className="p-3.5 sm:p-4 bg-neutral-50/80 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Theme Mode Segmented Control */}
                  <div className="p-1 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/80 border border-neutral-300/50 dark:border-neutral-700/60 flex items-center gap-1 w-full sm:w-auto relative">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "relative flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer z-10",
                          theme === opt.value
                            ? "text-neutral-900 dark:text-white font-semibold"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                        )}
                      >
                        {theme === opt.value && (
                          <motion.div
                            layoutId="active-theme-pill"
                            className="absolute inset-0 rounded-xl bg-white dark:bg-neutral-900 shadow-xs -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        )}
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Primary CTA Button */}
                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={() => {
                        setMenuOpen(false);
                        if (isCreateRoute) {
                          onOpenExport();
                        } else {
                          navigate('/create');
                        }
                      }}
                      className="w-full sm:w-auto rounded-xl px-5 h-9.5 text-xs font-bold gap-2 bg-[#E64500] hover:bg-[#cc3d00] active:bg-[#b33500] text-white shadow-md shadow-orange-500/25"
                    >
                      {isCreateRoute ? (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download QR</span>
                        </>
                      ) : (
                        <>
                          <span>Create QR</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
