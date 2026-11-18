import { QRConfig, QRContentMap } from '../types/qr';

const CURRENT_CONFIG_KEY = 'custom_qr_current_config';
const RECENT_DESIGNS_KEY = 'custom_qr_recent_designs';
const APP_THEME_KEY = 'custom_qr_theme';

export const EMPTY_QR_CONTENT: QRContentMap = {
  url: { url: '' },
  text: { text: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  contact: {
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  },
  email: {
    email: '',
    subject: '',
    message: ''
  },
  phone: { phone: '', countryCode: '+1', nationalNumber: '' },
  sms: { phone: '', message: '', format: 'smsto' },
  whatsapp: { phone: '', countryCode: '', nationalNumber: '', message: '' },
  location: { address: '', placeName: '', label: '', mapsUrl: '', latitude: '', longitude: '', format: 'maps' },
  event: {
    title: '',
    location: '',
    start: '',
    end: '',
    description: ''
  },
  social: {
    platform: 'instagram',
    username: ''
  },
  payment: {
    type: 'upi',
    upiId: '',
    name: '',
    amount: '',
    note: ''
  }
};

export const DEFAULT_QR_CONFIG: QRConfig = {
  type: 'url',
  content: {
    ...EMPTY_QR_CONTENT,
    url: { url: 'https://makeqrr.com' },
    location: { address: 'Eiffel Tower, Paris', placeName: 'Eiffel Tower', label: 'Eiffel Tower', mapsUrl: '', latitude: '', longitude: '', format: 'maps' }
  },
  pattern: {
    type: 'rounded',
    color: '#0a0a0a'
  },
  eyes: {
    customEyes: false,
    outer: 'rounded',
    inner: 'rounded',
    outerColor: '#0a0a0a',
    innerColor: '#0a0a0a'
  },
  colors: {
    foreground: '#0a0a0a',
    background: '#ffffff',
    transparentBackground: false,
    gradient: {
      enabled: false,
      type: 'linear',
      startColor: '#0a0a0a',
      endColor: '#3b82f6',
      angle: 45
    }
  },
  logo: {
    enabled: false,
    source: '',
    originalSource: '',
    type: 'upload',
    size: 0.22,
    uploadSize: undefined,
    iconSize: undefined,
    emojiSize: undefined,
    padding: 0,
    innerPadding: 0,
    shape: 'square',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderColor: '#e5e7eb',
    borderWidth: 0
  },
  errorCorrection: 'M',
  quietZone: 4,
  layout: {
    type: 'qr-only',
    card: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 16,
      padding: 24,
      shadow: 'md'
    }
  },
  frame: {
    preset: 'none',
    text: 'SCAN ME',
    color: '#0a0a0a',
    textColor: '#ffffff',
    backgroundColor: '#ffffff',
    style: 'banner-bottom'
  },
  text: {
    heading: '',
    subtitle: '',
    footer: '',
    fontFamily: 'Plus Jakarta Sans',
    headingSize: 18,
    headingWeight: 'bold',
    textColor: '#0a0a0a',
    letterSpacing: 1,
    alignment: 'center'
  },
  size: {
    width: 320,
    height: 320
  }
};

export function loadSavedConfig(): QRConfig {
  try {
    const raw = localStorage.getItem(CURRENT_CONFIG_KEY);
    if (!raw) return DEFAULT_QR_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_QR_CONFIG,
      ...parsed,
      content: {
        ...DEFAULT_QR_CONFIG.content,
        ...(parsed.content || {})
      },
      colors: {
        ...DEFAULT_QR_CONFIG.colors,
        ...(parsed.colors || {}),
        gradient: {
          ...DEFAULT_QR_CONFIG.colors.gradient,
          ...(parsed.colors?.gradient || {})
        }
      },
      eyes: {
        ...DEFAULT_QR_CONFIG.eyes,
        ...(parsed.eyes || {})
      },
      logo: {
        ...DEFAULT_QR_CONFIG.logo,
        ...(parsed.logo || {}),
        // If an uploaded image was saved with the old default white background, sanitize to transparent
        // and ensure the original pristine image data is used as source
        ...(parsed.logo?.type === 'upload' && (!parsed.logo?.backgroundColor || parsed.logo?.backgroundColor === '#ffffff')
          ? {
              backgroundColor: 'transparent',
              shape: parsed.logo.shape === 'rounded' ? 'square' : parsed.logo.shape || 'square',
              innerPadding: 0,
              source: parsed.logo.originalSource || parsed.logo.source
            }
          : {})
      },
      layout: {
        ...DEFAULT_QR_CONFIG.layout,
        ...(parsed.layout || {})
      },
      frame: {
        ...DEFAULT_QR_CONFIG.frame,
        ...(parsed.frame || {})
      },
      text: {
        ...DEFAULT_QR_CONFIG.text,
        ...(parsed.text || {})
      }
    };
  } catch {
    return DEFAULT_QR_CONFIG;
  }
}

export function saveConfig(config: QRConfig): void {
  try {
    localStorage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save QR configuration to localStorage', e);
  }
}

export function loadRecentDesigns(): QRConfig[] {
  try {
    const raw = localStorage.getItem(RECENT_DESIGNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasUserEnteredData(config: QRConfig): boolean {
  if (!config) return false;

  const c = config.content;
  if (c) {
    if (c.url?.url && c.url.url.trim() !== '') return true;
    if (c.text?.text && c.text.text.trim() !== '') return true;
    if (c.wifi?.ssid?.trim() || c.wifi?.password?.trim()) return true;
    if (
      c.contact?.firstName?.trim() ||
      c.contact?.lastName?.trim() ||
      c.contact?.company?.trim() ||
      c.contact?.title?.trim() ||
      c.contact?.phone?.trim() ||
      c.contact?.email?.trim() ||
      c.contact?.website?.trim() ||
      c.contact?.address?.trim()
    ) return true;
    if (c.email?.email?.trim() || c.email?.subject?.trim() || c.email?.message?.trim()) return true;
    if (
      (c.phone?.nationalNumber && c.phone.nationalNumber.trim() !== '') ||
      (c.phone?.phone && c.phone.phone.trim() !== '' && c.phone.phone !== '+1')
    ) return true;
    if (c.sms?.phone?.trim() || c.sms?.message?.trim()) return true;
    if (c.whatsapp?.nationalNumber?.trim() || c.whatsapp?.phone?.trim() || c.whatsapp?.message?.trim()) return true;
    if (
      c.location?.placeName?.trim() ||
      c.location?.address?.trim() ||
      c.location?.label?.trim() ||
      c.location?.mapsUrl?.trim() ||
      c.location?.latitude?.trim() ||
      c.location?.longitude?.trim()
    ) return true;
    if (c.event?.title?.trim() || c.event?.location?.trim() || c.event?.description?.trim()) return true;
    if (c.social?.username?.trim()) return true;
    if (c.payment?.upiId?.trim() || c.payment?.name?.trim() || (c.payment?.amount && c.payment.amount.trim() !== '')) return true;
  }

  if (config.type && config.type !== 'url') return true;
  if (config.logo?.enabled || config.logo?.source || config.logo?.originalSource) return true;
  if (config.colors?.foreground && config.colors.foreground.toLowerCase() !== '#0a0a0a') return true;
  if (config.colors?.background && config.colors.background.toLowerCase() !== '#ffffff') return true;
  if (config.colors?.gradient?.enabled) return true;
  if (config.colors?.transparentBackground) return true;
  if (config.pattern?.type && config.pattern.type !== 'rounded') return true;
  if (config.eyes?.customEyes) return true;
  if (config.eyes?.outer && config.eyes.outer !== 'rounded') return true;
  if (config.eyes?.inner && config.eyes.inner !== 'rounded') return true;
  if (config.frame?.preset && config.frame.preset !== 'none') return true;
  if (config.layout?.type && config.layout.type !== 'qr-only') return true;
  if (config.text?.heading?.trim() || config.text?.subtitle?.trim() || config.text?.footer?.trim()) return true;

  return false;
}

let lastClearedRecentTimestamp = 0;

export function saveToRecentDesigns(config: QRConfig): void {
  // Do not pollute recent designs with an empty blank canvas
  if (!hasUserEnteredData(config)) {
    return;
  }

  // Prevent race condition: do not immediately re-save a design if recent designs were just cleared
  if (lastClearedRecentTimestamp > 0 && Date.now() - lastClearedRecentTimestamp < 3500) {
    return;
  }

  try {
    const recents = loadRecentDesigns();
    const item: QRConfig = {
      ...config,
      id: config.id || `design_${Date.now()}`,
      updatedAt: Date.now()
    };
    // Keep max 12 designs, filter duplicates by id
    const filtered = recents.filter(r => r.id !== item.id);
    const updated = [item, ...filtered].slice(0, 12);
    localStorage.setItem(RECENT_DESIGNS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to recent designs', e);
  }
}

export function clearSavedDesigns(): void {
  lastClearedRecentTimestamp = Date.now();
  try {
    localStorage.removeItem(RECENT_DESIGNS_KEY);
    localStorage.setItem(RECENT_DESIGNS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear saved designs', e);
  }
}

export function clearEditorLocalStorage(cleanConfig: QRConfig = DEFAULT_QR_CONFIG): void {
  try {
    localStorage.removeItem(CURRENT_CONFIG_KEY);
    // Explicitly write clean default config to localStorage so on page refresh no old data returns
    localStorage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(cleanConfig));
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (e) {
    console.error('Failed to clear editor local storage:', e);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(CURRENT_CONFIG_KEY);
    localStorage.removeItem(RECENT_DESIGNS_KEY);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  } catch (e) {
    console.error('Failed to clear local data', e);
  }
}

export function getSavedTheme(): 'light' | 'dark' | 'system' {
  try {
    const theme = localStorage.getItem(APP_THEME_KEY);
    if (theme === 'light' || theme === 'dark' || theme === 'system') return theme;
  } catch {
    // ignore
  }
  return 'system';
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(APP_THEME_KEY, theme);
  } catch {
    // ignore
  }
}
