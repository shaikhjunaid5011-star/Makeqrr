import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown, Mail } from 'lucide-react';
import { Link } from '../../lib/router';
import { cn } from '../../lib/utils';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: React.ReactNode;
}

export const FAQ_CATEGORIES = [
  'All',
  'General',
  'QR Code Creation',
  'Templates',
  'Phone Numbers',
  'QR Image & Download',
  'Sharing',
  'Camera & QR Scanning',
  'Privacy & Security',
  'Themes & Devices',
  'Troubleshooting',
  'Sponsorship'
] as const;

export const FAQS: FAQItem[] = [
  // ---------------------------------------------------------------------------
  // 1. General
  // ---------------------------------------------------------------------------
  {
    id: 'general-what-is',
    category: 'General',
    question: 'What is makeqrr?',
    answer: (
      <p>
        makeqrr is a free tool for creating QR codes that you can customize with colors, patterns, icons, images, frames, and more.
      </p>
    )
  },
  {
    id: 'general-is-free',
    category: 'General',
    question: 'Is makeqrr free?',
    answer: (
      <p>
        Yes. It is free to use.
      </p>
    )
  },
  {
    id: 'general-need-account',
    category: 'General',
    question: 'Do I need to create an account?',
    answer: (
      <p>
        No. There is no sign-up or login required.
      </p>
    )
  },
  {
    id: 'general-do-codes-expire',
    category: 'General',
    question: 'Do my QR codes expire?',
    answer: (
      <p>
        No. A QR code created here does not automatically expire.
      </p>
    )
  },
  {
    id: 'general-use-for-business',
    category: 'General',
    question: 'Can I use the QR code for business?',
    answer: (
      <p>
        Yes. You can create QR codes for personal, business, print, packaging, menus, posters, social media, and other uses.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 2. QR Code Creation
  // ---------------------------------------------------------------------------
  {
    id: 'create-what-for',
    category: 'QR Code Creation',
    question: 'What can I create a QR code for?',
    answer: (
      <p>
        You can create QR codes for different types of information supported by the studio, such as links, text, contact details, phone numbers, and other available QR types.
      </p>
    )
  },
  {
    id: 'create-can-customize',
    category: 'QR Code Creation',
    question: 'Can I customize my QR code?',
    answer: (
      <p>
        Yes. You can customize the QR pattern, shape, colors, layout, frame, and center icon or image.
      </p>
    )
  },
  {
    id: 'create-change-pattern',
    category: 'QR Code Creation',
    question: 'Can I change the QR code pattern?',
    answer: (
      <p>
        Yes. Choose from the available QR pattern styles.
      </p>
    )
  },
  {
    id: 'create-change-layout',
    category: 'QR Code Creation',
    question: 'Can I change the QR code layout?',
    answer: (
      <p>
        Yes. The studio provides different layout and design options.
      </p>
    )
  },
  {
    id: 'create-add-logo',
    category: 'QR Code Creation',
    question: 'Can I add a logo or icon to the QR code?',
    answer: (
      <p>
        Yes. You can add an icon or upload your own image for the center of the QR code.
      </p>
    )
  },
  {
    id: 'create-upload-own-image',
    category: 'QR Code Creation',
    question: 'Can I upload my own image?',
    answer: (
      <p>
        Yes. Upload an image and use it as the QR center image.
      </p>
    )
  },
  {
    id: 'create-extra-white-background',
    category: 'QR Code Creation',
    question: 'Will the uploaded image get an extra white background?',
    answer: (
      <p>
        No. Uploaded images preserve their original transparency without an unnecessary white box or background being added behind them unless you choose a solid background.
      </p>
    )
  },
  {
    id: 'create-change-colors',
    category: 'QR Code Creation',
    question: 'Can I change the QR colors?',
    answer: (
      <p>
        Yes. You can customize the QR code colors while keeping enough contrast for scanning.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 3. Templates
  // ---------------------------------------------------------------------------
  {
    id: 'templates-ready-made',
    category: 'Templates',
    question: 'Does makeqrr have ready-made templates?',
    answer: (
      <p>
        Yes. The studio includes many ready-made QR design templates.
      </p>
    )
  },
  {
    id: 'templates-use-and-customize',
    category: 'Templates',
    question: 'Can I use a template and customize it?',
    answer: (
      <p>
        Yes. Select a template and change its colors, pattern, icon, layout, and other available settings.
      </p>
    )
  },
  {
    id: 'templates-own-design-from-scratch',
    category: 'Templates',
    question: 'Can I create my own design instead of using a template?',
    answer: (
      <p>
        Yes. You can build your QR code from scratch.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 4. Phone Numbers
  // ---------------------------------------------------------------------------
  {
    id: 'phone-number-create',
    category: 'Phone Numbers',
    question: 'Can I create a QR code for a phone number?',
    answer: (
      <p>
        Yes.
      </p>
    )
  },
  {
    id: 'phone-number-country-code',
    category: 'Phone Numbers',
    question: 'Can I select a country code?',
    answer: (
      <p>
        Yes. The phone number section includes a separate country-code selector.
      </p>
    )
  },
  {
    id: 'phone-number-why-country-code',
    category: 'Phone Numbers',
    question: 'Why do I need a country code?',
    answer: (
      <p>
        It helps create the correct international phone number format.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 5. QR Image & Download
  // ---------------------------------------------------------------------------
  {
    id: 'download-can-download',
    category: 'QR Image & Download',
    question: 'Can I download my QR code?',
    answer: (
      <p>
        Yes. Use the Download QR button to save your QR code.
      </p>
    )
  },
  {
    id: 'download-can-print',
    category: 'QR Image & Download',
    question: 'Can I print my QR code?',
    answer: (
      <p>
        Yes. Download it and use it for printing, posters, cards, packaging, menus, and other materials.
      </p>
    )
  },
  {
    id: 'download-design-included',
    category: 'QR Image & Download',
    question: 'Will my customized design be included in the downloaded QR code?',
    answer: (
      <p>
        Yes. Your downloaded QR code matches the customized colors, patterns, frames, and center logo shown in the live preview.
      </p>
    )
  },
  {
    id: 'download-use-anywhere',
    category: 'QR Image & Download',
    question: 'Can I use a downloaded QR code anywhere?',
    answer: (
      <p>
        You can use it wherever the QR code&apos;s content and your intended use allow.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 6. Sharing
  // ---------------------------------------------------------------------------
  {
    id: 'sharing-can-share',
    category: 'Sharing',
    question: 'Can I share my QR code?',
    answer: (
      <p>
        Yes. Use the Share button.
      </p>
    )
  },
  {
    id: 'sharing-what-does-it-share',
    category: 'Sharing',
    question: 'What does the Share button share?',
    answer: (
      <p>
        The share feature shares your customized QR code image with the caption <strong className="font-semibold text-neutral-900 dark:text-neutral-100">&ldquo;Scan it quickly&rdquo;</strong>, without exposing or sending the underlying destination URL.
      </p>
    )
  },
  {
    id: 'sharing-special-account',
    category: 'Sharing',
    question: 'Does makeqrr require a special sharing account?',
    answer: (
      <p>
        No. The device&apos;s built-in sharing system is used.
      </p>
    )
  },
  {
    id: 'sharing-from-phone',
    category: 'Sharing',
    question: 'Can I share from my phone?',
    answer: (
      <p>
        Yes. On supported devices, the device&apos;s default share menu can be used.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 7. Camera & QR Scanning
  // ---------------------------------------------------------------------------
  {
    id: 'camera-can-scan',
    category: 'Camera & QR Scanning',
    question: 'Can I scan a QR code with my camera?',
    answer: (
      <p>
        Yes, when the camera/scan feature is available.
      </p>
    )
  },
  {
    id: 'camera-ask-on-open',
    category: 'Camera & QR Scanning',
    question: 'Does the website ask for camera access when I open it?',
    answer: (
      <p>
        No. Camera access is only requested after you explicitly choose to open and allow the camera scanner.
      </p>
    )
  },
  {
    id: 'camera-why-permission',
    category: 'Camera & QR Scanning',
    question: 'Why does the browser ask for camera permission?',
    answer: (
      <p>
        The browser needs your permission before a website can use your camera.
      </p>
    )
  },
  {
    id: 'camera-deny-permission',
    category: 'Camera & QR Scanning',
    question: 'What happens if I deny camera access?',
    answer: (
      <p>
        The scanner will not be able to use your camera. You can allow camera access later through your browser settings and try again.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 8. Privacy & Security
  // ---------------------------------------------------------------------------
  {
    id: 'privacy-personal-info',
    category: 'Privacy & Security',
    question: 'Does makeqrr require my personal information?',
    answer: (
      <p>
        No account or sign-up is required.
      </p>
    )
  },
  {
    id: 'privacy-data-uploaded',
    category: 'Privacy & Security',
    question: 'Is my QR data uploaded to a server?',
    answer: (
      <p>
        No. All QR generation, customization, logo processing, and scanning happen 100% locally in your web browser—your QR content is never uploaded to any server.
      </p>
    )
  },
  {
    id: 'privacy-store-data',
    category: 'Privacy & Security',
    question: 'Does the website store my QR data?',
    answer: (
      <p>
        makeqrr has no backend database and never stores your data on any server. Any saved studio settings, recent designs, or theme preferences remain strictly in your own browser&apos;s local storage and can be cleared anytime.
      </p>
    )
  },
  {
    id: 'privacy-sell-data',
    category: 'Privacy & Security',
    question: 'Do you sell my QR data?',
    answer: (
      <p>
        No. Because everything runs locally on your device without user tracking or server storage, makeqrr never collects, views, or sells any of your QR data.
      </p>
    )
  },
  {
    id: 'privacy-account-to-save',
    category: 'Privacy & Security',
    question: 'Do I need an account to save my work?',
    answer: (
      <p>
        No account is required. Your current QR design and recent history are automatically saved in your browser&apos;s local storage so you can pick up right where you left off.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 9. Themes & Devices
  // ---------------------------------------------------------------------------
  {
    id: 'themes-dark-mode',
    category: 'Themes & Devices',
    question: 'Does makeqrr support Dark Mode?',
    answer: (
      <p>
        Yes. It supports Light, Dark, and System themes.
      </p>
    )
  },
  {
    id: 'themes-work-on-mobile',
    category: 'Themes & Devices',
    question: 'Will it work on mobile?',
    answer: (
      <p>
        Yes. The interface is designed to work across mobile, tablet, and desktop screens.
      </p>
    )
  },
  {
    id: 'themes-different-browsers',
    category: 'Themes & Devices',
    question: 'Does it work on different browsers?',
    answer: (
      <p>
        makeqrr works on all modern web browsers including Chrome, Safari, Firefox, Edge, and Brave on desktop and mobile devices.
      </p>
    )
  },
  {
    id: 'themes-android-iphone',
    category: 'Themes & Devices',
    question: 'Can I use it on Android and iPhone?',
    answer: (
      <p>
        Yes. The entire studio, template gallery, and QR scanner are responsive and designed for both Android and iPhone browsers.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 10. Troubleshooting
  // ---------------------------------------------------------------------------
  {
    id: 'troubleshoot-not-scanning',
    category: 'Troubleshooting',
    question: 'Why is my QR code not scanning?',
    answer: (
      <p>
        Check that there is enough contrast between the QR code and background. Also avoid covering important QR areas with large images or decorations.
      </p>
    )
  },
  {
    id: 'troubleshoot-customized-difficult',
    category: 'Troubleshooting',
    question: 'Why is my customized QR code difficult to scan?',
    answer: (
      <p>
        Very complex designs, low contrast, excessive decoration, or an oversized center image can reduce scan reliability.
      </p>
    )
  },
  {
    id: 'troubleshoot-camera-not-working',
    category: 'Troubleshooting',
    question: "Why isn't my camera working?",
    answer: (
      <p>
        Check that your browser has camera permission and that another application is not currently using the camera.
      </p>
    )
  },
  {
    id: 'troubleshoot-not-updating',
    category: 'Troubleshooting',
    question: "Why isn't my QR code updating?",
    answer: (
      <p>
        Try changing the input or design setting again. If the preview still does not update, refresh the page and try again.
      </p>
    )
  },
  {
    id: 'troubleshoot-cannot-download',
    category: 'Troubleshooting',
    question: "Why can't I download my QR code?",
    answer: (
      <p>
        Check your browser&apos;s download permissions and make sure the browser is not blocking the download.
      </p>
    )
  },

  // ---------------------------------------------------------------------------
  // 11. Sponsorship
  // ---------------------------------------------------------------------------
  {
    id: 'sponsor-can-support',
    category: 'Sponsorship',
    question: 'Can I support makeqrr?',
    answer: (
      <p>
        Yes. You can use the{' '}
        <Link
          href="/sponsor"
          className="text-[#E64500] dark:text-orange-400 font-semibold underline hover:text-[#cc3d00] transition-colors"
        >
          Become a Sponsor
        </Link>{' '}
        section to contact the project.
      </p>
    )
  },
  {
    id: 'sponsor-how-to-contact',
    category: 'Sponsorship',
    question: 'How can I contact the project about sponsorship?',
    answer: (
      <div className="space-y-2">
        <p>Use the sponsorship contact email:</p>
        <div>
          <a
            href="mailto:heythisisjunaid@gmail.com"
            className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#E64500] dark:text-orange-400 underline hover:text-[#cc3d00] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 inline-block" />
            <span>heythisisjunaid@gmail.com</span>
          </a>
        </div>
      </div>
    )
  }
];

export interface FaqAccordionProps {
  items?: FAQItem[];
  defaultOpenIndex?: number | null;
  className?: string;
  showCategoryBadge?: boolean;
  allowMultiple?: boolean;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  items = FAQS,
  defaultOpenIndex = null,
  className,
  showCategoryBadge = true,
  allowMultiple = false
}) => {
  const [openIndices, setOpenIndices] = React.useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (defaultOpenIndex !== null && defaultOpenIndex !== undefined && defaultOpenIndex >= 0) {
      initial.add(defaultOpenIndex);
    }
    return initial;
  });

  const prefersReducedMotion = useReducedMotion();

  // Smooth accordion toggle: Clicking an open item closes it; opening another item expands it smoothly
  const handleToggle = (idx: number) => {
    setOpenIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className={cn('space-y-3 sm:space-y-3.5 w-full', className)}>
      {items.map((faq, idx) => {
        const isOpen = openIndices.has(idx);
        const itemId = faq.id || `faq-${idx}`;
        const headerId = `faq-header-${itemId}`;
        const contentId = `faq-content-${itemId}`;

        return (
          <motion.div
            key={itemId}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: prefersReducedMotion ? 0 : Math.min(idx * 0.02, 0.2)
            }}
            className={cn(
              'group rounded-2xl border transition-all duration-200 relative overflow-hidden',
              isOpen
                ? 'bg-white dark:bg-neutral-900 border-[#E64500]/50 dark:border-[#E64500]/50 shadow-md shadow-orange-500/5 ring-1 ring-[#E64500]/20'
                : 'bg-white dark:bg-neutral-900/90 border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:border-orange-200 dark:hover:border-orange-950/60 hover:shadow-sm'
            )}
          >
            {/* Active Left Accent Stripe */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1 bg-[#E64500] rounded-r-full transition-all duration-200 pointer-events-none',
                isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
              )}
              aria-hidden="true"
            />

            {/* Clickable Question Header */}
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => handleToggle(idx)}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-3.5 sm:gap-4 text-left cursor-pointer select-none rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
            >
              <div className="flex-1 min-w-0 space-y-1">
                {showCategoryBadge && faq.category && (
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 group-hover:text-[#E64500]/80 transition-colors block">
                    {faq.category}
                  </span>
                )}
                <h3
                  className={cn(
                    'text-sm sm:text-base font-semibold leading-snug transition-transform duration-200 text-balance',
                    isOpen
                      ? 'text-neutral-950 dark:text-white font-bold'
                      : 'text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white group-hover:translate-x-0.5'
                  )}
                >
                  {faq.question}
                </h3>
              </div>

              {/* Animated Rotating Chevron Icon */}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{
                  type: 'spring',
                  damping: 24,
                  stiffness: 280
                }}
                className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                  isOpen
                    ? 'bg-orange-100 dark:bg-orange-950/70 text-[#E64500] dark:text-orange-400 ring-2 ring-[#E64500]/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 group-hover:bg-neutral-200/80 dark:group-hover:bg-neutral-700 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'
                )}
                aria-hidden="true"
              >
                <ChevronDown className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.25]" />
              </motion.div>
            </button>

            {/* Smooth Dynamic Height + Opacity Accordion Panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : {
                          height: 'auto',
                          opacity: 1,
                          transition: {
                            height: {
                              type: 'spring',
                              damping: 30,
                              stiffness: 300,
                              restDelta: 0.5
                            },
                            opacity: {
                              duration: 0.22,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }
                        }
                  }
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : {
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              duration: 0.2,
                              ease: [0.16, 1, 0.3, 1]
                            },
                            opacity: {
                              duration: 0.14,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }
                        }
                  }
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: -6, opacity: 0 }}
                    animate={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: -4, opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60"
                  >
                    <div className="pt-3">{faq.answer}</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
