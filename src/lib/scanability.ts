import { QRConfig, ScanabilityAudit, ScanabilityIssue } from '../types/qr';
import { getEffectiveLogoSize } from './logo-utils';

export function isValidHexColor(hex: string): boolean {
  const c = hex.replace('#', '').trim();
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(c);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3 && /^[0-9a-fA-F]{3}$/.test(c)) {
    c = c.split('').map(x => x + x).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(c)) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export type WCAGLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';
export type ContrastSafetyStatus = 'safe' | 'warning' | 'fail';

export interface ContrastSafetyResult {
  status: ContrastSafetyStatus;
  wcagLevel: WCAGLevel;
  contrastRatio: number;
  minContrastRatio: number;
  effectiveBackground: string;
  isTransparentBackground: boolean;
  isInverted: boolean;
  hasGradientRisk: boolean;
  hasCustomEyesRisk: boolean;
  headline: string;
  message: string;
  recommendation: string;
  suggestedForeground: string;
}

/**
 * Computes an accessible foreground color with at least 7.0:1 contrast against the given background
 * (preserving hue when possible by darkening or lightening, otherwise falling back to #000000 or #FFFFFF).
 */
export function suggestAccessibleForeground(fgHex: string, bgHex: string, targetRatio: number = 7.0): string {
  const bgRgb = hexToRgb(bgHex);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgRgb = hexToRgb(fgHex);

  // Prefer dark foreground on light backgrounds for optimal QR camera compatibility
  const shouldDarken = bgLum > 0.179;
  const targetRgb = shouldDarken ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };

  for (let step = 1; step <= 20; step++) {
    const t = step / 20;
    const candidate = rgbToHex(
      fgRgb.r + (targetRgb.r - fgRgb.r) * t,
      fgRgb.g + (targetRgb.g - fgRgb.g) * t,
      fgRgb.b + (targetRgb.b - fgRgb.b) * t
    );
    if (calculateContrast(candidate, bgHex) >= targetRatio) {
      return candidate;
    }
  }

  return shouldDarken ? '#000000' : '#ffffff';
}

export function getEffectiveQRBackground(config: QRConfig): string {
  if (config.colors.transparentBackground) {
    return config.layout.type === 'card'
      ? config.layout.card.backgroundColor || '#FFFFFF'
      : '#FFFFFF';
  }
  return config.colors.background || '#FFFFFF';
}

/**
 * Evaluates real-time WCAG accessibility and QR scannability contrast standards.
 * - Fails WCAG (< 3.0:1): Critical scannability risk; fails WCAG 1.4.11 non-text minimum.
 * - Below WCAG AA (3.0:1 - 4.49:1): Meets 3:1 UI minimum only; falls short of WCAG AA 4.5:1 standard.
 * - WCAG AA (>= 4.5:1) / AAA (>= 7.0:1): Accessible contrast for reliable scanning.
 */
export function evaluateContrastSafety(config: QRConfig): ContrastSafetyResult {
  const fg = config.colors.foreground || '#000000';
  const bg = getEffectiveQRBackground(config);
  const isTransparentBackground = !!config.colors.transparentBackground;

  const fgContrast = calculateContrast(fg, bg);
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const isInverted = fgLum > bgLum && fgContrast > 1.5;

  let minContrastRatio = fgContrast;
  let hasGradientRisk = false;
  let hasCustomEyesRisk = false;

  if (config.colors.gradient.enabled) {
    const startContrast = calculateContrast(config.colors.gradient.startColor, bg);
    const endContrast = calculateContrast(config.colors.gradient.endColor, bg);
    const gradMin = Math.min(startContrast, endContrast);
    if (gradMin < 4.5) {
      hasGradientRisk = true;
    }
    minContrastRatio = Math.min(minContrastRatio, gradMin);
  }

  if (config.eyes.customEyes) {
    const outerContrast = calculateContrast(config.eyes.outerColor, bg);
    const innerContrast = calculateContrast(config.eyes.innerColor, bg);
    const eyesMin = Math.min(outerContrast, innerContrast);
    if (eyesMin < 4.5) {
      hasCustomEyesRisk = true;
    }
    minContrastRatio = Math.min(minContrastRatio, eyesMin);
  }

  let wcagLevel: WCAGLevel = 'AAA';
  if (minContrastRatio < 3.0) {
    wcagLevel = 'Fail';
  } else if (minContrastRatio < 4.5) {
    wcagLevel = 'AA Large';
  } else if (minContrastRatio < 7.0) {
    wcagLevel = 'AA';
  }

  let status: ContrastSafetyStatus = 'safe';
  let headline = wcagLevel === 'AAA' ? 'WCAG AAA Optimal' : 'WCAG AA Safe';
  let message =
    wcagLevel === 'AAA'
      ? `Excellent ${minContrastRatio}:1 contrast meets WCAG AAA standards for instant scanning.`
      : `Good ${minContrastRatio}:1 contrast meets WCAG AA (4.5:1) accessibility standards.`;
  let recommendation = isTransparentBackground
    ? 'Transparent background: ensure the surface behind your QR stays light and high-contrast.'
    : 'Keep dark foreground on a light background for fastest recognition.';

  if (minContrastRatio < 3.0) {
    status = 'fail';
    headline = 'Fails WCAG Minimum';
    message = hasGradientRisk
      ? `Gradient blend drops to ${minContrastRatio}:1, below the 3.0:1 WCAG minimum.`
      : hasCustomEyesRisk
      ? `Corner eye color contrast is ${minContrastRatio}:1, below the 3.0:1 WCAG minimum.`
      : `Contrast ratio (${minContrastRatio}:1) fails WCAG 3.0:1 and 4.5:1 standards. Cameras may fail to scan.`;
    recommendation = 'Increase contrast to at least 4.5:1 (WCAG AA) using darker dots or a lighter background.';
  } else if (minContrastRatio < 4.5) {
    status = 'warning';
    headline = 'Below WCAG AA (4.5:1)';
    message = hasGradientRisk
      ? `Gradient contrast drops to ${minContrastRatio}:1 (WCAG AA requires 4.5:1).`
      : hasCustomEyesRisk
      ? `Corner eyes drop to ${minContrastRatio}:1 (WCAG AA requires 4.5:1).`
      : `Contrast ratio (${minContrastRatio}:1) is below WCAG AA (4.5:1) and may struggle in dim light or glare.`;
    recommendation = 'Aim for 4.5:1+ (WCAG AA) or 7.0:1+ (WCAG AAA) for reliable mobile scanning.';
  } else if (isInverted) {
    status = 'warning';
    headline = `Inverted Colors (${wcagLevel})`;
    message = `Passes WCAG ${wcagLevel} (${minContrastRatio}:1), but light dots on a dark background scan slower on some cameras.`;
    recommendation = 'For universal compatibility, prefer dark QR dots on a light background.';
  }

  return {
    status,
    wcagLevel,
    contrastRatio: fgContrast,
    minContrastRatio,
    effectiveBackground: bg,
    isTransparentBackground,
    isInverted,
    hasGradientRisk,
    hasCustomEyesRisk,
    headline,
    message,
    recommendation,
    suggestedForeground: suggestAccessibleForeground(fg, bg, 7.0)
  };
}

export function auditScanability(config: QRConfig): ScanabilityAudit {
  const issues: ScanabilityIssue[] = [];

  const fg = config.colors.foreground;
  const bg = getEffectiveQRBackground(config);

  // 1. Contrast Check (WCAG 1.4.11 3.0:1 & WCAG AA 4.5:1)
  const contrastRatio = calculateContrast(fg, bg);
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  if (contrastRatio < 3.0) {
    issues.push({
      severity: 'risky',
      title: 'Fails WCAG contrast minimum',
      description: `Foreground & background contrast (${contrastRatio}:1) is below the 3.0:1 minimum.`,
      recommendation: 'Use darker dots or a lighter background (aim for 4.5:1+ WCAG AA).'
    });
  } else if (contrastRatio < 4.5) {
    issues.push({
      severity: 'warning',
      title: 'Below WCAG AA contrast (4.5:1)',
      description: `Contrast (${contrastRatio}:1) passes 3.0:1 UI minimum only and may fail in dim light.`,
      recommendation: 'Make the QR code darker or the background lighter to reach 4.5:1+.'
    });
  }

  // Inverted QR code detection (foreground is lighter than background)
  if (fgLum > bgLum && contrastRatio > 2.0) {
    issues.push({
      severity: 'warning',
      title: 'Light QR on dark background',
      description: 'The QR dots are lighter than the background.',
      recommendation: 'Some phone cameras scan dark dots on light backgrounds much faster.'
    });
  }

  // Gradient Contrast Check
  if (config.colors.gradient.enabled) {
    const startContrast = calculateContrast(config.colors.gradient.startColor, bg);
    const endContrast = calculateContrast(config.colors.gradient.endColor, bg);
    const minGradContrast = Math.min(startContrast, endContrast);
    if (minGradContrast < 3.0) {
      issues.push({
        severity: 'risky',
        title: 'Gradient fails WCAG contrast',
        description: `Gradient color contrast drops to ${minGradContrast}:1 against the background.`,
        recommendation: 'Pick darker gradient colors with at least 4.5:1 contrast.'
      });
    } else if (minGradContrast < 4.5) {
      issues.push({
        severity: 'warning',
        title: 'Gradient below WCAG AA (4.5:1)',
        description: `Gradient fade contrast (${minGradContrast}:1) is close to the background color.`,
        recommendation: 'Pick a darker color for the gradient so phones scan reliably.'
      });
    }
  }

  // 2. Quiet Zone
  if (config.quietZone < 2) {
    issues.push({
      severity: 'risky',
      title: 'Not enough space around QR',
      description: `There is only ${config.quietZone} unit of space around the code.`,
      recommendation: 'Add more space around the edges so phones can find it.'
    });
  } else if (config.quietZone < 4) {
    issues.push({
      severity: 'warning',
      title: 'Small space around QR',
      description: 'The space around the edges is a bit small.',
      recommendation: 'Give it a little more room if printing on packaging.'
    });
  }

  // 3. Logo Coverage & Error Correction
  let logoCoverage = 0;
  if (config.logo.enabled && (config.logo.source || config.logo.originalSource)) {
    const effectiveSize = getEffectiveLogoSize(config);
    logoCoverage = Math.round(effectiveSize * effectiveSize * 100);

    if (effectiveSize > 0.35) {
      issues.push({
        severity: 'risky',
        title: 'Logo is too large',
        description: `Your logo covers about ${logoCoverage}% of the QR code.`,
        recommendation: 'Make the logo smaller and set Scan Safety to High.'
      });
    } else if (effectiveSize > 0.25) {
      issues.push({
        severity: 'warning',
        title: 'Logo is quite large',
        description: `Your logo covers about ${logoCoverage}% of the QR code.`,
        recommendation: 'Set Scan Safety to High so phones can still read it easily.'
      });
    }

    if (config.errorCorrection === 'L') {
      issues.push({
        severity: 'risky',
        title: 'Scan Safety is too low for a logo',
        description: 'Low safety cannot handle a logo in the center.',
        recommendation: 'Change Scan Safety to High or Medium.'
      });
    } else if (config.errorCorrection === 'M' && effectiveSize > 0.22) {
      issues.push({
        severity: 'warning',
        title: 'Recommend higher Scan Safety',
        description: 'With this logo size, higher safety makes scanning smoother.',
        recommendation: 'Switch Scan Safety to High.'
      });
    }
  }

  // 4. Custom Eyes Contrast
  if (config.eyes.customEyes) {
    const outerContrast = calculateContrast(config.eyes.outerColor, bg);
    const innerContrast = calculateContrast(config.eyes.innerColor, bg);
    const minEyeContrast = Math.min(outerContrast, innerContrast);
    if (minEyeContrast < 3.0) {
      issues.push({
        severity: 'risky',
        title: 'Corner eyes fail WCAG contrast',
        description: `Corner eye contrast (${minEyeContrast}:1) is too low for camera detection.`,
        recommendation: 'Make sure corner colors have at least 4.5:1 contrast.'
      });
    } else if (minEyeContrast < 4.5) {
      issues.push({
        severity: 'warning',
        title: 'Corner eyes below WCAG AA (4.5:1)',
        description: `Corner eye contrast (${minEyeContrast}:1) may be hard to detect in dim light.`,
        recommendation: 'Darken the corner eye colors for faster aiming.'
      });
    }
  }

  // Overall Score determination
  let score: 'excellent' | 'warning' | 'risky' = 'excellent';
  if (issues.some(i => i.severity === 'risky')) {
    score = 'risky';
  } else if (issues.length > 0) {
    score = 'warning';
  }

  return {
    score,
    contrastRatio,
    logoCoverage,
    issues
  };
}
