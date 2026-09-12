import React, { createContext, useContext, useEffect } from 'react';

export type ThemeColor = 'orange' | 'green' | 'blue' | 'purple' | 'red';

export interface ThemeColorConfig {
  name: string;
  label: string;
  primary: string;
  hover: string;
  light: string;
  text: string;
  accent: string;
  navy: string;
  cyan: string;
}

export const APP_THEME: ThemeColorConfig = {
  name: 'blue',
  label: 'Vyapar Blue',
  primary: '#0284C7',
  hover: '#0369A1',
  light: '#EDF6FD',
  text: '#0284C7',
  accent: 'from-[#0284C7] via-[#38BDF8] to-[#00ADEF]',
  navy: '#1E3A8A',
  cyan: '#00ADEF',
};

export const THEME_PALETTES: Record<ThemeColor, ThemeColorConfig> = {
  orange: APP_THEME,
  green: APP_THEME,
  blue: APP_THEME,
  purple: APP_THEME,
  red: APP_THEME,
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  palette: ThemeColorConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure dark mode class is completely removed and light mode is enforced
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    try {
      localStorage.removeItem('vyaparx_dark_mode');
    } catch {
      // ignore
    }
  }, []);

  // Apply CSS color variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', APP_THEME.primary);
    root.style.setProperty('--primary-hover', APP_THEME.hover);
    root.style.setProperty('--primary-light', APP_THEME.light);
    root.style.setProperty('--primary-text', APP_THEME.text);
    root.style.setProperty('--primary-navy', APP_THEME.navy);
    root.style.setProperty('--primary-cyan', APP_THEME.cyan);
    localStorage.setItem('vyaparx_theme_color', 'blue');
  }, []);

  const toggleDarkMode = () => { /* Light mode only */ };
  const setDarkMode = () => { /* Light mode only */ };
  const setThemeColor = () => { /* Theme is locked to brand blue palette */ };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: false,
        toggleDarkMode,
        setDarkMode,
        themeColor: 'blue',
        setThemeColor,
        palette: APP_THEME,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
