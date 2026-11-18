/**
 * Action Dispatcher & Windows Compatibility Helpers
 * Provides robust URI generation, Windows desktop protocol handling,
 * webmail fallbacks (Gmail/Outlook Web), vCard and iCalendar file downloads.
 */

export interface ParsedEmailData {
  to: string;
  subject: string;
  body: string;
}

export interface ParsedWifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass' | 'WPA3' | string;
  hidden: boolean;
}

export interface ParsedContactData {
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

/**
 * Detects whether the current browser is running on Windows (Windows 10, 11, etc.)
 */
export function isWindowsPlatform(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform =
    (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    navigator.platform ||
    '';
  return /Win/i.test(platform) || /Windows/i.test(ua);
}

/**
 * Generates an RFC 6068 compliant mailto URL.
 * Normalizes newlines to \r\n (CRLF) for Windows Mail/Outlook multiline compatibility.
 * Encodes spaces as %20.
 */
export function buildMailtoUrl(to: string, subject?: string, body?: string): string {
  const cleanTo = (to || '').trim();
  const params: string[] = [];

  if (subject && subject.trim()) {
    params.push(`subject=${encodeURIComponent(subject.trim()).replace(/\+/g, '%20')}`);
  }

  if (body && body.trim()) {
    // RFC 6068: CRLF line breaks for mail body
    const normalizedBody = body.trim().replace(/\r?\n/g, '\r\n');
    params.push(`body=${encodeURIComponent(normalizedBody).replace(/\+/g, '%20')}`);
  }

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${cleanTo}${query}`;
}

/**
 * Generates a Gmail Web compose URL with prefilled recipient, subject and body.
 */
export function buildGmailComposeUrl(to: string, subject?: string, body?: string): string {
  const params: string[] = ['view=cm', 'fs=1'];
  if (to && to.trim()) params.push(`to=${encodeURIComponent(to.trim())}`);
  if (subject && subject.trim()) params.push(`su=${encodeURIComponent(subject.trim())}`);
  if (body && body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  return `https://mail.google.com/mail/?${params.join('&')}`;
}

/**
 * Generates an Outlook.com Web compose URL with prefilled recipient, subject and body.
 */
export function buildOutlookWebComposeUrl(to: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (to && to.trim()) params.push(`to=${encodeURIComponent(to.trim())}`);
  if (subject && subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
  if (body && body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `https://outlook.live.com/mail/0/deeplink/compose${query}`;
}

/**
 * Parses an existing mailto URL into its component parts.
 */
export function parseMailtoUrl(mailto: string): ParsedEmailData {
  if (!mailto || !mailto.startsWith('mailto:')) {
    return { to: '', subject: '', body: '' };
  }

  const withoutScheme = mailto.slice('mailto:'.length);
  const qIndex = withoutScheme.indexOf('?');
  const to = qIndex >= 0 ? withoutScheme.slice(0, qIndex) : withoutScheme;
  let subject = '';
  let body = '';

  if (qIndex >= 0) {
    const query = withoutScheme.slice(qIndex + 1);
    const params = new URLSearchParams(query);
    subject = params.get('subject') || '';
    body = params.get('body') || '';
  }

  return {
    to: decodeURIComponent(to),
    subject,
    body
  };
}

/**
 * Generates an RFC 5724 compliant `sms:` clickable URI for HTML anchor tags (`<a href="...">`).
 * Desktop browsers (Windows 10/11 Chrome, Edge, Firefox) and mobile browsers require `sms:`
 * rather than `smsto:` when clicking a link in the UI.
 */
export function buildSmsActionHref(phone: string, message?: string): string {
  const cleanPhone = (phone || '').trim().replace(/^(?:tel|smsto|sms):+/i, '').replace(/[^\d+]/g, '');
  if (!cleanPhone) return 'sms:';
  const cleanMsg = (message || '').trim();
  if (!cleanMsg) return `sms:${cleanPhone}`;
  return `sms:${cleanPhone}?body=${encodeURIComponent(cleanMsg).replace(/\+/g, '%20')}`;
}

/**
 * Generates a Google Calendar Web event creation URL.
 */
export function buildGoogleCalendarUrl(event: {
  title: string;
  location?: string;
  start?: string;
  end?: string;
  description?: string;
}): string {
  const params: string[] = ['action=TEMPLATE'];
  if (event.title) params.push(`text=${encodeURIComponent(event.title)}`);
  if (event.description) params.push(`details=${encodeURIComponent(event.description)}`);
  if (event.location) params.push(`location=${encodeURIComponent(event.location)}`);

  if (event.start || event.end) {
    const formatCalDate = (isoStr: string) => {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const s = event.start ? formatCalDate(event.start) : '';
    const e = event.end ? formatCalDate(event.end) : s;
    if (s && e) {
      params.push(`dates=${s}/${e}`);
    }
  }

  return `https://calendar.google.com/calendar/render?${params.join('&')}`;
}

/**
 * Triggers browser download of a vCard (.vcf) file.
 * Windows Contacts, Microsoft Outlook, and macOS/iOS Contacts natively open this file on click.
 */
export function downloadVCardFile(vcardPayload: string, filename = 'contact.vcf'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const blob = new Blob([vcardPayload], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.vcf') ? filename : `${filename}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to download vCard file:', err);
    return false;
  }
}

/**
 * Triggers browser download of an iCalendar (.ics) file.
 * Windows Calendar, Outlook, and Google Calendar natively open this file.
 */
export function downloadICalendarFile(icsPayload: string, filename = 'event.ics'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const blob = new Blob([icsPayload], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to download iCalendar file:', err);
    return false;
  }
}

/**
 * Parses Wi-Fi ZXing payload string (WIFI:T:WPA;S:MySSID;P:password;H:false;;)
 */
export function parseWifiPayload(payload: string): ParsedWifiData {
  let ssid = '';
  let password = '';
  let encryption = 'WPA';
  let hidden = false;

  if (payload && payload.startsWith('WIFI:')) {
    const unescapeWifi = (str: string) => str.replace(/\\([\\;,:"])/g, '$1');

    const sMatch = payload.match(/(?:^|;)S:((?:\\;|[^;])*)/);
    if (sMatch) ssid = unescapeWifi(sMatch[1]);

    const pMatch = payload.match(/(?:^|;)P:((?:\\;|[^;])*)/);
    if (pMatch) password = unescapeWifi(pMatch[1]);

    const tMatch = payload.match(/(?:^|;)T:([^;]*)/);
    if (tMatch) encryption = tMatch[1] || 'WPA';

    const hMatch = payload.match(/(?:^|;)H:(true|false)/i);
    if (hMatch) hidden = hMatch[1].toLowerCase() === 'true';
  }

  return { ssid, password, encryption, hidden };
}

/**
 * Parses summary information from a vCard payload string.
 */
export function parseVCardSummary(payload: string): ParsedContactData {
  let name = '';
  let company = '';
  let title = '';
  let phone = '';
  let email = '';
  let website = '';
  let address = '';

  const unescapeV = (str: string) => str.replace(/\\([\\;,])/g, '$1').replace(/\\n/g, '\n');

  const lines = payload.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('FN:')) {
      name = unescapeV(line.slice(3));
    } else if (line.startsWith('ORG:')) {
      company = unescapeV(line.slice(4));
    } else if (line.startsWith('TITLE:')) {
      title = unescapeV(line.slice(6));
    } else if (line.startsWith('TEL')) {
      const col = line.indexOf(':');
      if (col >= 0) phone = line.slice(col + 1).trim();
    } else if (line.startsWith('EMAIL')) {
      const col = line.indexOf(':');
      if (col >= 0) email = line.slice(col + 1).trim();
    } else if (line.startsWith('URL:')) {
      website = line.slice(4).trim();
    } else if (line.startsWith('ADR')) {
      const col = line.indexOf(':');
      if (col >= 0) {
        const parts = line.slice(col + 1).split(';');
        const street = parts[2] || '';
        address = unescapeV(street || parts.filter(Boolean).join(', '));
      }
    }
  }

  return { name: name || 'Contact', company, title, phone, email, website, address };
}
