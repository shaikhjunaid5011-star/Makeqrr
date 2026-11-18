export type QRType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'contact'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'location'
  | 'event'
  | 'social'
  | 'payment';

export type SocialPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'github'
  | 'telegram';

export interface QRContentMap {
  url: {
    url: string;
  };
  text: {
    text: string;
  };
  wifi: {
    ssid: string;
    password: string;
    encryption: 'WPA' | 'WEP' | 'nopass' | 'WPA3';
    hidden: boolean;
  };
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  email: {
    email: string;
    subject: string;
    message: string;
  };
  phone: {
    phone: string;
    countryCode?: string;
    nationalNumber?: string;
  };
  sms: {
    phone: string;
    message: string;
    format?: 'smsto' | 'rfc5724';
  };
  whatsapp: {
    phone: string;
    countryCode?: string;
    nationalNumber?: string;
    message: string;
  };
  location: {
    address?: string;
    placeName?: string;
    mapsUrl?: string;
    latitude?: string;
    longitude?: string;
    label?: string;
    format?: 'maps' | 'geo';
  };
  event: {
    title: string;
    location: string;
    start: string;
    end: string;
    description: string;
  };
  social: {
    platform: SocialPlatform;
    username: string;
  };
  payment: {
    type: 'upi' | 'generic';
    upiId: string;
    name: string;
    amount?: string;
    note?: string;
  };
}

export type PatternType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type EyeOuterStyle = 'square' | 'rounded' | 'circle' | 'leaf' | 'extra-rounded';
export type EyeInnerStyle = 'square' | 'circle' | 'dot' | 'rounded' | 'diamond' | 'leaf';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  startColor: string;
  endColor: string;
  angle: number; // 0 - 360
}

export type LogoShape = 'square' | 'rounded' | 'circle' | 'squircle';
export type LogoBorderStyle = 'none' | 'solid' | 'dashed';

export interface LogoConfig {
  enabled: boolean;
  source: string; // Processed Data URL for QR embedding
  originalSource?: string; // Raw uploaded image / vector before badge processing
  fileName?: string; // Original uploaded file name
  fileSize?: number; // File size in bytes
  fileType?: string; // MIME type or extension e.g. 'PNG'
  type: 'upload' | 'icon' | 'emoji';
  emoji?: string;
  size: number; // 0.1 to 0.4 (fraction of QR width)
  uploadSize?: number; // Independent customized size for uploaded logo
  iconSize?: number; // Independent customized size for built-in icons
  emojiSize?: number; // Independent customized size for center emojis
  padding: number; // 0 to 20 (QR module clearance margin)
  innerPadding?: number; // 0 to 30 (inner padding inside the badge)
  shape: LogoShape;
  backgroundColor: string; // e.g. '#ffffff' or 'transparent'
  borderStyle: LogoBorderStyle;
  borderColor: string;
  borderWidth: number;
  removeBgBehindLogo?: boolean;
}

export type LayoutType = 'qr-only' | 'qr-text' | 'qr-logo-text' | 'card';

export type FramePreset =
  | 'none'
  | 'simple'
  | 'solid'
  | 'rounded'
  | 'badge'
  | 'scan-me'
  | 'camera'
  | 'social'
  | 'business'
  | 'event'
  | 'minimal'
  | 'banner'
  | 'polaroid';

export interface TextConfig {
  heading: string;
  subtitle: string;
  footer: string;
  fontFamily: string;
  headingSize: number; // px
  headingWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor: string;
  letterSpacing: number; // px
  alignment: 'center' | 'left' | 'right';
}

export interface FrameConfig {
  preset: FramePreset;
  text: string;
  color: string;
  textColor: string;
  backgroundColor: string;
  style: 'banner-bottom' | 'banner-top' | 'pill' | 'outline' | 'badge';
}

export interface CardLayoutConfig {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
}

export interface QRConfig {
  id?: string;
  title?: string;
  updatedAt?: number;
  type: QRType;
  content: QRContentMap;

  pattern: {
    type: PatternType;
    color: string;
  };

  eyes: {
    customEyes: boolean;
    outer: EyeOuterStyle;
    inner: EyeInnerStyle;
    outerColor: string;
    innerColor: string;
  };

  colors: {
    foreground: string;
    background: string;
    transparentBackground: boolean;
    gradient: GradientConfig;
  };

  logo: LogoConfig;

  errorCorrection: ErrorCorrectionLevel;
  quietZone: number; // modules, default 4

  layout: {
    type: LayoutType;
    card: CardLayoutConfig;
  };

  frame: FrameConfig;
  text: TextConfig;

  size: {
    width: number;
    height: number;
  };
}

export interface ScanabilityIssue {
  severity: 'warning' | 'risky';
  title: string;
  description: string;
  recommendation: string;
}

export interface ScanabilityAudit {
  score: 'excellent' | 'warning' | 'risky';
  contrastRatio: number;
  logoCoverage: number; // percentage (0 - 100)
  issues: ScanabilityIssue[];
}

export type QRTemplateCategory =
  | 'business'
  | 'restaurant'
  | 'social'
  | 'contact'
  | 'event'
  | 'marketing'
  | 'payment'
  | 'wifi'
  | 'portfolio'
  | 'personal';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface QRTemplate {
  id: string;
  name: string;
  category: QRTemplateCategory;
  description: string;
  previewColor: string;
  tag?: string;
  config: DeepPartial<QRConfig>;
}
