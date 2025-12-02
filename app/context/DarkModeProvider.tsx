'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

type ContextValue = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const KEY = 'theme'; // chave no localStorage
const DarkModeContext = createContext<ContextValue | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const resolve = useCallback((t: Theme) => {
    if (t === 'system') {
      try {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } catch {
        return 'light';
      }
    }
    return t === 'dark' ? 'dark' : 'light';
  }, []);

  // lê preferências no mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeState(saved);
      } else {
        setThemeState('system');
      }
    } catch {
      setThemeState('system');
    }
  }, []);

  // aplica a classe e observa prefers-color-scheme se for 'system'
  useEffect(() => {
    const r = resolve(theme);
    setResolvedTheme(r);

    const el = document.documentElement;
    if (r === 'dark') el.classList.add('dark');
    else el.classList.remove('dark');

    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // ignore
    }

    let mql: MediaQueryList | null = null;
    const handleChange = () => {
      if (theme === 'system') {
        const newR = resolve('system');
        setResolvedTheme(newR);
        if (newR === 'dark') el.classList.add('dark');
        else el.classList.remove('dark');
      }
    };

    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener?.('change', handleChange);
      mql.addListener?.(handleChange); // fallback older browsers
    }

    return () => {
      if (mql) {
        mql.removeEventListener?.('change', handleChange);
        mql.removeListener?.(handleChange);
      }
    };
  }, [theme, resolve]);

  const setTheme = (t: Theme) => setThemeState(t);

  const toggleTheme = () =>
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      return next;
    });

  return (
    <DarkModeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </DarkModeContext.Provider>
  );
}

// hook de utilidade
export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside DarkModeProvider');
  return ctx;
}
