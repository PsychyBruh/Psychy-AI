// src/components/ThemeProvider.tsx
// Provides theme context and switching for Psychy AI
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'light' | 'dark' | 'psychy-green' | 'solarized-light' | 'high-contrast' | 'custom';

interface ThemeContextProps {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  customTheme?: Record<string, string>;
  setCustomTheme?: (theme: Record<string, string>) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>('light');
  const [customTheme, setCustomTheme] = useState<Record<string, string>>();

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-psychy-green', 'theme-solarized-light', 'theme-high-contrast', 'theme-custom');
    document.body.classList.add(`theme-${theme}`);
    if (theme === 'custom' && customTheme) {
      Object.entries(customTheme).forEach(([key, value]) => {
        document.body.style.setProperty(key, value);
      });
    }
  }, [theme, customTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
