import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTheme, saveTheme, DEFAULT_THEME } from '../storage/appStorage';

export const THEME_PALETTES = {
  light: {
    mode: 'light',
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    accent: '#F59E0B',
    success: '#10B981',
    successLight: '#ECFDF5',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    border: '#CBD5E1',
    inputBackground: '#F1F5F9',
    statusBar: 'dark',
  },
  dark: {
    mode: 'dark',
    background: '#0F172A',
    cardBackground: '#1E293B',
    cardBorder: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: '#3B82F6',
    primaryLight: '#1E3A8A',
    primaryDark: '#60A5FA',
    accent: '#FBBF24',
    success: '#34D399',
    successLight: '#064E3B',
    error: '#F87171',
    errorLight: '#7F1D1D',
    warning: '#FBBF24',
    border: '#334155',
    inputBackground: '#0F172A',
    statusBar: 'light',
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(DEFAULT_THEME);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Hydrate theme on startup
  useEffect(() => {
    let isMounted = true;
    const hydrateTheme = async () => {
      const storedTheme = await getTheme();
      if (isMounted) {
        setThemeModeState(storedTheme);
        setIsThemeLoading(false);
      }
    };
    hydrateTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = async () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(nextMode);
    await saveTheme(nextMode);
  };

  const setThemeMode = async (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setThemeModeState(mode);
      await saveTheme(mode);
    }
  };

  const value = useMemo(
    () => ({
      themeMode,
      isDark: themeMode === 'dark',
      colors: THEME_PALETTES[themeMode],
      toggleTheme,
      setThemeMode,
      isThemeLoading,
    }),
    [themeMode, isThemeLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
