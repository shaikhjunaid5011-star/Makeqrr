// Web Worker for non-blocking QR scanability auditing and calculations

interface ContrastRGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): ContrastRGB {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

self.onmessage = (e: MessageEvent) => {
  const { id, type, data } = e.data;

  if (type === 'AUDIT_SCANABILITY') {
    const { fg, bg, gradient, eyes, quietZone, errorCorrection, logoSize, logoEnabled } = data;
    const contrastRatio = calculateContrast(fg, bg);
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    const issues: any[] = [];

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

    if (fgLum > bgLum && contrastRatio > 2.0) {
      issues.push({
        severity: 'warning',
        title: 'Light QR on dark background',
        description: 'The QR dots are lighter than the background.',
        recommendation: 'Some phone cameras scan dark dots on light backgrounds much faster.'
      });
    }

    if (gradient?.enabled) {
      const startContrast = calculateContrast(gradient.startColor, bg);
      const endContrast = calculateContrast(gradient.endColor, bg);
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

    if (eyes?.customEyes) {
      const outerContrast = calculateContrast(eyes.outerColor, bg);
      const innerContrast = calculateContrast(eyes.innerColor, bg);
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

    if (quietZone < 2) {
      issues.push({
        severity: 'risky',
        title: 'Not enough space around QR',
        description: `There is only ${quietZone} unit of space around the code.`,
        recommendation: 'Add more space around the edges so phones can find it.'
      });
    } else if (quietZone < 4) {
      issues.push({
        severity: 'warning',
        title: 'Small space around QR',
        description: 'The space around the edges is a bit small.',
        recommendation: 'Give it a little more room if printing on packaging.'
      });
    }

    if (logoEnabled && logoSize > 0.28 && errorCorrection === 'L') {
      issues.push({
        severity: 'risky',
        title: 'Center image is too large for Level L',
        description: 'A large center image needs stronger error correction.',
        recommendation: 'Switch Error Correction to Level H in Design > Card & Safety.'
      });
    }

    const hasRisky = issues.some(i => i.severity === 'risky');
    const hasWarning = issues.some(i => i.severity === 'warning');
    const score = hasRisky ? 'risky' : hasWarning ? 'warning' : 'excellent';

    self.postMessage({
      id,
      result: {
        score,
        contrastRatio,
        issues,
        testedAt: Date.now()
      }
    });
  }
};
