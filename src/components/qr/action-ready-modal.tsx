import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { QRConfig } from '../../types/qr';
import {
  isWindowsPlatform,
  buildMailtoUrl,
  buildGmailComposeUrl,
  buildOutlookWebComposeUrl,
  parseMailtoUrl,
  buildSmsActionHref,
  parseWifiPayload,
  parseVCardSummary,
  downloadVCardFile,
  downloadICalendarFile,
  buildGoogleCalendarUrl
} from '../../lib/action-dispatcher';
import {
  Mail,
  ExternalLink,
  Copy,
  Check,
  Wifi,
  Eye,
  EyeOff,
  User,
  Download,
  Calendar,
  Phone,
  MessageSquare,
  FileText,
  MapPin,
  CreditCard,
  Monitor,
  Info,
  Smartphone,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionReadyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: QRConfig;
  payload: string;
}

export const ActionReadyModal: React.FC<ActionReadyModalProps> = ({
  open,
  onOpenChange,
  config,
  payload
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const isWindows = React.useMemo(() => isWindowsPlatform(), []);

  const handleCopy = (text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  const renderContent = () => {
    switch (config.type) {
      case 'email': {
        const emailData = parseMailtoUrl(payload);
        const recipient = emailData.to || config.content.email.email;
        const subject = emailData.subject || config.content.email.subject;
        const body = emailData.body || config.content.email.message;

        const mailtoHref = payload.startsWith('mailto:')
          ? payload
          : buildMailtoUrl(recipient, subject, body);
        const gmailHref = buildGmailComposeUrl(recipient, subject, body);
        const outlookHref = buildOutlookWebComposeUrl(recipient, subject, body);

        return (
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <Mail className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Email Action Ready
                </span>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                  To: {recipient || '(No recipient)'}
                </p>
              </div>
            </div>

            {/* Email Summary Box */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                  Recipient
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 select-all">
                  {recipient}
                </span>
              </div>
              {subject && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Subject
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium select-all">
                    {subject}
                  </span>
                </div>
              )}
              {body && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Message Body
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-sans max-h-24 overflow-y-auto select-all">
                    {body}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                Choose How to Open
              </span>

              {/* 1. Genuine Native mailto: link for default app */}
              <a
                href={mailtoHref}
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-between bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors shadow-xs cursor-pointer active:scale-98"
                onClick={() => {
                  // Keep genuine click without cancelling navigation
                }}
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Open in Default Mail App</span>
                </span>
                <span className="text-[10px] opacity-80 font-normal">
                  (Outlook, Windows Mail, etc.)
                </span>
              </a>

              {/* 2. Webmail Fallback: Gmail Web */}
              <a
                href={gmailHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-red-500" />
                  <span>Open in Gmail (Web)</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  mail.google.com
                </span>
              </a>

              {/* 3. Webmail Fallback: Outlook.com Web */}
              <a
                href={outlookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-between bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <span>Open in Outlook Web</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  outlook.live.com
                </span>
              </a>

              {/* 4. Copy Email Address */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs justify-center gap-2 cursor-pointer"
                onClick={() => handleCopy(recipient, 'email')}
              >
                {copiedKey === 'email' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email Address</span>
                  </>
                )}
              </Button>
            </div>

            {/* Windows 10/11 Guidance Box */}
            <div className="p-3 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-start gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-400">
              <Monitor className="w-4 h-4 text-[#E64500] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">
                  {isWindows ? 'Windows 10/11 Email Guide' : 'Desktop Email Guide'}
                </span>
                <p className="leading-relaxed">
                  If clicking &ldquo;Open in Default Mail App&rdquo; does not launch an application on your PC, make sure an email app is assigned in{' '}
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Windows Settings &gt; Apps &gt; Default apps &gt; Email
                  </span>
                  , or use the <strong className="text-neutral-800 dark:text-neutral-200">Open in Gmail</strong> button above.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case 'wifi': {
        const wifi = parseWifiPayload(payload);
        const ssid = wifi.ssid || config.content.wifi.ssid;
        const password = wifi.password ?? config.content.wifi.password;
        const encryption = wifi.encryption || config.content.wifi.encryption;

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <Wifi className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Wi-Fi Network Connection Card
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Connect on PC or scan QR with smartphone camera
                </span>
              </div>
            </div>

            {/* Network SSID & Password Details */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs space-y-3">
              {/* SSID */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Network Name (SSID)
                  </span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 select-all">
                    {ssid || '(Empty)'}
                  </span>
                </div>
                {ssid && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1 cursor-pointer shrink-0"
                    onClick={() => handleCopy(ssid, 'ssid')}
                  >
                    {copiedKey === 'ssid' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'ssid' ? 'Copied' : 'Copy'}</span>
                  </Button>
                )}
              </div>

              {/* Password */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Password ({encryption})
                  </span>
                  {password ? (
                    <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all">
                      {showPassword ? password : '••••••••••••'}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No password (Open network)</span>
                  )}
                </div>

                {password && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1 cursor-pointer bg-[#E64500] hover:bg-[#cc3d00] text-white"
                      onClick={() => handleCopy(password, 'pwd')}
                    >
                      {copiedKey === 'pwd' ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{copiedKey === 'pwd' ? 'Copied!' : 'Copy Password'}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* How to Connect Guidance for Windows & Mobile */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-start gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                <Monitor className="w-4 h-4 text-[#E64500] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">
                    Connecting on Windows 10/11
                  </span>
                  <p className="leading-relaxed">
                    Click the Wi-Fi icon on the bottom-right taskbar (or press{' '}
                    <kbd className="px-1 py-0.5 rounded bg-white dark:bg-neutral-700 border text-[10px] font-mono">Win + A</kbd>
                    ), select <strong>{ssid || 'your network'}</strong>, and paste the copied password.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-start gap-2.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                <Smartphone className="w-4 h-4 text-[#E64500] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200 block">
                    Connecting on Mobile (iPhone &amp; Android)
                  </span>
                  <p className="leading-relaxed">
                    Point your smartphone camera at the generated QR code. A banner will appear asking to &ldquo;Join {ssid || 'Network'}&rdquo;—tap to connect instantly without typing!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'contact': {
        const contact = parseVCardSummary(payload);
        const displayName = contact.name || 'Contact';

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <User className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  vCard Digital Contact Ready
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Standards-compliant vCard 3.0 file for Windows, Outlook, Apple &amp; Android
                </span>
              </div>
            </div>

            {/* Contact Card Summary */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                  Full Name
                </span>
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {displayName}
                </span>
              </div>
              {(contact.company || contact.title) && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Company / Title
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {[contact.title, contact.company].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
              {contact.phone && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Phone
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200 font-mono">
                    {contact.phone}
                  </span>
                </div>
              )}
              {contact.email && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Email
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {contact.email}
                  </span>
                </div>
              )}
              {contact.website && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Website
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {contact.website}
                  </span>
                </div>
              )}
            </div>

            {/* Download & Copy Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="primary"
                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-xs"
                onClick={() => {
                  const safeName = displayName.replace(/\s+/g, '_') || 'Contact';
                  downloadVCardFile(payload, `${safeName}.vcf`);
                }}
              >
                <Download className="w-4 h-4" />
                <span>Download .vcf Contact Card</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-xs gap-2 cursor-pointer"
                onClick={() => handleCopy(payload, 'vcard')}
              >
                {copiedKey === 'vcard' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">vCard Data Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Raw vCard Data</span>
                  </>
                )}
              </Button>
            </div>

            {/* Windows Note */}
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
              Opening the downloaded <strong>.vcf</strong> file in Windows launches Windows Contacts or Microsoft Outlook to import into your address book.
            </p>
          </div>
        );
      }

      case 'event': {
        const ev = config.content.event;
        const googleCalUrl = buildGoogleCalendarUrl({
          title: ev.title,
          location: ev.location,
          start: ev.start,
          end: ev.end,
          description: ev.description
        });

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <Calendar className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Calendar Event Ready
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Add to Outlook, Windows Calendar, or Google Calendar
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                  Event Title
                </span>
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {ev.title || 'Untitled Event'}
                </span>
              </div>
              {ev.location && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Location
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300">{ev.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="primary"
                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-xs"
                onClick={() => {
                  const safeTitle = (ev.title || 'Event').replace(/\s+/g, '_');
                  downloadICalendarFile(payload, `${safeTitle}.ics`);
                }}
              >
                <Download className="w-4 h-4" />
                <span>Download .ics Calendar File (Outlook / Windows Calendar)</span>
              </Button>

              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <span>Add to Google Calendar (Web)</span>
              </a>
            </div>
          </div>
        );
      }

      case 'phone': {
        const phone = payload.startsWith('tel:')
          ? payload.slice(4)
          : config.content.phone.phone;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <Phone className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Telephone Call Action Ready
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Launches Phone Link, Skype, or mobile dialer
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
                Dial Number
              </span>
              <span className="font-mono text-xl font-bold text-neutral-900 dark:text-neutral-100 select-all">
                {phone}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={`tel:${phone}`}
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors shadow-xs cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call {phone} (Default Calling App)</span>
              </a>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-xs gap-2 cursor-pointer"
                onClick={() => handleCopy(phone, 'phone')}
              >
                {copiedKey === 'phone' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Phone Number Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Phone Number</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
              On Windows, <code className="font-mono text-[10px]">tel:</code> links launch Phone Link, Skype, or your configured telephony handler.
            </p>
          </div>
        );
      }

      case 'sms': {
        const sms = config.content.sms;
        const smsHref = buildSmsActionHref(sms.phone, sms.message);
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <MessageSquare className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  SMS Message Action Ready
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Prefilled recipient and message for messaging apps
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                  Recipient
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {sms.phone}
                </span>
              </div>
              {sms.message && (
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Message
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {sms.message}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={smsHref}
                className="w-full h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in Messaging App</span>
              </a>

              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-xs gap-2 cursor-pointer"
                onClick={() => handleCopy(sms.message || sms.phone, 'sms')}
              >
                {copiedKey === 'sms' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message Text</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      }

      case 'text': {
        const text = config.content.text.text;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 text-xs">
              <FileText className="w-4 h-4 text-[#E64500] dark:text-orange-400 shrink-0" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Plain Text Content Ready
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {text.length} characters • {text.trim().split(/\s+/).length} words
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-xs max-h-48 overflow-y-auto">
              <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 font-sans select-all">
                {text}
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-xs"
              onClick={() => handleCopy(text, 'plainText')}
            >
              {copiedKey === 'plainText' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Text Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Text</span>
                </>
              )}
            </Button>
          </div>
        );
      }

      default:
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 break-all select-all">
              {payload}
            </div>
            <Button
              type="button"
              variant="primary"
              className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer bg-[#E64500] hover:bg-[#cc3d00] text-white"
              onClick={() => handleCopy(payload, 'raw')}
            >
              {copiedKey === 'raw' ? 'Copied!' : 'Copy Payload'}
            </Button>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (config.type) {
      case 'email': return 'Email Action & Options';
      case 'wifi': return 'Wi-Fi Connection Details';
      case 'contact': return 'Contact Card (vCard 3.0)';
      case 'event': return 'Calendar Event';
      case 'phone': return 'Telephone Calling';
      case 'sms': return 'SMS Messaging';
      case 'text': return 'Plain Text Preview';
      default: return 'Action Ready';
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={getTitle()}
      maxWidth="md"
    >
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          {getTitle()}
        </h3>

        {renderContent()}
      </div>
    </Dialog>
  );
};
