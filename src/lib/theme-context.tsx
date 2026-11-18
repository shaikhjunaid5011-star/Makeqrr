import * as React from 'react';
import { getSavedTheme, saveTheme } from './storage';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<Theme>(() => getSavedTheme());
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() => getSystemTheme());
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const transitionTimerRef = React.useRef<number | null>(null);

  // Listen to system prefers-color-scheme changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
      return () => (mediaQuery as any).removeListener(handleChange);
    }
  }, []);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply class to document.documentElement synchronously and reliably
  React.useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  const activateThemeTransition = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setIsTransitioning(true);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      setIsTransitioning(false);
      transitionTimerRef.current = null;
    }, 650);
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    activateThemeTransition();
    setThemeState(newTheme);
    saveTheme(newTheme);
  }, [activateThemeTransition]);

  const toggleTheme = React.useCallback(() => {
    activateThemeTransition();
    setThemeState(prev => {
      // Toggle between light and dark; if in system, toggle to the opposite of resolved theme
      const currentResolved = prev === 'system' ? systemTheme : prev;
      const next: Theme = currentResolved === 'light' ? 'dark' : 'light';
      saveTheme(next);
      return next;
    });
  }, [systemTheme, activateThemeTransition]);

  const value = React.useMemo<ThemeContextType>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isTransitioning
  }), [theme, resolvedTheme, setTheme, toggleTheme, isTransitioning]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
