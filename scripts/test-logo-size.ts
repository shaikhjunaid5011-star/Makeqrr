import jsQR from 'jsqr';
import { DEFAULT_QR_CONFIG } from '../src/lib/storage';
import { calculateSafeLogoBounds, getEffectiveLogoSize, DEFAULT_ELEMENT_SIZES } from '../src/lib/logo-utils';
import { createQRCodeStylingOptions } from '../src/lib/qr-renderer';
import { QRConfig } from '../src/types/qr';

// Mock DOM elements required for node execution of client libraries
if (typeof (global as any).document === 'undefined') {
  (global as any).document = {
    createElement: (tag: string) => {
      return {
        getContext: () => ({
          fillRect: () => {},
          drawImage: () => {},
          clearRect: () => {},
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {}
        }),
        width: 320,
        height: 320,
        toDataURL: () => 'data:image/png;base64,mock'
      };
    }
  };
}
if (typeof (global as any).Image === 'undefined') {
  (global as any).Image = class {
    onload: any = null;
    onerror: any = null;
    src = '';
    width = 100;
    height = 100;
    naturalWidth = 100;
    naturalHeight = 100;
  };
}

let passed = 0;
let failed = 0;

function assert(desc: string, cond: boolean) {
  if (cond) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed++;
  }
}

console.log('====================================================');
console.log('   CENTER LOGO, ICON & EMOJI SIZE TEST SUITE');
console.log('====================================================');

// Test 1: Safe bounds calculation for various Error Correction levels
console.log('\nTest Group 1: Error Correction Level Safe Bounds');
const baseConfig: QRConfig = {
  ...DEFAULT_QR_CONFIG,
  type: 'url',
  content: {
    ...DEFAULT_QR_CONFIG.content,
    url: { url: 'https://example.com/test-logo-size' }
  }
};

const boundsL = calculateSafeLogoBounds({ ...baseConfig, errorCorrection: 'L' });
const boundsM = calculateSafeLogoBounds({ ...baseConfig, errorCorrection: 'M' });
const boundsQ = calculateSafeLogoBounds({ ...baseConfig, errorCorrection: 'Q' });
const boundsH = calculateSafeLogoBounds({ ...baseConfig, errorCorrection: 'H' });

assert('EC Level L has safeMax <= 0.16', boundsL.safeMax <= 0.16);
assert('EC Level M has safeMax around 0.22', boundsM.safeMax >= 0.20 && boundsM.safeMax <= 0.24);
assert('EC Level Q has safeMax around 0.27', boundsQ.safeMax >= 0.25 && boundsQ.safeMax <= 0.28);
assert('EC Level H allows safeMax up to 0.33', boundsH.safeMax >= 0.30 && boundsH.safeMax <= 0.34);
assert('Safe minimum is 0.10 across all levels', boundsH.safeMin === 0.10);

// Test 2: Separate size settings for Upload, Icon, and Emoji
console.log('\nTest Group 2: Separate Customization for Upload, Icon, Emoji');
const multiConfig: QRConfig = {
  ...baseConfig,
  errorCorrection: 'H',
  logo: {
    ...baseConfig.logo,
    enabled: true,
    source: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>',
    type: 'upload',
    size: 0.25,
    uploadSize: 0.25,
    iconSize: 0.18,
    emojiSize: 0.22
  }
};

// When type is upload:
const uploadConfig: QRConfig = {
  ...multiConfig,
  logo: { ...multiConfig.logo, type: 'upload', size: multiConfig.logo.uploadSize! }
};
const uploadSizeEff = getEffectiveLogoSize(uploadConfig);
assert('Effective size for upload matches uploadSize (0.25)', uploadSizeEff === 0.25);

// When switching to icon:
const iconConfig: QRConfig = {
  ...multiConfig,
  logo: { ...multiConfig.logo, type: 'icon', size: multiConfig.logo.iconSize! }
};
const iconSizeEff = getEffectiveLogoSize(iconConfig);
assert('Effective size for icon matches iconSize (0.18)', iconSizeEff === 0.18);

// When switching to emoji:
const emojiConfig: QRConfig = {
  ...multiConfig,
  logo: { ...multiConfig.logo, type: 'emoji', size: multiConfig.logo.emojiSize! }
};
const emojiSizeEff = getEffectiveLogoSize(emojiConfig);
assert('Effective size for emoji matches emojiSize (0.22)', emojiSizeEff === 0.22);

// When size is undefined, it resolves to the type-specific setting:
const iconFallbackEff = getEffectiveLogoSize({
  ...multiConfig,
  logo: { ...multiConfig.logo, type: 'icon', size: undefined as any }
});
assert('Fallback resolves to iconSize (0.18) when size is undefined', iconFallbackEff === 0.18);

// Test 3: Clamping at safe maximum
console.log('\nTest Group 3: Clamping at Safe Maximum');
const oversizedConfig: QRConfig = {
  ...baseConfig,
  errorCorrection: 'M', // Safe max is ~0.22
  logo: {
    ...baseConfig.logo,
    enabled: true,
    source: 'data:image/svg+xml;utf8,<svg></svg>',
    type: 'upload',
    size: 0.45 // Requesting 45% (unsafe)
  }
};
const clampedSize = getEffectiveLogoSize(oversizedConfig);
assert('Oversized logo (0.45) is clamped to safeMax (<= 0.24) under EC Level M', clampedSize <= 0.24);

const undersizedConfig: QRConfig = {
  ...baseConfig,
  errorCorrection: 'H',
  logo: {
    ...baseConfig.logo,
    enabled: true,
    source: 'data:image/svg+xml;utf8,<svg></svg>',
    type: 'upload',
    size: 0.02 // Requesting 2% (too tiny)
  }
};
const clampedMin = getEffectiveLogoSize(undersizedConfig);
assert('Undersized logo (0.02) is clamped to safeMin (0.10)', clampedMin === 0.10);

// Test 4: Default reset values
console.log('\nTest Group 4: Default Values & Reset');
assert('Upload default baseline is 0.22', DEFAULT_ELEMENT_SIZES.upload === 0.22);
assert('Icon default baseline is 0.20', DEFAULT_ELEMENT_SIZES.icon === 0.20);
assert('Emoji default baseline is 0.20', DEFAULT_ELEMENT_SIZES.emoji === 0.20);

// Test 5: Verify rendered styling options
console.log('\nTest Group 5: Options passed to QRCodeStyling');
const stylingOptions = createQRCodeStylingOptions({
  ...baseConfig,
  errorCorrection: 'H',
  logo: {
    ...baseConfig.logo,
    enabled: true,
    type: 'icon',
    iconSize: 0.24,
    source: 'data:image/svg+xml;utf8,<svg></svg>'
  }
}, 320, 'https://example.com/test-logo-size');

assert('QRCodeStyling imageOptions has hideBackgroundDots true', stylingOptions.imageOptions?.hideBackgroundDots === true);
assert('QRCodeStyling imageSize receives exactly clamped size (0.24)', stylingOptions.imageOptions?.imageSize === 0.24);

console.log('\n====================================================');
console.log(`TOTAL: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
