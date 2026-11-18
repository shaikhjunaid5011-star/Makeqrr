import * as React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Layers, ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import { Link } from '../../lib/router';
import { BecomeSponsorButton } from '../ui/become-sponsor-button';
import { MagneticWrapper } from '../ui/animated-primitives';
import {
  staggerContainerVariants,
  staggerItemVariants,
  scrollRevealVariants
} from '../../lib/motion-system';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/70 text-[#E64500] dark:text-[#ff7a3d] border border-orange-200/80 dark:border-orange-800/80">
          <span>Fast, Free, & Private QR Codes</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
          About makeqrr
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          makeqrr lets you create beautiful, high-quality QR codes for personal and business use. Free forever, no sign up needed, and your data stays on your device.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <MagneticWrapper>
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 hover:-translate-y-0.5 transition-all"
            >
              <span>Create QR</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticWrapper>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 hover:-translate-y-0.5 transition-all"
          >
            <Layers className="w-4 h-4 text-neutral-500" />
            <span>View Templates</span>
          </Link>
          <BecomeSponsorButton
            href="/sponsor"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-orange-50/80 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 shadow-xs hover:-translate-y-0.5 transition-all"
          >
            <Heart className="w-4 h-4 text-[#E64500] dark:text-orange-400" />
            <span>Become a Sponsor</span>
          </BecomeSponsorButton>
        </div>
      </motion.div>

      {/* Core Architectural Pillars */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
      >
        <motion.div
          variants={staggerItemVariants}
          className="glow-card group p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
            Your Data Stays on Your Device
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Everything happens directly on your device. Your Wi-Fi passwords, contact details, and links are never sent to any server or saved in any database.
          </p>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className="glow-card group p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
            Never Expire
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Unlike other sites that route scans through expiring redirect links, our codes save your real information directly inside the QR pattern. They work forever.
          </p>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className="glow-card group p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-[#E64500] dark:group-hover:text-[#ff7a3d] transition-colors">
            Sharp for Print & Screen
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Download sharp SVG images for printing on paper, signs, and shirts at any size, or high-quality PNG and JPG images for phones and screens.
          </p>
        </motion.div>
      </motion.div>

      {/* Technical Specifications */}
      <motion.div
        variants={scrollRevealVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="glow-card p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-6"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Built for Quality & Ease of Use
          </h2>
          <p className="text-xs text-neutral-500">
            Standard QR codes designed to scan fast on any device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-neutral-200">Standard QR Codes:</strong> Works on all modern iPhone, Android, and tablet cameras without special apps.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-neutral-200">Easy-to-Scan Check:</strong> Live color check helps make sure your colors have good contrast for cameras.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-neutral-200">Built-in Camera Scanner:</strong> Test your QR code directly on your screen using your camera.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-neutral-200">Useful Formats:</strong> Websites, Wi-Fi networks, contacts, phone calls, text messages, emails, and maps.
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Box */}
      <motion.div
        variants={scrollRevealVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="p-8 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold">
            Ready to make your QR code?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-600">
            No sign up, no email, free forever.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 shrink-0">
          <MagneticWrapper>
            <Link
              href="/create"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-md shadow-orange-500/25 transition-all shrink-0 inline-block"
            >
              Create QR
            </Link>
          </MagneticWrapper>
          <Link
            href="/templates"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 border border-white/20 dark:border-neutral-300 transition-all shrink-0 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Templates</span>
          </Link>
          <BecomeSponsorButton
            href="/sponsor"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 border border-white/20 dark:border-neutral-300 transition-all shrink-0 flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-orange-400 dark:text-[#E64500]" />
            <span>Become a Sponsor</span>
          </BecomeSponsorButton>
        </div>
      </motion.div>
    </div>
  );
};
