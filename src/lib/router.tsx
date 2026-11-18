import * as React from 'react';

export interface RouterContextType {
  pathname: string;
  search: string;
  hash: string;
  canGoBack: boolean;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
}

const RouterContext = React.createContext<RouterContextType | null>(null);

export const useRouter = (): RouterContextType => {
  const context = React.useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const usePathname = (): string => {
  return useRouter().pathname;
};

export const useLocation = () => {
  const router = useRouter();
  return {
    pathname: router.pathname,
    search: router.search,
    hash: router.hash
  };
};

export const useNavigate = () => {
  return useRouter().navigate;
};

export const useGoBack = () => {
  return useRouter().goBack;
};

interface RouterProviderProps {
  children: React.ReactNode;
}

function normalizePath(rawPath: string): string {
  if (!rawPath || rawPath === '/' || rawPath === '/index.html') return '/';
  const trimmed = rawPath.replace(/\/+$/, '');
  if (!trimmed || trimmed === '/index.html') return '/';
  return trimmed;
}

function hasSameOriginReferrer(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (!document.referrer) return false;
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = React.useState(() => {
    if (typeof window === 'undefined') {
      return { pathname: '/', search: '', hash: '' };
    }
    const rawPathname = window.location.pathname || '/';
    const normalized = normalizePath(rawPathname);
    if (rawPathname !== normalized && window.history?.replaceState) {
      window.history.replaceState(
        {},
        '',
        `${normalized}${window.location.search || ''}${window.location.hash || ''}`
      );
    }
    return {
      pathname: normalized,
      search: window.location.search || '',
      hash: window.location.hash || ''
    };
  });

  const [inAppHistoryCount, setInAppHistoryCount] = React.useState(0);
  const inAppHistoryRef = React.useRef(0);

  React.useEffect(() => {
    const handlePopState = () => {
      const rawPathname = window.location.pathname || '/';
      const normalized = normalizePath(rawPathname);
      inAppHistoryRef.current = Math.max(0, inAppHistoryRef.current - 1);
      setInAppHistoryCount(inAppHistoryRef.current);
      setCurrentUrl({
        pathname: normalized,
        search: window.location.search || '',
        hash: window.location.hash || ''
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = React.useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;

    // Normalize URL safely
    let newPath = '/';
    let newSearch = '';
    let newHash = '';
    try {
      const url = new URL(to, window.location.origin);
      newPath = normalizePath(url.pathname || '/');
      newSearch = url.search || '';
      newHash = url.hash || '';
    } catch {
      newPath = normalizePath(to.split('?')[0].split('#')[0] || '/');
    }

    // Only update history if destination is different
    const currentFull = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const targetFull = `${newPath}${newSearch}${newHash}`;

    if (currentFull !== targetFull) {
      if (options?.replace) {
        window.history.replaceState({}, '', targetFull);
      } else {
        window.history.pushState({}, '', targetFull);
        inAppHistoryRef.current += 1;
        setInAppHistoryCount(inAppHistoryRef.current);
      }
    }

    setCurrentUrl({
      pathname: newPath,
      search: newSearch,
      hash: newHash
    });

    // Scroll to top smoothly on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const canGoBack =
    inAppHistoryCount > 0 ||
    (typeof window !== 'undefined' && window.history.length > 1 && hasSameOriginReferrer());

  const goBack = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    if (inAppHistoryRef.current > 0 || (window.history.length > 1 && hasSameOriginReferrer())) {
      window.history.back();
      return;
    }
    navigate('/');
  }, [navigate]);

  return (
    <RouterContext.Provider
      value={{
        pathname: currentUrl.pathname,
        search: currentUrl.search,
        hash: currentUrl.hash,
        canGoBack,
        navigate,
        goBack
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  activeClassName?: string;
  exact?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, replace = false, className, activeClassName, exact = false, onClick, children, ...props }, ref) => {
    const { pathname, navigate } = useRouter();

    // Check active state
    const normalizedHref = href.split('?')[0].split('#')[0] || '/';
    const isActive = exact
      ? pathname === normalizedHref
      : normalizedHref === '/'
      ? pathname === '/'
      : pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow default behavior for modified clicks (e.g. Cmd+Click, Ctrl+Click for new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      // External links
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      e.preventDefault();
      onClick?.(e);
      navigate(href, { replace });
    };

    const combinedClassName = [
      className,
      isActive && activeClassName ? activeClassName : ''
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        className={combinedClassName}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = 'Link';
