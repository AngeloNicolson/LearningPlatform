import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, getTheme, getAvailableThemes } from '../styles/themes';

interface ThemeContextValue {
  currentTheme: Theme;
  themeId: string;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'classic' 
}) => {
  const [themeId, setThemeId] = useState<string>(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check for system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return defaultTheme;
  });
  
  const currentTheme = getTheme(themeId);
  const availableThemes = getAvailableThemes();
  
  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;
    
    // Set CSS variables for each color
    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variable names
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Set additional utility variables
    root.style.setProperty('--theme-name', currentTheme.name);
    root.style.setProperty('--theme-is-dark', currentTheme.isDark ? '1' : '0');
    
    // Add theme class to body for theme-specific styles
    document.body.className = `theme-${currentTheme.id}`;
    
    // Save theme preference
    localStorage.setItem('app-theme', themeId);
  }, [currentTheme, themeId]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually selected a theme
      const savedTheme = localStorage.getItem('app-theme');
      if (!savedTheme) {
        setThemeId(e.matches ? 'dark' : 'classic');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const setTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
  };
  
  const toggleDarkMode = () => {
    setThemeId(currentTheme.isDark ? 'classic' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeId,
      setTheme,
      availableThemes,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};