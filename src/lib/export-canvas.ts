import { QRConfig } from '../types/qr';
import { createQRCodeInstance } from './qr-renderer';
import { validateAndBuildPayload } from './payload-builders';

export interface ExportOptions {
  format: 'png' | 'svg' | 'jpeg' | 'webp';
  resolution: number; // e.g. 512, 1024, 2048, 4096
  quality?: number; // 0.1 to 1.0
  fileName?: string;
}

export async function renderCompositeCanvas(
  config: QRConfig,
  targetQRSize: number = 1024,
  forceOpaqueBackground: boolean = false
): Promise<HTMLCanvasElement> {
  // Validate content before rendering
  const validation = validateAndBuildPayload(config.type, config.content, config.errorCorrection);
  if (!validation.valid && !validation.payload) {
    throw new Error(validation.error || 'Please enter valid QR content before exporting');
  }

  const isCard = config.layout.type === 'card';
  const hasFrame = config.frame.preset !== 'none';
  const hasText = !!(config.text.heading || config.text.subtitle || config.text.footer);

  // 1. Create QR code on an offscreen canvas
  const qrInstance = createQRCodeInstance(config, targetQRSize);
  const qrRawBlob = await qrInstance.getRawData('png');
  if (!qrRawBlob) {
    throw new Error('Failed to generate base QR code image');
  }

  const qrImage = await loadImageFromBlob(qrRawBlob as Blob);

  // If no card, no frame, and no text, return clean QR canvas directly
  if (!isCard && !hasFrame && !hasText) {
    const directCanvas = document.createElement('canvas');
    directCanvas.width = targetQRSize;
    directCanvas.height = targetQRSize;
    const ctx = directCanvas.getContext('2d')!;

    // JPEG requires an opaque background or transparent pixels become black
    const shouldDrawBg = forceOpaqueBackground || !config.colors.transparentBackground;
    if (shouldDrawBg) {
      ctx.fillStyle = config.colors.background || '#ffffff';
      ctx.fillRect(0, 0, targetQRSize, targetQRSize);
    }
    ctx.drawImage(qrImage, 0, 0);
    return directCanvas;
  }

  // Calculate composite dimensions
  const scale = targetQRSize / 320;
  const padding = (isCard ? config.layout.card.padding : 24) * scale;
  const frameHeight = hasFrame ? 56 * scale : 0;
  let textHeight = 0;

  if (config.text.heading) textHeight += (config.text.headingSize + 12) * scale;
  if (config.text.subtitle) textHeight += 24 * scale;
  if (config.text.footer) textHeight += 24 * scale;

  const canvasWidth = targetQRSize + padding * 2;
  const canvasHeight = targetQRSize + padding * 2 + frameHeight + textHeight;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(canvasWidth);
  canvas.height = Math.round(canvasHeight);
  const ctx = canvas.getContext('2d')!;

  // Background determination
  let cardBg = isCard
    ? config.layout.card.backgroundColor
    : config.colors.transparentBackground
    ? 'transparent'
    : config.colors.background;

  if (forceOpaqueBackground && cardBg === 'transparent') {
    cardBg = '#ffffff';
  }

  if (cardBg !== 'transparent') {
    ctx.fillStyle = cardBg;
    if (isCard && config.layout.card.borderRadius > 0) {
      roundRect(
        ctx,
        0,
        0,
        canvasWidth,
        canvasHeight,
        config.layout.card.borderRadius * scale
      );
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  // Card Border
  if (isCard && config.layout.card.borderWidth > 0) {
    ctx.strokeStyle = config.layout.card.borderColor;
    ctx.lineWidth = config.layout.card.borderWidth * scale;
    roundRect(
      ctx,
      ctx.lineWidth / 2,
      ctx.lineWidth / 2,
      canvasWidth - ctx.lineWidth,
      canvasHeight - ctx.lineWidth,
      config.layout.card.borderRadius * scale
    );
    ctx.stroke();
  }

  let currentY = padding;

  const fontFamily = config.text.fontFamily ? `"${config.text.fontFamily}", sans-serif` : 'sans-serif';

  // Heading text (top)
  if (config.text.heading) {
    ctx.fillStyle = config.text.textColor;
    ctx.font = `${config.text.headingWeight === 'bold' ? 'bold' : 'normal'} ${Math.round(
      config.text.headingSize * scale
    )}px ${fontFamily}`;
    ctx.textAlign = config.text.alignment;
    const textX =
      config.text.alignment === 'center'
        ? canvasWidth / 2
        : config.text.alignment === 'right'
        ? canvasWidth - padding
        : padding;
    ctx.fillText(config.text.heading, textX, currentY + config.text.headingSize * scale);
    currentY += (config.text.headingSize + 16) * scale;
  }

  // Subtitle
  if (config.text.subtitle) {
    ctx.fillStyle = config.text.textColor + 'cc';
    ctx.font = `normal ${Math.round(14 * scale)}px ${fontFamily}`;
    ctx.textAlign = config.text.alignment;
    const textX =
      config.text.alignment === 'center'
        ? canvasWidth / 2
        : config.text.alignment === 'right'
        ? canvasWidth - padding
        : padding;
    ctx.fillText(config.text.subtitle, textX, currentY + 14 * scale);
    currentY += 24 * scale;
  }

  // Frame banner top (if preset is banner-top)
  if (hasFrame && config.frame.style === 'banner-top') {
    drawFrameBanner(ctx, config.frame, padding, currentY, targetQRSize, 44 * scale, scale);
    currentY += 52 * scale;
  }

  // Draw QR Image (qrImage already contains any logo properly positioned with quiet zones)
  const qrX = padding;
  const qrY = currentY;
  ctx.drawImage(qrImage, qrX, qrY, targetQRSize, targetQRSize);

  currentY += targetQRSize;

  // Frame banner bottom
  if (hasFrame && config.frame.style !== 'banner-top') {
    currentY += 8 * scale;
    drawFrameBanner(ctx, config.frame, padding, currentY, targetQRSize, 48 * scale, scale);
    currentY += 56 * scale;
  }

  // Footer text
  if (config.text.footer) {
    currentY += 12 * scale;
    ctx.fillStyle = config.text.textColor + '99';
    ctx.font = `normal ${Math.round(12 * scale)}px ${fontFamily}`;
    ctx.textAlign = config.text.alignment;
    const textX =
      config.text.alignment === 'center'
        ? canvasWidth / 2
        : config.text.alignment === 'right'
        ? canvasWidth - padding
        : padding;
    ctx.fillText(config.text.footer, textX, currentY + 12 * scale);
  }

  return canvas;
}

function drawFrameBanner(
  ctx: CanvasRenderingContext2D,
  frame: QRConfig['frame'],
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
) {
  ctx.save();
  ctx.fillStyle = frame.color;

  if (frame.preset === 'rounded' || frame.preset === 'scan-me') {
    roundRect(ctx, x, y, width, height, 12 * scale);
    ctx.fill();
  } else if (frame.preset === 'badge') {
    roundRect(ctx, x + width * 0.1, y, width * 0.8, height, 24 * scale);
    ctx.fill();
  } else if (frame.preset === 'minimal') {
    ctx.strokeStyle = frame.color;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(x, y, width, height);
  } else {
    ctx.fillRect(x, y, width, height);
  }

  // Text inside frame
  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(frame.text || 'SCAN ME', x + width / 2, y + height / 2);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(img);
    };
    img.onerror = e => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Generates an SVG string representing either the pure vector QR or the complete composite
 * with card layout, frame, and text.
 */
export async function getSVGString(config: QRConfig, targetQRSize: number = 512): Promise<string> {
  const isCard = config.layout.type === 'card';
  const hasFrame = config.frame.preset !== 'none';
  const hasText = !!(config.text.heading || config.text.subtitle || config.text.footer);

  const qrInstance = createQRCodeInstance(config, targetQRSize);
  const svgBlob = await qrInstance.getRawData('svg');
  if (!svgBlob) throw new Error('Failed to generate base SVG');

  const rawSvgText = await (svgBlob as Blob).text();

  // If no card, no frame, and no text, return clean vector QR SVG directly
  if (!isCard && !hasFrame && !hasText) {
    return rawSvgText;
  }

  // Composite SVG with card container, frame banner, and typography
  const scale = targetQRSize / 320;
  const padding = (isCard ? config.layout.card.padding : 24) * scale;
  const frameHeight = hasFrame ? 56 * scale : 0;
  let textHeight = 0;

  if (config.text.heading) textHeight += (config.text.headingSize + 12) * scale;
  if (config.text.subtitle) textHeight += 24 * scale;
  if (config.text.footer) textHeight += 24 * scale;

  const totalW = Math.round(targetQRSize + padding * 2);
  const totalH = Math.round(targetQRSize + padding * 2 + frameHeight + textHeight);

  const cardBg = isCard
    ? config.layout.card.backgroundColor
    : config.colors.transparentBackground
    ? 'none'
    : config.colors.background;

  let currentY = padding;
  let textElements = '';
  const svgFontFamily = escapeXml(config.text.fontFamily || 'sans-serif');

  const buildSvgFrameBanner = (yPos: number, heightVal: number) => {
    const h = Math.round(heightVal);
    const preset = config.frame.preset;
    let rectEl = '';
    if (preset === 'minimal') {
      rectEl = `<rect x="${padding}" y="${yPos}" width="${targetQRSize}" height="${h}" fill="none" stroke="${config.frame.color}" stroke-width="${Math.max(1, Math.round(2 * scale))}" rx="${Math.round(6 * scale)}" />`;
    } else if (preset === 'badge') {
      const badgeX = Math.round(padding + targetQRSize * 0.1);
      const badgeW = Math.round(targetQRSize * 0.8);
      rectEl = `<rect x="${badgeX}" y="${yPos}" width="${badgeW}" height="${h}" fill="${config.frame.color}" rx="${Math.round(24 * scale)}" />`;
    } else if (preset === 'solid') {
      rectEl = `<rect x="${padding}" y="${yPos}" width="${targetQRSize}" height="${h}" fill="${config.frame.color}" rx="0" />`;
    } else {
      rectEl = `<rect x="${padding}" y="${yPos}" width="${targetQRSize}" height="${h}" fill="${config.frame.color}" rx="${Math.round(12 * scale)}" />`;
    }
    const textFill = preset === 'minimal' ? config.frame.color : config.frame.textColor;
    const labelEl = `<text x="${totalW / 2}" y="${Math.round(yPos + h * 0.58)}" fill="${textFill}" font-family="${svgFontFamily}" font-weight="bold" font-size="${Math.round(14 * scale)}" text-anchor="middle">${escapeXml(config.frame.text || 'SCAN ME')}</text>`;
    return rectEl + labelEl;
  };

  if (config.text.heading) {
    const align = config.text.alignment;
    const tx = align === 'center' ? totalW / 2 : align === 'right' ? totalW - padding : padding;
    const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
    textElements += `<text x="${tx}" y="${currentY + config.text.headingSize * scale}" fill="${config.text.textColor}" font-family="${svgFontFamily}" font-weight="${config.text.headingWeight === 'bold' ? 'bold' : 'normal'}" font-size="${Math.round(config.text.headingSize * scale)}" text-anchor="${anchor}">${escapeXml(config.text.heading)}</text>`;
    currentY += (config.text.headingSize + 16) * scale;
  }

  if (config.text.subtitle) {
    const align = config.text.alignment;
    const tx = align === 'center' ? totalW / 2 : align === 'right' ? totalW - padding : padding;
    const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
    textElements += `<text x="${tx}" y="${currentY + 14 * scale}" fill="${config.text.textColor}" opacity="0.8" font-family="${svgFontFamily}" font-size="${Math.round(14 * scale)}" text-anchor="${anchor}">${escapeXml(config.text.subtitle)}</text>`;
    currentY += 24 * scale;
  }

  if (hasFrame && config.frame.style === 'banner-top') {
    textElements += buildSvgFrameBanner(currentY, 44 * scale);
    currentY += 52 * scale;
  }

  const qrY = currentY;
  currentY += targetQRSize;

  if (hasFrame && config.frame.style !== 'banner-top') {
    currentY += 8 * scale;
    textElements += buildSvgFrameBanner(currentY, 48 * scale);
    currentY += 56 * scale;
  }

  if (config.text.footer) {
    currentY += 12 * scale;
    const align = config.text.alignment;
    const tx = align === 'center' ? totalW / 2 : align === 'right' ? totalW - padding : padding;
    const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
    textElements += `<text x="${tx}" y="${currentY + 12 * scale}" fill="${config.text.textColor}" opacity="0.65" font-family="${svgFontFamily}" font-size="${Math.round(12 * scale)}" text-anchor="${anchor}">${escapeXml(config.text.footer)}</text>`;
  }

  // Strip XML declaration and outer svg tags from raw QR svg to embed as nested svg
  const cleanedQrSvg = rawSvgText
    .replace(/<\?xml[\s\S]*?\?>/i, '')
    .replace(/<!DOCTYPE[\s\S]*?>/i, '');

  return `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  ${cardBg !== 'none' ? `<rect width="${totalW}" height="${totalH}" fill="${cardBg}" rx="${isCard ? config.layout.card.borderRadius * scale : 0}" ${isCard && config.layout.card.borderWidth > 0 ? `stroke="${config.layout.card.borderColor}" stroke-width="${config.layout.card.borderWidth * scale}"` : ''} />` : ''}
  ${textElements}
  <g transform="translate(${padding}, ${qrY})">
    ${cleanedQrSvg}
  </g>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function exportQRCode(
  config: QRConfig,
  options: ExportOptions
): Promise<void> {
  const fileName = options.fileName || `makeqrr-${Date.now()}`;

  if (options.format === 'svg') {
    // Generate true vector SVG export (matching preview)
    const svgString = await getSVGString(config, options.resolution);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    downloadUrl(url, `${fileName}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
    return;
  }

  // For JPEG: force opaque white background so transparent background doesn't turn black
  const isJpeg = options.format === 'jpeg';
  const canvas = await renderCompositeCanvas(config, options.resolution, isJpeg);
  const mimeType = isJpeg ? 'image/jpeg' : options.format === 'webp' ? 'image/webp' : 'image/png';
  const quality = options.quality ?? 0.95;

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to generate image file for download'));
        return;
      }
      try {
        const url = URL.createObjectURL(blob);
        downloadUrl(url, `${fileName}.${options.format}`);
        setTimeout(() => URL.revokeObjectURL(url), 2500);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, mimeType, quality);
  });
}

export async function copyQRImageToClipboard(config: QRConfig): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || !('write' in navigator.clipboard) || typeof ClipboardItem === 'undefined') {
    throw new Error('Image copying to clipboard is not supported in this browser. Please use Download PNG instead.');
  }

  const canvas = await renderCompositeCanvas(config, 1024, false);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (!blob) {
        reject(new Error('Failed to generate image for copying'));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        resolve();
      } catch (err: any) {
        reject(new Error(err?.message || 'Could not copy image to clipboard. Please use Download PNG.'));
      }
    }, 'image/png');
  });
}

export async function getQRBlob(
  config: QRConfig,
  format: 'png' | 'jpeg' = 'png',
  resolution: number = 800
): Promise<Blob> {
  const isJpeg = format === 'jpeg';
  const canvas = await renderCompositeCanvas(config, resolution, isJpeg);
  const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image blob'));
    }, mimeType, 0.95);
  });
}

export async function getQRImageFile(
  config: QRConfig,
  fileName: string = 'makeqrr.png'
): Promise<File> {
  const blob = await getQRBlob(config, 'png', 800);
  return new File([blob], fileName, { type: 'image/png' });
}

function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 100);
}
