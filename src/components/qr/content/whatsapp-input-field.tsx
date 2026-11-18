import * as React from 'react';
import { MessageCircle, Check, AlertCircle, Info, QrCode } from 'lucide-react';
import { CountryCodeSelect } from './country-code-select';
import { 
  CountryData, 
  COUNTRY_CODES,
  findCountry,
  parseFullPhoneNumber, 
  validatePhoneNumber, 
  formatPhoneNumberDigits,
  buildWhatsAppPhoneNumber
} from '../../../lib/country-codes';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/input';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface WhatsAppInputFieldProps {
  value: {
    phone: string;
    countryCode?: string;
    nationalNumber?: string;
    message: string;
  };
  onChange: (newValue: { phone: string; countryCode: string; nationalNumber: string; message: string }) => void;
  onGenerateQR?: () => void;
}

export const WhatsAppInputField: React.FC<WhatsAppInputFieldProps> = ({
  value,
  onChange,
  onGenerateQR
}) => {
  // Never assume country code automatically. Only resolve if explicitly provided or starting with '+'
  const selectedCountry: CountryData | null = React.useMemo(() => {
    if (value.countryCode && value.countryCode.trim()) {
      return findCountry(value.countryCode);
    }
    if (value.phone && value.phone.trim().startsWith('+')) {
      return parseFullPhoneNumber(value.phone).country;
    }
    return null;
  }, [value.countryCode, value.phone]);

  // Extract national number
  const nationalNumber = React.useMemo(() => {
    if (value.nationalNumber !== undefined) {
      return value.nationalNumber;
    }
    if (value.phone && selectedCountry) {
      const cleanDial = selectedCountry.dialCode.replace(/\D/g, '');
      const cleanPhone = value.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith(cleanDial)) {
        return cleanPhone.slice(cleanDial.length);
      }
      return cleanPhone;
    }
    return '';
  }, [value.nationalNumber, value.phone, selectedCountry]);

  const [isGenerated, setIsGenerated] = React.useState(false);

  // Validate phone number according to selected country's numbering rules
  const validation = React.useMemo(() => {
    if (!selectedCountry) {
      return {
        isValid: false,
        status: 'no_country' as const,
        message: 'Select mandatory country code (e.g. 🇮🇳 India +91)',
        cleanDigits: ''
      };
    }
    return validatePhoneNumber(nationalNumber, selectedCountry);
  }, [nationalNumber, selectedCountry]);

  // Handle country code selection
  const handleCountryChange = (country: CountryData) => {
    // If nationalNumber starts with the newly selected country's dial code, prevent duplicate
    const cleanDial = country.dialCode.replace(/\D/g, '');
    let cleanNat = nationalNumber.replace(/\D/g, '');
    if (cleanNat.startsWith(cleanDial) && cleanNat.length > country.maxLength) {
      cleanNat = cleanNat.slice(cleanDial.length);
    }

    const combined = buildWhatsAppPhoneNumber(country.dialCode, cleanNat, country);
    onChange({
      phone: combined,
      countryCode: country.dialCode,
      nationalNumber: cleanNat,
      message: value.message
    });
  };

  // Handle phone number input with smart paste and duplicate country code prevention
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    // Smart Paste: If user pastes international number starting with +
    if (rawVal.trim().startsWith('+')) {
      const parsed = parseFullPhoneNumber(rawVal);
      const combined = buildWhatsAppPhoneNumber(parsed.dialCode, parsed.nationalNumber, parsed.country);
      onChange({
        phone: combined,
        countryCode: parsed.dialCode,
        nationalNumber: parsed.nationalNumber,
        message: value.message
      });
      return;
    }

    // Keep only digits
    let cleanDigits = rawVal.replace(/[^\d]/g, '');

    // Prevent duplicate country code if user typed/pasted the dial code again
    if (selectedCountry) {
      const cleanDial = selectedCountry.dialCode.replace(/\D/g, '');
      if (cleanDigits.startsWith(cleanDial) && cleanDigits.length > selectedCountry.maxLength) {
        cleanDigits = cleanDigits.slice(cleanDial.length);
      }
      // Strip leading zero if present (e.g. 07911... in UK)
      if (cleanDigits.startsWith('0')) {
        cleanDigits = cleanDigits.replace(/^0+/, '');
      }
      // Limit to country maxLength + 2 to prevent runaway typing
      cleanDigits = cleanDigits.slice(0, selectedCountry.maxLength + 2);
    }

    const currentCountryCode = selectedCountry ? selectedCountry.dialCode : (value.countryCode || '');
    const combined = currentCountryCode ? buildWhatsAppPhoneNumber(currentCountryCode, cleanDigits, selectedCountry || undefined) : cleanDigits;

    onChange({
      phone: combined,
      countryCode: currentCountryCode,
      nationalNumber: cleanDigits,
      message: value.message
    });
  };

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...value,
      countryCode: selectedCountry?.dialCode || value.countryCode || '',
      nationalNumber,
      message: e.target.value
    });
  };

  const handleGenerateClick = () => {
    if (onGenerateQR) {
      onGenerateQR();
    }
    setIsGenerated(true);
    setTimeout(() => setIsGenerated(false), 2000);
  };

  // Build preview of the generated WhatsApp URL
  const waPreviewUrl = React.useMemo(() => {
    if (!selectedCountry || !validation.isValid) return '';
    const cleanDigits = buildWhatsAppPhoneNumber(selectedCountry.dialCode, nationalNumber, selectedCountry);
    if (!cleanDigits) return '';
    const textParam = value.message?.trim() ? `?text=${encodeURIComponent(value.message.trim())}` : '';
    return `https://wa.me/${cleanDigits}${textParam}`;
  }, [selectedCountry, validation.isValid, nationalNumber, value.message]);

  const formattedDisplay = selectedCountry
    ? formatPhoneNumberDigits(nationalNumber, selectedCountry)
    : nationalNumber;

  return (
    <div className="space-y-4">
      {/* Phone Number Field with Mandatory Country Code Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            WhatsApp Phone Number <span className="text-[#E64500] font-bold">*</span>
          </label>
          <span className="text-[11px] text-neutral-500 font-mono">
            {selectedCountry ? `${selectedCountry.name} (${selectedCountry.dialCode})` : 'Country Code Required'}
          </span>
        </div>

        {/* Input Group: Country Code Dropdown + National Phone Number Input + Create Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Mandatory Country Code Selector */}
          <div className="w-full sm:w-[155px] shrink-0">
            <CountryCodeSelect
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              placeholder="Country Code *"
              className="w-full"
            />
          </div>

          {/* National Phone Input */}
          <div className="flex-1 relative flex items-center">
            <Input
              type="tel"
              inputMode="numeric"
              placeholder={selectedCountry ? selectedCountry.placeholder : 'Select country code first...'}
              value={formattedDisplay}
              onChange={handleNumberChange}
              className={cn(
                "font-mono text-xs w-full h-9 transition-colors",
                !selectedCountry && "bg-neutral-50 dark:bg-neutral-900/50",
                validation.isValid && "border-emerald-500 dark:border-emerald-500 focus:border-emerald-500",
                !validation.isValid && nationalNumber && "border-amber-400 dark:border-amber-600 focus:border-amber-500"
              )}
            />
          </div>

          {/* Create / Update QR Action Button */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGenerateClick}
            disabled={!selectedCountry || !validation.isValid}
            title={
              !selectedCountry
                ? "Select a country code to create WhatsApp QR"
                : !validation.isValid
                ? "Enter a valid phone number"
                : "Create or update QR code"
            }
            className={cn(
              "shrink-0 text-xs gap-1.5 font-semibold transition-all shadow-xs h-9",
              isGenerated
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] shadow-xs shadow-orange-500/25",
              (!selectedCountry || !validation.isValid) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerated ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Updated!</span>
              </>
            ) : (
              <>
                <QrCode className="h-3.5 w-3.5" />
                <span>Create QR</span>
              </>
            )}
          </Button>
        </div>

        {/* Live Validation & Status Guidance */}
        <div className="text-[11px] pt-0.5">
          {!selectedCountry ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Country code is required. Please pick your country code above (e.g. 🇮🇳 India +91).</span>
            </div>
          ) : !nationalNumber ? (
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Info className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              <span>
                Enter phone number without {selectedCountry.dialCode} (e.g. {selectedCountry.example}).
              </span>
            </div>
          ) : validation.isValid ? (
            <div className="flex items-center justify-between gap-2 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span className="font-medium truncate">{validation.message}</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                wa.me/{buildWhatsAppPhoneNumber(selectedCountry.dialCode, nationalNumber, selectedCountry)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pre-filled Message Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Pre-filled Message <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <span className="text-[10px] text-neutral-400">
            Automatically typed when opened in WhatsApp
          </span>
        </div>
        <Textarea
          rows={3}
          placeholder="Hello! I'm interested in your services and would like more information..."
          value={value.message || ''}
          onChange={handleMessageChange}
          className="text-xs"
        />
      </div>

      {/* WhatsApp Action Banner info */}
      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-900 dark:text-emerald-300">
            Action Ready: Opens WhatsApp Chat Directly
          </span>
        </div>
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed pl-6">
          When scanned with a phone camera, this QR code generates a standard <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-900/40">https://wa.me/&lt;number&gt;</code> link. Compatible scanner apps directly launch WhatsApp with your phone number and pre-filled message ready to send.
        </p>
        {waPreviewUrl && (
          <div className="pl-6 pt-0.5">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono break-all">
              Target: {waPreviewUrl}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
