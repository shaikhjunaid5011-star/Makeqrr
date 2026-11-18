import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';
import {
  validateAndBuildPayload,
  toUtf8ByteString,
  sanitizePhoneNumber,
  safeEncodeURIComponent
} from '../src/lib/payload-builders';
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

  // Decode UTF-8 bytes if needed
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

function runTests() {
  console.log('=== RUNNING SMS AND TEL QR FUNCTIONAL AUDIT & TESTS ===\n');
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

  // 1. Phone number sanitizer tests
  console.log('-- Test Group 1: Phone Number Sanitization --');
  assert('Normal E.164 phone', sanitizePhoneNumber('+919876543210') === '+919876543210');
  assert('Phone with spaces and hyphens', sanitizePhoneNumber('+91 98765-43210') === '+919876543210');
  assert('Phone with parentheses', sanitizePhoneNumber('+1 (555) 000-0000') === '+15550000000');
  assert('Phone with accidental tel: prefix', sanitizePhoneNumber('tel:+919876543210') === '+919876543210');
  assert('Phone with accidental smsto: prefix', sanitizePhoneNumber('smsto:+919876543210:message') === '+919876543210');
  assert('Phone with accidental sms: prefix', sanitizePhoneNumber('sms:+919876543210?body=test') === '+919876543210');

  // 2. Safe URI Component Encoding tests
  console.log('\n-- Test Group 2: safeEncodeURIComponent (No Double-Encoding) --');
  assert('Plain message encoding', safeEncodeURIComponent('Kuch nahi bs ayese hi') === 'Kuch%20nahi%20bs%20ayese%20hi');
  assert('Already percent-encoded message preservation', safeEncodeURIComponent('Kuch%20nahi%20bs%20ayese%20hi') === 'Kuch%20nahi%20bs%20ayese%20hi');
  assert('Message with reserved symbols &?=', safeEncodeURIComponent('Hello & welcome? 50% discount') === 'Hello%20%26%20welcome%3F%2050%25%20discount');

  // 3. TEL QR payload builder and matrix decode
  console.log('\n-- Test Group 3: Telephone (TEL) QR Encoding & Decoding --');
  const mockTelContent: QRContentMap = {
    url: { url: '' },
    text: { text: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    contact: { firstName: '', lastName: '', company: '', title: '', phone: '', email: '', website: '', address: '' },
    email: { email: '', subject: '', message: '' },
    phone: { phone: '+919876543210', countryCode: '+91', nationalNumber: '9876543210' },
    sms: { phone: '', message: '', format: 'smsto' },
    whatsapp: { phone: '', message: '' },
    location: { latitude: '', longitude: '' },
    event: { title: '', location: '', start: '', end: '', description: '' },
    social: { platform: 'instagram', username: '' },
    payment: { type: 'upi', upiId: '', name: '' }
  };

  const telResult = validateAndBuildPayload('phone', mockTelContent, 'M');
  assert('TEL payload valid', telResult.valid);
  assert('TEL payload exact format tel:+919876543210', telResult.payload === 'tel:+919876543210');
  assert('TEL payload contains NO sms prefix', !telResult.payload.includes('smsto:') && !telResult.payload.includes('sms:'));
  assert('TEL payload contains NO vCard BEGIN', !telResult.payload.includes('BEGIN:VCARD'));

  const decodedTel = decodeQRMatrix(telResult.payload);
  assert('TEL QR matrix decodes character-for-character', decodedTel === 'tel:+919876543210', `Got: ${decodedTel}`);

  // 4. SMS Universal smsto: format tests
  console.log('\n-- Test Group 4: SMS Universal (smsto:) Encoding & Decoding --');
  const mockSmsUniversalContent: QRContentMap = {
    ...mockTelContent,
    sms: {
      phone: '+919876543210',
      message: 'Kuch nahi bs ayese hi',
      format: 'smsto'
    }
  };

  const smsUniversalResult = validateAndBuildPayload('sms', mockSmsUniversalContent, 'M');
  const expectedSmsto = 'smsto:+919876543210:Kuch nahi bs ayese hi';
  assert('SMS Universal payload valid', smsUniversalResult.valid);
  assert('SMS Universal exact payload match', smsUniversalResult.payload === expectedSmsto, `Got: ${smsUniversalResult.payload}`);
  assert('SMS contains NO tel: prefix', !smsUniversalResult.payload.startsWith('tel:'));
  assert('SMS contains NO vCard', !smsUniversalResult.payload.includes('BEGIN:VCARD'));

  const decodedSmsto = decodeQRMatrix(smsUniversalResult.payload);
  assert('SMS Universal QR matrix decodes character-for-character', decodedSmsto === expectedSmsto, `Decoded: ${decodedSmsto}`);

  // 5. SMS Universal without body
  const mockSmsNoBody: QRContentMap = {
    ...mockTelContent,
    sms: {
      phone: '+919876543210',
      message: '',
      format: 'smsto'
    }
  };
  const smsNoBodyResult = validateAndBuildPayload('sms', mockSmsNoBody, 'M');
  assert('SMS without message is smsto:+919876543210 (no trailing colon)', smsNoBodyResult.payload === 'smsto:+919876543210');
  const decodedSmsNoBody = decodeQRMatrix(smsNoBodyResult.payload);
  assert('SMS without body decodes cleanly', decodedSmsNoBody === 'smsto:+919876543210');

  // 6. SMS RFC 5724 standard (sms:?body=) format tests
  console.log('\n-- Test Group 5: SMS RFC 5724 (sms:) Encoding & Decoding --');
  const mockSmsRfcContent: QRContentMap = {
    ...mockTelContent,
    sms: {
      phone: '+919876543210',
      message: 'Kuch nahi bs ayese hi',
      format: 'rfc5724'
    }
  };

  const smsRfcResult = validateAndBuildPayload('sms', mockSmsRfcContent, 'M');
  const expectedRfc = 'sms:+919876543210?body=Kuch%20nahi%20bs%20ayese%20hi';
  assert('SMS RFC payload valid', smsRfcResult.valid);
  assert('SMS RFC exact payload match', smsRfcResult.payload === expectedRfc, `Got: ${smsRfcResult.payload}`);

  const decodedRfc = decodeQRMatrix(smsRfcResult.payload);
  assert('SMS RFC QR matrix decodes character-for-character', decodedRfc === expectedRfc, `Decoded: ${decodedRfc}`);

  // 7. SMS with Hindi & Emoji characters
  console.log('\n-- Test Group 6: Unicode & International Characters in SMS --');
  const mockSmsUnicode: QRContentMap = {
    ...mockTelContent,
    sms: {
      phone: '+919876543210',
      message: 'नमस्ते दुनिया 🚀 Happy Coding!',
      format: 'smsto'
    }
  };
  const smsUnicodeResult = validateAndBuildPayload('sms', mockSmsUnicode, 'M');
  const expectedUnicode = 'smsto:+919876543210:नमस्ते दुनिया 🚀 Happy Coding!';
  assert('SMS with Hindi and Emoji generates valid payload', smsUnicodeResult.valid);
  const decodedUnicode = decodeQRMatrix(smsUnicodeResult.payload);
  assert('SMS with Hindi and Emoji decodes with 100% fidelity without truncation', decodedUnicode === expectedUnicode, `Got: ${decodedUnicode}`);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
