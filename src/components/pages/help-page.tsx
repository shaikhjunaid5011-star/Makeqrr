import * as React from 'react';
import {
  HelpCircle,
  Search,
  X,
  Printer,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Heart
} from 'lucide-react';
import { Link } from '../../lib/router';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { FaqAccordion, FAQS, FAQ_CATEGORIES, FAQItem } from '../shared/faq-accordion';
import { cn } from '../../lib/utils';
import { motion, useReducedMotion } from 'motion/react';

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const prefersReducedMotion = useReducedMotion();

  const filteredFaqs = React.useMemo(() => {
    return FAQS.filter(f => {
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        f.question.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-20 space-y-10 sm:space-y-12">
      {/* Header Section with Smooth Entrance */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/70 text-[#E64500] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#E64500] dark:text-orange-400" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
          Short and simple answers about creating, customizing, downloading, sharing, scanning, and privacy for your QR codes.
        </p>

        {/* Search Input Bar with Clear Action */}
        <div className="pt-2 max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions (e.g. print, logo, camera, colors)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#E64500] dark:focus:ring-orange-500 focus:border-[#E64500] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontally Scrollable Category Filter Pills on Mobile */}
        <div className="w-full overflow-x-auto pb-1.5 pt-2 no-scrollbar">
          <div className="flex items-center sm:justify-center gap-1.5 min-w-max px-1">
            {FAQ_CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              const count =
                category === 'All'
                  ? FAQS.length
                  : FAQS.filter(f => f.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer select-none shrink-0 inline-flex items-center gap-1.5 z-10',
                    isSelected
                      ? 'text-white font-semibold'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70'
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="help-page-cat-pill"
                      className="absolute inset-0 rounded-full bg-[#E64500] shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span>{category}</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Accordion List with Polished Spring Interactions */}
      <div className="w-full">
        {filteredFaqs.length > 0 ? (
          <FaqAccordion
            key={`${selectedCategory}-${searchQuery}`}
            items={filteredFaqs}
            defaultOpenIndex={null}
          />
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 space-y-3">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              No questions found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-[#E64500] dark:text-orange-400 font-semibold hover:underline cursor-pointer"
            >
              Reset search & filter
            </button>
          </div>
        )}
      </div>

      {/* Quick Best Practice Cards */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
      >
        <div className="glow-card p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-[#E64500] dark:text-orange-400">
              <Printer className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold">Before You Print</h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Always test scan your QR code on at least two different smartphones with standard camera apps before printing large batches.
          </p>
        </div>

        <div className="glow-card p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold">Logo Recommendation</h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Keep your logo size under 30% and set Scan Safety to High or Maximum so camera sensors easily scan obstructed modules.
          </p>
        </div>
      </motion.div>

      {/* Comprehensive QR Code Learning & How-To Guides */}
      <section aria-labelledby="qr-learning-guides-heading" className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-orange-300 border border-orange-200/70 dark:border-orange-800/70">
            Step-by-Step Documentation
          </span>
          <h2
            id="qr-learning-guides-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Complete QR Code Learning &amp; How-To Guides
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Everything you need to know about generating, customizing, printing, and scanning static QR codes for personal and business use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              1. What Is a Static QR Code?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              A QR (Quick Response) code is a two-dimensional matrix barcode capable of storing website URLs, contact cards, Wi-Fi credentials, and payment links. Static QR codes created in makeqrr encode your data directly into the pattern modules—meaning they never expire, require zero monthly subscriptions, and work without redirecting through third-party tracking servers.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              2. How to Create a Custom QR Code Online
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Open the{' '}
              <Link href="/create" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
                Free QR Code Generator
              </Link>
              , select your content category (URL, WhatsApp, Wi-Fi, vCard, Location, Email, Phone, or UPI), and type your destination details. The live preview updates immediately in your browser so you can test scan before downloading.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              3. How to Customize QR Code Colors, Patterns &amp; Frames
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Switch to the Design panel or pick one of our{' '}
              <Link href="/templates" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
                50+ designer QR templates
              </Link>
              . Customize dot shapes (dots, rounded, classy, diamond), corner eye styles, linear or radial color gradients, and call-to-action frames. Always keep foreground modules darker than the background for reliable camera recognition.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              4. How to Add a Center Logo or Emoji to a QR Code
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              In the Logo tab, upload a PNG, JPG, or SVG brand mark—or select a preset icon or emoji. makeqrr automatically applies Reed-Solomon High (Level H, 30%) error correction and clears the center quiet zone so iOS and Android cameras read your branded QR code effortlessly.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              5. How to Create a WhatsApp QR Code (With Country Code)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Choose the WhatsApp QR type, select your mandatory international country dialing code (such as +1 for US/Canada, +44 for UK, or +91 for India), enter your mobile number without leading zeros, and add an optional pre-filled greeting message. Scanning opens a direct WhatsApp chat window immediately.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              6. How to Create a Wi-Fi QR Code for Instant Guest Login
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Select the Wi-Fi QR generator, enter your exact network SSID name, choose your security encryption protocol (WPA/WPA2/WPA3, WEP, or Open), and type your Wi-Fi password. Guests, cafe visitors, and Airbnb travelers can join your network with a single camera scan—no password typing needed.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              7. How to Create a Google Maps Location QR Code
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Select the Location QR type in the{' '}
              <Link href="/create" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
                QR Code Maker
              </Link>{' '}
              and enter either latitude/longitude coordinates or a direct Google Maps place link. Ideal for wedding invitations, retail storefronts, conference venues, and real estate signage to launch turn-by-turn directions.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              8. How to Download High-Resolution PNG &amp; Vector SVG QR Codes
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Click <strong>Download QR</strong> to export raster PNG files up to 4096×4096 pixels for websites, emails, and social media, or choose vector SVG format for commercial print workflows. Vector SVG paths scale infinitely in Adobe Illustrator, Figma, Canva, and CorelDRAW without pixelation.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              9. How to Scan QR Codes with Camera or Image Upload
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Point any modern iPhone or Android camera at a QR code, or click the <strong>Scan QR</strong> button in our top navigation bar. Our built-in scanner requests camera access only when you explicitly click Allow, and also lets you upload saved screenshots or image files from your device.
            </p>
          </article>

          <article className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              10. How to Use Custom QR Codes for Business &amp; Print
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Businesses use custom QR codes on restaurant table menus, product packaging, vCard business cards, event badges, and payment stands. Print your QR code at a minimum size of 2 × 2 cm (0.8 × 0.8 in), preserve the 4-module white border quiet zone, and always verify scan speed across multiple phones.
            </p>
          </article>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="text-center pt-4"
      >
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Ready to create your custom QR code?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Choose colors, patterns, frames, and logos. Free forever, no sign up required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 transition-all"
            >
              <span>Create QR</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all"
            >
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>Browse Templates</span>
            </Link>
            <BecomeSponsorButton
              href="/sponsor"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all"
            >
              <Heart className="w-4 h-4 text-orange-500" />
              <span>Become a Sponsor</span>
            </BecomeSponsorButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
