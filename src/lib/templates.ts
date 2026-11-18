import { QRTemplate } from '../types/qr';
import { BUILT_IN_ICONS } from './icons-catalog';

const getIcon = (id: string): string => {
  const item = BUILT_IN_ICONS.find(i => i.id === id);
  return item ? item.svg : '';
};

export const QR_TEMPLATES: QRTemplate[] = [
  // ==========================================
  // 1. BUSINESS CATEGORY
  // ==========================================
  {
    id: 'executive-dark',
    name: 'Executive Onyx',
    category: 'business',
    tag: 'Popular',
    description: 'Crisp square dots, deep charcoal tone, subtle border badge for professional business cards and pitch decks.',
    previewColor: '#0f172a',
    config: {
      pattern: { type: 'square', color: '#0f172a' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#0f172a',
        innerColor: '#0f172a'
      },
      colors: {
        foreground: '#0f172a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f172a', endColor: '#334155', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('briefcase'),
        originalSource: getIcon('briefcase'),
        shape: 'rounded',
        size: 0.2,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'SCAN TO CONNECT',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#f8fafc',
        style: 'banner-bottom'
      },
      text: {
        heading: 'EXECUTIVE PROFILE',
        subtitle: 'Point camera to view credentials',
        footer: 'Direct Business Card',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 16,
        headingWeight: 'bold',
        textColor: '#0f172a',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'corporate-sapphire',
    name: 'Corporate Sapphire',
    category: 'business',
    tag: 'Enterprise',
    description: 'Distinguished deep navy tone with classy rounded modules, ideal for enterprise collateral and investor reports.',
    previewColor: '#1e3a8a',
    config: {
      pattern: { type: 'classy-rounded', color: '#1e3a8a' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#1e3a8a',
        innerColor: '#2563eb'
      },
      colors: {
        foreground: '#1e3a8a',
        background: '#f8fafc',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#1e3a8a',
          endColor: '#2563eb',
          angle: 120
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('building'),
        originalSource: getIcon('building'),
        shape: 'circle',
        size: 0.2,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'scan-me',
        text: 'VIEW COMPANY PROFILE',
        color: '#1e3a8a',
        textColor: '#ffffff',
        backgroundColor: '#ffffff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'DIRECT LINK',
        subtitle: 'Verified Company Directory',
        footer: 'Enterprise Security Verified',
        fontFamily: 'Inter',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#1e3a8a',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#cbd5e1',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'slate-modernist',
    name: 'Slate Modernist',
    category: 'business',
    description: 'Ultra-refined charcoal slate with leaf eyes and minimalist high-density layout. Best for architectural & design firms.',
    previewColor: '#334155',
    config: {
      pattern: { type: 'classy', color: '#334155' },
      eyes: {
        customEyes: true,
        outer: 'leaf',
        inner: 'leaf',
        outerColor: '#1e293b',
        innerColor: '#334155'
      },
      colors: {
        foreground: '#334155',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#334155', endColor: '#475569', angle: 0 }
      },
      frame: {
        preset: 'minimal',
        text: 'SCAN TO EXPLORE',
        color: '#334155',
        textColor: '#ffffff',
        backgroundColor: '#ffffff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'STUDIO DIRECTORY',
        subtitle: 'Selected Works & Case Studies',
        footer: 'Published Quarterly',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 14,
        headingWeight: 'bold',
        textColor: '#1e293b',
        letterSpacing: 1.2,
        alignment: 'center'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 8,
          padding: 18,
          shadow: 'none'
        }
      },
      quietZone: 4,
      errorCorrection: 'M'
    }
  },
  {
    id: 'venture-emerald',
    name: 'Venture Emerald',
    category: 'business',
    tag: 'Modern',
    description: 'High-energy tech forest gradient with extra-rounded dots and circular corner markers. Perfect for high-growth tech firms.',
    previewColor: '#059669',
    config: {
      pattern: { type: 'extra-rounded', color: '#059669' },
      eyes: {
        customEyes: true,
        outer: 'extra-rounded',
        inner: 'circle',
        outerColor: '#065f46',
        innerColor: '#10b981'
      },
      colors: {
        foreground: '#059669',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#047857',
          endColor: '#059669',
          angle: 135
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('badge-check'),
        originalSource: getIcon('badge-check'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ecfdf5',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'JOIN THE SYNDICATE',
        color: '#065f46',
        textColor: '#ffffff',
        backgroundColor: '#ecfdf5',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#a7f3d0',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'black-gold-vip',
    name: 'Black & Gold Executive',
    category: 'business',
    tag: 'Premium',
    description: 'Rich dark palette with deep amber-gold accents and diamond eye centers for high-net-worth consulting and luxury firms.',
    previewColor: '#b45309',
    config: {
      pattern: { type: 'classy', color: '#18181b' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'diamond',
        outerColor: '#b45309',
        innerColor: '#d97706'
      },
      colors: {
        foreground: '#18181b',
        background: '#fffbeb',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#18181b', endColor: '#27272a', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'VIP PRIVATE ACCESS',
        color: '#b45309',
        textColor: '#ffffff',
        backgroundColor: '#fffbeb',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fde68a',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 2. RESTAURANT & MENU CATEGORY
  // ==========================================
  {
    id: 'artisan-bistro',
    name: 'Artisan Bistro',
    category: 'restaurant',
    tag: 'Popular',
    description: 'Rustic warm espresso brown with rounded dots and cutlery center badge for tabletop menus, wine lists, and bar tops.',
    previewColor: '#78350f',
    config: {
      pattern: { type: 'dots', color: '#78350f' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#78350f',
        innerColor: '#92400e'
      },
      colors: {
        foreground: '#78350f',
        background: '#fefce8',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#78350f', endColor: '#92400e', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('utensils'),
        originalSource: getIcon('utensils'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'VIEW SEASONAL MENU',
        color: '#78350f',
        textColor: '#ffffff',
        backgroundColor: '#fefce8',
        style: 'banner-bottom'
      },
      text: {
        heading: 'TABLE RESERVATION & MENU',
        subtitle: 'Point your camera to order digitally',
        footer: 'Kitchen closes at 10 PM',
        fontFamily: 'Inter',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#78350f',
        letterSpacing: 0.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fef08a',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'haute-gastronomie',
    name: 'Haute Gastronomie',
    category: 'restaurant',
    tag: 'Luxury',
    description: 'Deep burgundy and velvet red palette with classy diamond modules for fine dining establishments and sommelier lists.',
    previewColor: '#831843',
    config: {
      pattern: { type: 'classy', color: '#831843' },
      eyes: {
        customEyes: true,
        outer: 'circle',
        inner: 'diamond',
        outerColor: '#831843',
        innerColor: '#9d174d'
      },
      colors: {
        foreground: '#831843',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#831843',
          endColor: '#9d174d',
          angle: 45
        }
      },
      frame: {
        preset: 'polaroid',
        text: 'TASTING MENU & PAIRINGS',
        color: '#831843',
        textColor: '#ffffff',
        backgroundColor: '#fff1f2',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecdd3',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'roastery-coffee',
    name: 'Specialty Coffee Lounge',
    category: 'restaurant',
    description: 'Warm roasted coffee tones with coffee cup center logo and friendly rounded markers for cafes and brew bars.',
    previewColor: '#451a03',
    config: {
      pattern: { type: 'rounded', color: '#451a03' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'rounded',
        outerColor: '#451a03',
        innerColor: '#78350f'
      },
      colors: {
        foreground: '#451a03',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#451a03', endColor: '#78350f', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('coffee'),
        originalSource: getIcon('coffee'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#fef3c7',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'SPECIALTY DRINKS & PASTRIES',
        color: '#451a03',
        textColor: '#ffffff',
        backgroundColor: '#fef3c7',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fed7aa',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'pizzeria-trattoria',
    name: 'Tuscan Trattoria',
    category: 'restaurant',
    description: 'Tuscan terracotta and deep tomato red for pizzerias, food trucks, and casual family dining.',
    previewColor: '#b91c1c',
    config: {
      pattern: { type: 'extra-rounded', color: '#b91c1c' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#991b1b',
        innerColor: '#dc2626'
      },
      colors: {
        foreground: '#b91c1c',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#b91c1c', endColor: '#dc2626', angle: 45 }
      },
      frame: {
        preset: 'banner',
        text: 'TABLE ORDER & FAST PAY',
        color: '#991b1b',
        textColor: '#ffffff',
        backgroundColor: '#fef2f2',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fca5a5',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 3. SOCIAL MEDIA CATEGORY
  // ==========================================
  {
    id: 'instagram-sunset',
    name: 'Sunset Glow',
    category: 'social',
    tag: 'Trending',
    description: 'Striking magenta to warm orange sunset gradient with circular eyes and Instagram center logo.',
    previewColor: '#e1306c',
    config: {
      pattern: { type: 'extra-rounded', color: '#e1306c' },
      eyes: {
        customEyes: true,
        outer: 'circle',
        inner: 'circle',
        outerColor: '#c026d3',
        innerColor: '#ea580c'
      },
      colors: {
        foreground: '#e1306c',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#c026d3',
          endColor: '#f97316',
          angle: 45
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('instagram'),
        originalSource: getIcon('instagram'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'FOLLOW ON INSTAGRAM',
        color: '#c026d3',
        textColor: '#ffffff',
        backgroundColor: '#fdf4ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fbcfe8',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'tiktok-pulse',
    name: 'Electric Cyan Pulse',
    category: 'social',
    tag: 'Vibrant',
    description: 'High-contrast black matrix with electric cyan and magenta eye accents for viral short-form video creators.',
    previewColor: '#0891b2',
    config: {
      pattern: { type: 'dots', color: '#0f172a' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'dot',
        outerColor: '#0891b2',
        innerColor: '#e11d48'
      },
      colors: {
        foreground: '#0f172a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f172a', endColor: '#1e293b', angle: 45 }
      },
      frame: {
        preset: 'banner',
        text: 'WATCH VIRAL CLIPS',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#ecfeff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#cffafe',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'youtube-creator',
    name: 'Creator Studio Red',
    category: 'social',
    description: 'Iconic YouTube scarlet red with play-button center branding and high-visibility scan frame for video channels.',
    previewColor: '#dc2626',
    config: {
      pattern: { type: 'rounded', color: '#dc2626' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#dc2626',
        innerColor: '#991b1b'
      },
      colors: {
        foreground: '#dc2626',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#dc2626', endColor: '#991b1b', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('youtube'),
        originalSource: getIcon('youtube'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'scan-me',
        text: 'SUBSCRIBE & WATCH',
        color: '#dc2626',
        textColor: '#ffffff',
        backgroundColor: '#fef2f2',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecaca',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'linkedin-pro',
    name: 'Executive Network Pro',
    category: 'social',
    description: 'Deep LinkedIn royal blue with verified professional tone and networking call to action.',
    previewColor: '#0a66c2',
    config: {
      pattern: { type: 'classy', color: '#0a66c2' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#0a66c2',
        innerColor: '#0284c7'
      },
      colors: {
        foreground: '#0a66c2',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0a66c2', endColor: '#0284c7', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('linkedin'),
        originalSource: getIcon('linkedin'),
        shape: 'rounded',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CONNECT ON LINKEDIN',
        color: '#0a66c2',
        textColor: '#ffffff',
        backgroundColor: '#f0f9ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#bae6fd',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'community-discord',
    name: 'Discord Cyber Violet',
    category: 'social',
    description: 'Blurple indigo tone with chat bubble center emblem for gaming groups, DAOs, and developer servers.',
    previewColor: '#5865f2',
    config: {
      pattern: { type: 'extra-rounded', color: '#5865f2' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#5865f2',
        innerColor: '#4338ca'
      },
      colors: {
        foreground: '#5865f2',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#5865f2',
          endColor: '#4f46e5',
          angle: 90
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('message-circle'),
        originalSource: getIcon('message-circle'),
        shape: 'circle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#eef2ff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'JOIN OUR SERVER',
        color: '#4338ca',
        textColor: '#ffffff',
        backgroundColor: '#eef2ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#c7d2fe',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 4. CONTACT / VCARD CATEGORY
  // ==========================================
  {
    id: 'vcard-teal',
    name: 'Modern vCard Teal',
    category: 'contact',
    tag: 'Popular',
    description: 'Fresh emerald teal tone with phone contact icon and card layout for seamless one-tap smartphone contact addition.',
    previewColor: '#0d9488',
    config: {
      pattern: { type: 'rounded', color: '#0f766e' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#0f766e',
        innerColor: '#14b8a6'
      },
      colors: {
        foreground: '#0f766e',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#0f766e',
          endColor: '#0d9488',
          angle: 45
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('phone-call'),
        originalSource: getIcon('phone-call'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'ADD TO CONTACTS',
        color: '#0f766e',
        textColor: '#ffffff',
        backgroundColor: '#f0fdfa',
        style: 'banner-bottom'
      },
      text: {
        heading: 'DIGITAL BUSINESS CARD',
        subtitle: 'Scan to save number & email',
        footer: 'Direct VCF Import',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#0f766e',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#99f6e4',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'signature-monogram',
    name: 'Signature Monogram',
    category: 'contact',
    description: 'Refined deep graphite with square matrix and circle inner eyes for senior executives and consultants.',
    previewColor: '#1e293b',
    config: {
      pattern: { type: 'square', color: '#1e293b' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'circle',
        outerColor: '#0f172a',
        innerColor: '#334155'
      },
      colors: {
        foreground: '#1e293b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#1e293b', endColor: '#334155', angle: 45 }
      },
      frame: {
        preset: 'minimal',
        text: 'SAVE CONTACT VCARD',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#ffffff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 12,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'realtor-gold',
    name: 'Premier Real Estate',
    category: 'contact',
    tag: 'Luxury',
    description: 'Rich onyx slate with gold accents for luxury real estate agents, brokers, and architectural consultants.',
    previewColor: '#ca8a04',
    config: {
      pattern: { type: 'classy-rounded', color: '#1c1917' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#ca8a04',
        innerColor: '#a16207'
      },
      colors: {
        foreground: '#1c1917',
        background: '#fffdf5',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#1c1917', endColor: '#292524', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('building'),
        originalSource: getIcon('building'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'AGENT CONTACT & LISTINGS',
        color: '#ca8a04',
        textColor: '#ffffff',
        backgroundColor: '#fefce8',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fef08a',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'clinical-blue',
    name: 'Medical & Clinic vCard',
    category: 'contact',
    description: 'Clean medical sapphire blue with verified check badge for healthcare professionals and clinics.',
    previewColor: '#0284c7',
    config: {
      pattern: { type: 'rounded', color: '#0369a1' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'square',
        outerColor: '#0369a1',
        innerColor: '#0284c7'
      },
      colors: {
        foreground: '#0369a1',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0369a1', endColor: '#0284c7', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('badge-check'),
        originalSource: getIcon('badge-check'),
        shape: 'circle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#f0f9ff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'DOCTOR PROFILE & BOOKING',
        color: '#0369a1',
        textColor: '#ffffff',
        backgroundColor: '#f0f9ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#bae6fd',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 5. EVENTS CATEGORY
  // ==========================================
  {
    id: 'wedding-romance',
    name: 'Rose Gold Wedding',
    category: 'event',
    tag: 'Wedding',
    description: 'Romantic blush rose gold with classy diamond pattern and polaroid frame for wedding invitations and RSVP cards.',
    previewColor: '#be123c',
    config: {
      pattern: { type: 'classy', color: '#be123c' },
      eyes: {
        customEyes: true,
        outer: 'circle',
        inner: 'diamond',
        outerColor: '#be123c',
        innerColor: '#e11d48'
      },
      colors: {
        foreground: '#be123c',
        background: '#fff1f2',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#be123c', endColor: '#e11d48', angle: 45 }
      },
      frame: {
        preset: 'polaroid',
        text: 'SAVE OUR DATE & RSVP',
        color: '#be123c',
        textColor: '#ffffff',
        backgroundColor: '#fff1f2',
        style: 'banner-bottom'
      },
      text: {
        heading: 'OUR WEDDING CELEBRATION',
        subtitle: 'Scan to view venue & RSVP',
        footer: 'Together With Our Families',
        fontFamily: 'Inter',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#be123c',
        letterSpacing: 1.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecdd3',
          borderWidth: 1.5,
          borderRadius: 18,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'tech-summit-dark',
    name: 'Tech Summit Pass',
    category: 'event',
    tag: 'Conference',
    description: 'High-contrast cobalt matrix with calendar center icon for developer summits, keynotes, and hackathons.',
    previewColor: '#2563eb',
    config: {
      pattern: { type: 'square', color: '#1e3a8a' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#1d4ed8',
        innerColor: '#2563eb'
      },
      colors: {
        foreground: '#1e3a8a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#1e3a8a',
          endColor: '#2563eb',
          angle: 90
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('calendar'),
        originalSource: getIcon('calendar'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CONFERENCE BADGE & SCHEDULE',
        color: '#1d4ed8',
        textColor: '#ffffff',
        backgroundColor: '#eff6ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#bfdbfe',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'festival-sunset',
    name: 'Festival Horizon Glow',
    category: 'event',
    tag: 'Music',
    description: 'Vivid electric violet to coral gradient with ticket emblem for festivals, raves, concerts, and nightlife.',
    previewColor: '#9333ea',
    config: {
      pattern: { type: 'dots', color: '#9333ea' },
      eyes: {
        customEyes: true,
        outer: 'circle',
        inner: 'circle',
        outerColor: '#7e22ce',
        innerColor: '#e11d48'
      },
      colors: {
        foreground: '#9333ea',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#7e22ce',
          endColor: '#e11d48',
          angle: 135
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('ticket'),
        originalSource: getIcon('ticket'),
        shape: 'circle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#faf5ff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'LINEUP & STAGE TIMETABLE',
        color: '#7e22ce',
        textColor: '#ffffff',
        backgroundColor: '#faf5ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e9d5ff',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'black-tie-gala',
    name: 'Black Tie Gala RSVP',
    category: 'event',
    description: 'Midnight luxury with gold accents for charity galas, film premiers, and formal anniversary banquets.',
    previewColor: '#ca8a04',
    config: {
      pattern: { type: 'classy', color: '#09090b' },
      eyes: {
        customEyes: true,
        outer: 'leaf',
        inner: 'diamond',
        outerColor: '#ca8a04',
        innerColor: '#a16207'
      },
      colors: {
        foreground: '#09090b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#09090b', endColor: '#18181b', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'GALA ENTRY & SEATING',
        color: '#ca8a04',
        textColor: '#ffffff',
        backgroundColor: '#fefce8',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fef08a',
          borderWidth: 1.5,
          borderRadius: 14,
          padding: 20,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 6. MARKETING CATEGORY
  // ==========================================
  {
    id: 'flash-sale-bold',
    name: 'Flash Sale High-Vis',
    category: 'marketing',
    tag: 'Promo',
    description: 'Urgent vivid crimson red with discount tag center logo for retail promotions, pop-up stores, and coupons.',
    previewColor: '#e11d48',
    config: {
      pattern: { type: 'extra-rounded', color: '#e11d48' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#be123c',
        innerColor: '#e11d48'
      },
      colors: {
        foreground: '#e11d48',
        background: '#fff1f2',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#e11d48', endColor: '#be123c', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('tag'),
        originalSource: getIcon('tag'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'CLAIM 30% DISCOUNT CODE',
        color: '#be123c',
        textColor: '#ffffff',
        backgroundColor: '#fff1f2',
        style: 'banner-bottom'
      },
      text: {
        heading: 'LIMITED TIME OFFER',
        subtitle: 'Scan in-store to unlock instant savings',
        footer: 'Valid on all merchandise today only',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 16,
        headingWeight: 'bold',
        textColor: '#be123c',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecdd3',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'product-packaging',
    name: 'Product Label & Authenticity',
    category: 'marketing',
    description: 'Precision slate dots with company badge for product boxes, bottle labels, hang tags, and user manuals.',
    previewColor: '#0f172a',
    config: {
      pattern: { type: 'dots', color: '#0f172a' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#0f172a',
        innerColor: '#334155'
      },
      colors: {
        foreground: '#0f172a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f172a', endColor: '#334155', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('badge-check'),
        originalSource: getIcon('badge-check'),
        shape: 'rounded',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'VERIFY AUTHENTIC PRODUCT',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#f8fafc',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          borderRadius: 12,
          padding: 18,
          shadow: 'none'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'loyalty-rewards',
    name: 'VIP Member Rewards',
    category: 'marketing',
    tag: 'Rewards',
    description: 'Royal violet with shopping bag emblem for customer loyalty clubs, cashback apps, and point redemption.',
    previewColor: '#7c3aed',
    config: {
      pattern: { type: 'extra-rounded', color: '#6d28d9' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#6d28d9',
        innerColor: '#8b5cf6'
      },
      colors: {
        foreground: '#6d28d9',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#6d28d9',
          endColor: '#8b5cf6',
          angle: 90
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('shopping-bag'),
        originalSource: getIcon('shopping-bag'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'scan-me',
        text: 'COLLECT REWARD POINTS',
        color: '#6d28d9',
        textColor: '#ffffff',
        backgroundColor: '#f5f3ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#ddd6fe',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'billboard-highvis',
    name: 'Outdoor Billboard High-Vis',
    category: 'marketing',
    tag: 'High-Vis',
    description: 'Ultra-high contrast black on solid yellow badge frame for long-distance scanning on transit stops, posters, and billboards.',
    previewColor: '#eab308',
    config: {
      pattern: { type: 'square', color: '#000000' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#000000',
        innerColor: '#000000'
      },
      colors: {
        foreground: '#000000',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#000000', endColor: '#000000', angle: 0 }
      },
      frame: {
        preset: 'badge',
        text: 'SCAN FROM ANY DISTANCE',
        color: '#000000',
        textColor: '#ffffff',
        backgroundColor: '#fef08a',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#eab308',
          borderWidth: 2,
          borderRadius: 14,
          padding: 22,
          shadow: 'md'
        }
      },
      quietZone: 5,
      errorCorrection: 'H'
    }
  },

  // ==========================================
  // 7. PAYMENT CATEGORY
  // ==========================================
  {
    id: 'fintech-violet',
    name: 'Neo-Bank Violet',
    category: 'payment',
    tag: 'Fintech',
    description: 'Modern indigo gradient with credit card emblem for touchless cashier desks, peer-to-peer payments, and e-wallets.',
    previewColor: '#4f46e5',
    config: {
      pattern: { type: 'extra-rounded', color: '#4f46e5' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#4338ca',
        innerColor: '#6366f1'
      },
      colors: {
        foreground: '#4338ca',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#4338ca',
          endColor: '#6366f1',
          angle: 135
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('credit-card'),
        originalSource: getIcon('credit-card'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'TOUCHLESS INSTANT PAY',
        color: '#4338ca',
        textColor: '#ffffff',
        backgroundColor: '#eef2ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'TOUCHLESS CASHIER',
        subtitle: 'Point camera to authorize instant checkout',
        footer: '256-Bit Encrypted Payment Flow',
        fontFamily: 'Inter',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#4338ca',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#c7d2fe',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'crypto-web3',
    name: 'Web3 Crypto Terminal',
    category: 'payment',
    tag: 'Crypto',
    description: 'Deep obsidian black with electric cyan markers and wallet center icon for Bitcoin, Ethereum, and Solana payments.',
    previewColor: '#06b6d4',
    config: {
      pattern: { type: 'square', color: '#09090b' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#0891b2',
        innerColor: '#06b6d4'
      },
      colors: {
        foreground: '#09090b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#09090b', endColor: '#18181b', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wallet'),
        originalSource: getIcon('wallet'),
        shape: 'rounded',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'SEND CRYPTO TO WALLET',
        color: '#0891b2',
        textColor: '#ffffff',
        backgroundColor: '#ecfeff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#a5f3fc',
          borderWidth: 1.5,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'pos-merchant',
    name: 'Merchant POS Express',
    category: 'payment',
    description: 'Forest green payment terminal design with banknote emblem for fast in-store cashier scanning.',
    previewColor: '#059669',
    config: {
      pattern: { type: 'rounded', color: '#047857' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#047857',
        innerColor: '#10b981'
      },
      colors: {
        foreground: '#047857',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#047857', endColor: '#059669', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('banknote'),
        originalSource: getIcon('banknote'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'SCAN TO PAY BILL',
        color: '#047857',
        textColor: '#ffffff',
        backgroundColor: '#ecfdf5',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#a7f3d0',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'secure-vault-pay',
    name: 'Premier Secure Vault',
    category: 'payment',
    description: 'Deep charcoal bronze with warm gold border for luxury goods checkout and private banking transfers.',
    previewColor: '#d97706',
    config: {
      pattern: { type: 'classy', color: '#1c1917' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'diamond',
        outerColor: '#d97706',
        innerColor: '#b45309'
      },
      colors: {
        foreground: '#1c1917',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#1c1917', endColor: '#292524', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'SECURE ESCROW CHECKOUT',
        color: '#b45309',
        textColor: '#ffffff',
        backgroundColor: '#fffbeb',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fde68a',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 8. WI-FI CATEGORY
  // ==========================================
  {
    id: 'wifi-boutique-hotel',
    name: 'Boutique Hotel Wi-Fi',
    category: 'wifi',
    tag: 'Hospitality',
    description: 'Navy slate tone with Wi-Fi vector badge and elegant card layout for hotel rooms, lobbies, and guest suites.',
    previewColor: '#1e293b',
    config: {
      pattern: { type: 'rounded', color: '#0f172a' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#0f172a',
        innerColor: '#2563eb'
      },
      colors: {
        foreground: '#0f172a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f172a', endColor: '#1e293b', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wifi'),
        originalSource: getIcon('wifi'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#eff6ff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CONNECT TO GUEST WI-FI',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#f8fafc',
        style: 'banner-bottom'
      },
      text: {
        heading: 'COMPLIMENTARY HIGH-SPEED WI-FI',
        subtitle: 'Point camera to connect automatically',
        footer: 'Enjoy your stay · Front desk dial 0',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#0f172a',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 24,
          shadow: 'md'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'wifi-cafe-espresso',
    name: 'Roast & Brew Guest Wi-Fi',
    category: 'wifi',
    description: 'Warm cafe espresso brown with Wi-Fi center icon for coffee shops, bakeries, and reading lounges.',
    previewColor: '#451a03',
    config: {
      pattern: { type: 'dots', color: '#451a03' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#451a03',
        innerColor: '#78350f'
      },
      colors: {
        foreground: '#451a03',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#451a03', endColor: '#78350f', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wifi'),
        originalSource: getIcon('wifi'),
        shape: 'circle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#fef3c7',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'FREE CUSTOMER WI-FI',
        color: '#451a03',
        textColor: '#ffffff',
        backgroundColor: '#fef3c7',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fed7aa',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'wifi-coworking-hub',
    name: 'Coworking Fast Connect',
    category: 'wifi',
    tag: 'Tech',
    description: 'Clean modern teal with extra-rounded modules for shared offices, incubators, and campus libraries.',
    previewColor: '#0f766e',
    config: {
      pattern: { type: 'extra-rounded', color: '#0f766e' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#0f766e',
        innerColor: '#14b8a6'
      },
      colors: {
        foreground: '#0f766e',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f766e', endColor: '#14b8a6', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wifi'),
        originalSource: getIcon('wifi'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CAMPUS 1GBPS GUEST NETWORK',
        color: '#0f766e',
        textColor: '#ffffff',
        backgroundColor: '#f0fdfa',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#99f6e4',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'wifi-transit-express',
    name: 'Airport Express Wi-Fi',
    category: 'wifi',
    description: 'High-contrast cobalt blue with plane & wifi treatment for transit hubs, train stations, and airport terminals.',
    previewColor: '#1d4ed8',
    config: {
      pattern: { type: 'square', color: '#1e3a8a' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#1d4ed8',
        innerColor: '#2563eb'
      },
      colors: {
        foreground: '#1e3a8a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#1e3a8a', endColor: '#1d4ed8', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wifi'),
        originalSource: getIcon('wifi'),
        shape: 'rounded',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'scan-me',
        text: 'FREE TERMINAL WI-FI',
        color: '#1d4ed8',
        textColor: '#ffffff',
        backgroundColor: '#eff6ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#bfdbfe',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 9. PORTFOLIO CATEGORY
  // ==========================================
  {
    id: 'architect-studio',
    name: 'Architect Monolith',
    category: 'portfolio',
    tag: 'Minimal',
    description: 'Precision monochrome slate with classy angular dots and pure white border for architects and structural designers.',
    previewColor: '#18181b',
    config: {
      pattern: { type: 'classy', color: '#18181b' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#18181b',
        innerColor: '#27272a'
      },
      colors: {
        foreground: '#18181b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#18181b', endColor: '#27272a', angle: 45 }
      },
      frame: {
        preset: 'minimal',
        text: 'EXPLORE BLUEPRINTS & BUILDS',
        color: '#18181b',
        textColor: '#ffffff',
        backgroundColor: '#ffffff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'SELECTED ARCHITECTURE',
        subtitle: 'Master plans, renderings & monographs',
        footer: 'Studio Portfolio 2026',
        fontFamily: 'Inter',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#18181b',
        letterSpacing: 1.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e4e4e7',
          borderWidth: 1.5,
          borderRadius: 12,
          padding: 24,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'M'
    }
  },
  {
    id: 'photographer-darkroom',
    name: 'Visual Darkroom',
    category: 'portfolio',
    tag: 'Creative',
    description: 'Monochromatic obsidian matrix with rounded eyes for fine art photographers, cinematographers, and printmakers.',
    previewColor: '#000000',
    config: {
      pattern: { type: 'dots', color: '#000000' },
      eyes: {
        customEyes: true,
        outer: 'circle',
        inner: 'dot',
        outerColor: '#000000',
        innerColor: '#000000'
      },
      colors: {
        foreground: '#000000',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#000000', endColor: '#18181b', angle: 45 }
      },
      frame: {
        preset: 'polaroid',
        text: 'VIEW FULL GALLERY',
        color: '#000000',
        textColor: '#ffffff',
        backgroundColor: '#f4f4f5',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e4e4e7',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'M'
    }
  },
  {
    id: 'ux-product-designer',
    name: 'UX Product Showcase',
    category: 'portfolio',
    tag: 'Popular',
    description: 'Vibrant indigo-to-violet linear gradient with smooth extra-rounded geometry for digital product & UX designers.',
    previewColor: '#6366f1',
    config: {
      pattern: { type: 'extra-rounded', color: '#4f46e5' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#4f46e5',
        innerColor: '#7c3aed'
      },
      colors: {
        foreground: '#4f46e5',
        background: '#ffffff',
        transparentBackground: false,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#4f46e5',
          endColor: '#7c3aed',
          angle: 135
        }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('laptop'),
        originalSource: getIcon('laptop'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'VIEW CASE STUDIES & PROTOTYPES',
        color: '#4f46e5',
        textColor: '#ffffff',
        backgroundColor: '#eef2ff',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#c7d2fe',
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'indie-maker-stack',
    name: 'Indie Creator Stack',
    category: 'portfolio',
    description: 'Warm amber tones with laptop emblem for indie hackers, open-source maintainers, and solopreneurs.',
    previewColor: '#d97706',
    config: {
      pattern: { type: 'rounded', color: '#b45309' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'rounded',
        outerColor: '#b45309',
        innerColor: '#d97706'
      },
      colors: {
        foreground: '#b45309',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#b45309', endColor: '#d97706', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('laptop'),
        originalSource: getIcon('laptop'),
        shape: 'squircle',
        size: 0.22,
        innerPadding: 8,
        backgroundColor: '#fef3c7',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'banner',
        text: 'EXPLORE LIVE PRODUCTS',
        color: '#b45309',
        textColor: '#ffffff',
        backgroundColor: '#fef3c7',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fde68a',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },

  // ==========================================
  // 10. PERSONAL CATEGORY
  // ==========================================
  {
    id: 'minimal-zen-monochrome',
    name: 'Zen Monochrome',
    category: 'personal',
    tag: 'Clean',
    description: 'Pure aesthetic simplicity: high-contrast dark graphite on crisp white with gentle leaf eye contours.',
    previewColor: '#1f2937',
    config: {
      pattern: { type: 'rounded', color: '#1f2937' },
      eyes: {
        customEyes: true,
        outer: 'leaf',
        inner: 'dot',
        outerColor: '#111827',
        innerColor: '#1f2937'
      },
      colors: {
        foreground: '#1f2937',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#1f2937', endColor: '#374151', angle: 45 }
      },
      frame: {
        preset: 'minimal',
        text: 'PERSONAL HOMEPAGE',
        color: '#111827',
        textColor: '#ffffff',
        backgroundColor: '#ffffff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'MY PERSONAL SPACE',
        subtitle: 'Links, writings, and thoughts',
        footer: 'Updated weekly',
        fontFamily: 'Inter',
        headingSize: 14,
        headingWeight: 'normal',
        textColor: '#1f2937',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          borderRadius: 14,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'M'
    }
  },
  {
    id: 'cyber-matrix',
    name: 'Cyber Matrix Protocol',
    category: 'personal',
    description: 'Emerald phosphor green dots with sharp square geometry for crypto enthusiasts, hackers, and terminal lovers.',
    previewColor: '#059669',
    config: {
      pattern: { type: 'square', color: '#047857' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#047857',
        innerColor: '#10b981'
      },
      colors: {
        foreground: '#047857',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#047857', endColor: '#10b981', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'CONNECT PROTOCOL',
        color: '#047857',
        textColor: '#ffffff',
        backgroundColor: '#ecfdf5',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#a7f3d0',
          borderWidth: 1,
          borderRadius: 12,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'terracotta-warmth',
    name: 'Warm Terracotta Studio',
    category: 'personal',
    description: 'Earthy Mediterranean terracotta tone with rounded modules for lifestyle blogs, ceramicists, and craft makers.',
    previewColor: '#c2410c',
    config: {
      pattern: { type: 'rounded', color: '#c2410c' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'circle',
        outerColor: '#9a3412',
        innerColor: '#ea580c'
      },
      colors: {
        foreground: '#c2410c',
        background: '#fffaf5',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#c2410c', endColor: '#ea580c', angle: 45 }
      },
      frame: {
        preset: 'polaroid',
        text: 'VISIT MY WORKSHOP',
        color: '#9a3412',
        textColor: '#ffffff',
        backgroundColor: '#fffaf5',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#ffedd5',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Forest Sage',
    category: 'personal',
    tag: 'Eco',
    description: 'Deep forest green with natural leaf eye motifs for botanical gardens, eco-initiatives, and outdoor enthusiasts.',
    previewColor: '#15803d',
    config: {
      pattern: { type: 'classy-rounded', color: '#15803d' },
      eyes: {
        customEyes: true,
        outer: 'leaf',
        inner: 'leaf',
        outerColor: '#166534',
        innerColor: '#22c55e'
      },
      colors: {
        foreground: '#15803d',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#15803d', endColor: '#166534', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'NATURE & BOTANY JOURNAL',
        color: '#166534',
        textColor: '#ffffff',
        backgroundColor: '#f0fdf4',
        style: 'banner-bottom'
      },
      layout: {
        type: 'qr-only',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#bbf7d0',
          borderWidth: 1,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  // ==========================================
  // ADDITIONAL PREMIER TEMPLATES (50+ TOTAL)
  // ==========================================
  {
    id: 'nordic-consulting',
    name: 'Nordic Strategic Advisory',
    category: 'business',
    tag: 'Executive',
    description: 'Crisp ice blue and deep fjord navy with diamond eyes. Engineered for high-end advisory, management consulting, and fintech boards.',
    previewColor: '#0369a1',
    config: {
      pattern: { type: 'rounded', color: '#0c4a6e' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'diamond',
        outerColor: '#0369a1',
        innerColor: '#0284c7'
      },
      colors: {
        foreground: '#0c4a6e',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: true, type: 'linear', startColor: '#0c4a6e', endColor: '#0284c7', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('building'),
        originalSource: getIcon('building'),
        shape: 'rounded',
        size: 0.18,
        innerPadding: 6,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CONNECT WITH SENIOR PARTNER',
        color: '#0c4a6e',
        textColor: '#ffffff',
        backgroundColor: '#f0f9ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'NORDIC STRATEGIC ADVISORY',
        subtitle: 'Management Consulting & Strategy',
        footer: 'Verified Member Profile',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#0c4a6e',
        letterSpacing: 0.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e0f2fe',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'legal-chambers',
    name: 'Chambers & Counsel Legal',
    category: 'business',
    tag: 'Legal',
    description: 'Authoritative deep crimson and vintage gold framing with square precision modules. Ideal for barristers, notary publics, and legal counsel.',
    previewColor: '#881337',
    config: {
      pattern: { type: 'square', color: '#4c0519' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'square',
        outerColor: '#881337',
        innerColor: '#be123c'
      },
      colors: {
        foreground: '#4c0519',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#4c0519', endColor: '#881337', angle: 0 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('badge-check'),
        originalSource: getIcon('badge-check'),
        shape: 'circle',
        size: 0.18,
        innerPadding: 6,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'business',
        text: 'LEGAL ATTESTATION',
        color: '#881337',
        textColor: '#ffffff',
        backgroundColor: '#fff1f2',
        style: 'banner-bottom'
      },
      text: {
        heading: 'CHAMBERS & COUNSEL',
        subtitle: 'Attorneys & Counselors at Law',
        footer: 'Direct Case Record & Verification',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#4c0519',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecdd3',
          borderWidth: 1.5,
          borderRadius: 12,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'H'
    }
  },
  {
    id: 'sushi-omakase',
    name: 'Omakase Reserve',
    category: 'restaurant',
    tag: 'Gourmet',
    description: 'Obsidian charcoal with fresh wasabi green eye accents. Tailored for Japanese fine dining, sashimi counters, and chef tasting menus.',
    previewColor: '#166534',
    config: {
      pattern: { type: 'classy', color: '#18181b' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'leaf',
        outerColor: '#15803d',
        innerColor: '#16a34a'
      },
      colors: {
        foreground: '#18181b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#18181b', endColor: '#27272a', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('utensils'),
        originalSource: getIcon('utensils'),
        shape: 'rounded',
        size: 0.18,
        innerPadding: 6,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'camera',
        text: 'CHEF TASTING MENU · OMAKASE',
        color: '#15803d',
        textColor: '#ffffff',
        backgroundColor: '#f0fdf4',
        style: 'banner-bottom'
      },
      text: {
        heading: 'OMAKASE RESERVE',
        subtitle: 'Chef Seasonal Course & Pairings',
        footer: 'Table reservation & dietary guide',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#18181b',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#dcfce7',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'cocktail-speakeasy',
    name: 'Velvet Room Speakeasy',
    category: 'restaurant',
    tag: 'Cocktails',
    description: 'Midnight plum with burnished brass gold framing. Crafted for underground cocktail lounges, artisanal spirits, and secret speakeasies.',
    previewColor: '#701a75',
    config: {
      pattern: { type: 'classy-rounded', color: '#4a044e' },
      eyes: {
        customEyes: true,
        outer: 'extra-rounded',
        inner: 'circle',
        outerColor: '#701a75',
        innerColor: '#b45309'
      },
      colors: {
        foreground: '#4a044e',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: true, type: 'linear', startColor: '#4a044e', endColor: '#701a75', angle: 135 }
      },
      frame: {
        preset: 'badge',
        text: 'SECRET COCKTAILS & ADMISSION',
        color: '#701a75',
        textColor: '#ffffff',
        backgroundColor: '#fdf4ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'THE VELVET ROOM',
        subtitle: 'Craft Cocktail List & Entry Cipher',
        footer: 'Password required at entrance',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 16,
        headingWeight: 'bold',
        textColor: '#4a044e',
        letterSpacing: 1.2,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fae8ff',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'podcast-broadcast',
    name: 'Studio On-Air Podcast',
    category: 'social',
    tag: 'Audio',
    description: 'Electric violet to neon fuchsia gradient with circular acoustic dots. Built for podcasters, audio creators, and streaming radio.',
    previewColor: '#7c3aed',
    config: {
      pattern: { type: 'dots', color: '#7c3aed' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'dot',
        outerColor: '#6d28d9',
        innerColor: '#c026d3'
      },
      colors: {
        foreground: '#6d28d9',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: true, type: 'linear', startColor: '#6d28d9', endColor: '#c026d3', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'LISTEN ON SPOTIFY & APPLE',
        color: '#6d28d9',
        textColor: '#ffffff',
        backgroundColor: '#f5f3ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'STUDIO ON-AIR PODCAST',
        subtitle: 'Weekly In-Depth Conversations',
        footer: 'Scan to stream latest episode',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#5b21b6',
        letterSpacing: 0.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#ddd6fe',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'charity-gala-hope',
    name: 'Philanthropy & Hope Gala',
    category: 'event',
    tag: 'Charity',
    description: 'Regal navy blue with warm rose gold accents and elegant leaf eyes. Designed for non-profit galas, auctions, and philanthropic causes.',
    previewColor: '#312e81',
    config: {
      pattern: { type: 'classy-rounded', color: '#312e81' },
      eyes: {
        customEyes: true,
        outer: 'leaf',
        inner: 'leaf',
        outerColor: '#3730a3',
        innerColor: '#e11d48'
      },
      colors: {
        foreground: '#312e81',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#312e81', endColor: '#4338ca', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'DONATE & BID IN CHARITY AUCTION',
        color: '#312e81',
        textColor: '#ffffff',
        backgroundColor: '#eef2ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'ANNUAL HOPE GALA',
        subtitle: 'Empowering Communities Worldwide',
        footer: 'Direct tax-deductible contribution',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#312e81',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e0e7ff',
          borderWidth: 1.5,
          borderRadius: 18,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'automotive-showroom',
    name: 'Velocity Supercar Showcase',
    category: 'marketing',
    tag: 'Automotive',
    description: 'High-octane carbon graphite with racing red finder eyes. Designed for exotic car dealerships, auto expos, and performance tuning specs.',
    previewColor: '#dc2626',
    config: {
      pattern: { type: 'square', color: '#18181b' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'diamond',
        outerColor: '#dc2626',
        innerColor: '#b91c1c'
      },
      colors: {
        foreground: '#18181b',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#18181b', endColor: '#27272a', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'BOOK TEST DRIVE & VIEW SPECS',
        color: '#dc2626',
        textColor: '#ffffff',
        backgroundColor: '#fef2f2',
        style: 'banner-bottom'
      },
      text: {
        heading: 'VELOCITY MOTORSPORT',
        subtitle: 'Track Performance & Vehicle Configurator',
        footer: 'Instant window sticker download',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#18181b',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fecaca',
          borderWidth: 1.5,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'H'
    }
  },
  {
    id: 'contactless-tap-pay',
    name: 'Apex Instant Pay',
    category: 'payment',
    tag: 'Fintech',
    description: 'Vibrant royal cobalt to mint gradient with credit card emblem. Perfect for instant split checks, point-of-sale kiosks, and contactless checkout.',
    previewColor: '#1d4ed8',
    config: {
      pattern: { type: 'extra-rounded', color: '#1d4ed8' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'rounded',
        outerColor: '#1d4ed8',
        innerColor: '#059669'
      },
      colors: {
        foreground: '#1d4ed8',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: true, type: 'linear', startColor: '#1d4ed8', endColor: '#059669', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('credit-card'),
        originalSource: getIcon('credit-card'),
        shape: 'rounded',
        size: 0.18,
        innerPadding: 6,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'CONTACTLESS SECURE CHECKOUT',
        color: '#1d4ed8',
        textColor: '#ffffff',
        backgroundColor: '#eff6ff',
        style: 'banner-bottom'
      },
      text: {
        heading: 'APEX DIGITAL PAY',
        subtitle: 'Zero-fee instant transfer & receipt',
        footer: 'Encrypted end-to-end payment',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#1e40af',
        letterSpacing: 0.5,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#dbeafe',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'airport-lounge-wifi',
    name: 'SkyClub Lounge Wi-Fi',
    category: 'wifi',
    tag: 'Aviation',
    description: 'Aviation deep navy with airport Wi-Fi motif and crisp diamond eyes. Optimized for airline club lounges, transit terminals, and executive travel.',
    previewColor: '#0f172a',
    config: {
      pattern: { type: 'classy', color: '#0f172a' },
      eyes: {
        customEyes: true,
        outer: 'rounded',
        inner: 'diamond',
        outerColor: '#0284c7',
        innerColor: '#0369a1'
      },
      colors: {
        foreground: '#0f172a',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#0f172a', endColor: '#1e293b', angle: 45 }
      },
      logo: {
        enabled: true,
        type: 'icon',
        source: getIcon('wifi'),
        originalSource: getIcon('wifi'),
        shape: 'circle',
        size: 0.18,
        innerPadding: 6,
        backgroundColor: '#ffffff',
        removeBgBehindLogo: true
      },
      frame: {
        preset: 'badge',
        text: 'COMPLIMENTARY HIGH-SPEED WI-FI',
        color: '#0f172a',
        textColor: '#ffffff',
        backgroundColor: '#f8fafc',
        style: 'banner-bottom'
      },
      text: {
        heading: 'SKYCLUB FIRST CLASS',
        subtitle: 'Instant 1 Gbps Fiber Connection',
        footer: 'No login credentials required',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#0f172a',
        letterSpacing: 0.8,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 22,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  },
  {
    id: 'cinematographer-reel',
    name: 'Cinema Anamorphic Reel',
    category: 'portfolio',
    tag: 'Film',
    description: 'Matte carbon with warm tungsten amber accents. Engineered for directors of photography, film festivals, and cinematic showreels.',
    previewColor: '#b45309',
    config: {
      pattern: { type: 'classy-rounded', color: '#292524' },
      eyes: {
        customEyes: true,
        outer: 'square',
        inner: 'rounded',
        outerColor: '#b45309',
        innerColor: '#d97706'
      },
      colors: {
        foreground: '#292524',
        background: '#ffffff',
        transparentBackground: false,
        gradient: { enabled: false, type: 'linear', startColor: '#292524', endColor: '#44403c', angle: 45 }
      },
      frame: {
        preset: 'badge',
        text: 'WATCH 4K ANAMORPHIC SHOWREEL',
        color: '#b45309',
        textColor: '#ffffff',
        backgroundColor: '#fffbeb',
        style: 'banner-bottom'
      },
      text: {
        heading: 'DIRECTOR OF PHOTOGRAPHY',
        subtitle: 'Commercial & Narrative Cinematography',
        footer: 'Stream in HDR 4K Dolby Vision',
        fontFamily: 'Plus Jakarta Sans',
        headingSize: 15,
        headingWeight: 'bold',
        textColor: '#292524',
        letterSpacing: 1,
        alignment: 'center'
      },
      layout: {
        type: 'card',
        card: {
          backgroundColor: '#ffffff',
          borderColor: '#fef3c7',
          borderWidth: 1.5,
          borderRadius: 14,
          padding: 20,
          shadow: 'sm'
        }
      },
      quietZone: 4,
      errorCorrection: 'Q'
    }
  }
];
