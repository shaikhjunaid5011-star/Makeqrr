import * as React from 'react';
import { FileText, CheckCircle, Scale, AlertCircle } from 'lucide-react';
import { Link } from '../../lib/router';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
          <Scale className="w-3.5 h-3.5" />
          <span>Simple Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Terms of Service
        </h1>
      </div>

      {/* Key Terms Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>100% Free Forever</span>
          </div>
          <p className="text-xs text-neutral-500">
            No fees, no watermarks, and no limits on scans.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Commercial Use</span>
          </div>
          <p className="text-xs text-neutral-500">
            You own your QR codes and can use them for personal or business projects.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Safe Use</span>
          </div>
          <p className="text-xs text-neutral-500">
            No scams, phishing, viruses, or illegal content.
          </p>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            1. Using This Website
          </h2>
          <p>
            By using makeqrr, you agree to these simple terms. If you do not agree, please do not use the website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            2. You Own Your QR Codes
          </h2>
          <p>
            <strong>Your QR codes belong to you.</strong> Any QR code, image, or design you create here is yours to keep, print, share, or sell freely with no fees and no attribution required.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            3. Responsible Use
          </h2>
          <p>
            You agree not to use makeqrr for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Harmful links, scams, or phishing websites.</li>
            <li>Fraudulent payment requests or impersonation.</li>
            <li>Any illegal activity or content.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            4. Test Before Printing
          </h2>
          <p>
            Always scan your QR code with a phone before printing many copies. We work hard to create easy-to-scan codes, but lighting, printers, and materials can vary.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
            5. Disclaimer
          </h2>
          <p>
            This website is provided as-is without any warranties. The makers are not liable for any issues arising from the use of this free tool.
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
          <Link href="/privacy" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/help" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            FAQ &amp; Printing Guide
          </Link>
          <Link href="/templates" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            QR Templates
          </Link>
        </div>
      </div>
    </div>
  );
};
