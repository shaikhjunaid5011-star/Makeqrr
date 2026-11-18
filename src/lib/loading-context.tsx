import * as React from 'react';
import { Loader } from '../components/ui/loader';

interface FullscreenLoaderState {
  active: boolean;
  label?: string;
  sublabel?: string;
}

interface LoadingContextType {
  isInitialLoading: boolean;
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
  showFullscreenLoader: (label: string, sublabel?: string) => void;
  hideFullscreenLoader: () => void;
}

const LoadingContext = React.createContext<LoadingContextType | null>(null);

export const useLoading = (): LoadingContextType => {
  const ctx = React.useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return ctx;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial page loading state - brief, smooth branding animation on mount
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [fullscreenLoader, setFullscreenLoader] = React.useState<FullscreenLoaderState>({
    active: false
  });

  React.useEffect(() => {
    // Graceful initial boot transition: 550ms so user sees the QR Studio brand, then smooth reveal
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const showFullscreenLoader = React.useCallback((label: string, sublabel?: string) => {
    setFullscreenLoader({ active: true, label, sublabel });
  }, []);

  const hideFullscreenLoader = React.useCallback(() => {
    setFullscreenLoader({ active: false });
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isInitialLoading,
        isNavigating,
        setIsNavigating,
        showFullscreenLoader,
        hideFullscreenLoader
      }}
    >
      {/* Top Route Progress Bar for Route Transitions */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <Loader variant="bar" />
        </div>
      )}

      {/* Initial App Load Reveal Overlay */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-300">
          <Loader
            variant="logo"
            size="lg"
            label="makeqrr"
            sublabel="Loading high-precision vector engine..."
          />
        </div>
      )}

      {/* Reusable Full-Screen Wait Loader (Only when user actually needs to wait for heavy jobs) */}
      {fullscreenLoader.active && (
        <Loader
          variant="fullscreen"
          size="lg"
          label={fullscreenLoader.label}
          sublabel={fullscreenLoader.sublabel}
        />
      )}

      {children}
    </LoadingContext.Provider>
  );
};
