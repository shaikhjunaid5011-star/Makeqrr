import * as React from 'react';
import {
  Link2,
  FileText,
  Wifi,
  User,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  MapPin,
  Calendar,
  Share2,
  CreditCard,
  ExternalLink,
  QrCode,
  Check,
  Sparkles,
  Info,
  Copy
} from 'lucide-react';
import { QRConfig, QRType, SocialPlatform } from '../../../types/qr';
import { buildMailtoUrl, buildGmailComposeUrl } from '../../../lib/action-dispatcher';
import { Input, Textarea } from '../../ui/input';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/slider';
import { cn } from '../../../lib/utils';
import { PhoneInputField } from './phone-input-field';
import { WhatsAppInputField } from './whatsapp-input-field';
import { sanitizePhoneNumber, safeEncodeURIComponent, validateAndBuildPayload } from '../../../lib/payload-builders';

interface ContentFormProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
}

const QR_TYPE_TABS: { id: QRType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'url', label: 'Website', icon: Link2 },
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'sms', label: 'Text Message', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'location', label: 'Map', icon: MapPin },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'payment', label: 'Payment', icon: CreditCard }
];

export const ContentForm: React.FC<ContentFormProps> = React.memo(({ config, onChange }) => {
  const [isGenerated, setIsGenerated] = React.useState(false);
  const [copiedMailto, setCopiedMailto] = React.useState(false);

  const setType = (type: QRType) => {
    onChange(prev => ({ ...prev, type }));
  };

  const handleGenerateQR = () => {
    // If URL type and URL has no protocol, automatically prepend https://
    if (config.type === 'url') {
      let currentUrl = (config.content.url.url || '').trim();
      if (currentUrl && !/^https?:\/\//i.test(currentUrl) && !/^mailto:/i.test(currentUrl)) {
        currentUrl = `https://${currentUrl}`;
        onChange(prev => ({
          ...prev,
          content: {
            ...prev.content,
            url: { url: currentUrl }
          }
        }));
      }
    }

    setIsGenerated(true);
    setTimeout(() => {
      setIsGenerated(false);
    }, 1800);
  };

  return (
    <div className="space-y-4">
      {/* Type Selector Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
          Choose Type
        </label>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          {QR_TYPE_TABS.map(tab => {
            const Icon = tab.icon;
            const active = config.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setType(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg transition-all text-left truncate cursor-pointer',
                  active
                    ? 'bg-white dark:bg-neutral-800 text-[#E64500] dark:text-orange-400 shadow-xs font-semibold ring-1 ring-[#E64500]/30 dark:ring-orange-400/30'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#E64500] dark:text-orange-400' : 'text-neutral-500')} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-form Panels */}
      <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
        {/* URL Form */}
        {config.type === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Website Link
              </label>
              <div className="flex flex-col xs:flex-row gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={config.content.url.url}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        url: { url: e.target.value }
                      }
                    }))
                  }
                  className="font-mono text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateQR}
                  title="Create or update QR code"
                  className={cn(
                    "shrink-0 text-xs gap-1.5 font-semibold transition-all shadow-xs h-9",
                    isGenerated
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs shadow-orange-500/25"
                  )}
                >
                  {isGenerated ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Updated!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Create QR</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Paste your website link here.
              </p>
            </div>
          </div>
        )}

        {/* Text Form */}
        {config.type === 'text' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Your Text
            </label>
            <Textarea
              rows={4}
              placeholder="Enter any text, instructions, serial number, or note..."
              value={config.content.text.text}
              onChange={e =>
                onChange(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    text: { text: e.target.value }
                  }
                }))
              }
              className="text-xs"
            />
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>Any notes or words</span>
              <span className="font-mono">{config.content.text.text.length} characters</span>
            </div>
          </div>
        )}

        {/* Wi-Fi Form */}
        {config.type === 'wifi' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Network Name
              </label>
              <Input
                placeholder="e.g. MyHome_WiFi"
                value={config.content.wifi.ssid}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      wifi: { ...prev.content.wifi, ssid: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Wi-Fi Password
              </label>
              <Input
                type="text"
                placeholder="Network password"
                value={config.content.wifi.password}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      wifi: { ...prev.content.wifi, password: e.target.value }
                    }
                  }))
                }
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Security
                </label>
                <select
                  value={config.content.wifi.encryption}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        wifi: {
                          ...prev.content.wifi,
                          encryption: e.target.value as any
                        }
                      }
                    }))
                  }
                  className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1 text-xs text-neutral-900 dark:text-neutral-100"
                >
                  <option value="WPA">WPA / WPA2 (Normal)</option>
                  <option value="WPA3">WPA3 (Newer)</option>
                  <option value="WEP">WEP (Older)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <Switch
                  checked={config.content.wifi.hidden}
                  onCheckedChange={checked =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        wifi: { ...prev.content.wifi, hidden: checked }
                      }
                    }))
                  }
                  label="Hidden Network"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact / vCard Form */}
        {config.type === 'contact' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  First Name
                </label>
                <Input
                  placeholder="First name"
                  value={config.content.contact.firstName}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: { ...prev.content.contact, firstName: e.target.value }
                      }
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Last Name
                </label>
                <Input
                  placeholder="Last name"
                  value={config.content.contact.lastName}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: { ...prev.content.contact, lastName: e.target.value }
                      }
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Company
                </label>
                <Input
                  placeholder="Company name"
                  value={config.content.contact.company ?? ''}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: {
                          ...prev.content.contact,
                          company: e.target.value
                        }
                      }
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Job Title
                </label>
                <Input
                  placeholder="Job title or role"
                  value={config.content.contact.title}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: { ...prev.content.contact, title: e.target.value }
                      }
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={config.content.contact.phone}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: { ...prev.content.contact, phone: e.target.value }
                      }
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={config.content.contact.email}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        contact: { ...prev.content.contact, email: e.target.value }
                      }
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Website
              </label>
              <Input
                placeholder="https://mywebsite.com"
                value={config.content.contact.website}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      contact: { ...prev.content.contact, website: e.target.value }
                    }
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Address
              </label>
              <Input
                placeholder="City, State, Zip"
                value={config.content.contact.address}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      contact: { ...prev.content.contact, address: e.target.value }
                    }
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* Email Form */}
        {config.type === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Send To (Email)
              </label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={config.content.email.email}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      email: { ...prev.content.email, email: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Subject
              </label>
              <Input
                placeholder="Subject line"
                value={config.content.email.subject}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      email: { ...prev.content.email, subject: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Message
              </label>
              <Textarea
                rows={3}
                placeholder="Write your message here..."
                value={config.content.email.message}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      email: { ...prev.content.email, message: e.target.value }
                    }
                  }))
                }
              />
            </div>

            {/* Open Mail & Windows Compatibility Bar */}
            {config.content.email.email.trim() && (() => {
              const emailVal = validateAndBuildPayload('email', config.content);
              if (!emailVal.valid) {
                return (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                    {emailVal.error}
                  </p>
                );
              }
              return (
                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block">
                    Test Email Action
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Native mailto: link for default app */}
                    <a
                      href={buildMailtoUrl(
                        config.content.email.email,
                        config.content.email.subject,
                        config.content.email.message
                      )}
                      className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors shadow-2xs cursor-pointer active:scale-95"
                      title="Launch default email app (Outlook, Windows Mail)"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Mail App</span>
                    </a>

                    {/* Gmail Web fallback */}
                    <a
                      href={buildGmailComposeUrl(
                        config.content.email.email,
                        config.content.email.subject,
                        config.content.email.message
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors shadow-2xs cursor-pointer"
                      title="Open in Gmail (browser webmail)"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                      <span>Open in Gmail</span>
                    </a>

                    {/* Copy mailto URI */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                      onClick={() => {
                        const mailtoUri = buildMailtoUrl(
                          config.content.email.email,
                          config.content.email.subject,
                          config.content.email.message
                        );
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(mailtoUri).then(() => {
                            setCopiedMailto(true);
                            setTimeout(() => setCopiedMailto(false), 2500);
                          });
                        }
                      }}
                    >
                      {copiedMailto ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Phone Form with Separate Country Code & Number */}
        {config.type === 'phone' && (
          <PhoneInputField
            value={config.content.phone}
            onChange={newPhone =>
              onChange(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  phone: newPhone
                }
              }))
            }
            onGenerateQR={handleGenerateQR}
          />
        )}

        {/* SMS Form */}
        {config.type === 'sms' && (
          <div className="space-y-3.5">
            {/* Format Selector: Universal smsto vs RFC 5724 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  SMS URI Format
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Standards & Compatibility
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        sms: { ...prev.content.sms, format: 'smsto' }
                      }
                    }))
                  }
                  className={cn(
                    'p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer flex flex-col',
                    (config.content.sms.format || 'smsto') === 'smsto'
                      ? 'border-[#E64500] bg-orange-50/60 dark:bg-orange-950/25 text-[#E64500] dark:text-orange-400 font-medium ring-1 ring-[#E64500]/20'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <span className="font-semibold text-xs flex items-center justify-between">
                    Universal (smsto:)
                    {(config.content.sms.format || 'smsto') === 'smsto' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E64500] dark:bg-orange-400" />
                    )}
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    Recommended for Android & Google Lens
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        sms: { ...prev.content.sms, format: 'rfc5724' }
                      }
                    }))
                  }
                  className={cn(
                    'p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer flex flex-col',
                    config.content.sms.format === 'rfc5724'
                      ? 'border-[#E64500] bg-orange-50/60 dark:bg-orange-950/25 text-[#E64500] dark:text-orange-400 font-medium ring-1 ring-[#E64500]/20'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <span className="font-semibold text-xs flex items-center justify-between">
                    RFC 5724 (sms:)
                    {config.content.sms.format === 'rfc5724' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E64500] dark:bg-orange-400" />
                    )}
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    Standard URI scheme (iOS & Web)
                  </span>
                </button>
              </div>
            </div>

            {/* Recipient Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Recipient Phone Number
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Include country code (+91, +1, etc.)
                </span>
              </div>
              <div className="flex flex-col xs:flex-row gap-2">
                <Input
                  type="tel"
                  placeholder="+919876543210"
                  value={config.content.sms.phone}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        sms: { ...prev.content.sms, phone: e.target.value }
                      }
                    }))
                  }
                  className="font-mono text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateQR}
                  title="Generate or update QR code"
                  className={cn(
                    "shrink-0 text-xs gap-1.5 font-semibold transition-all shadow-xs h-9",
                    isGenerated
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs shadow-orange-500/25"
                  )}
                >
                  {isGenerated ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Updated!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Create QR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Pre-filled Message (Optional)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        sms: {
                          ...prev.content.sms,
                          phone: prev.content.sms.phone || '+919876543210',
                          message: 'Kuch nahi bs ayese hi'
                        }
                      }
                    }))
                  }
                  className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Try sample: "Kuch nahi bs ayese hi"
                </button>
              </div>
              <Textarea
                rows={3}
                placeholder="Type the message that will be prefilled in the messaging app..."
                value={config.content.sms.message}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      sms: { ...prev.content.sms, message: e.target.value }
                    }
                  }))
                }
                className="text-xs"
              />
            </div>

            {/* Live Decoded Payload Preview */}
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-2.5 border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                  <Info className="h-3 w-3 text-neutral-400" />
                  Exact Encoded Payload:
                </span>
                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                  {(config.content.sms.format || 'smsto') === 'smsto' ? 'smsto: URI' : 'RFC 5724 URI'}
                </span>
              </div>
              <div className="font-mono text-[11px] p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 break-all select-all font-semibold">
                {(() => {
                  const num = sanitizePhoneNumber(config.content.sms.phone || '');
                  const msg = (config.content.sms.message || '').trim();
                  if (!num) return <span className="text-neutral-400 italic font-normal">Enter recipient number above...</span>;
                  if ((config.content.sms.format || 'smsto') === 'rfc5724') {
                    return msg ? `sms:${num}?body=${safeEncodeURIComponent(msg)}` : `sms:${num}`;
                  }
                  return msg ? `smsto:${num}:${msg}` : `smsto:${num}`;
                })()}
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed pt-0.5">
                Scanning with Android camera / Google Lens displays a <strong>"Message / Send SMS"</strong> action chip. Tapping it directly opens your SMS app with recipient &amp; message pre-filled.
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Form */}
        {config.type === 'whatsapp' && (
          <WhatsAppInputField
            value={config.content.whatsapp}
            onChange={val =>
              onChange(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  whatsapp: val
                }
              }))
            }
            onGenerateQR={handleGenerateQR}
          />
        )}

        {/* Location Form */}
        {config.type === 'location' && (
          <div className="space-y-3.5">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Map Location
              </label>
              <span className="text-[11px] text-neutral-400 font-mono">
                No coordinates needed
              </span>
            </div>

            {/* Field 1: Place Name / Business / Landmark */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Place Name or Landmark
              </label>
              <div className="flex flex-col xs:flex-row gap-2">
                <Input
                  placeholder="e.g. Starbucks, Central Park, Taj Mahal"
                  value={config.content.location.placeName || config.content.location.label || ''}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        location: {
                          ...prev.content.location,
                          placeName: e.target.value,
                          label: e.target.value
                        }
                      }
                    }))
                  }
                  className="text-xs flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateQR}
                  title="Generate or update QR code"
                  className={cn(
                    "shrink-0 text-xs gap-1.5 font-semibold transition-all shadow-xs h-9",
                    isGenerated
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs shadow-orange-500/25"
                  )}
                >
                  {isGenerated ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Updated!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Create QR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Field 2: Full Address / City / Area */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Full Street Address or Area
              </label>
              <Input
                placeholder="e.g. Champ de Mars, 5 Av. Anatole France, 75007 Paris, France"
                value={config.content.location.address || ''}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      location: {
                        ...prev.content.location,
                        address: e.target.value
                      }
                    }
                  }))
                }
                className="text-xs"
              />
            </div>

            {/* Field 3: Or Paste Google Maps Link */}
            <div className="pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Or Paste Google Maps Link
                </label>
                <span className="text-[10px] text-neutral-400">
                  Direct share link
                </span>
              </div>
              <Input
                type="url"
                placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                value={config.content.location.mapsUrl || ''}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      location: {
                        ...prev.content.location,
                        mapsUrl: e.target.value
                      }
                    }
                  }))
                }
                className="font-mono text-xs"
              />
            </div>

            {/* Popular Landmarks Quick-Pick */}
            <div className="flex gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-neutral-500 self-center">Popular:</span>
              {[
                { name: 'Eiffel Tower', address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France' },
                { name: 'Times Square', address: 'Manhattan, NY 10036, United States' },
                { name: 'Taj Mahal', address: 'Dharmapuri, Forest Colony, Agra, Uttar Pradesh 282001, India' },
                { name: 'Tokyo Tower', address: '4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan' }
              ].map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        location: {
                          ...prev.content.location,
                          placeName: p.name,
                          label: p.name,
                          address: p.address,
                          mapsUrl: ''
                        }
                      }
                    }))
                  }
                  className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Live Generated Google Maps Link Preview */}
            {(() => {
              const locVal = validateAndBuildPayload('location', config.content);
              return (
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-2.5 border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                      <Info className="h-3 w-3 text-neutral-400" />
                      Generated Map URL:
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[10px] font-semibold uppercase',
                        locVal.valid
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-400 dark:text-neutral-500'
                      )}
                    >
                      {locVal.valid ? 'Google Maps Ready' : 'Awaiting Location'}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 break-all select-all font-semibold">
                    {locVal.valid ? (
                      locVal.payload
                    ) : (
                      <span className="text-neutral-400 italic font-normal">
                        {locVal.error || 'Enter place name or address above...'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed pt-0.5">
                    When scanned by Android, iPhone camera, or Google Lens, this QR code immediately triggers the <strong>"Open in Maps"</strong> action to navigate to the location.
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Calendar Event Form */}
        {config.type === 'event' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Event Name
              </label>
              <Input
                placeholder="Birthday Party / Meeting"
                value={config.content.event.title}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      event: { ...prev.content.event, title: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Location
              </label>
              <Input
                placeholder="Main Hall or Online link"
                value={config.content.event.location}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      event: { ...prev.content.event, location: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Start Time
                </label>
                <Input
                  type="datetime-local"
                  value={config.content.event.start}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        event: { ...prev.content.event, start: e.target.value }
                      }
                    }))
                  }
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  End Time
                </label>
                <Input
                  type="datetime-local"
                  value={config.content.event.end}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        event: { ...prev.content.event, end: e.target.value }
                      }
                    }))
                  }
                  className="text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Notes
              </label>
              <Textarea
                rows={2}
                placeholder="Details, schedule, or extra information..."
                value={config.content.event.description}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      event: { ...prev.content.event, description: e.target.value }
                    }
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* Social Presets Form */}
        {config.type === 'social' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Platform
              </label>
              <select
                value={config.content.social.platform}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      social: {
                        ...prev.content.social,
                        platform: e.target.value as SocialPlatform
                      }
                    }
                  }))
                }
                className="w-full h-9 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-900 dark:text-neutral-100"
              >
                <option value="instagram">Instagram (@username)</option>
                <option value="youtube">YouTube (@channel)</option>
                <option value="tiktok">TikTok (@username)</option>
                <option value="facebook">Facebook (username or page)</option>
                <option value="x">X / Twitter (@handle)</option>
                <option value="linkedin">LinkedIn (in/username)</option>
                <option value="github">GitHub (@username)</option>
                <option value="telegram">Telegram (@username)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-neutral-400 font-mono">@</span>
                <Input
                  placeholder="yourname"
                  value={config.content.social.username}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        social: { ...prev.content.social, username: e.target.value }
                      }
                    }))
                  }
                  className="pl-7 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {config.type === 'payment' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                UPI ID or Payment Address
              </label>
              <Input
                placeholder="merchant@okhdfcbank"
                value={config.content.payment.upiId}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      payment: { ...prev.content.payment, upiId: e.target.value }
                    }
                  }))
                }
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Name or Business
                </label>
                <Input
                  placeholder="Your Name or Store"
                  value={config.content.payment.name}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        payment: { ...prev.content.payment, name: e.target.value }
                      }
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Amount (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={config.content.payment.amount || ''}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        payment: { ...prev.content.payment, amount: e.target.value }
                      }
                    }))
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Note (Optional)
              </label>
              <Input
                placeholder="e.g. Order #123"
                value={config.content.payment.note || ''}
                onChange={e =>
                  onChange(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      payment: { ...prev.content.payment, note: e.target.value }
                    }
                  }))
                }
              />
            </div>
            <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
              Note: This creates a payment link. Payments are handled directly by your payment app.
            </div>
          </div>
        )}

        {/* Create / Generate QR Code Primary Button */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={handleGenerateQR}
            className={cn(
              "w-full h-10 text-xs font-semibold gap-2 shadow-xs transition-all",
              isGenerated
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            )}
          >
            {isGenerated ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Updated!</span>
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                <span>Create QR</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.config.type === next.config.type &&
    prev.config.content === next.config.content &&
    prev.onChange === next.onChange
  );
});

ContentForm.displayName = 'ContentForm';

