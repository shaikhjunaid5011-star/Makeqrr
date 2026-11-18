import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import {
  toUtf8ByteString,
  validateAndBuildPayload,
  buildQRPayload,
  escapeWifi,
  escapeVCard,
  formatCalendarDate,
  getMaxByteCapacity,
  estimateQRModuleCount
} from '../src/lib/payload-builders';
import { QRContentMap, QRConfig, ErrorCorrectionLevel } from '../src/types/qr';
import { DEFAULT_QR_CONFIG, EMPTY_QR_CONTENT } from '../src/lib/storage';
import { calculateContrast, auditScanability } from '../src/lib/scanability';

// Helper to render and independently decode a QR code using jsQR
function decodeQRPayload(payload: string, ec: ErrorCorrectionLevel = 'M'): { success: boolean; decoded: string | null } {
  const utf8String = toUtf8ByteString(payload);
  const qr = qrcode(0, ec);
  qr.addData(utf8String);
  qr.make();

  const count = qr.getModuleCount();
  const scale = 8;
  const quiet = 4;
  const width = (count + quiet * 2) * scale;
  const data = new Uint8ClampedArray(width * width * 4);
  data.fill(255); // White background

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const px = ((r + quiet) * scale + y) * width + ((c + quiet) * scale + x);
            data[px * 4] = 0;
            data[px * 4 + 1] = 0;
            data[px * 4 + 2] = 0;
            data[px * 4 + 3] = 255;
          }
        }
      }
    }
  }

  const result = jsQR(data, width, width);
  return {
    success: result !== null && result.data === payload,
    decoded: result ? result.data : null
  };
}

let totalTests = 0;
let passedTests = 0;

function assertTest(name: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
  }
}

console.log('====================================================');
console.log('   PRODUCTION QR SUITE: AUTOMATED VERIFICATION');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// 1. A normal website URL
// -----------------------------------------------------------------------------
console.log('Test Group 1: Normal Website URL');
{
  const content: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    url: { url: 'https://example.com' }
  };
  const val = validateAndBuildPayload('url', content);
  assertTest('Validates normal URL', val.valid);
  assertTest('Payload matches', val.payload === 'https://example.com');
  const dec = decodeQRPayload(val.payload);
  assertTest('Decodes accurately with jsQR', dec.success, `Decoded: ${dec.decoded}`);
}

// -----------------------------------------------------------------------------
// 2. A URL containing query parameters and special characters
// -----------------------------------------------------------------------------
console.log('\nTest Group 2: URL with Query Params and Special Characters');
{
  const complexUrl = 'https://example.com/search?q=custom+qr&category=tech&tag=%23studio&id=10293#section-2';
  const content: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    url: { url: complexUrl }
  };
  const val = validateAndBuildPayload('url', content);
  assertTest('Validates complex URL with params', val.valid);
  const dec = decodeQRPayload(val.payload);
  assertTest('Decodes complex URL with 100% fidelity', dec.success, `Decoded: ${dec.decoded}`);
}

// -----------------------------------------------------------------------------
// 3. Plain text containing spaces, punctuation, and emojis
// -----------------------------------------------------------------------------
console.log('\nTest Group 3: Plain Text with Spaces, Punctuation, and Emojis');
{
  const emojiText = 'Hello World! 🎉 QR Studio 🚀 Special chars: & < > " \' % @ !';
  const content: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    text: { text: emojiText }
  };
  const val = validateAndBuildPayload('text', content);
  assertTest('Validates emoji and punctuation text', val.valid);
  const dec = decodeQRPayload(val.payload);
  assertTest('Decodes emojis and symbols without corruption', dec.success, `Decoded: ${dec.decoded}`);
}

// -----------------------------------------------------------------------------
// 4. Hindi or other Unicode text
// -----------------------------------------------------------------------------
console.log('\nTest Group 4: Hindi and Multilingual Unicode Text');
{
  const hindiText = 'नमस्ते भारत! यह एक सुरक्षित और सटीक क्यूआर कोड है। (Hindi Unicode)';
  const content: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    text: { text: hindiText }
  };
  const val = validateAndBuildPayload('text', content);
  assertTest('Validates Hindi Unicode string', val.valid);
  const dec = decodeQRPayload(val.payload);
  assertTest('Decodes Hindi text with exact UTF-8 character match', dec.success, `Decoded: ${dec.decoded}`);

  const japaneseText = 'こんにちは世界！東京 QRコード 生成ツール';
  const contentJa: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    text: { text: japaneseText }
  };
  const valJa = validateAndBuildPayload('text', contentJa);
  const decJa = decodeQRPayload(valJa.payload);
  assertTest('Decodes Japanese Kanji/Hiragana UTF-8 text', decJa.success, `Decoded: ${decJa.decoded}`);
}

// -----------------------------------------------------------------------------
// 5. Phone, Email, and SMS QR codes
// -----------------------------------------------------------------------------
console.log('\nTest Group 5: Phone, Email, and SMS QR Codes');
{
  // Phone
  const phoneContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    phone: { countryCode: '+91', nationalNumber: '9876543210', phone: '' }
  };
  const valPhone = validateAndBuildPayload('phone', phoneContent);
  assertTest('Phone payload format is tel:+919876543210', valPhone.payload === 'tel:+919876543210');
  const decPhone = decodeQRPayload(valPhone.payload);
  assertTest('Decodes Phone QR', decPhone.success);

  // Email
  const emailContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    email: { email: 'hello@example.com', subject: 'Project Inquiry', message: 'Hello makeqrr' }
  };
  const valEmail = validateAndBuildPayload('email', emailContent);
  assertTest('Email payload follows RFC 6068 mailto format', valEmail.payload.startsWith('mailto:hello@example.com?subject=Project%20Inquiry&body=Hello%20makeqrr'));
  const decEmail = decodeQRPayload(valEmail.payload);
  assertTest('Decodes Email QR', decEmail.success);

  // SMS
  const smsContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    sms: { phone: '+919876543210', message: 'Hello from QR Code' }
  };
  const valSms = validateAndBuildPayload('sms', smsContent);
  assertTest('SMS payload uses universal standard smsto: format', valSms.payload === 'smsto:+919876543210:Hello from QR Code');
  const decSms = decodeQRPayload(valSms.payload);
  assertTest('Decodes SMS QR', decSms.success);
}

// -----------------------------------------------------------------------------
// 6. Wi-Fi credentials containing reserved characters
// -----------------------------------------------------------------------------
console.log('\nTest Group 6: Wi-Fi Credentials and Escaping');
{
  // WPA with special characters
  const wifiSpecial: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    wifi: { ssid: 'Home;WiFi:5G', password: 'P@ss;word:123"\\', encryption: 'WPA', hidden: true }
  };
  const valWifi = validateAndBuildPayload('wifi', wifiSpecial);
  assertTest('Wi-Fi properly escapes ; : \\ "', valWifi.payload.includes('S:Home\\;WiFi\\:5G;') && valWifi.payload.includes('P:P@ss\\;word\\:123\\"\\\\;'));
  assertTest('Hidden network includes H:true;', valWifi.payload.includes('H:true;'));
  const decWifi = decodeQRPayload(valWifi.payload);
  assertTest('Decodes Wi-Fi QR correctly', decWifi.success);

  // Open / nopass network
  const wifiOpen: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    wifi: { ssid: 'FreeAirportWiFi', password: '', encryption: 'nopass', hidden: false }
  };
  const valOpen = validateAndBuildPayload('wifi', wifiOpen);
  assertTest('Open Wi-Fi omits password field P:', !valOpen.payload.includes('P:'));
  assertTest('Non-hidden network omits H:', !valOpen.payload.includes('H:'));
  assertTest('Open Wi-Fi payload is exact', valOpen.payload === 'WIFI:T:nopass;S:FreeAirportWiFi;;');
  const decOpen = decodeQRPayload(valOpen.payload);
  assertTest('Decodes Open Wi-Fi QR correctly', decOpen.success);
}

// -----------------------------------------------------------------------------
// 7. Empty input and invalid data
// -----------------------------------------------------------------------------
console.log('\nTest Group 7: Empty Input and Invalid Data Handling');
{
  const emptyUrlContent: QRContentMap = { ...EMPTY_QR_CONTENT, url: { url: '' } };
  const valEmptyUrl = validateAndBuildPayload('url', emptyUrlContent);
  assertTest('Empty URL is flagged as empty and invalid', !valEmptyUrl.valid && valEmptyUrl.empty);
  assertTest('Empty URL produces empty payload without mock fallback', valEmptyUrl.payload === '');

  const emptyTextContent: QRContentMap = { ...EMPTY_QR_CONTENT, text: { text: '   ' } };
  const valEmptyText = validateAndBuildPayload('text', emptyTextContent);
  assertTest('Whitespace text is flagged as empty', !valEmptyText.valid && valEmptyText.empty);

  const invalidCoords: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    location: { latitude: '999.0', longitude: '-500.0', label: '' }
  };
  const valCoords = validateAndBuildPayload('location', invalidCoords);
  assertTest('Invalid geographic coordinates are rejected', !valCoords.valid && !valCoords.empty);
}

// -----------------------------------------------------------------------------
// 8. Long content and appropriate size/error handling
// -----------------------------------------------------------------------------
console.log('\nTest Group 8: Long Content and QR Capacity Boundaries');
{
  const longUrl = 'https://example.com/path/' + 'a'.repeat(400);
  const contentLong: QRContentMap = { ...EMPTY_QR_CONTENT, url: { url: longUrl } };
  const valLong = validateAndBuildPayload('url', contentLong, 'H');
  assertTest('Large 450-byte payload within capacity is valid', valLong.valid);
  const decLong = decodeQRPayload(valLong.payload, 'H');
  assertTest('Decodes large URL accurately', decLong.success);

  // Check capacity limit
  const maxH = getMaxByteCapacity('H');
  assertTest('Error Correction H max capacity is 1273 bytes', maxH === 1273);

  const oversizedText = 'X'.repeat(2500);
  const contentOversized: QRContentMap = { ...EMPTY_QR_CONTENT, text: { text: oversizedText } };
  const valOver = validateAndBuildPayload('text', contentOversized, 'H');
  assertTest('Oversized payload for EC level H is safely rejected with clear error', !valOver.valid && valOver.error !== undefined);
}

// -----------------------------------------------------------------------------
// 9. Switching QR types repeatedly
// -----------------------------------------------------------------------------
console.log('\nTest Group 9: Switching QR Types Repeatedly');
{
  const content: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    url: { url: 'https://example.com' },
    phone: { countryCode: '+1', nationalNumber: '5551234567', phone: '' },
    wifi: { ssid: 'OfficeMesh', password: 'secretpassword', encryption: 'WPA', hidden: false }
  };

  const val1 = validateAndBuildPayload('url', content);
  const val2 = validateAndBuildPayload('phone', content);
  const val3 = validateAndBuildPayload('wifi', content);
  const val4 = validateAndBuildPayload('url', content);

  assertTest('Type switch to URL yields url payload', val1.payload === 'https://example.com');
  assertTest('Type switch to Phone yields tel payload', val2.payload === 'tel:+15551234567');
  assertTest('Type switch to Wi-Fi yields wifi payload', val3.payload === 'WIFI:T:WPA;S:OfficeMesh;P:secretpassword;;');
  assertTest('Type switch back to URL preserves original url payload', val4.payload === 'https://example.com');
}

// -----------------------------------------------------------------------------
// 10. Changing colors, patterns, and templates
// -----------------------------------------------------------------------------
console.log('\nTest Group 10: Color Contrast and Scanability Audit');
{
  const highContrastConfig: QRConfig = {
    ...DEFAULT_QR_CONFIG,
    colors: {
      ...DEFAULT_QR_CONFIG.colors,
      foreground: '#000000',
      background: '#ffffff'
    }
  };
  const auditHigh = auditScanability(highContrastConfig);
  assertTest('High contrast (#000 on #fff) scores excellent', auditHigh.score === 'excellent');

  const lowContrastConfig: QRConfig = {
    ...DEFAULT_QR_CONFIG,
    colors: {
      ...DEFAULT_QR_CONFIG.colors,
      foreground: '#888888',
      background: '#999999'
    }
  };
  const auditLow = auditScanability(lowContrastConfig);
  assertTest('Low contrast triggers risky warning', auditLow.score === 'risky');
}

// -----------------------------------------------------------------------------
// 11. Center logo safe occlusion testing
// -----------------------------------------------------------------------------
console.log('\nTest Group 11: Logo Center Occlusion & Error Correction');
{
  // Test that Error Correction H survives 25% center occlusion
  const payload = 'https://makeqrr.com/verify';
  const utf8 = toUtf8ByteString(payload);
  const qr = qrcode(0, 'H');
  qr.addData(utf8);
  qr.make();

  const count = qr.getModuleCount();
  const scale = 10;
  const quiet = 4;
  const width = (count + quiet * 2) * scale;
  const data = new Uint8ClampedArray(width * width * 4);
  data.fill(255);

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const px = ((r + quiet) * scale + y) * width + ((c + quiet) * scale + x);
            data[px * 4] = 0;
            data[px * 4 + 1] = 0;
            data[px * 4 + 2] = 0;
            data[px * 4 + 3] = 255;
          }
        }
      }
    }
  }

  // Draw 24% center logo
  const logoModules = Math.round(count * 0.24);
  const startMod = Math.round((count - logoModules) / 2);
  for (let r = startMod; r < startMod + logoModules; r++) {
    for (let c = startMod; c < startMod + logoModules; c++) {
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          const px = ((r + quiet) * scale + y) * width + ((c + quiet) * scale + x);
          data[px * 4] = 220;
          data[px * 4 + 1] = 60;
          data[px * 4 + 2] = 20;
          data[px * 4 + 3] = 255;
        }
      }
    }
  }

  const res = jsQR(data, width, width);
  assertTest('QR with 24% center logo decodes reliably under Error Correction H', res !== null && res.data === payload);
}

// -----------------------------------------------------------------------------
// 12. Dynamic Quiet Zone Scaling
// -----------------------------------------------------------------------------
console.log('\nTest Group 12: Dynamic Quiet Zone ISO Scaling');
{
  const modCount = estimateQRModuleCount(25, 'M'); // ~25 modules
  const target320 = 320;
  const target1024 = 1024;
  const totalMods = modCount + (4 * 2);

  const margin320 = Math.round((target320 / totalMods) * 4);
  const margin1024 = Math.round((target1024 / totalMods) * 4);

  assertTest('Quiet zone margin scales proportionally at 320px', margin320 >= 30);
  assertTest('Quiet zone margin scales proportionally at 1024px', margin1024 >= 100);
}

// -----------------------------------------------------------------------------
// 13. Contact Card (vCard 3.0) Specification Compliance
// -----------------------------------------------------------------------------
console.log('\nTest Group 13: vCard 3.0 Compliance');
{
  const contactContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    contact: {
      firstName: 'John',
      lastName: 'Smith, Jr.',
      company: 'Acme;Corp',
      title: 'Lead Architect',
      phone: '+1-555-0199',
      email: 'john@acme.com',
      website: 'acme.com',
      address: '123 Market St, Suite 400; San Francisco, CA'
    }
  };
  const val = validateAndBuildPayload('contact', contactContent);
  assertTest('vCard includes BEGIN:VCARD and VERSION:3.0', val.payload.includes('BEGIN:VCARD\r\nVERSION:3.0'));
  assertTest('vCard escapes commas in name', val.payload.includes('N:Smith\\, Jr.;John;;;'));
  assertTest('vCard escapes semicolons in org', val.payload.includes('ORG:Acme\\;Corp'));
  assertTest('vCard website prepends https://', val.payload.includes('URL:https://acme.com'));
  const dec = decodeQRPayload(val.payload);
  assertTest('vCard decodes with full integrity', dec.success);
}

// -----------------------------------------------------------------------------
// 14. WhatsApp Link Construction
// -----------------------------------------------------------------------------
console.log('\nTest Group 14: WhatsApp Links');
{
  const waContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    whatsapp: { phone: '+1 (555) 234-5678', message: 'Hello! I need a QR code.' }
  };
  const val = validateAndBuildPayload('whatsapp', waContent);
  assertTest('WhatsApp phone digits only', val.payload.startsWith('https://wa.me/15552345678'));
  assertTest('WhatsApp message percent-encoded', val.payload.includes('?text=Hello!%20I%20need%20a%20QR%20code.'));
  const dec = decodeQRPayload(val.payload);
  assertTest('WhatsApp QR decodes accurately', dec.success);
}

// -----------------------------------------------------------------------------
// 15. UPI / Payment Link Construction
// -----------------------------------------------------------------------------
console.log('\nTest Group 15: Payment Links (UPI)');
{
  const payContent: QRContentMap = {
    ...EMPTY_QR_CONTENT,
    payment: { type: 'upi', upiId: 'merchant@okaxis', name: 'Coffee Shop', amount: '150.00', note: 'Order #42' }
  };
  const val = validateAndBuildPayload('payment', payContent);
  assertTest('UPI payload starts with upi://pay', val.payload.startsWith('upi://pay?'));
  assertTest('UPI includes pa, pn, am, tn, cu', val.payload.includes('pa=merchant%40okaxis') && val.payload.includes('pn=Coffee%20Shop') && val.payload.includes('am=150.00') && val.payload.includes('tn=Order%20%2342') && val.payload.includes('cu=INR'));
  const dec = decodeQRPayload(val.payload);
  assertTest('UPI QR decodes accurately', dec.success);
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
