import React, { createContext, useContext, useState, useEffect } from 'react';

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
  primary: '#2563EB',
  hover: '#1D4ED8',
  light: '#EFF6FF',
  text: '#2563EB',
  accent: 'from-[#1E3A8A] via-[#2563EB] to-[#0EA5E9]',
  navy: '#1E3A8A',
  cyan: '#0EA5E9',
};

export const APP_DARK_THEME: ThemeColorConfig = {
  name: 'blue',
  label: 'Vyapar Blue (Dark)',
  primary: '#3B82F6',
  hover: '#60A5FA',
  light: 'rgba(59, 130, 246, 0.15)',
  text: '#60A5FA',
  accent: 'from-[#172033] via-[#3B82F6] to-[#38BDF8]',
  navy: '#1E293B',
  cyan: '#38BDF8',
};

export const THEME_PALETTES: Record<ThemeColor, ThemeColorConfig> = {
  blue: APP_THEME,
  orange: {
    name: 'orange',
    label: 'Vyapar Amber',
    primary: '#F59E0B',
    hover: '#D97706',
    light: '#FEF3C7',
    text: '#D97706',
    accent: 'from-[#78350F] via-[#F59E0B] to-[#FBBF24]',
    navy: '#78350F',
    cyan: '#FBBF24',
  },
  green: {
    name: 'green',
    label: 'Emerald Green',
    primary: '#16A34A',
    hover: '#15803D',
    light: '#DCFCE7',
    text: '#15803D',
    accent: 'from-[#14532D] via-[#16A34A] to-[#4ADE80]',
    navy: '#14532D',
    cyan: '#4ADE80',
  },
  purple: {
    name: 'purple',
    label: 'Royal Purple',
    primary: '#7C3AED',
    hover: '#6D28D9',
    light: '#F3E8FF',
    text: '#7C3AED',
    accent: 'from-[#3B0764] via-[#7C3AED] to-[#A855F7]',
    navy: '#3B0764',
    cyan: '#A855F7',
  },
  red: {
    name: 'red',
    label: 'Crimson Red',
    primary: '#EF4444',
    hover: '#DC2626',
    light: '#FEE2E2',
    text: '#DC2626',
    accent: 'from-[#7F1D1D] via-[#EF4444] to-[#F87171]',
    navy: '#7F1D1D',
    cyan: '#F87171',
  },
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
  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vyaparx_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    try {
      const saved = localStorage.getItem('vyaparx_theme_color') as ThemeColor;
      return saved && THEME_PALETTES[saved] ? saved : 'blue';
    } catch {
      return 'blue';
    }
  });

  // Handle dark mode class on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('vyaparx_dark_mode', String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Apply CSS color variables dynamically
  useEffect(() => {
    const root = document.documentElement;
    const basePalette = THEME_PALETTES[themeColor] || APP_THEME;
    const activePrimary = isDarkMode ? (themeColor === 'blue' ? '#3B82F6' : basePalette.primary) : basePalette.primary;
    const activeHover = isDarkMode ? (themeColor === 'blue' ? '#60A5FA' : basePalette.hover) : basePalette.hover;
    const activeLight = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : basePalette.light;
    const activeText = isDarkMode ? (themeColor === 'blue' ? '#60A5FA' : basePalette.primary) : basePalette.text;

    root.style.setProperty('--primary', activePrimary);
    root.style.setProperty('--primary-hover', activeHover);
    root.style.setProperty('--primary-light', activeLight);
    root.style.setProperty('--primary-text', activeText);
    root.style.setProperty('--primary-navy', basePalette.navy);
    root.style.setProperty('--primary-cyan', basePalette.cyan);

    try {
      localStorage.setItem('vyaparx_theme_color', themeColor);
    } catch {
      // ignore
    }
  }, [themeColor, isDarkMode]);

  const toggleDarkMode = () => setIsDarkModeState(prev => !prev);
  const setDarkMode = (val: boolean) => setIsDarkModeState(val);
  const setThemeColor = (color: ThemeColor) => setThemeColorState(color);

  const currentPalette: ThemeColorConfig = isDarkMode
    ? (themeColor === 'blue' ? APP_DARK_THEME : THEME_PALETTES[themeColor] || APP_DARK_THEME)
    : (THEME_PALETTES[themeColor] || APP_THEME);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        themeColor,
        setThemeColor,
        palette: currentPalette,
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

