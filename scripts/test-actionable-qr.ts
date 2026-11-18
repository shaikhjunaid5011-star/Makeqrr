import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import {
  validateAndBuildPayload,
  toUtf8ByteString
} from '../src/lib/payload-builders';
import {
  buildGmailComposeUrl,
  buildOutlookWebComposeUrl,
  parseMailtoUrl,
  buildSmsActionHref,
  parseWifiPayload,
  parseVCardSummary,
  buildGoogleCalendarUrl
} from '../src/lib/action-dispatcher';
import { sanitizeSvgContent } from '../src/lib/logo-utils';
import { EMPTY_QR_CONTENT } from '../src/lib/storage';
import { QRContentMap } from '../src/types/qr';

function decodeQRMatrix(payload: string): string | null {
  const qr = qrcode(0, 'M');
  const utf8 = toUtf8ByteString(payload);
  qr.addData(utf8);
  qr.make();

  const count = qr.getModuleCount();
  const scale = 4;
  const size = count * scale;
  const imgData = new Uint8ClampedArray(size * size * 4);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const qrR = Math.floor(r / scale);
      const qrC = Math.floor(c / scale);
      const isDark = qr.isDark(qrR, qrC);
      const idx = (r * size + c) * 4;
      const val = isDark ? 0 : 255;
      imgData[idx] = val;
      imgData[idx + 1] = val;
      imgData[idx + 2] = val;
      imgData[idx + 3] = 255;
    }
  }

  const result = jsQR(imgData, size, size);
  if (!result) return null;

  try {
    return decodeURIComponent(
      Array.from(result.data)
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return result.data;
  }
}

function runActionSuite() {
  console.log('================================================================');
  console.log('   ACTIONABLE QR FORMATS & STANDARDS VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  }

  const baseContent: QRContentMap = {
    url: { url: 'https://example.com' },
    text: { text: 'Hello World' },
    wifi: { ssid: 'OfficeWiFi', password: 'SecretPassword!123', encryption: 'WPA', hidden: false },
    contact: {
      firstName: 'Jane',
      lastName: 'Doe',
      company: 'Acme Corp',
      title: 'Engineer',
      phone: '+15551234567',
      email: 'jane@example.com',
      website: 'example.com',
      address: '123 Main St, New York'
    },
    email: { email: 'example@email.com', subject: 'Hello', message: 'Message' },
    phone: { phone: '+919876543210' },
    sms: { phone: '+919876543210', message: 'Hello', format: 'smsto' },
    whatsapp: { countryCode: '+1', nationalNumber: '5551234567', phone: '15551234567', message: 'Hi there' },
    location: { latitude: '37.7749', longitude: '-122.4194', label: 'Coffee Shop', format: 'geo' },
    event: { title: 'Annual Summit', location: 'Convention Center', start: '2026-12-01T10:00:00Z', end: '2026-12-01T18:00:00Z', description: 'Meeting' },
    social: { platform: 'x', username: 'customqr' },
    payment: { type: 'upi', upiId: 'merchant@upi', name: 'Store', amount: '100', note: 'Order' }
  };

  // 1. Website / URL
  console.log('-- 1. Website / URL (Trigger: Open in Browser) --');
  const urlRes = validateAndBuildPayload('url', baseContent);
  assert('URL starts with https://', urlRes.payload === 'https://example.com');
  assert('URL decodes identically', decodeQRMatrix(urlRes.payload) === 'https://example.com');

  // 2. Phone Number
  console.log('\n-- 2. Phone Number (Trigger: Open Phone Dialer) --');
  const phoneRes = validateAndBuildPayload('phone', baseContent);
  assert('Phone uses tel: scheme', phoneRes.payload === 'tel:+919876543210');
  assert('Phone has no plain text prefix or vCard', !phoneRes.payload.includes('smsto:') && !phoneRes.payload.includes('BEGIN:'));
  assert('Phone decodes identically', decodeQRMatrix(phoneRes.payload) === 'tel:+919876543210');

  // 3. SMS Message
  console.log('\n-- 3. SMS Message (Trigger: Open Messaging App with Prefilled Text) --');
  const smsRes = validateAndBuildPayload('sms', baseContent);
  assert('SMS uses smsto: scheme', smsRes.payload === 'smsto:+919876543210:Hello');
  assert('SMS decodes identically', decodeQRMatrix(smsRes.payload) === 'smsto:+919876543210:Hello');

  const smsRfcContent: QRContentMap = {
    ...baseContent,
    sms: { phone: '+919876543210', message: 'Hello', format: 'rfc5724' }
  };
  const smsRfcRes = validateAndBuildPayload('sms', smsRfcContent);
  assert('SMS RFC uses sms:?body= scheme', smsRfcRes.payload === 'sms:+919876543210?body=Hello');
  assert('SMS RFC decodes identically', decodeQRMatrix(smsRfcRes.payload) === 'sms:+919876543210?body=Hello');

  // 4. Email
  console.log('\n-- 4. Email (Trigger: Open Email Client with Recipient, Subject, Body) --');
  const emailRes = validateAndBuildPayload('email', baseContent);
  const expectedEmail = 'mailto:example@email.com?subject=Hello&body=Message';
  assert('Email matches RFC 6068 mailto URI', emailRes.payload === expectedEmail);
  assert('Email decodes identically', decodeQRMatrix(emailRes.payload) === expectedEmail);

  // 4b. Email validation - reject invalid email address
  const invalidEmailContent: QRContentMap = {
    ...baseContent,
    email: { email: 'not-an-email', subject: 'Test', message: 'Hello' }
  };
  const invalidEmailRes = validateAndBuildPayload('email', invalidEmailContent);
  assert('Invalid email is safely rejected with helpful error', !invalidEmailRes.valid && !invalidEmailRes.empty);

  // 4c. Multiline body CRLF normalization for Windows Mail (RFC 6068)
  const multilineEmailContent: QRContentMap = {
    ...baseContent,
    email: { email: 'user@example.com', subject: 'Inquiry', message: 'Line 1\nLine 2\nLine 3' }
  };
  const multilineRes = validateAndBuildPayload('email', multilineEmailContent);
  assert('Multiline email encodes CRLF newlines as %0D%0A', multilineRes.payload.includes('body=Line%201%0D%0ALine%202%0D%0ALine%203'));

  // 4d. Action Dispatcher: Gmail Web & Outlook Web compose URLs
  const gmailUrl = buildGmailComposeUrl('client@example.com', 'Hello World', 'First line\nSecond line');
  assert('Gmail Web compose URL has recipient, subject and body', gmailUrl.includes('to=client%40example.com') && gmailUrl.includes('su=Hello%20World') && gmailUrl.includes('view=cm'));

  const outlookUrl = buildOutlookWebComposeUrl('client@example.com', 'Meeting', 'Details');
  assert('Outlook Web compose URL is properly formatted', outlookUrl.includes('to=client%40example.com') && outlookUrl.includes('subject=Meeting'));

  const parsedMail = parseMailtoUrl(multilineRes.payload);
  assert('parseMailtoUrl extracts recipient and subject', parsedMail.to === 'user@example.com' && parsedMail.subject === 'Inquiry');

  // 5. Wi-Fi Credentials
  console.log('\n-- 5. Wi-Fi (Trigger: Join Network Prompt) --');
  const wifiRes = validateAndBuildPayload('wifi', baseContent);
  const expectedWifi = 'WIFI:T:WPA;S:OfficeWiFi;P:SecretPassword!123;;';
  assert('Wi-Fi follows standard WIFI:T:WPA;S:..;P:..;; format', wifiRes.payload === expectedWifi);
  assert('Wi-Fi decodes identically', decodeQRMatrix(wifiRes.payload) === expectedWifi);

  const parsedWifi = parseWifiPayload(wifiRes.payload);
  assert('parseWifiPayload extracts SSID, password and encryption', parsedWifi.ssid === 'OfficeWiFi' && parsedWifi.password === 'SecretPassword!123' && parsedWifi.encryption === 'WPA');

  // 6. Contact / vCard
  console.log('\n-- 6. Contact / vCard (Trigger: Add Contact Prompt) --');
  const contactRes = validateAndBuildPayload('contact', baseContent);
  assert('vCard begins with BEGIN:VCARD', contactRes.payload.startsWith('BEGIN:VCARD'));
  assert('vCard ends with END:VCARD', contactRes.payload.endsWith('END:VCARD'));
  assert('vCard contains structured TEL and EMAIL', contactRes.payload.includes('TEL;TYPE=CELL,VOICE:+15551234567') && contactRes.payload.includes('EMAIL;TYPE=INTERNET:jane@example.com'));
  assert('vCard decodes with full integrity', decodeQRMatrix(contactRes.payload) === contactRes.payload);

  // 7. Location (Place Name, Full Address, and Google Maps URL)
  console.log('\n-- 7. Location (Trigger: Open in Maps App via Place Name, Address, or URL) --');
  
  // 7a. Place Name + Address (No coordinates needed!)
  const locPlaceAddress: QRContentMap = {
    ...baseContent,
    location: {
      placeName: 'Eiffel Tower',
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France'
    }
  };
  const locPlaceRes = validateAndBuildPayload('location', locPlaceAddress);
  const expectedPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Eiffel Tower, Champ de Mars, 5 Av. Anatole France, 75007 Paris, France')}`;
  assert('Location builds Google Maps search URL from place name and address without coordinates', locPlaceRes.payload === expectedPlaceUrl);
  assert('Location place and address decodes identically', decodeQRMatrix(locPlaceRes.payload) === expectedPlaceUrl);

  // 7b. Place Name only
  const locNameOnly: QRContentMap = {
    ...baseContent,
    location: { placeName: 'Central Park, NY' }
  };
  const locNameRes = validateAndBuildPayload('location', locNameOnly);
  const expectedNameUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Central Park, NY')}`;
  assert('Location with only place name generates valid Google Maps URL', locNameRes.payload === expectedNameUrl);

  // 7c. Direct Google Maps URL pasted by user
  const locDirectUrl: QRContentMap = {
    ...baseContent,
    location: { mapsUrl: 'https://maps.app.goo.gl/9bYzR8WXYZ' }
  };
  const locDirectRes = validateAndBuildPayload('location', locDirectUrl);
  assert('Pasted Google Maps URL is preserved directly', locDirectRes.payload === 'https://maps.app.goo.gl/9bYzR8WXYZ');
  assert('Pasted Google Maps URL decodes identically', decodeQRMatrix(locDirectRes.payload) === 'https://maps.app.goo.gl/9bYzR8WXYZ');

  // 7d. Empty location validation
  const locEmpty: QRContentMap = {
    ...baseContent,
    location: { placeName: '', address: '', mapsUrl: '', latitude: '', longitude: '' }
  };
  const locEmptyRes = validateAndBuildPayload('location', locEmpty);
  assert('Empty location is safely rejected with helpful message', !locEmptyRes.valid && locEmptyRes.empty);

  // 8. Plain Text
  console.log('\n-- 8. Plain Text (Trigger: Display Raw Content) --');
  const textRes = validateAndBuildPayload('text', baseContent);
  assert('Plain text is preserved verbatim without unwanted prefixes', textRes.payload === 'Hello World');
  assert('Plain text decodes identically', decodeQRMatrix(textRes.payload) === 'Hello World');

  // 9. Calendar Event
  console.log('\n-- 9. Calendar Event (Trigger: Add to Calendar Prompt) --');
  const eventRes = validateAndBuildPayload('event', baseContent);
  assert('Event follows iCalendar standard', eventRes.payload.startsWith('BEGIN:VCALENDAR') && eventRes.payload.includes('BEGIN:VEVENT'));
  assert('Event decodes identically', decodeQRMatrix(eventRes.payload) === eventRes.payload);

  // 10. Security Hardening & Malicious URI / XSS Protection
  console.log('\n-- 10. Security Hardening (XSS, Malicious Schemes, CRLF Injection, SVG Sanitizer) --');
  const xssUrlRes = validateAndBuildPayload('url', {
    ...baseContent,
    url: { url: 'javascript:alert(document.cookie)' }
  });
  assert('Blocks javascript: URI scheme in URL QR', !xssUrlRes.valid && xssUrlRes.payload === '');

  const dataUrlRes = validateAndBuildPayload('url', {
    ...baseContent,
    url: { url: 'data:text/html,<script>alert(1)</script>' }
  });
  assert('Blocks data: URI scheme in URL QR', !dataUrlRes.valid && dataUrlRes.payload === '');

  const crlfContactRes = validateAndBuildPayload('contact', {
    ...baseContent,
    contact: {
      ...baseContent.contact,
      phone: '+15551234567\r\nNOTE:InjectedHeader'
    }
  });
  assert('Strips CRLF injection from Contact phone field', crlfContactRes.valid && !crlfContactRes.payload.includes('\r\nNOTE:InjectedHeader'));

  const dirtySvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>evil()</script><foreignObject><iframe></iframe></foreignObject><a href="javascript:alert(2)"><circle cx="10" cy="10" r="5" onclick="steal()" /></a></svg>`;
  const cleanSvg = sanitizeSvgContent(dirtySvg);
  assert(
    'SVG Sanitizer strips <script>, <foreignObject>, on* attributes, and javascript: links',
    !cleanSvg.includes('<script') &&
      !cleanSvg.includes('<foreignObject') &&
      !cleanSvg.includes('onload=') &&
      !cleanSvg.includes('onclick=') &&
      !cleanSvg.includes('javascript:')
  );

  // 11. Windows / Desktop Clickable SMS Action Href & Clear All Blank State
  console.log('\n-- 11. Windows Clickable SMS Action & Clear All Blank State --');
  const smsHref = buildSmsActionHref('+91 98765-43210', 'Hello World');
  assert('buildSmsActionHref generates RFC 5724 sms: link for clickable anchors', smsHref === 'sms:+919876543210?body=Hello%20World');

  const emptyUrlVal = validateAndBuildPayload('url', EMPTY_QR_CONTENT);
  const emptyLocVal = validateAndBuildPayload('location', EMPTY_QR_CONTENT);
  assert('EMPTY_QR_CONTENT resets both URL and Location to empty state on Clear All', emptyUrlVal.empty && emptyLocVal.empty);

  console.log(`\n================================================================`);
  console.log(`ACTIONABLE QR SUITE SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`================================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runActionSuite();
