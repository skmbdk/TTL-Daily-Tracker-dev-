import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('zira_theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('zira_theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === 'light',
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
