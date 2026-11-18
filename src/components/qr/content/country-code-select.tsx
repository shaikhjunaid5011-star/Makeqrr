import * as React from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { CountryData, COUNTRY_CODES } from '../../../lib/country-codes';
import { cn } from '../../../lib/utils';

interface CountryCodeSelectProps {
  selectedCountry?: CountryData | null;
  onSelectCountry: (country: CountryData) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  selectedCountry,
  onSelectCountry,
  disabled = false,
  placeholder = 'Select Country',
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [alignRight, setAlignRight] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;

    const cleanDial = q.replace(/[^\d]/g, '');

    return COUNTRY_CODES.filter(country => {
      const matchName = country.name.toLowerCase().includes(q);
      const matchCode = country.code.toLowerCase().includes(q);
      const matchDial = country.dialCode.toLowerCase().includes(q) || 
        (cleanDial && country.dialCode.replace(/[^\d]/g, '').includes(cleanDial));
      return matchName || matchCode || matchDial;
    });
  }, [searchQuery]);

  // Reset highlight index when query changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Check positioning to prevent viewport overflow
  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 270;
      if (rect.left + popoverWidth > window.innerWidth - 16) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  // Focus search input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle click outside & escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const items = listRef.current.querySelectorAll('li');
    if (items[highlightedIndex]) {
      items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredCountries.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries[highlightedIndex]) {
        onSelectCountry(filteredCountries[highlightedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative shrink-0", className)} ref={containerRef}>
      {/* Trigger Button - Compact & Balanced */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedCountry ? `Country code: ${selectedCountry.name} (${selectedCountry.dialCode})` : placeholder}
        className={cn(
          "w-full h-9 px-2.5 rounded-lg border flex items-center justify-between gap-1.5 transition-all cursor-pointer text-xs font-medium text-left select-none",
          "bg-white dark:bg-neutral-900",
          selectedCountry
            ? "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
            : "border-orange-300 dark:border-orange-700/80 bg-orange-50/20 dark:bg-orange-950/20",
          "focus-visible:ring-2 focus-visible:ring-[#E64500] dark:focus-visible:ring-orange-500 focus-visible:outline-hidden",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-[#E64500] dark:ring-orange-500 border-transparent shadow-xs"
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {selectedCountry ? (
            <>
              <span className="text-base leading-none select-none shrink-0" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 shrink-0 text-xs">
                {selectedCountry.dialCode}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <span className="text-base leading-none select-none shrink-0">🌐</span>
              <span className="text-xs font-medium truncate">{placeholder}</span>
            </div>
          )}
        </div>
        <ChevronDown className={cn(
          "w-3 h-3 text-neutral-400 shrink-0 transition-transform duration-150",
          isOpen && "transform rotate-180 text-neutral-900 dark:text-neutral-100"
        )} />
      </button>

      {/* Dropdown Popover - Compact, Clean, Non-Overflowing */}
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-1.5 w-[260px] xs:w-[275px] max-w-[calc(100vw-32px)] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100",
            alignRight ? "right-0" : "left-0"
          )}
        >
          {/* Search Header */}
          <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-7.5 pl-8 pr-7 text-xs bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-[#E64500] dark:focus:ring-orange-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-52 overflow-y-auto overscroll-contain py-1 text-xs divide-y divide-neutral-50 dark:divide-neutral-800/40"
          >
            {filteredCountries.length === 0 ? (
              <li className="px-3 py-5 text-center text-neutral-400 text-xs">
                No countries found
              </li>
            ) : (
              filteredCountries.map((country, idx) => {
                const isSelected = Boolean(selectedCountry && country.code === selectedCountry.code && country.dialCode === selectedCountry.dialCode);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={`${country.code}-${country.dialCode}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectCountry(country);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "px-2.5 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-colors select-none",
                      isSelected
                        ? "bg-orange-50 dark:bg-orange-950/60 text-[#E64500] dark:text-orange-300 font-semibold"
                        : isHighlighted
                        ? "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base leading-none shrink-0" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <span className="truncate text-neutral-900 dark:text-neutral-100 text-xs">
                        {country.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {country.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        {country.dialCode}
                      </span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                      ) : (
                        <div className="w-3.5" />
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Quick Footer Info */}
          <div className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
            <span>{filteredCountries.length} countries</span>
            <span>Default: India (+91)</span>
          </div>
        </div>
      )}
    </div>
  );
};
