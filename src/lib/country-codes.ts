export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  example: string;
  minLength: number;
  maxLength: number;
  formatGroups?: number[]; // e.g. [5, 5] for India 98765 43210, [3, 3, 4] for US
}

export const COUNTRY_CODES: CountryData[] = [
  // Primary / Featured countries at top for quick access
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    placeholder: '98765 43210',
    example: '9876543210',
    minLength: 10,
    maxLength: 10,
    formatGroups: [5, 5]
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    placeholder: '555 123 4567',
    example: '5551234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    placeholder: '7911 123456',
    example: '7911123456',
    minLength: 10,
    maxLength: 11,
    formatGroups: [4, 6]
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    placeholder: '555 123 4567',
    example: '5551234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    placeholder: '412 345 678',
    example: '412345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 3, 3]
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    placeholder: '50 123 4567',
    example: '501234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    placeholder: '50 123 4567',
    example: '501234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    placeholder: '8123 4567',
    example: '81234567',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    placeholder: '151 12345678',
    example: '15112345678',
    minLength: 10,
    maxLength: 11,
    formatGroups: [3, 8]
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    placeholder: '6 12 34 56 78',
    example: '612345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [1, 2, 2, 2, 2]
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    placeholder: '90 1234 5678',
    example: '9012345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [2, 4, 4]
  },
  {
    code: 'CN',
    name: 'China',
    dialCode: '+86',
    flag: '🇨🇳',
    placeholder: '138 1234 5678',
    example: '13812345678',
    minLength: 11,
    maxLength: 11,
    formatGroups: [3, 4, 4]
  },
  {
    code: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    placeholder: '11 91234 5678',
    example: '11912345678',
    minLength: 10,
    maxLength: 11,
    formatGroups: [2, 5, 4]
  },
  {
    code: 'MX',
    name: 'Mexico',
    dialCode: '+52',
    flag: '🇲🇽',
    placeholder: '55 1234 5678',
    example: '5512345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [2, 4, 4]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    placeholder: '71 123 4567',
    example: '711234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    placeholder: '802 123 4567',
    example: '8021234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'PK',
    name: 'Pakistan',
    dialCode: '+92',
    flag: '🇵🇰',
    placeholder: '300 1234567',
    example: '3001234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 7]
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
    placeholder: '1712 345678',
    example: '1712345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [4, 6]
  },
  {
    code: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
    flag: '🇮🇩',
    placeholder: '812 3456 7890',
    example: '81234567890',
    minLength: 9,
    maxLength: 12,
    formatGroups: [3, 4, 4]
  },
  {
    code: 'PH',
    name: 'Philippines',
    dialCode: '+63',
    flag: '🇵🇭',
    placeholder: '917 123 4567',
    example: '9171234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    placeholder: '12 345 6789',
    example: '123456789',
    minLength: 9,
    maxLength: 10,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    dialCode: '+64',
    flag: '🇳🇿',
    placeholder: '21 123 4567',
    example: '211234567',
    minLength: 8,
    maxLength: 10,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    placeholder: '312 345 6789',
    example: '3123456789',
    minLength: 9,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    placeholder: '612 34 56 78',
    example: '612345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 2, 2, 2]
  },
  {
    code: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    flag: '🇳🇱',
    placeholder: '6 12345678',
    example: '612345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [1, 8]
  },
  {
    code: 'CH',
    name: 'Switzerland',
    dialCode: '+41',
    flag: '🇨🇭',
    placeholder: '78 123 45 67',
    example: '781234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 2, 2]
  },
  {
    code: 'SE',
    name: 'Sweden',
    dialCode: '+46',
    flag: '🇸🇪',
    placeholder: '70 123 45 67',
    example: '701234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 2, 2]
  },
  {
    code: 'NO',
    name: 'Norway',
    dialCode: '+47',
    flag: '🇳🇴',
    placeholder: '412 34 567',
    example: '41234567',
    minLength: 8,
    maxLength: 8,
    formatGroups: [3, 2, 3]
  },
  {
    code: 'DK',
    name: 'Denmark',
    dialCode: '+45',
    flag: '🇩🇰',
    placeholder: '20 12 34 56',
    example: '20123456',
    minLength: 8,
    maxLength: 8,
    formatGroups: [2, 2, 2, 2]
  },
  {
    code: 'FI',
    name: 'Finland',
    dialCode: '+358',
    flag: '🇫🇮',
    placeholder: '40 123 4567',
    example: '401234567',
    minLength: 7,
    maxLength: 10,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'IE',
    name: 'Ireland',
    dialCode: '+353',
    flag: '🇮🇪',
    placeholder: '85 123 4567',
    example: '851234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'PT',
    name: 'Portugal',
    dialCode: '+351',
    flag: '🇵🇹',
    placeholder: '912 345 678',
    example: '912345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 3, 3]
  },
  {
    code: 'PL',
    name: 'Poland',
    dialCode: '+48',
    flag: '🇵🇱',
    placeholder: '512 345 678',
    example: '512345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 3, 3]
  },
  {
    code: 'AT',
    name: 'Austria',
    dialCode: '+43',
    flag: '🇦🇹',
    placeholder: '664 1234567',
    example: '6641234567',
    minLength: 9,
    maxLength: 11,
    formatGroups: [3, 7]
  },
  {
    code: 'BE',
    name: 'Belgium',
    dialCode: '+32',
    flag: '🇧🇪',
    placeholder: '470 12 34 56',
    example: '470123456',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 2, 2, 2]
  },
  {
    code: 'GR',
    name: 'Greece',
    dialCode: '+30',
    flag: '🇬🇷',
    placeholder: '691 234 5678',
    example: '6912345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'TR',
    name: 'Turkey',
    dialCode: '+90',
    flag: '🇹🇷',
    placeholder: '532 123 4567',
    example: '5321234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'RU',
    name: 'Russia',
    dialCode: '+7',
    flag: '🇷🇺',
    placeholder: '912 345-67-89',
    example: '9123456789',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 2, 2]
  },
  {
    code: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    flag: '🇰🇷',
    placeholder: '10 1234 5678',
    example: '1012345678',
    minLength: 9,
    maxLength: 10,
    formatGroups: [2, 4, 4]
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    dialCode: '+852',
    flag: '🇭🇰',
    placeholder: '9123 4567',
    example: '91234567',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'TW',
    name: 'Taiwan',
    dialCode: '+886',
    flag: '🇹🇼',
    placeholder: '912 345 678',
    example: '912345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 3, 3]
  },
  {
    code: 'TH',
    name: 'Thailand',
    dialCode: '+66',
    flag: '🇹🇭',
    placeholder: '81 234 5678',
    example: '812345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'VN',
    name: 'Vietnam',
    dialCode: '+84',
    flag: '🇻🇳',
    placeholder: '91 234 5678',
    example: '912345678',
    minLength: 9,
    maxLength: 10,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'EG',
    name: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    placeholder: '10 1234 5678',
    example: '1012345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [2, 4, 4]
  },
  {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    placeholder: '712 345678',
    example: '712345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [3, 6]
  },
  {
    code: 'GH',
    name: 'Ghana',
    dialCode: '+233',
    flag: '🇬🇭',
    placeholder: '24 123 4567',
    example: '241234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'AR',
    name: 'Argentina',
    dialCode: '+54',
    flag: '🇦🇷',
    placeholder: '11 1234 5678',
    example: '1112345678',
    minLength: 10,
    maxLength: 10,
    formatGroups: [2, 4, 4]
  },
  {
    code: 'CL',
    name: 'Chile',
    dialCode: '+56',
    flag: '🇨🇱',
    placeholder: '9 1234 5678',
    example: '912345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [1, 4, 4]
  },
  {
    code: 'CO',
    name: 'Colombia',
    dialCode: '+57',
    flag: '🇨🇴',
    placeholder: '310 123 4567',
    example: '3101234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [3, 3, 4]
  },
  {
    code: 'IL',
    name: 'Israel',
    dialCode: '+972',
    flag: '🇮🇱',
    placeholder: '50 123 4567',
    example: '501234567',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  },
  {
    code: 'QA',
    name: 'Qatar',
    dialCode: '+974',
    flag: '🇶🇦',
    placeholder: '3312 3456',
    example: '33123456',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'KW',
    name: 'Kuwait',
    dialCode: '+965',
    flag: '🇰🇼',
    placeholder: '9123 4567',
    example: '91234567',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'OM',
    name: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    placeholder: '9123 4567',
    example: '91234567',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'BH',
    name: 'Bahrain',
    dialCode: '+973',
    flag: '🇧🇭',
    placeholder: '3912 3456',
    example: '39123456',
    minLength: 8,
    maxLength: 8,
    formatGroups: [4, 4]
  },
  {
    code: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    flag: '🇳🇵',
    placeholder: '9841 234567',
    example: '9841234567',
    minLength: 10,
    maxLength: 10,
    formatGroups: [4, 6]
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    dialCode: '+94',
    flag: '🇱🇰',
    placeholder: '71 234 5678',
    example: '712345678',
    minLength: 9,
    maxLength: 9,
    formatGroups: [2, 3, 4]
  }
];

export const DEFAULT_COUNTRY: CountryData = COUNTRY_CODES[0]; // India (+91)

/**
 * Find country by dialing code (e.g. "+91") or country code (e.g. "IN")
 */
export function findCountry(dialCodeOrCode: string): CountryData {
  const clean = dialCodeOrCode.trim();
  const byCode = COUNTRY_CODES.find(c => c.code.toUpperCase() === clean.toUpperCase());
  if (byCode) return byCode;

  const withPlus = clean.startsWith('+') ? clean : `+${clean}`;
  const byDial = COUNTRY_CODES.find(c => c.dialCode === withPlus);
  if (byDial) return byDial;

  return DEFAULT_COUNTRY;
}

/**
 * Format a raw digits string according to the country's grouping
 */
export function formatPhoneNumberDigits(rawDigits: string, country: CountryData): string {
  const digits = rawDigits.replace(/\D/g, '');
  if (!digits) return '';

  const groups = country.formatGroups;
  if (!groups || groups.length === 0) return digits;

  const parts: string[] = [];
  let remaining = digits;

  for (const size of groups) {
    if (remaining.length === 0) break;
    parts.push(remaining.slice(0, size));
    remaining = remaining.slice(size);
  }

  if (remaining.length > 0) {
    parts.push(remaining);
  }

  return parts.join(' ');
}

/**
 * Parse an existing combined telephone string into { dialCode, nationalNumber, country }
 */
export function parseFullPhoneNumber(fullNumber: string): {
  dialCode: string;
  nationalNumber: string;
  country: CountryData;
} {
  const raw = (fullNumber || '').trim();
  if (!raw) {
    return {
      dialCode: DEFAULT_COUNTRY.dialCode,
      nationalNumber: '',
      country: DEFAULT_COUNTRY
    };
  }

  // Check if string starts with +
  if (raw.startsWith('+')) {
    // Sort country codes by dialCode length descending (+971 before +9)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (raw.startsWith(c.dialCode)) {
        const remaining = raw.slice(c.dialCode.length).trim().replace(/[^\d]/g, '');
        return {
          dialCode: c.dialCode,
          nationalNumber: remaining,
          country: c
        };
      }
    }

    // Generic fallback for unlisted country codes with +
    const match = raw.match(/^\+(\d{1,4})(.*)$/);
    if (match) {
      const genericDial = `+${match[1]}`;
      const remaining = match[2].trim().replace(/[^\d]/g, '');
      const existing = COUNTRY_CODES.find(c => c.dialCode === genericDial) || DEFAULT_COUNTRY;
      return {
        dialCode: genericDial,
        nationalNumber: remaining,
        country: existing
      };
    }
  }

  // If no +, assume digits are the national number and use India as default
  const cleanDigits = raw.replace(/[^\d]/g, '');
  return {
    dialCode: DEFAULT_COUNTRY.dialCode,
    nationalNumber: cleanDigits,
    country: DEFAULT_COUNTRY
  };
}

/**
 * Validate national phone number for given country
 */
export function validatePhoneNumber(nationalNumber: string, country: CountryData): {
  isValid: boolean;
  status: 'empty' | 'valid' | 'invalid' | 'incomplete';
  message: string;
  cleanDigits: string;
} {
  const cleanDigits = nationalNumber.replace(/\D/g, '');

  if (!cleanDigits) {
    return {
      isValid: false,
      status: 'empty',
      message: `Enter your ${country.name} phone number`,
      cleanDigits: ''
    };
  }

  const len = cleanDigits.length;

  if (len < country.minLength) {
    return {
      isValid: false,
      status: 'incomplete',
      message: `${len} of ${country.minLength} digits entered`,
      cleanDigits
    };
  }

  if (len > country.maxLength) {
    return {
      isValid: false,
      status: 'invalid',
      message: `Too many numbers for ${country.name} (max ${country.maxLength})`,
      cleanDigits
    };
  }

  // Country specific checks
  if (country.code === 'IN') {
    // Indian mobile numbers typically start with 6, 7, 8, 9
    const firstDigit = cleanDigits.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return {
        isValid: false,
        status: 'invalid',
        message: 'Indian mobile numbers usually start with 6, 7, 8, or 9',
        cleanDigits
      };
    }
  }

  return {
    isValid: true,
    status: 'valid',
    message: `Looks good for ${country.name}`,
    cleanDigits
  };
}

/**
 * Combine country dial code and national number for QR payload (E.164 compliant)
 */
export function buildCombinedPhone(dialCode: string, nationalNumber: string): string {
  const cleanDigits = nationalNumber.replace(/\D/g, '');
  if (!cleanDigits) return '';
  const cleanDial = dialCode.startsWith('+') ? dialCode : `+${dialCode.replace(/\D/g, '')}`;
  return `${cleanDial}${cleanDigits}`;
}

/**
 * Combine country dial code and national number for WhatsApp link.
 * Format requirement: COUNTRYCODEPHONENUMBER (digits only, NO '+', no spaces, dashes, brackets, no duplicate country codes)
 * e.g. countryCode="+91", nationalNumber="9876543210" -> "919876543210"
 */
export function buildWhatsAppPhoneNumber(countryCode: string, nationalNumber: string, country?: CountryData): string {
  const cleanCode = countryCode.replace(/\D/g, '');
  if (!cleanCode) return '';
  let cleanNational = nationalNumber.replace(/\D/g, '');
  if (!cleanNational) return '';

  const maxLen = country?.maxLength || 10;
  // If the user entered/pasted their number with the country code already attached
  if (cleanNational.startsWith(cleanCode) && cleanNational.length > maxLen) {
    cleanNational = cleanNational.slice(cleanCode.length);
  }

  // Strip leading zero if present in national number (e.g. 07911 123456 in UK)
  if (cleanNational.startsWith('0')) {
    cleanNational = cleanNational.replace(/^0+/, '');
  }

  return `${cleanCode}${cleanNational}`;
}

/**
 * Filter countries by partial name, ISO code, or dial code.
 */
export function searchCountries(query: string): CountryData[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRY_CODES;
  const cleanDial = q.replace(/[^\d]/g, '');

  return COUNTRY_CODES.filter(country => {
    const matchName = country.name.toLowerCase().includes(q);
    const matchCode = country.code.toLowerCase().includes(q);
    const matchDial = country.dialCode.toLowerCase().includes(q) ||
      (cleanDial ? country.dialCode.replace(/[^\d]/g, '').includes(cleanDial) : false);
    return matchName || matchCode || matchDial;
  });
}
