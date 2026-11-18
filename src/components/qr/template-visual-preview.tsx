import * as React from 'react';
import { QRTemplate, PatternType, EyeOuterStyle, EyeInnerStyle } from '../../types/qr';

interface TemplateVisualPreviewProps {
  template: QRTemplate;
  size?: number; // width in pixels, default 100
  className?: string;
}

// Fixed pseudo-random QR matrix pattern (17x17 grid) representative of a clean QR code
const QR_GRID_PATTERN: number[][] = [
  // 17 columns x 17 rows: 1 = data dot, 0 = empty space
  // We leave (0..6, 0..6), (10..16, 0..6), and (0..6, 10..16) clear for the 3 finder eyes!
  [0,0,0,0,0,0,0, 1,0,1, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 0,1,0, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 1,1,1, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 0,0,1, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 1,0,0, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 0,1,1, 0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0, 1,0,1, 0,0,0,0,0,0,0],

  // Timing & middle data bands
  [1,0,1,0,1,0,1, 1,0,1, 1,0,1,0,1,0,1],
  [0,1,0,1,0,1,0, 0,1,0, 0,1,0,1,0,1,0],
  [1,1,0,0,1,0,1, 1,0,1, 1,0,0,1,1,0,1],

  // Bottom section
  [0,0,0,0,0,0,0, 0,1,0, 1,0,1,1,0,1,0],
  [0,0,0,0,0,0,0, 1,0,1, 0,1,0,0,1,0,1],
  [0,0,0,0,0,0,0, 0,1,1, 1,1,0,1,0,1,1],
  [0,0,0,0,0,0,0, 1,0,0, 0,1,1,0,1,0,0],
  [0,0,0,0,0,0,0, 0,1,0, 1,0,1,1,0,1,1],
  [0,0,0,0,0,0,0, 1,1,1, 0,1,0,0,1,1,0],
  [0,0,0,0,0,0,0, 0,0,1, 1,0,1,1,0,0,1]
];

export const TemplateVisualPreview: React.FC<TemplateVisualPreviewProps> = React.memo(({
  template,
  size = 110,
  className = ''
}) => {
  const { config } = template;
  const patternType: PatternType = config.pattern?.type || 'rounded';
  const foreground = config.colors?.foreground || '#000000';
  const background = config.colors?.transparentBackground ? 'transparent' : config.colors?.background || '#ffffff';
  const gradient = config.colors?.gradient;
  const hasGradient = gradient?.enabled;

  const eyes = config.eyes;
  const customEyes = eyes?.customEyes;
  const outerStyle: EyeOuterStyle = eyes?.outer || 'rounded';
  const innerStyle: EyeInnerStyle = eyes?.inner || 'rounded';
  const outerColor = customEyes ? eyes?.outerColor || foreground : foreground;
  const innerColor = customEyes ? eyes?.innerColor || foreground : foreground;

  const frame = config.frame;
  const hasFrame = frame && frame.preset !== 'none';
  const frameStyle = frame?.style || 'banner-bottom';
  const frameColor = frame?.color || foreground;
  const frameTextColor = frame?.textColor || '#ffffff';
  const frameText = frame?.text || 'SCAN ME';

  const isCard = config.layout?.type === 'card';
  const cardBg = isCard ? config.layout?.card?.backgroundColor || background : background;
  const cardBorder = isCard ? config.layout?.card?.borderColor || '#e5e7eb' : 'transparent';
  const cardRadius = isCard ? 10 : 8;

  // Unique gradient ID per template to avoid SVG ID collisions
  const gradId = `grad_${template.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // SVG coordinate system: 140 x 140 internal viewBox
  // If frame top or bottom, we adjust internal layout
  const vbWidth = 140;
  const vbHeight = hasFrame ? 160 : 140;
  const qrOffsetTop = hasFrame && frameStyle === 'banner-top' ? 24 : 10;
  const qrSize = 120;
  const qrOffsetLeft = 10;

  // Module dimensions
  const matrixCount = 17;
  const moduleSize = qrSize / matrixCount; // ~7.05px

  // Render a single data module based on pattern
  const renderModule = (x: number, y: number, col: number, row: number) => {
    const key = `m_${col}_${row}`;
    const fill = hasGradient ? `url(#${gradId})` : foreground;

    switch (patternType) {
      case 'dots':
        return <circle key={key} cx={x + moduleSize / 2} cy={y + moduleSize / 2} r={moduleSize * 0.42} fill={fill} />;
      case 'square':
        return <rect key={key} x={x + 0.3} y={y + 0.3} width={moduleSize - 0.6} height={moduleSize - 0.6} fill={fill} />;
      case 'extra-rounded':
        return <rect key={key} x={x + 0.4} y={y + 0.4} width={moduleSize - 0.8} height={moduleSize - 0.8} rx={moduleSize * 0.45} fill={fill} />;
      case 'classy':
        return (
          <polygon
            key={key}
            points={`${x + moduleSize / 2},${y + 0.4} ${x + moduleSize - 0.4},${y + moduleSize / 2} ${x + moduleSize / 2},${y + moduleSize - 0.4} ${x + 0.4},${y + moduleSize / 2}`}
            fill={fill}
          />
        );
      case 'classy-rounded':
        return (row + col) % 2 === 0 ? (
          <circle key={key} cx={x + moduleSize / 2} cy={y + moduleSize / 2} r={moduleSize * 0.42} fill={fill} />
        ) : (
          <rect key={key} x={x + 0.5} y={y + 0.5} width={moduleSize - 1} height={moduleSize - 1} rx={moduleSize * 0.3} fill={fill} />
        );
      case 'rounded':
      default:
        return <rect key={key} x={x + 0.4} y={y + 0.4} width={moduleSize - 0.8} height={moduleSize - 0.8} rx={moduleSize * 0.25} fill={fill} />;
    }
  };

  // Render corner finder eye (7 modules x 7 modules box)
  const renderCornerEye = (originX: number, originY: number, keyName: string) => {
    const boxSize = moduleSize * 7;
    const strokeW = moduleSize * 1.05;
    const innerBoxSize = moduleSize * 3;
    const innerCenterX = originX + boxSize / 2;
    const innerCenterY = originY + boxSize / 2;

    // Outer eye shape
    let outerElement: React.ReactNode;
    if (outerStyle === 'circle') {
      outerElement = (
        <circle
          cx={originX + boxSize / 2}
          cy={originY + boxSize / 2}
          r={boxSize / 2 - strokeW / 2}
          fill="none"
          stroke={outerColor}
          strokeWidth={strokeW}
        />
      );
    } else if (outerStyle === 'leaf') {
      const r = boxSize - strokeW;
      outerElement = (
        <path
          d={`M${originX + strokeW / 2},${originY + boxSize / 2} C${originX + strokeW / 2},${originY + strokeW / 2} ${originX + boxSize / 2},${originY + strokeW / 2} ${originX + boxSize - strokeW / 2},${originY + strokeW / 2} L${originX + boxSize - strokeW / 2},${originY + boxSize / 2} C${originX + boxSize - strokeW / 2},${originY + boxSize - strokeW / 2} ${originX + boxSize / 2},${originY + boxSize - strokeW / 2} ${originX + strokeW / 2},${originY + boxSize - strokeW / 2} Z`}
          fill="none"
          stroke={outerColor}
          strokeWidth={strokeW}
        />
      );
    } else if (outerStyle === 'square') {
      outerElement = (
        <rect
          x={originX + strokeW / 2}
          y={originY + strokeW / 2}
          width={boxSize - strokeW}
          height={boxSize - strokeW}
          fill="none"
          stroke={outerColor}
          strokeWidth={strokeW}
        />
      );
    } else {
      // rounded
      outerElement = (
        <rect
          x={originX + strokeW / 2}
          y={originY + strokeW / 2}
          width={boxSize - strokeW}
          height={boxSize - strokeW}
          rx={boxSize * 0.25}
          fill="none"
          stroke={outerColor}
          strokeWidth={strokeW}
        />
      );
    }

    // Inner eye shape
    let innerElement: React.ReactNode;
    if (innerStyle === 'circle' || innerStyle === 'dot') {
      const radius = innerStyle === 'dot' ? innerBoxSize * 0.42 : innerBoxSize * 0.48;
      innerElement = (
        <circle cx={innerCenterX} cy={innerCenterY} r={radius} fill={innerColor} />
      );
    } else if (innerStyle === 'square') {
      innerElement = (
        <rect
          x={innerCenterX - innerBoxSize / 2}
          y={innerCenterY - innerBoxSize / 2}
          width={innerBoxSize}
          height={innerBoxSize}
          fill={innerColor}
        />
      );
    } else {
      // rounded
      innerElement = (
        <rect
          x={innerCenterX - innerBoxSize / 2}
          y={innerCenterY - innerBoxSize / 2}
          width={innerBoxSize}
          height={innerBoxSize}
          rx={innerBoxSize * 0.28}
          fill={innerColor}
        />
      );
    }

    return (
      <g key={keyName}>
        {outerElement}
        {innerElement}
      </g>
    );
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ width: size, height: (size * vbHeight) / vbWidth }}
    >
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="w-full h-full drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {hasGradient && (
            <linearGradient
              id={gradId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradient.startColor} />
              <stop offset="100%" stopColor={gradient.endColor} />
            </linearGradient>
          )}
        </defs>

        {/* Card or QR Background */}
        <rect
          x="2"
          y="2"
          width={vbWidth - 4}
          height={vbHeight - 4}
          rx={cardRadius}
          fill={cardBg}
          stroke={cardBorder}
          strokeWidth={isCard ? '1.5' : '0'}
        />

        {/* Frame Top Banner if banner-top */}
        {hasFrame && frameStyle === 'banner-top' && (
          <g>
            <rect
              x="12"
              y="6"
              width={vbWidth - 24}
              height="16"
              rx="4"
              fill={frameColor}
            />
            <text
              x={vbWidth / 2}
              y="17"
              textAnchor="middle"
              fill={frameTextColor}
              fontSize="7"
              fontWeight="bold"
              letterSpacing="0.6"
              fontFamily="system-ui, sans-serif"
            >
              {frameText.length > 18 ? frameText.slice(0, 16) + '..' : frameText}
            </text>
          </g>
        )}

        {/* Data Modules Grid */}
        <g>
          {QR_GRID_PATTERN.map((rowArr, rowIndex) =>
            rowArr.map((isDark, colIndex) => {
              if (!isDark) return null;
              if (config.logo?.enabled) {
                const logoSizeRatio = config.logo.size || 0.22;
                const centerIdx = (matrixCount - 1) / 2;
                const halfSpread = (logoSizeRatio * matrixCount) / 2;
                if (
                  Math.abs(colIndex - centerIdx) < halfSpread &&
                  Math.abs(rowIndex - centerIdx) < halfSpread
                ) {
                  return null;
                }
              }
              const x = qrOffsetLeft + colIndex * moduleSize;
              const y = qrOffsetTop + rowIndex * moduleSize;
              return renderModule(x, y, colIndex, rowIndex);
            })
          )}
        </g>

        {/* 3 Corner Finder Patterns */}
        {/* Top-Left */}
        {renderCornerEye(qrOffsetLeft, qrOffsetTop, 'eye_tl')}
        {/* Top-Right */}
        {renderCornerEye(qrOffsetLeft + (matrixCount - 7) * moduleSize, qrOffsetTop, 'eye_tr')}
        {/* Bottom-Left */}
        {renderCornerEye(qrOffsetLeft, qrOffsetTop + (matrixCount - 7) * moduleSize, 'eye_bl')}

        {/* Center Logo / Icon if enabled */}
        {config.logo?.enabled && (
          <g>
            {/* Colored backing ONLY for icons/emojis when explicitly configured with a solid background */}
            {config.logo.type !== 'upload' &&
              config.logo.backgroundColor &&
              config.logo.backgroundColor !== 'transparent' &&
              config.logo.backgroundColor !== 'none' && (
                <rect
                  x={qrOffsetLeft + (qrSize - (config.logo.size || 0.22) * qrSize * 1.25) / 2}
                  y={qrOffsetTop + (qrSize - (config.logo.size || 0.22) * qrSize * 1.25) / 2}
                  width={(config.logo.size || 0.22) * qrSize * 1.25}
                  height={(config.logo.size || 0.22) * qrSize * 1.25}
                  rx={config.logo.shape === 'circle' ? ((config.logo.size || 0.22) * qrSize * 1.25) / 2 : 4}
                  fill={config.logo.backgroundColor}
                />
              )}
            {Boolean(config.logo.source || config.logo.originalSource) && (
              <image
                href={
                  config.logo.type === 'upload'
                    ? config.logo.originalSource || config.logo.source
                    : config.logo.source || config.logo.originalSource
                }
                x={qrOffsetLeft + (qrSize - (config.logo.size || 0.22) * qrSize) / 2}
                y={qrOffsetTop + (qrSize - (config.logo.size || 0.22) * qrSize) / 2}
                width={(config.logo.size || 0.22) * qrSize}
                height={(config.logo.size || 0.22) * qrSize}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {!config.logo.source && !config.logo.originalSource && config.logo.type === 'emoji' && config.logo.emoji && (
              <text
                x={qrOffsetLeft + qrSize / 2}
                y={qrOffsetTop + qrSize / 2 + 4}
                textAnchor="middle"
                fontSize="12"
              >
                {config.logo.emoji}
              </text>
            )}
          </g>
        )}

        {/* Frame Bottom Banner if banner-bottom or badge or scan-me */}
        {hasFrame && frameStyle !== 'banner-top' && (
          <g>
            <rect
              x={frame?.preset === 'badge' ? 24 : 14}
              y={qrOffsetTop + qrSize + 4}
              width={frame?.preset === 'badge' ? vbWidth - 48 : vbWidth - 28}
              height="16"
              rx={frame?.preset === 'badge' ? 8 : 4}
              fill={frameColor}
            />
            <text
              x={vbWidth / 2}
              y={qrOffsetTop + qrSize + 15}
              textAnchor="middle"
              fill={frameTextColor}
              fontSize="7"
              fontWeight="bold"
              letterSpacing="0.6"
              fontFamily="system-ui, sans-serif"
            >
              {frameText.length > 18 ? frameText.slice(0, 16) + '..' : frameText}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}, (prev, next) => {
  return (
    prev.template.id === next.template.id &&
    prev.size === next.size &&
    prev.className === next.className
  );
});

TemplateVisualPreview.displayName = 'TemplateVisualPreview';
