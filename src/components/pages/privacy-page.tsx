import * as React from 'react';
import { ShieldCheck, Lock, EyeOff, DatabaseZap, CheckCircle2 } from 'lucide-react';
import { Link } from '../../lib/router';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Privacy Policy
        </h1>
      </div>

      {/* Highlights Grid */}
      <section aria-labelledby="privacy-highlights-heading">
        <h2 id="privacy-highlights-heading" className="sr-only">
          Key Privacy Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
              Zero Data Collection
            </h3>
            <p className="text-xs text-neutral-500">
              We do not collect your name, email, Wi-Fi password, contact details, or links.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <DatabaseZap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
              No Servers or Databases
            </h3>
            <p className="text-xs text-neutral-500">
              Everything is created directly on your device. Your data stays on your device.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <EyeOff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
              No Tracking Cookies
            </h3>
            <p className="text-xs text-neutral-500">
              No ads, no tracking cookies, and no analytics sharing your data.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            1. Overview
          </h2>
          <p>
            At <strong>makeqrr</strong>, your privacy comes first. Everything you create stays completely on your own device. We do not save, record, or track the information you type into your QR codes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            2. What Information Is Used?
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Your Information:</strong> Whatever link, text, phone number, contact details, or Wi-Fi password you type is only used to draw your QR code. It is never sent to our servers.
            </li>
            <li>
              <strong>Saved on this Device:</strong> To make sure you do not lose your work if you refresh the browser, your recent QR designs are saved directly on your device. You can clear this anytime.
            </li>
            <li>
              <strong>Logos &amp; Images:</strong> When you add an image or logo, it stays on your phone or computer. It is never uploaded to the cloud.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            3. Camera Scanner
          </h2>
          <p>
            If you use the QR code tester with your camera, the video stays right on your screen. Camera access is requested only when you explicitly click to scan, and no video or photos are ever saved or uploaded anywhere.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            4. Questions?
          </h2>
          <p>
            If you have any questions about how your privacy is protected, please check our{' '}
            <Link href="/help" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
              Help &amp; FAQ page
            </Link>{' '}
            or learn more{' '}
            <Link href="/about" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
              about makeqrr
            </Link>
            .
          </p>
        </section>
      </div>

      {/* Back button & Related links */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#E64500] dark:hover:text-orange-400 transition-colors"
        >
          ← Back to Create QR
        </Link>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <Link href="/terms" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            FAQ &amp; Guides
          </Link>
        </div>
      </div>
    </div>
  );
};
