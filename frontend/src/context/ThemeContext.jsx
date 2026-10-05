import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('zira_theme') || 'blue');
  const [lastDarkTheme, setLastDarkTheme] = useState(() => {
    const saved = localStorage.getItem('zira_last_dark_theme');
    if (saved && saved !== 'light') return saved;
    const initialTheme = localStorage.getItem('zira_theme');
    return initialTheme && initialTheme !== 'light' ? initialTheme : 'blue';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('zira_theme', theme);

    if (theme !== 'light') {
      setLastDarkTheme(theme);
      localStorage.setItem('zira_last_dark_theme', theme);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme !== 'light') {
      setLastDarkTheme(newTheme);
      localStorage.setItem('zira_last_dark_theme', newTheme);
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'light') {
        return lastDarkTheme || 'blue';
      }
      return 'light';
    });
  };

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === 'light',
      isMidnightBlue: theme === 'blue' || theme === 'dark',
      isOnyx: theme === 'onyx',
      setTheme,
      toggleTheme
    }),
    [theme, lastDarkTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
