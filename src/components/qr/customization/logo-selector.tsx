import * as React from 'react';
import {
  Upload,
  Image as ImageIcon,
  Smile,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  X,
  FileCheck,
  Layers,
  Square,
  Circle,
  HelpCircle
} from 'lucide-react';
import { LogoConfig, LogoShape, LogoBorderStyle, QRConfig, ErrorCorrectionLevel } from '../../../types/qr';
import { BUILT_IN_ICONS, ICON_CATEGORIES, POPULAR_EMOJIS, createEmojiSvgDataUri } from '../../../lib/icons-catalog';
import {
  validateImageFile,
  readImageFileAsDataUrl,
  evaluateLogoScanability,
  generateStyledLogoDataUrl
} from '../../../lib/logo-utils';
import { Slider, Switch } from '../../ui/slider';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Loader } from '../../ui/loader';
import { CenterElementSizeControl } from './center-element-size-control';
import { cn } from '../../../lib/utils';

interface LogoSelectorProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
}

const SHAPE_OPTIONS: { id: LogoShape; label: string; icon: React.ReactNode }[] = [
  { id: 'square', label: 'Square', icon: <Square className="w-3.5 h-3.5" /> },
  {
    id: 'rounded',
    label: 'Rounded',
    icon: (
      <div className="w-3.5 h-3.5 rounded border-2 border-current" />
    )
  },
  { id: 'circle', label: 'Circle', icon: <Circle className="w-3.5 h-3.5" /> },
  {
    id: 'squircle',
    label: 'Squircle',
    icon: (
      <div className="w-3.5 h-3.5 rounded-lg border-2 border-current" />
    )
  }
];

const PRESET_BG_COLORS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Off-White', value: '#f8fafc' },
  { label: 'Dark Slate', value: '#0f172a' },
  { label: 'Pitch Black', value: '#000000' },
  { label: 'Brand Indigo', value: '#4f46e5' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Rose', value: '#e11d48' }
];

export const LogoSelector: React.FC<LogoSelectorProps> = React.memo(({ config, onChange }) => {
  const { logo } = config;
  const [activeTab, setActiveTab] = React.useState<'upload' | 'icons' | 'emoji'>('upload');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Social');
  const [isDragging, setIsDragging] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Real-time scanability analysis
  const scanAnalysis = evaluateLogoScanability(logo.size, config.errorCorrection);
  const coveragePercent = scanAnalysis.coveragePercent;

  /**
   * Generates badge styling and updates QRConfig client-side.
   */
  const applyLogoUpdate = React.useCallback(
    async (
      partialLogo: Partial<LogoConfig>,
      extraUpdates?: { errorCorrection?: ErrorCorrectionLevel }
    ) => {
      setIsProcessing(true);
      try {
        const mergedLogo: LogoConfig = {
          ...config.logo,
          ...partialLogo
        };

        const raw = mergedLogo.originalSource || mergedLogo.source;
        let styledSource = raw;

        if (raw && mergedLogo.enabled) {
          const isUploaded = mergedLogo.type === 'upload';
          const isTransparent =
            !mergedLogo.backgroundColor ||
            mergedLogo.backgroundColor === 'transparent' ||
            mergedLogo.backgroundColor === 'none';

          // For uploaded images: if transparent, NEVER flatten onto a canvas badge!
          // Use the uploaded raw data URL directly so transparency and original pixels are 100% preserved!
          if (isUploaded && isTransparent) {
            styledSource = raw;
          } else {
            styledSource = await generateStyledLogoDataUrl(raw, {
              shape: mergedLogo.shape || (isUploaded ? 'square' : 'rounded'),
              backgroundColor: mergedLogo.backgroundColor || 'transparent',
              borderStyle: mergedLogo.borderStyle || 'none',
              borderColor: mergedLogo.borderColor || '#e2e8f0',
              borderWidth: mergedLogo.borderWidth || 2,
              innerPadding: mergedLogo.innerPadding ?? (isUploaded ? 0 : 10)
            });
          }
        }

        onChange(prev => ({
          ...prev,
          ...(extraUpdates || {}),
          logo: {
            ...mergedLogo,
            source: styledSource
          }
        }));
      } catch (err) {
        console.error('Failed to apply styled logo:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [config.logo, onChange]
  );

  /**
   * Processes a client-side file upload with type and size validation.
   */
  const handleProcessFile = async (file: File) => {
    setValidationError(null);
    const validation = validateImageFile(file);

    if (!validation.valid || !validation.file) {
      setValidationError(validation.error || 'Invalid image file.');
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await readImageFileAsDataUrl(validation.file);

      // Automatically recommend High (H) error correction if currently Low (L)
      const nextEC: ErrorCorrectionLevel =
        config.errorCorrection === 'L' ? 'H' : config.errorCorrection;

      const uploadSize = config.logo?.uploadSize ?? (config.logo?.type === 'upload' ? config.logo?.size : undefined) ?? 0.22;
      await applyLogoUpdate(
        {
          enabled: true,
          source: dataUrl,
          originalSource: dataUrl,
          fileName: validation.name,
          fileSize: validation.file.size,
          fileType: validation.format,
          type: 'upload',
          size: uploadSize,
          uploadSize: uploadSize,
          backgroundColor: 'transparent', // STRICT: Preserve original transparency without automatic white
          shape: 'square', // STRICT: Preserve natural proportions without forced circle/rounded box
          innerPadding: 0, // STRICT: No artificial inner padding
          padding: 0, // STRICT: No artificial clearance margin
          borderStyle: 'none',
          borderWidth: 0
        },
        { errorCorrection: nextEC }
      );
    } catch (err: any) {
      setValidationError(err?.message || 'Error processing image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset file input value so re-selecting same file works
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSelectBuiltIn = async (svgDataUri: string, iconName: string) => {
    setValidationError(null);
    const nextEC: ErrorCorrectionLevel =
      config.errorCorrection === 'L' ? 'H' : config.errorCorrection;
    const iconSize = config.logo?.iconSize ?? (config.logo?.type === 'icon' ? config.logo?.size : undefined) ?? 0.20;
    const isBrandIcon = svgDataUri.includes('Glowing_Orange_QR_Q_Icon_27c8178a.png');

    await applyLogoUpdate(
      {
        enabled: true,
        originalSource: svgDataUri,
        fileName: `${iconName} Icon`,
        fileType: isBrandIcon ? 'PNG' : 'SVG',
        type: 'icon',
        size: iconSize,
        iconSize: iconSize,
        shape: isBrandIcon ? 'rounded' : config.logo?.shape,
        innerPadding: isBrandIcon ? 0 : 12
      },
      { errorCorrection: nextEC }
    );
  };

  const handleSelectEmoji = async (emoji: string) => {
    setValidationError(null);
    const svg = createEmojiSvgDataUri(emoji);
    const nextEC: ErrorCorrectionLevel =
      config.errorCorrection === 'L' ? 'H' : config.errorCorrection;
    const emojiSize = config.logo?.emojiSize ?? (config.logo?.type === 'emoji' ? config.logo?.size : undefined) ?? 0.20;

    await applyLogoUpdate(
      {
        enabled: true,
        originalSource: svg,
        fileName: `${emoji} Emoji`,
        fileType: 'SVG',
        type: 'emoji',
        size: emojiSize,
        emojiSize: emojiSize,
        innerPadding: 8
      },
      { errorCorrection: nextEC }
    );
  };

  const handleRemoveLogo = () => {
    setValidationError(null);
    onChange(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        enabled: false,
        source: '',
        originalSource: '',
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined
      }
    }));
  };

  const handleReplaceClick = () => {
    setValidationError(null);
    fileInputRef.current?.click();
  };

  const handleAutoAdjustScanability = () => {
    onChange(prev => ({
      ...prev,
      errorCorrection: 'H',
      logo: {
        ...prev.logo,
        size: Math.min(0.24, prev.logo.size)
      }
    }));
  };

  const isTransparentBg =
    !logo.backgroundColor ||
    logo.backgroundColor === 'transparent' ||
    logo.backgroundColor === 'none';

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Image Upload / Replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* Header & Master Toggle */}
      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Center Logo
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
              Centered
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Add a logo, picture, or icon to the middle of your QR code
          </p>
        </div>
        <div className="flex items-center gap-2">
          {logo.enabled && (logo.source || logo.originalSource) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              title="Remove logo"
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Switch
            checked={logo.enabled}
            onCheckedChange={checked => {
              if (checked && !logo.source && !logo.originalSource) {
                // If turning on with no image, switch tab to upload
                setActiveTab('upload');
              }
              onChange(prev => ({
                ...prev,
                logo: { ...prev.logo, enabled: checked }
              }));
            }}
          />
        </div>
      </div>

      {/* Validation / Error Banner */}
      {validationError && (
        <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {logo.enabled && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Active Center Image Status Card */}
          {logo.source || logo.originalSource ? (
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-3">
                {/* Live Styled Badge Preview */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center p-1 shadow-xs overflow-hidden shrink-0",
                    isTransparentBg && "bg-[repeating-conic-gradient(#e2e8f0_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#334155_0%_25%,transparent_0%_50%)] [background-size:8px_8px]"
                  )}
                  style={{
                    backgroundColor: isTransparentBg ? 'transparent' : logo.backgroundColor
                  }}
                >
                  <img
                    src={logo.type === 'upload' ? (logo.originalSource || logo.source) : (logo.source || logo.originalSource)}
                    alt="Current Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Metadata & Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {logo.fileName || `Active ${logo.type.toUpperCase()}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500">
                    <span className="font-mono bg-neutral-200/60 dark:bg-neutral-700/60 px-1 py-0.2 rounded text-[10px] text-neutral-700 dark:text-neutral-300">
                      {logo.fileType || 'IMAGE'}
                    </span>
                    {logo.fileSize && (
                      <span>{Math.round(logo.fileSize / 1024)} KB</span>
                    )}
                    <span>•</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      ~{coveragePercent}% area
                    </span>
                  </div>
                </div>

                {/* Primary Actions: Replace & Remove */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    className="text-xs h-7 gap-1 px-2.5"
                    title="Replace image"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">Replace</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="text-xs h-7 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2"
                    title="Remove logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Automatic Center Positioning Banner */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                <Target className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="flex-1 truncate">
                  <strong className="font-semibold">Centered:</strong> Automatically placed in the middle
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Target className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Automatic Centering Ready</span>
                Upload an image or pick an icon below. It will stay centered automatically.
              </div>
            </div>
          )}

          {/* Real-time Scanability & Safe Coverage Guard */}
          <div
            className={cn(
              'p-3 rounded-xl border text-xs space-y-2 transition-all',
              scanAnalysis.status === 'optimal'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                : scanAnalysis.status === 'moderate'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-medium">
                {scanAnalysis.status === 'optimal' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>
                  Safe Size: <strong>{coveragePercent}%</strong> (Safe limit: 30%)
                </span>
              </div>
              <span className="text-[11px] font-mono bg-white/60 dark:bg-neutral-900/60 px-2 py-0.5 rounded font-semibold">
                Scan Safety: {config.errorCorrection}
              </span>
            </div>

            <p className="text-[11px] opacity-90 leading-tight">
              {scanAnalysis.message}
            </p>

            {/* Quick Auto-Adjust button if scanability is not optimal */}
            {(!scanAnalysis.isSafe || config.errorCorrection !== 'H') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoAdjustScanability}
                className="w-full text-xs h-7.5 bg-white/80 dark:bg-neutral-900/80 hover:bg-white border-current font-medium gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Set Scan Safety to High for Better Scanning</span>
              </Button>
            )}
          </div>

          {/* Source Tabs: Upload Image | Stock Icons | Emoji */}
          <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                activeTab === 'upload'
                  ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('icons')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                activeTab === 'icons'
                  ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Icons</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('emoji')}
              className={cn(
                'flex-1 py-1 px-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                activeTab === 'emoji'
                  ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              )}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Emoji</span>
            </button>
          </div>

          {/* TAB 1: Upload Image (Drag & Drop + File Picker) */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-[#E64500] bg-orange-50/50 dark:bg-orange-950/30 scale-[1.01]'
                    : 'border-neutral-300 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-700 bg-neutral-50/40 dark:bg-neutral-800/30',
                  isProcessing && 'cursor-wait pointer-events-none opacity-90'
                )}
              >
                {isProcessing ? (
                  <div className="py-2">
                    <Loader
                      variant="wave"
                      size="md"
                      label="Optimizing & formatting logo..."
                      sublabel="Generating pixel-crisp vector-safe preview"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-orange-400 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                      {logo.source ? 'Click or drag to replace image' : 'Add PNG, JPG, or SVG image'}
                    </span>
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Drag and drop here, or <span className="text-[#E64500] dark:text-orange-400 underline font-medium">browse files</span>
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                        PNG
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                        JPG / JPEG
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                        SVG
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        • Up to 5MB • Your files stay on your device
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Built-in Icons */}
          {activeTab === 'icons' && (
            <div className="space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {ICON_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-colors',
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {BUILT_IN_ICONS.filter(i => i.category === selectedCategory).map(icon => {
                  const isBrandIcon = icon.svg.includes('Glowing_Orange_QR_Q_Icon_27c8178a.png');
                  return (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => handleSelectBuiltIn(icon.svg, icon.name)}
                      title={icon.name}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 transition-all active:scale-95 cursor-pointer group"
                    >
                      <div className={cn("w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform", isBrandIcon && "rounded-md overflow-hidden bg-neutral-950")}>
                        <img
                          src={icon.svg}
                          alt={icon.name}
                          className={cn("w-6 h-6 object-contain", isBrandIcon && "object-cover scale-[1.18]")}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 truncate w-full text-center mt-1">
                        {icon.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Emoji */}
          {activeTab === 'emoji' && (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-1 max-h-48 overflow-y-auto">
              {POPULAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectEmoji(emoji)}
                  className="h-10 text-xl flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 transition-transform hover:scale-110 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* CONTROLS SECTION: Shape, Background, Padding, Size */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            {/* 1. Shape Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Logo Shape
                </label>
                <span className="text-[11px] text-neutral-500 capitalize">
                  {logo.shape}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {SHAPE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => applyLogoUpdate({ shape: opt.id })}
                    className={cn(
                      'py-1.5 px-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                      logo.shape === opt.id
                        ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/50 text-[#E64500] dark:text-orange-300 ring-1 ring-[#E64500] dark:ring-orange-500 font-semibold shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-orange-200 dark:hover:border-orange-900/60 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900'
                    )}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Background Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Logo Background
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyLogoUpdate({ backgroundColor: 'transparent' })}
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors border',
                      isTransparentBg
                        ? 'bg-[#E64500] text-white font-semibold border-transparent shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyLogoUpdate({
                        backgroundColor:
                          logo.backgroundColor === 'transparent' ? '#ffffff' : logo.backgroundColor
                      })
                    }
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors border',
                      !isTransparentBg
                        ? 'bg-[#E64500] text-white font-semibold border-transparent shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    Solid
                  </button>
                </div>
              </div>

              {!isTransparentBg && (
                <div className="space-y-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_BG_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => applyLogoUpdate({ backgroundColor: c.value })}
                        title={c.label}
                        className={cn(
                          'w-6 h-6 rounded-full border transition-transform cursor-pointer relative shadow-xs',
                          logo.backgroundColor.toLowerCase() === c.value.toLowerCase()
                            ? 'scale-110 ring-2 ring-[#E64500] ring-offset-1 dark:ring-offset-neutral-900'
                            : 'border-neutral-300 dark:border-neutral-700 hover:scale-105'
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={logo.backgroundColor || '#ffffff'}
                      onChange={e => applyLogoUpdate({ backgroundColor: e.target.value })}
                      className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 p-0.5 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={logo.backgroundColor || '#ffffff'}
                      onChange={e => applyLogoUpdate({ backgroundColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="h-7 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Center Element Size Controls (Independent size for Logo, Icon, and Emoji) */}
            <CenterElementSizeControl
              config={config}
              onChange={onChange}
              activeType={logo.type}
            />

            {/* 4. Padding / Clearance Around Image Slider */}
            <div>
              <Slider
                min={0}
                max={16}
                step={1}
                value={logo.padding}
                unit="px"
                label="Space Around Logo"
                onValueChange={padding =>
                  onChange(prev => ({
                    ...prev,
                    logo: { ...prev.logo, padding }
                  }))
                }
              />
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Empty space between QR dots and your logo
              </span>
            </div>

            {/* 5. Inner Badge Spacing Slider */}
            <div>
              <Slider
                min={0}
                max={25}
                step={1}
                value={logo.innerPadding ?? 0}
                unit="%"
                label="Space Inside Border"
                onValueChange={innerPadding => applyLogoUpdate({ innerPadding })}
              />
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Space between your logo image and its border
              </span>
            </div>

            {/* 6. Border Options */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Logo Border
                </label>
                <div className="flex items-center gap-1">
                  {(['none', 'solid', 'dashed'] as LogoBorderStyle[]).map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => applyLogoUpdate({ borderStyle: style })}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded capitalize cursor-pointer transition-colors border',
                        logo.borderStyle === style
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold border-transparent'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {logo.borderStyle !== 'none' && (
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={logo.borderColor || '#e2e8f0'}
                      onChange={e => applyLogoUpdate({ borderColor: e.target.value })}
                      className="w-6 h-6 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                    />
                    <Input
                      value={logo.borderColor || '#e2e8f0'}
                      onChange={e => applyLogoUpdate({ borderColor: e.target.value })}
                      className="h-7 text-xs font-mono uppercase"
                    />
                  </div>
                  <div>
                    <Slider
                      min={1}
                      max={6}
                      step={1}
                      value={logo.borderWidth || 2}
                      unit="px"
                      label="Border Thickness"
                      onValueChange={borderWidth => applyLogoUpdate({ borderWidth })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

LogoSelector.displayName = 'LogoSelector';

