import * as React from 'react';
import { Phone, Check, AlertCircle, Info } from 'lucide-react';
import { CountryCodeSelect } from './country-code-select';
import { 
  CountryData, 
  DEFAULT_COUNTRY, 
  parseFullPhoneNumber, 
  validatePhoneNumber, 
  formatPhoneNumberDigits,
  buildCombinedPhone,
  COUNTRY_CODES 
} from '../../../lib/country-codes';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import { sanitizePhoneNumber } from '../../../lib/payload-builders';

interface PhoneInputFieldProps {
  value: {
    phone: string;
    countryCode?: string;
    nationalNumber?: string;
  };
  onChange: (newValue: { phone: string; countryCode: string; nationalNumber: string }) => void;
  onGenerateQR?: () => void;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  onGenerateQR
}) => {
  // Parse initial or current value
  const initialParsed = React.useMemo(() => {
    if (value.countryCode && value.nationalNumber !== undefined) {
      const matchCountry = COUNTRY_CODES.find(c => c.dialCode === value.countryCode) || DEFAULT_COUNTRY;
      return {
        country: matchCountry,
        nationalNumber: value.nationalNumber
      };
    }
    const parsed = parseFullPhoneNumber(value.phone || '');
    return {
      country: parsed.country,
      nationalNumber: parsed.nationalNumber
    };
  }, [value.phone, value.countryCode, value.nationalNumber]);

  const [selectedCountry, setSelectedCountry] = React.useState<CountryData>(initialParsed.country);
  const [nationalNumber, setNationalNumber] = React.useState<string>(initialParsed.nationalNumber);
  const [isGenerated, setIsGenerated] = React.useState(false);

  // Sync internal state when external value changes from presets/templates/reset
  React.useEffect(() => {
    if (value.countryCode && value.nationalNumber !== undefined) {
      const matchCountry = COUNTRY_CODES.find(c => c.dialCode === value.countryCode) || DEFAULT_COUNTRY;
      setSelectedCountry(matchCountry);
      setNationalNumber(value.nationalNumber);
    } else if (value.phone) {
      const parsed = parseFullPhoneNumber(value.phone);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
    } else {
      setSelectedCountry(DEFAULT_COUNTRY);
      setNationalNumber('');
    }
  }, [value.phone, value.countryCode, value.nationalNumber]);

  // Validation
  const validation = React.useMemo(() => {
    return validatePhoneNumber(nationalNumber, selectedCountry);
  }, [nationalNumber, selectedCountry]);

  // Handle country selection
  const handleCountryChange = (country: CountryData) => {
    setSelectedCountry(country);
    const combined = buildCombinedPhone(country.dialCode, nationalNumber);
    onChange({
      phone: combined,
      countryCode: country.dialCode,
      nationalNumber
    });
  };

  // Handle phone number input with smart paste detection
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    // Check if user pasted an international number starting with +
    if (rawVal.trim().startsWith('+')) {
      const parsed = parseFullPhoneNumber(rawVal);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.nationalNumber);
      const combined = buildCombinedPhone(parsed.dialCode, parsed.nationalNumber);
      onChange({
        phone: combined,
        countryCode: parsed.dialCode,
        nationalNumber: parsed.nationalNumber
      });
      return;
    }

    // Keep only digits and spacing/hyphens for input
    const cleanDigits = rawVal.replace(/[^\d]/g, '');
    
    // Auto-limit to max length + 2 to prevent runaway inputs
    const truncatedDigits = cleanDigits.slice(0, selectedCountry.maxLength + 2);
    setNationalNumber(truncatedDigits);

    const combined = buildCombinedPhone(selectedCountry.dialCode, truncatedDigits);
    onChange({
      phone: combined,
      countryCode: selectedCountry.dialCode,
      nationalNumber: truncatedDigits
    });
  };

  const handleGenerateClick = () => {
    if (onGenerateQR) {
      onGenerateQR();
    }
    setIsGenerated(true);
    setTimeout(() => setIsGenerated(false), 2000);
  };

  const combinedFullPhone = buildCombinedPhone(selectedCountry.dialCode, nationalNumber);
  const formattedNational = formatPhoneNumberDigits(nationalNumber, selectedCountry);

  return (
    <div className="space-y-3">
      {/* Label and Helper */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Phone Number
        </label>
        <span className="text-[11px] text-neutral-400 font-mono">
          Country Code + Number
        </span>
      </div>

      {/* Two-field Group: Country Code + Phone Number + Action Button */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
        {/* Country Code + Phone Input row */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Field 1: Compact Country Code Dropdown */}
          <div className="w-[88px] xs:w-[96px] shrink-0">
            <CountryCodeSelect
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              className="w-full"
            />
          </div>

          {/* Field 2: Clean Phone Number Input */}
          <div className="flex-1 min-w-0 relative flex items-center">
            <Input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={`e.g. ${selectedCountry.placeholder}`}
              value={formattedNational}
              onChange={handleNumberChange}
              className={cn(
                "h-9 font-mono text-xs pr-8 w-full transition-colors",
                validation.status === 'valid' && "border-emerald-500 dark:border-emerald-600 focus-visible:ring-emerald-500",
                validation.status === 'invalid' && "border-amber-500 dark:border-amber-600 focus-visible:ring-amber-500"
              )}
            />
            {/* Status Icon */}
            <div className="absolute right-2.5 pointer-events-none">
              {validation.status === 'valid' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              ) : validation.status === 'invalid' ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </div>
          </div>
        </div>

        {/* Generate / Update Button - Perfectly Aligned */}
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleGenerateClick}
          className={cn(
            "h-9 shrink-0 gap-1.5 text-xs font-semibold shadow-xs transition-all w-full xs:w-auto px-3.5",
            isGenerated
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-[#E64500] hover:bg-[#cc3d00] active:bg-[#b33500] text-white shadow-sm shadow-orange-500/20"
          )}
        >
          {isGenerated ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Update QR</span>
          )}
        </Button>
      </div>

      {/* Validation Message & Live Details */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          {/* Validation Feedback */}
          <div className="flex items-center gap-1.5">
            {validation.status === 'valid' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[2.5]" />
                {validation.message}
              </span>
            ) : validation.status === 'incomplete' ? (
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {validation.message}
              </span>
            ) : validation.status === 'invalid' ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validation.message}
              </span>
            ) : (
              <span className="text-neutral-400 dark:text-neutral-500">
                Enter phone number without {selectedCountry.dialCode}
              </span>
            )}
          </div>

          {/* Combined Payload Preview */}
          {combinedFullPhone && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300">
              <span className="text-neutral-400">TEL URI:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">tel:{sanitizePhoneNumber(combinedFullPhone)}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          When someone scans this QR code, their phone will ask to call this number.
        </p>
      </div>
    </div>
  );
};
