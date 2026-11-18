import QRCodeStyling, {
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
  Options
} from 'qr-code-styling';
import { QRConfig, PatternType, EyeOuterStyle, EyeInnerStyle } from '../types/qr';
import {
  buildQRPayload,
  toUtf8ByteString,
  estimateQRModuleCount
} from './payload-builders';
import { getEffectiveLogoSize } from './logo-utils';

export function mapPatternType(type: PatternType): DotType {
  switch (type) {
    case 'square':
      return 'square';
    case 'dots':
      return 'dots';
    case 'rounded':
      return 'rounded';
    case 'extra-rounded':
      return 'extra-rounded';
    case 'classy':
      return 'classy';
    case 'classy-rounded':
      return 'classy-rounded';
    default:
      return 'rounded';
  }
}

export function mapCornerSquare(style: EyeOuterStyle): CornerSquareType {
  switch (style) {
    case 'square':
      return 'square';
    case 'rounded':
      return 'extra-rounded';
    case 'circle':
      return 'dot';
    case 'leaf':
      return 'classy';
    default:
      return 'extra-rounded';
  }
}

export function mapCornerDot(style: EyeInnerStyle): CornerDotType {
  switch (style) {
    case 'square':
      return 'square';
    case 'dot':
    case 'circle':
      return 'dot';
    case 'rounded':
      return 'rounded';
    default:
      return 'dot';
  }
}

export function createQRCodeStylingOptions(
  config: QRConfig,
  targetSize: number = 320,
  payloadOverride?: string
): Options {
  const rawPayload = payloadOverride !== undefined ? payloadOverride : buildQRPayload(config.type, config.content, config.errorCorrection);
  // Convert to UTF-8 Latin-1 byte stream so Unicode/emojis/Hindi are not corrupted by Byte-mode charCodeAt & 0xff
  const utf8Data = toUtf8ByteString(rawPayload);

  const dotsOptions: Options['dotsOptions'] = {
    type: mapPatternType(config.pattern.type),
    color: config.colors.foreground
  };

  if (config.colors.gradient.enabled) {
    const isLinear = config.colors.gradient.type === 'linear';
    dotsOptions.gradient = {
      type: isLinear ? 'linear' : 'radial',
      rotation: (config.colors.gradient.angle * Math.PI) / 180,
      colorStops: [
        { offset: 0, color: config.colors.gradient.startColor },
        { offset: 1, color: config.colors.gradient.endColor }
      ]
    };
  }

  const cornersSquareOptions: Options['cornersSquareOptions'] = {
    type: mapCornerSquare(config.eyes.outer),
    color: config.eyes.customEyes ? config.eyes.outerColor : config.colors.foreground
  };

  const cornersDotOptions: Options['cornersDotOptions'] = {
    type: mapCornerDot(config.eyes.inner),
    color: config.eyes.customEyes ? config.eyes.innerColor : config.colors.foreground
  };

  const isUpload = config.logo.type === 'upload';
  const isTransparent =
    !config.logo.backgroundColor ||
    config.logo.backgroundColor === 'transparent' ||
    config.logo.backgroundColor === 'none';

  // For uploaded images: use originalSource if transparent, or source if styled badge
  const imageSource =
    config.logo.enabled && (config.logo.source || config.logo.originalSource)
      ? isUpload && isTransparent
        ? config.logo.originalSource || config.logo.source
        : config.logo.source || config.logo.originalSource
      : undefined;

  // Enforce dynamic, safe logo size limit based on ISO bounds and error correction
  const clampedLogoSize = imageSource ? getEffectiveLogoSize(config) : 0;

  const imageOptions: Options['imageOptions'] = {
    hideBackgroundDots: true,
    imageSize: clampedLogoSize,
    margin: isUpload && isTransparent ? 0 : (config.logo.padding ?? 0),
    crossOrigin: 'anonymous'
  };

  // Dynamically compute quiet zone margin in pixels so that the standard ISO quiet zone
  // (at least config.quietZone modules) is preserved at ANY resolution (320px, 1024px, 4096px).
  const ec = (config.errorCorrection as ErrorCorrectionLevel) || 'M';
  const estimatedModules = estimateQRModuleCount(utf8Data.length || 20, ec);
  const totalModules = estimatedModules + (config.quietZone * 2);
  const dynamicMargin = Math.max(8, Math.round((targetSize / totalModules) * config.quietZone));

  return {
    width: targetSize,
    height: targetSize,
    data: utf8Data,
    margin: dynamicMargin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: ec
    },
    image: imageSource,
    imageOptions,
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: {
      color: config.colors.transparentBackground ? 'transparent' : config.colors.background
    }
  };
}

export function createQRCodeInstance(
  config: QRConfig,
  size: number = 320,
  payloadOverride?: string
): QRCodeStyling {
  const options = createQRCodeStylingOptions(config, size, payloadOverride);
  return new QRCodeStyling(options);
}
