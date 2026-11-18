import { LogoConfig, LogoShape, LogoBorderStyle, ErrorCorrectionLevel, QRConfig } from '../types/qr';
import { buildQRPayload, toUtf8ByteString, estimateQRModuleCount } from './payload-builders';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
  name?: string;
  sizeKB?: number;
  format?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const VALID_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp'
];

const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

/**
 * Sanitizes raw SVG markup to strip executable scripts, event handlers, foreignObject,
 * and dangerous URI schemes before embedding in data URLs or canvases.
 */
export function sanitizeSvgContent(svgText: string): string {
  if (!svgText || typeof svgText !== 'string') {
    throw new Error('Invalid SVG file content.');
  }
  const trimmed = svgText.trim();
  if (!/<svg[\s>]/i.test(trimmed)) {
    throw new Error('File does not contain a valid <svg> root element.');
  }

  // Strip dangerous elements: <script>, <foreignObject>, <iframe>, <object>, <embed>
  let cleaned = trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*\/?>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*\/?>/gi, '');

  // Strip inline event handler attributes (onload, onerror, onclick, onmouseover, etc.)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Neutralize javascript:, vbscript:, or data:text/html URIs in href / xlink:href
  cleaned = cleaned.replace(
    /(?:xlink:)?href\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*')/gi,
    'href="#"'
  );

  return cleaned;
}

/**
 * Validates file type and size for client-side QR center image upload.
 * Requires BOTH a valid image file extension AND a valid image MIME type.
 */
export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }

  const parts = file.name.split('.');
  const extension = parts.length > 1 ? '.' + parts.pop()?.toLowerCase() : '';
  const mimeType = file.type?.toLowerCase() || '';

  const isValidExtension = VALID_EXTENSIONS.includes(extension);
  const isValidMime = VALID_MIME_TYPES.includes(mimeType);

  if (!isValidExtension || !isValidMime) {
    return {
      valid: false,
      error: "This file type isn't supported. Please use a valid PNG, JPG, WebP, or SVG image."
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMB}MB). Please pick a file under 5MB.`
    };
  }

  const format = extension.replace('.', '').toUpperCase();
  const sizeKB = Math.round(file.size / 1024);

  return {
    valid: true,
    file,
    name: file.name,
    sizeKB,
    format
  };
}

/**
 * Reads a validated image file client-side into an optimized Data URL.
 * Sanitizes SVG files against XSS and automatically downscales oversized raster images
 * to a crisp 1024x1024 max bounds to prevent localStorage quota exhaustion and memory bloat.
 */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text, sanitize against XSS/scripts, and verify it decodes as a valid image
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const rawText = event.target?.result as string;
          const sanitizedSvg = sanitizeSvgContent(rawText);
          const encodedDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvg)}`;
          const testImg = new Image();
          testImg.onload = () => resolve(encodedDataUrl);
          testImg.onerror = () => reject(new Error('Invalid or corrupted SVG image file.'));
          testImg.src = encodedDataUrl;
        } catch (err: any) {
          reject(new Error(err?.message || 'Failed to validate SVG file.'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading SVG file.'));
      reader.readAsText(file);
      return;
    }

    // For raster images, decode and downscale to max 1024px if oversized
    const reader = new FileReader();
    reader.onload = event => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Failed to read image data URL.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDimension = 1024;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          reject(new Error('Image has invalid dimensions.'));
          return;
        }

        // If image is within bounds, use original
        if (width <= maxDimension && height <= maxDimension) {
          resolve(rawDataUrl);
          return;
        }

        // Scale down while maintaining aspect ratio
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const optimizedUrl = canvas.toDataURL(mime, mime === 'image/jpeg' ? 0.92 : undefined);
        resolve(optimizedUrl);
      };

      img.onerror = () => {
        reject(new Error('Corrupted or unsupported image file. Please upload a valid PNG, JPG, WebP, or SVG image.'));
      };

      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error('Error reading image file.'));
    reader.readAsDataURL(file);
  });
}

// Memory-bounded LRU cache for styled badge data URLs
const styledLogoCache = new Map<string, string>();
const MAX_LOGO_CACHE_SIZE = 40;

export interface SafeLogoBoundsResult {
  safeMin: number;
  safeMax: number;
  defaultSize: number;
  currentSize: number;
  isAtMax: boolean;
  isAtMin: boolean;
  warning: string | null;
  version: number;
  moduleCount: number;
  errorCorrection: ErrorCorrectionLevel;
}

/**
 * Estimates QR version (1 to 40) and module dimension (N x N)
 * based on UTF-8 payload byte length and error-correction level according to ISO/IEC 18004.
 */
export function estimateQRVersionAndModules(
  payloadByteLength: number,
  errorCorrection: ErrorCorrectionLevel = 'H'
): { version: number; moduleCount: number } {
  const moduleCount = estimateQRModuleCount(payloadByteLength, errorCorrection);
  const version = Math.max(1, Math.min(40, Math.round((moduleCount - 21) / 4) + 1));
  return { version, moduleCount };
}

/**
 * Baseline default sizes for each center element type
 */
export const DEFAULT_ELEMENT_SIZES: Record<'upload' | 'icon' | 'emoji', number> = {
  upload: 0.22,
  icon: 0.20,
  emoji: 0.20
};

/**
 * Dynamically calculates the safe center image/logo bounds based on:
 * - QR version / module count
 * - Error-correction level (L: 7%, M: 15%, Q: 25%, H: 30%)
 * - Center image dimensions & aspect ratio
 * - Required clear area / padding around the logo
 * - Center element type (upload, icon, emoji)
 *
 * Never permits unsafe fixed percentages that could break scanning.
 */
export function calculateSafeLogoBounds(
  config: QRConfig,
  naturalWidth?: number,
  naturalHeight?: number,
  elementType?: 'upload' | 'icon' | 'emoji'
): SafeLogoBoundsResult {
  const ec = (config.errorCorrection as ErrorCorrectionLevel) || 'M';
  const payload = buildQRPayload(config.type, config.content, ec);
  const utf8ByteLength = toUtf8ByteString(payload).length;
  const { version, moduleCount } = estimateQRVersionAndModules(utf8ByteLength, ec);

  // 1. Geometric Finder Pattern Clearance:
  // Finder patterns are 8x8 in 3 corners. The center gap is (moduleCount - 16).
  // We reserve at least 2 clear data modules between the logo and each finder pattern.
  const geometricLimit = Math.max(0.12, (moduleCount - 20) / moduleCount);

  // 2. Error Correction Capacity:
  // Safe linear occlusion budget to prevent degradation in dim light or glare
  let ecLimit = 0.33;
  if (ec === 'L') {
    ecLimit = 0.14; // Low (7%) can tolerate minimal obstruction
  } else if (ec === 'M') {
    ecLimit = 0.22; // Medium (15%)
  } else if (ec === 'Q') {
    ecLimit = 0.27; // Quartile (25%)
  } else {
    ecLimit = 0.33; // High (30%)
  }

  // 3. Module density penalty:
  // Denser QR codes have smaller physical modules, where lens blur can bleed across adjacent modules.
  let densityPenalty = 0;
  if (version >= 8) {
    densityPenalty = 0.04;
  } else if (version >= 5) {
    densityPenalty = 0.02;
  }

  // 4. Logo padding / clearance allowance:
  // If padding is active, it clears additional modules around the center image.
  const paddingPenalty = (config.logo?.padding || 0) > 8 ? 0.02 : 0;

  // 5. Aspect ratio consideration:
  let aspectPenalty = 0;
  if (naturalWidth && naturalHeight && naturalWidth > 0 && naturalHeight > 0) {
    const ratio = Math.max(naturalWidth / naturalHeight, naturalHeight / naturalWidth);
    if (ratio > 1.8) {
      aspectPenalty = 0.03;
    }
  }

  // Calculate safe maximum
  const rawMax = Math.min(geometricLimit, ecLimit - densityPenalty - paddingPenalty - aspectPenalty);
  const safeMin = 0.10;
  const safeMax = Math.max(safeMin + 0.04, Math.min(0.33, Number(rawMax.toFixed(2))));

  const activeType = elementType || config.logo?.type || 'upload';
  const baseDefault = DEFAULT_ELEMENT_SIZES[activeType] || 0.22;
  const defaultSize = Math.min(baseDefault, safeMax);

  // Resolve current active size: check type-specific setting first, then active size, then default
  const typeSpecific =
    activeType === 'upload'
      ? config.logo?.uploadSize
      : activeType === 'icon'
      ? config.logo?.iconSize
      : config.logo?.emojiSize;
  const rawCurrent = typeSpecific ?? config.logo?.size ?? defaultSize;

  const currentSize = Math.max(safeMin, Math.min(safeMax, Number(rawCurrent.toFixed(2))));
  const isAtMax = currentSize >= safeMax - 0.005;
  const isAtMin = currentSize <= safeMin + 0.005;

  let warning: string | null = null;
  if (isAtMax) {
    warning = `Maximum safe size reached (${Math.round(safeMax * 100)}%). Larger sizes could cover critical QR patterns and prevent devices from scanning.`;
  }

  return {
    safeMin,
    safeMax,
    defaultSize,
    currentSize,
    isAtMax,
    isAtMin,
    warning,
    version,
    moduleCount,
    errorCorrection: ec
  };
}

/**
 * Returns the effective, safe clamped logo/icon size for rendering and exporting
 */
export function getEffectiveLogoSize(config: QRConfig): number {
  if (!config.logo || !config.logo.enabled) return 0;
  const bounds = calculateSafeLogoBounds(config);
  const type = config.logo.type || 'upload';
  const typeSpecific =
    type === 'upload'
      ? config.logo.uploadSize
      : type === 'icon'
      ? config.logo.iconSize
      : config.logo.emojiSize;
  const raw = typeSpecific ?? config.logo.size ?? bounds.defaultSize;
  return Math.max(bounds.safeMin, Math.min(bounds.safeMax, Number(raw.toFixed(2))));
}

export interface CoverageAnalysis {
  coveragePercent: number; // e.g. 18 (%)
  recommendedLevel: ErrorCorrectionLevel;
  isSafe: boolean;
  status: 'optimal' | 'moderate' | 'risky';
  message: string;
  recommendedSize: number;
}

/**
 * Analyzes QR scanability coverage and recommends safe error correction level.
 */
export function evaluateLogoScanability(
  logoSize: number, // 0.1 to 0.4
  currentLevel: ErrorCorrectionLevel
): CoverageAnalysis {
  const coveragePercent = Math.round(logoSize * logoSize * 100);

  let recommendedLevel: ErrorCorrectionLevel = 'H';
  let isSafe = true;
  let status: 'optimal' | 'moderate' | 'risky' = 'optimal';
  let message = 'Looks great! Phones will be able to scan easily.';

  if (coveragePercent <= 6) {
    recommendedLevel = currentLevel === 'L' ? 'M' : currentLevel;
  } else if (coveragePercent <= 14) {
    recommendedLevel = currentLevel === 'L' ? 'Q' : currentLevel;
  } else {
    recommendedLevel = 'H';
  }

  if (currentLevel === 'L') {
    isSafe = false;
    status = 'risky';
    message = 'Scan Safety is too low. Please switch to High safety so your logo works.';
  } else if (currentLevel === 'M' && coveragePercent > 12) {
    isSafe = false;
    status = 'risky';
    message = `Your logo is a bit large for Medium safety. Switch to High safety for best results.`;
  } else if (coveragePercent > 28) {
    status = 'moderate';
    message = `Large logo (~${coveragePercent}%). Keep Scan Safety on Maximum.`;
  }

  return {
    coveragePercent,
    recommendedLevel,
    isSafe,
    status,
    message,
    recommendedSize: Math.min(0.24, Math.max(0.18, logoSize))
  };
}

/**
 * Helper to draw a rounded rectangle on a canvas context.
 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export interface StyledLogoOptions {
  shape: LogoShape;
  backgroundColor: string;
  borderStyle: LogoBorderStyle;
  borderColor: string;
  borderWidth: number;
  innerPadding?: number; // 0 to 20
}

/**
 * Generates a styled center badge Data URL with client-side shape clipping,
 * background color fill, and borders, preserving drag-free center positioning.
 */
export function generateStyledLogoDataUrl(
  rawSource: string,
  options: StyledLogoOptions
): Promise<string> {
  if (!rawSource) return Promise.resolve('');

  const cacheKey = `${rawSource.slice(0, 100)}_${rawSource.length}_${options.shape}_${options.backgroundColor}_${options.borderStyle}_${options.borderColor}_${options.borderWidth}_${options.innerPadding}`;
  const cached = styledLogoCache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!rawSource.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawSource);
        return;
      }

      ctx.clearRect(0, 0, size, size);

      const margin = 4;
      const badgeSize = size - margin * 2;
      const badgeX = margin;
      const badgeY = margin;

      // 1. Create Badge Clipping Path
      ctx.beginPath();
      if (options.shape === 'circle') {
        ctx.arc(size / 2, size / 2, badgeSize / 2, 0, Math.PI * 2);
      } else if (options.shape === 'rounded') {
        drawRoundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.22);
      } else if (options.shape === 'squircle') {
        drawRoundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.35);
      } else {
        // square - clean full bounds without rounded corners
        drawRoundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 0);
      }
      ctx.closePath();

      // 2. Fill Background ONLY if an explicit non-transparent color is specified
      const isTransparent =
        !options.backgroundColor ||
        options.backgroundColor === 'transparent' ||
        options.backgroundColor === 'none';

      if (!isTransparent) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fill();
      }

      // 3. Draw Image Inside Clipped Shape with Inner Padding
      ctx.save();
      const isBrandLogoIcon = rawSource.includes('Glowing_Orange_QR_Q_Icon_27c8178a.png');
      if (isBrandLogoIcon && options.shape === 'square') {
        drawRoundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.22);
        ctx.clip();
      } else if (options.shape !== 'square' || !isTransparent) {
        ctx.clip();
      }

      const innerPadPercent = (options.innerPadding ?? 0) / 100;
      const innerPad = badgeSize * innerPadPercent;
      const drawAreaW = badgeSize - innerPad * 2;
      const drawAreaH = badgeSize - innerPad * 2;

      // Contain fit
      const natW = img.naturalWidth || img.width || 512;
      const natH = img.naturalHeight || img.height || 512;
      const imgAspect = natW / (natH || 1);
      let drawW = drawAreaW;
      let drawH = drawAreaH;

      if (imgAspect > 1) {
        drawH = drawAreaW / imgAspect;
      } else {
        drawW = drawAreaH * imgAspect;
      }

      const drawX = badgeX + innerPad + (drawAreaW - drawW) / 2;
      const drawY = badgeY + innerPad + (drawAreaH - drawH) / 2;

      if (isBrandLogoIcon) {
        const cropInset = 0.088;
        const sx = natW * cropInset;
        const sy = natH * cropInset;
        const sw = natW * (1 - cropInset * 2);
        const sh = natH * (1 - cropInset * 2);
        ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
      } else {
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
      ctx.restore();

      // 4. Draw Border if configured
      if (
        options.borderStyle &&
        options.borderStyle !== 'none' &&
        options.borderWidth &&
        options.borderWidth > 0
      ) {
        ctx.beginPath();
        const strokeW = Math.max(1, (options.borderWidth / 100) * badgeSize * 2.5);
        ctx.lineWidth = strokeW;
        ctx.strokeStyle = options.borderColor || '#e2e8f0';

        if (options.borderStyle === 'dashed') {
          ctx.setLineDash([strokeW * 2, strokeW * 1.5]);
        } else {
          ctx.setLineDash([]);
        }

        const borderOffset = strokeW / 2;
        const bX = badgeX + borderOffset;
        const bY = badgeY + borderOffset;
        const bSize = badgeSize - strokeW;

        if (options.shape === 'circle') {
          ctx.arc(size / 2, size / 2, bSize / 2, 0, Math.PI * 2);
        } else if (options.shape === 'rounded') {
          drawRoundRect(ctx, bX, bY, bSize, bSize, bSize * 0.22);
        } else if (options.shape === 'squircle') {
          drawRoundRect(ctx, bX, bY, bSize, bSize, bSize * 0.35);
        } else {
          drawRoundRect(ctx, bX, bY, bSize, bSize, 4);
        }
        ctx.stroke();
      }

      const finalDataUrl = canvas.toDataURL('image/png');
      if (styledLogoCache.size >= MAX_LOGO_CACHE_SIZE) {
        const oldestKey = styledLogoCache.keys().next().value;
        if (oldestKey) styledLogoCache.delete(oldestKey);
      }
      styledLogoCache.set(cacheKey, finalDataUrl);
      resolve(finalDataUrl);
    };

    img.onerror = () => {
      resolve(rawSource);
    };

    img.src = rawSource;
  });
}
