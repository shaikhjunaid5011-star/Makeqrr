import { QRType, QRContentMap, ErrorCorrectionLevel } from '../types/qr';
import {
  findCountry,
  validatePhoneNumber,
  buildWhatsAppPhoneNumber,
  parseFullPhoneNumber
} from './country-codes';

/**
 * Converts any JavaScript string (containing Unicode, emojis, Hindi, international characters, etc.)
 * into a Latin-1 byte string representing its true UTF-8 encoding.
 *
 * This is crucial because standard QR Byte-mode encoders (including qrcode-generator and qr-code-styling)
 * treat characters by taking `charCodeAt(i) & 0xff`. Without this conversion, any character with code > 255
 * has its upper byte truncated, completely corrupting non-ASCII characters.
 */
export function toUtf8ByteString(str: string): string {
  if (!str) return '';
  return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
}

/**
 * Sanitizes and normalizes phone numbers for TEL and SMS QR codes.
 * - Strips any accidental URI schemes (tel:, smsto:, sms:)
 * - Extracts only the phone number portion if combined payload was pasted
 * - Preserves leading '+' for international E.164 numbers (e.g. +919876543210)
 * - Removes spaces, dashes, parentheses, dots
 * - Guarantees only valid telephone dial characters
 */
export function sanitizePhoneNumber(input: string): string {
  if (!input) return '';
  let str = input.trim();
  // Strip any accidental URI schemes (tel:, smsto:, sms:)
  str = str.replace(/^(?:tel|smsto|sms):+/i, '');
  // If user pasted a combined string like smsto:+91987...:message or sms:+91...?body=...
  if (str.includes(':')) {
    str = str.split(':')[0];
  }
  if (str.includes('?')) {
    str = str.split('?')[0];
  }
  // Strip query params, hash, or extensions if any
  str = str.replace(/[#&;].*$/, '');
  const hasPlus = str.startsWith('+');
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Safely encodes URI components without double-encoding already percent-encoded values.
 * Handles both plain strings and strings with existing %20 or international sequences.
 */
export function safeEncodeURIComponent(str: string): string {
  if (!str) return '';
  try {
    const decoded = decodeURIComponent(str);
    return encodeURIComponent(decoded).replace(/\+/g, '%20');
  } catch {
    return encodeURIComponent(str).replace(/\+/g, '%20');
  }
}

/**
 * Returns the maximum payload capacity in bytes for QR code version 40 at each error correction level.
 */
export function getMaxByteCapacity(ec: ErrorCorrectionLevel = 'M'): number {
  switch (ec) {
    case 'L': return 2953;
    case 'M': return 2331;
    case 'Q': return 1663;
    case 'H': return 1273;
    default: return 2331;
  }
}

/**
 * Estimates the module count (N x N) for a given payload byte length and error correction level.
 */
export function estimateQRModuleCount(byteLength: number, ec: ErrorCorrectionLevel = 'M'): number {
  const versionCapacities: [number, number, number, number][] = [
    [19, 16, 13, 9],     // V1 (21x21)
    [34, 28, 22, 16],    // V2 (25x25)
    [55, 44, 34, 26],    // V3 (29x29)
    [80, 64, 48, 36],    // V4 (33x33)
    [108, 86, 62, 46],   // V5 (37x37)
    [136, 108, 76, 60],  // V6 (41x41)
    [156, 124, 88, 66],  // V7 (45x45)
    [194, 154, 110, 86], // V8 (49x49)
    [232, 182, 132, 100],// V9 (53x53)
    [274, 216, 154, 122],// V10 (57x57)
    [324, 254, 180, 140],// V11 (61x61)
    [370, 290, 206, 158],// V12 (65x65)
    [428, 334, 244, 180],// V13 (69x69)
    [461, 365, 261, 197],// V14 (73x73)
    [520, 415, 295, 223],// V15 (77x77)
    [584, 453, 325, 253],// V16 (81x81)
    [644, 507, 367, 283],// V17 (85x85)
    [718, 563, 397, 313],// V18 (89x89)
    [792, 627, 445, 341],// V19 (93x93)
    [858, 669, 485, 385],// V20 (97x97)
    [929, 714, 512, 406],// V21 (101x101)
    [1003, 782, 568, 442],// V22 (105x105)
    [1091, 860, 614, 464],// V23 (109x109)
    [1171, 914, 664, 514],// V24 (113x113)
    [1273, 1000, 718, 538],// V25 (117x117)
    [1367, 1062, 754, 596],// V26 (121x121)
    [1465, 1128, 808, 628],// V27 (125x125)
    [1528, 1193, 871, 661],// V28 (129x129)
    [1628, 1267, 911, 701],// V29 (133x133)
    [1732, 1373, 985, 745],// V30 (137x137)
    [1840, 1455, 1054, 793],// V31 (141x141)
    [1952, 1541, 1096, 845],// V32 (145x145)
    [2068, 1631, 1142, 901],// V33 (149x149)
    [2188, 1725, 1222, 961],// V34 (153x153)
    [2303, 1812, 1276, 986],// V35 (157x157)
    [2431, 1914, 1354, 1054],// V36 (161x161)
    [2563, 2018, 1426, 1096],// V37 (165x165)
    [2699, 2126, 1502, 1142],// V38 (169x169)
    [2809, 2213, 1582, 1222],// V39 (173x173)
    [2953, 2331, 1663, 1273] // V40 (177x177)
  ];

  const ecIdx = ec === 'L' ? 0 : ec === 'M' ? 1 : ec === 'Q' ? 2 : 3;
  let version = 1;
  for (let i = 0; i < versionCapacities.length; i++) {
    if (byteLength <= versionCapacities[i][ecIdx]) {
      version = i + 1;
      break;
    }
    if (i === versionCapacities.length - 1) {
      version = 40;
    }
  }

  return 21 + 4 * (version - 1);
}

export interface QRValidationResult {
  valid: boolean;
  empty: boolean;
  error?: string;
  payload: string;
}

/**
 * Escapes special characters for Wi-Fi SSID and Password fields.
 * The standard Wi-Fi QR spec escapes \, ;, ,, :, "
 */
export function escapeWifi(str: string): string {
  if (!str) return '';
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Escapes characters for vCard and iCalendar text fields.
 * Special characters ; , \ are backslash-escaped. Newlines become \n.
 */
export function escapeVCard(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Formats a date string into iCalendar UTC ISO format (YYYYMMDDTHHMMSSZ).
 */
export function formatCalendarDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Validates and constructs the exact standards-compliant payload for a given QR type.
 * Returns valid=false and empty=true if the user has not entered content yet.
 */
export function validateAndBuildPayload(
  type: QRType,
  content: QRContentMap,
  ec: ErrorCorrectionLevel = 'M'
): QRValidationResult {
  let payload = '';

  switch (type) {
    case 'url': {
      const raw = (content.url?.url || '').trim();
      if (!raw || raw === 'https://' || raw === 'http://') {
        return { valid: false, empty: true, error: 'Please enter a website link', payload: '' };
      }
      // Block dangerous script/data/file URI schemes
      if (/^(?:javascript|data|vbscript|file|blob|about):/i.test(raw)) {
        return { valid: false, empty: false, error: 'Unsafe link protocol blocked. Please enter an http:// or https:// website URL.', payload: '' };
      }
      if (/\s/.test(raw)) {
        return { valid: false, empty: false, error: 'Website URLs cannot contain spaces', payload: '' };
      }
      let url = raw;
      if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return { valid: false, empty: false, error: 'Only http:// and https:// website links are supported', payload: '' };
        }
        const host = parsed.hostname;
        if (!host || (!host.includes('.') && host !== 'localhost') || host.startsWith('.') || host.endsWith('.')) {
          return { valid: false, empty: false, error: 'Please enter a valid website domain (e.g. example.com)', payload: '' };
        }
      } catch {
        return { valid: false, empty: false, error: 'Please enter a valid website URL', payload: '' };
      }
      payload = url;
      break;
    }

    case 'text': {
      const text = content.text?.text ?? '';
      if (!text || text.trim() === '') {
        return { valid: false, empty: true, error: 'Please enter some text', payload: '' };
      }
      payload = text;
      break;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = content.wifi || {};
      const cleanSsid = (ssid || '').trim();
      if (!cleanSsid) {
        return { valid: false, empty: true, error: 'Please enter the Wi-Fi Network Name (SSID)', payload: '' };
      }
      const enc = encryption === 'nopass' ? 'nopass' : encryption === 'WEP' ? 'WEP' : 'WPA';
      let wifiPayload = `WIFI:T:${enc};S:${escapeWifi(cleanSsid)};`;
      if (enc !== 'nopass' && password) {
        wifiPayload += `P:${escapeWifi(password)};`;
      }
      if (hidden) {
        wifiPayload += 'H:true;';
      }
      wifiPayload += ';';
      payload = wifiPayload;
      break;
    }

    case 'contact': {
      const c = content.contact || {};
      const firstName = (c.firstName || '').trim();
      const lastName = (c.lastName || '').trim();
      const org = (c.company || '').trim();
      const phone = (c.phone || '').replace(/[\r\n]+/g, '').trim();
      const email = (c.email || '').replace(/[\r\n]+/g, '').trim();
      const title = (c.title || '').trim();
      const website = (c.website || '').replace(/[\r\n]+/g, '').trim();
      const address = (c.address || '').trim();

      const fn = `${firstName} ${lastName}`.trim() || firstName || lastName || org;
      if (!fn && !phone && !email) {
        return { valid: false, empty: true, error: 'Please enter at least a name, phone number, or email', payload: '' };
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valid: false, empty: false, error: 'Please enter a valid contact email address', payload: '' };
      }

      if (website && /^(?:javascript|data|vbscript|file|blob):/i.test(website)) {
        return { valid: false, empty: false, error: 'Please enter a valid http/https contact website', payload: '' };
      }

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
        `FN:${escapeVCard(fn || 'Contact')}`
      ];
      if (org) lines.push(`ORG:${escapeVCard(org)}`);
      if (title) lines.push(`TITLE:${escapeVCard(title)}`);
      if (phone) lines.push(`TEL;TYPE=CELL,VOICE:${phone}`);
      if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
      if (website) {
        const webUrl = /^https?:\/\//i.test(website) ? website : `https://${website}`;
        lines.push(`URL:${webUrl}`);
      }
      if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);
      lines.push('END:VCARD');
      payload = lines.join('\r\n');
      break;
    }

    case 'email': {
      const { email, subject, message } = content.email || {};
      const cleanEmail = (email || '').trim();
      if (!cleanEmail) {
        return { valid: false, empty: true, error: 'Please enter an email address', payload: '' };
      }
      // Validate email format (single recipient or comma/semicolon-separated list)
      const emailList = cleanEmail.split(/[,;]/).map(e => e.trim()).filter(Boolean);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailList.length === 0 || !emailList.every(e => emailRegex.test(e))) {
        return {
          valid: false,
          empty: false,
          error: 'Please enter a valid email address (e.g. name@example.com)',
          payload: ''
        };
      }
      const params: string[] = [];
      if (subject?.trim()) {
        params.push(`subject=${encodeURIComponent(subject.trim()).replace(/\+/g, '%20')}`);
      }
      if (message?.trim()) {
        // RFC 6068: normalize line breaks to \r\n (CRLF) for Windows Mail, Outlook, and desktop email clients
        const normalizedBody = message.trim().replace(/\r?\n/g, '\r\n');
        params.push(`body=${encodeURIComponent(normalizedBody).replace(/\+/g, '%20')}`);
      }
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      payload = `mailto:${emailList.join(',')}${query}`;
      break;
    }

    case 'phone': {
      const { phone, countryCode, nationalNumber } = content.phone || {};
      let cleanDial = '';
      if (countryCode && nationalNumber) {
        const digits = nationalNumber.replace(/\D/g, '');
        const code = countryCode.startsWith('+') ? countryCode : `+${countryCode.replace(/\D/g, '')}`;
        if (digits) {
          cleanDial = `${code}${digits}`;
        }
      }
      if (!cleanDial && phone) {
        cleanDial = phone;
      }
      const sanitized = sanitizePhoneNumber(cleanDial);
      if (!sanitized) {
        return { valid: false, empty: true, error: 'Please enter a valid phone number', payload: '' };
      }
      // Pure TEL URI - strictly contains only the telephone number, no SMS, vCard, or extra parameters
      payload = `tel:${sanitized}`;
      break;
    }

    case 'sms': {
      const { phone, message, format } = content.sms || {};
      const cleanPhone = sanitizePhoneNumber(phone || '');
      if (!cleanPhone) {
        return { valid: false, empty: true, error: 'Please enter a valid recipient phone number', payload: '' };
      }
      const rawMsg = (message ?? '').trim();
      const isRfc = format === 'rfc5724';

      if (isRfc) {
        // RFC 5724 standard: sms:<phone>?body=<encoded_message>
        // Spaces are %20, reserved characters and unicode are properly percent-encoded without double-encoding
        if (rawMsg) {
          payload = `sms:${cleanPhone}?body=${safeEncodeURIComponent(rawMsg)}`;
        } else {
          payload = `sms:${cleanPhone}`;
        }
      } else {
        // Universal / ZXing format: smsto:<phone>:<message>
        // e.g. smsto:+919876543210:Kuch nahi bs ayese hi
        // Message is preserved cleanly after the colon
        if (rawMsg) {
          payload = `smsto:${cleanPhone}:${rawMsg}`;
        } else {
          payload = `smsto:${cleanPhone}`;
        }
      }
      break;
    }

    case 'whatsapp': {
      const wa = content.whatsapp || {};
      const { message } = wa;
      let countryCode = (wa.countryCode || '').trim();
      let nationalNumber = wa.nationalNumber !== undefined ? wa.nationalNumber.trim() : '';

      // If user provided a combined phone starting with + (e.g. from smart paste or legacy test objects)
      if (!countryCode && wa.phone && wa.phone.trim().startsWith('+')) {
        const parsed = parseFullPhoneNumber(wa.phone);
        countryCode = parsed.dialCode;
        nationalNumber = parsed.nationalNumber;
      }

      // Mandatory Country Code: Never assume automatically, never make optional
      if (!countryCode) {
        return {
          valid: false,
          empty: !nationalNumber && !wa.phone?.trim(),
          error: 'Please select a country code for WhatsApp (e.g. +91)',
          payload: ''
        };
      }

      const country = findCountry(countryCode);
      const cleanDialCode = countryCode.replace(/\D/g, '');
      if (!cleanDialCode) {
        return {
          valid: false,
          empty: false,
          error: 'Please select a valid country code',
          payload: ''
        };
      }

      // Clean nationalNumber and handle duplicate country code or leading zeros
      if (nationalNumber) {
        let cleanNat = nationalNumber.replace(/\D/g, '');
        if (cleanNat.startsWith(cleanDialCode) && cleanNat.length > (country?.maxLength || 10)) {
          cleanNat = cleanNat.slice(cleanDialCode.length);
        }
        if (cleanNat.startsWith('0')) {
          cleanNat = cleanNat.replace(/^0+/, '');
        }
        nationalNumber = cleanNat;
      } else if (wa.phone) {
        let cleanRaw = wa.phone.replace(/\D/g, '');
        if (cleanRaw.startsWith(cleanDialCode) && cleanRaw.length > (country?.maxLength || 10)) {
          nationalNumber = cleanRaw.slice(cleanDialCode.length);
        } else {
          nationalNumber = cleanRaw;
        }
        if (nationalNumber.startsWith('0')) {
          nationalNumber = nationalNumber.replace(/^0+/, '');
        }
      }

      // Validate national phone number according to selected country's numbering rules
      const numValidation = validatePhoneNumber(nationalNumber, country);
      if (!numValidation.isValid) {
        return {
          valid: false,
          empty: numValidation.status === 'empty',
          error: numValidation.status === 'empty'
            ? `Please enter a WhatsApp phone number for ${country.name}`
            : numValidation.message,
          payload: ''
        };
      }

      // Combine country code and phone number: digits only, NO '+', no spaces or dashes
      const combinedDigits = buildWhatsAppPhoneNumber(countryCode, nationalNumber, country);
      if (!combinedDigits) {
        return {
          valid: false,
          empty: true,
          error: 'Please enter a valid WhatsApp phone number',
          payload: ''
        };
      }

      const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
      payload = `https://wa.me/${combinedDigits}${text}`;
      break;
    }

    case 'location': {
      const loc = content.location || {};
      const mapsUrl = (loc.mapsUrl || '').trim();
      const placeName = (loc.placeName || loc.label || '').trim();
      const address = (loc.address || '').trim();
      const lat = (loc.latitude || '').trim();
      const lng = (loc.longitude || '').trim();

      // Priority 1: User pasted a direct Maps URL (Google Maps, Apple Maps, or geo URL)
      if (mapsUrl) {
        let cleanUrl = mapsUrl;
        // If user omitted https:// on a domain like maps.google.com or goo.gl
        if (/^(?:maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|google\.[a-z.]+\/maps)/i.test(cleanUrl)) {
          cleanUrl = 'https://' + cleanUrl;
        }

        // Validate that it looks like a valid URL or geo scheme
        if (/^https?:\/\//i.test(cleanUrl) || /^geo:/i.test(cleanUrl)) {
          payload = cleanUrl;
          break;
        } else {
          return {
            valid: false,
            empty: false,
            error: 'Please enter a valid Google Maps link (e.g. https://maps.app.goo.gl/...)',
            payload: ''
          };
        }
      }

      // Priority 2: Place Name and/or Full Address (NO coordinates needed!)
      // Combine Place Name and Address if both are provided for maximum accuracy
      const locationQueryParts: string[] = [];
      if (placeName) locationQueryParts.push(placeName);
      if (address && address.toLowerCase() !== placeName.toLowerCase()) {
        locationQueryParts.push(address);
      }
      const combinedLocationQuery = locationQueryParts.join(', ').trim();

      if (combinedLocationQuery) {
        // Build universal Google Maps search URL which opens native Google Maps app or Apple Maps seamlessly
        payload = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(combinedLocationQuery)}`;
        break;
      }

      // Priority 3: Optional coordinates fallback (if coordinates were entered)
      if (lat || lng) {
        if (!lat || !lng) {
          return { valid: false, empty: false, error: 'Both latitude and longitude are required when using coordinates', payload: '' };
        }
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (isNaN(numLat) || numLat < -90 || numLat > 90) {
          return { valid: false, empty: false, error: 'Latitude must be a valid number between -90 and 90', payload: '' };
        }
        if (isNaN(numLng) || numLng < -180 || numLng > 180) {
          return { valid: false, empty: false, error: 'Longitude must be a valid number between -180 and 180', payload: '' };
        }

        if (loc.format === 'geo') {
          payload = `geo:${lat},${lng}`;
        } else {
          payload = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        }
        break;
      }

      // Nothing entered
      return {
        valid: false,
        empty: true,
        error: 'Please enter a place name, full address, or Google Maps link',
        payload: ''
      };
    }

    case 'event': {
      const e = content.event || {};
      const title = (e.title || '').trim();
      if (!title) {
        return { valid: false, empty: true, error: 'Please enter an event title', payload: '' };
      }
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${escapeVCard(title)}`
      ];
      if (e.location?.trim()) lines.push(`LOCATION:${escapeVCard(e.location.trim())}`);
      if (e.start) {
        const start = formatCalendarDate(e.start);
        if (start) lines.push(`DTSTART:${start}`);
      }
      if (e.end) {
        const end = formatCalendarDate(e.end);
        if (end) lines.push(`DTEND:${end}`);
      }
      if (e.description?.trim()) lines.push(`DESCRIPTION:${escapeVCard(e.description.trim())}`);
      lines.push('END:VEVENT', 'END:VCALENDAR');
      payload = lines.join('\r\n');
      break;
    }

    case 'social': {
      const { platform, username } = content.social || {};
      const user = (username || '').replace(/^@/, '').trim();
      if (!user) {
        return { valid: false, empty: true, error: 'Please enter a username or profile handle', payload: '' };
      }
      switch (platform) {
        case 'instagram': payload = `https://instagram.com/${user}`; break;
        case 'youtube': payload = `https://youtube.com/@${user}`; break;
        case 'tiktok': payload = `https://tiktok.com/@${user}`; break;
        case 'facebook': payload = `https://facebook.com/${user}`; break;
        case 'x': payload = `https://x.com/${user}`; break;
        case 'linkedin': payload = `https://linkedin.com/in/${user}`; break;
        case 'github': payload = `https://github.com/${user}`; break;
        case 'telegram': payload = `https://t.me/${user}`; break;
        default: payload = `https://${user}`;
      }
      break;
    }

    case 'payment': {
      const { upiId, name, amount, note } = content.payment || {};
      const cleanUpi = (upiId || '').trim();
      if (!cleanUpi) {
        return { valid: false, empty: true, error: 'Please enter a valid UPI ID (e.g. name@upi)', payload: '' };
      }
      const params: string[] = [];
      params.push(`pa=${encodeURIComponent(cleanUpi)}`);
      params.push(`pn=${encodeURIComponent((name || 'Merchant').trim())}`);
      if (amount?.trim()) params.push(`am=${encodeURIComponent(amount.trim())}`);
      if (note?.trim()) params.push(`tn=${encodeURIComponent(note.trim())}`);
      params.push('cu=INR');
      payload = `upi://pay?${params.join('&')}`;
      break;
    }

    default:
      return { valid: false, empty: true, error: 'Unsupported QR type', payload: '' };
  }

  // Capacity safety check
  const utf8Bytes = toUtf8ByteString(payload).length;
  const maxBytes = getMaxByteCapacity(ec);
  if (utf8Bytes > maxBytes) {
    return {
      valid: false,
      empty: false,
      error: `Content is too long for QR Code (${utf8Bytes} bytes exceeds ${maxBytes} byte limit at Error Correction ${ec}). Please shorten text or reduce error correction level.`,
      payload
    };
  }

  return { valid: true, empty: false, payload };
}

/**
 * Builds the payload for a given type, falling back to a safe empty string or initial starter
 * if user content is empty.
 */
export function buildQRPayload(type: QRType, content: QRContentMap, ec: ErrorCorrectionLevel = 'M'): string {
  const result = validateAndBuildPayload(type, content, ec);
  return result.payload;
}
