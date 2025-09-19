export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryAlpha10: string;
  primaryAlpha20: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background colors
  backgroundMain: string;
  backgroundPaper: string;
  backgroundSidebar: string;
  backgroundCard: string;
  backgroundHover: string;
  backgroundOverlay: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textLink: string;
  
  // Border colors
  borderLight: string;
  borderMedium: string;
  borderDark: string;
  borderFocus: string;
  
  // Status colors
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  
  // Shadow colors
  shadowLight: string;
  shadowMedium: string;
  shadowDark: string;
  
  // Special colors
  accent: string;
  highlight: string;
  selection: string;
  scrollbar: string;
  scrollbarThumb: string;
}

export interface Theme {
  name: string;
  id: string;
  description: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const themes: Record<string, Theme> = {
  classic: {
    name: "Classic Burgundy",
    id: "classic",
    description: "Elegant burgundy theme with warm cream backgrounds",
    isDark: false,
    colors: {
      // Primary colors
      primary: "#660B05",
      primaryLight: "#8b1009",
      primaryDark: "#4a0804",
      primaryAlpha10: "rgba(102, 11, 5, 0.1)",
      primaryAlpha20: "rgba(102, 11, 5, 0.2)",
      
      // Secondary colors
      secondary: "#8b7355",
      secondaryLight: "#a08870",
      secondaryDark: "#6b5840",
      
      // Background colors
      backgroundMain: "#faf8f3",
      backgroundPaper: "#ffffff",
      backgroundSidebar: "#ffffff",
      backgroundCard: "#ffffff",
      backgroundHover: "#f5f3ee",
      backgroundOverlay: "rgba(0, 0, 0, 0.5)",
      
      // Text colors
      textPrimary: "#3a3330",
      textSecondary: "#660B05",
      textMuted: "#8b7355",
      textInverse: "#ffffff",
      textLink: "#007bff",
      
      // Border colors
      borderLight: "rgba(102, 11, 5, 0.08)",
      borderMedium: "rgba(102, 11, 5, 0.15)",
      borderDark: "rgba(102, 11, 5, 0.3)",
      borderFocus: "#660B05",
      
      // Status colors
      success: "#28a745",
      successLight: "#5dd175",
      successDark: "#1e7e34",
      warning: "#ffc107",
      warningLight: "#ffcd38",
      warningDark: "#d39e00",
      error: "#dc3545",
      errorLight: "#e4606d",
      errorDark: "#bd2130",
      info: "#17a2b8",
      infoLight: "#3ab6cc",
      infoDark: "#117a8b",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.02)",
      shadowMedium: "rgba(102, 11, 5, 0.08)",
      shadowDark: "rgba(102, 11, 5, 0.25)",
      
      // Special colors
      accent: "#007bff",
      highlight: "rgba(102, 11, 5, 0.06)",
      selection: "rgba(102, 11, 5, 0.2)",
      scrollbar: "#f1f1f1",
      scrollbarThumb: "#c1c1c1",
    }
  },
  
  dark: {
    name: "Dark Mode",
    id: "dark",
    description: "Modern dark theme for reduced eye strain",
    isDark: true,
    colors: {
      // Primary colors
      primary: "#bb86fc",
      primaryLight: "#e7b9ff",
      primaryDark: "#8858c8",
      primaryAlpha10: "rgba(187, 134, 252, 0.1)",
      primaryAlpha20: "rgba(187, 134, 252, 0.2)",
      
      // Secondary colors
      secondary: "#03dac6",
      secondaryLight: "#66fff9",
      secondaryDark: "#00a896",
      
      // Background colors
      backgroundMain: "#121212",
      backgroundPaper: "#1e1e1e",
      backgroundSidebar: "#1a1a1a",
      backgroundCard: "#2c2c2c",
      backgroundHover: "#333333",
      backgroundOverlay: "rgba(0, 0, 0, 0.7)",
      
      // Text colors
      textPrimary: "#ffffff",
      textSecondary: "#bb86fc",
      textMuted: "#aaaaaa",
      textInverse: "#121212",
      textLink: "#03dac6",
      
      // Border colors
      borderLight: "rgba(255, 255, 255, 0.08)",
      borderMedium: "rgba(255, 255, 255, 0.15)",
      borderDark: "rgba(255, 255, 255, 0.3)",
      borderFocus: "#bb86fc",
      
      // Status colors
      success: "#4caf50",
      successLight: "#80e27e",
      successDark: "#087f23",
      warning: "#ff9800",
      warningLight: "#ffb74d",
      warningDark: "#c66900",
      error: "#f44336",
      errorLight: "#ff7961",
      errorDark: "#ba000d",
      info: "#2196f3",
      infoLight: "#6ec6ff",
      infoDark: "#0069c0",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.2)",
      shadowMedium: "rgba(0, 0, 0, 0.4)",
      shadowDark: "rgba(0, 0, 0, 0.6)",
      
      // Special colors
      accent: "#03dac6",
      highlight: "rgba(187, 134, 252, 0.1)",
      selection: "rgba(187, 134, 252, 0.3)",
      scrollbar: "#2c2c2c",
      scrollbarThumb: "#555555",
    }
  },
  
  ocean: {
    name: "Ocean Blue",
    id: "ocean",
    description: "Calming blue theme inspired by the sea",
    isDark: false,
    colors: {
      // Primary colors
      primary: "#0066cc",
      primaryLight: "#3399ff",
      primaryDark: "#004499",
      primaryAlpha10: "rgba(0, 102, 204, 0.1)",
      primaryAlpha20: "rgba(0, 102, 204, 0.2)",
      
      // Secondary colors
      secondary: "#00bcd4",
      secondaryLight: "#5ddef4",
      secondaryDark: "#008ba3",
      
      // Background colors
      backgroundMain: "#f0f8ff",
      backgroundPaper: "#ffffff",
      backgroundSidebar: "#e6f2ff",
      backgroundCard: "#ffffff",
      backgroundHover: "#e1f0ff",
      backgroundOverlay: "rgba(0, 0, 0, 0.5)",
      
      // Text colors
      textPrimary: "#1a3a52",
      textSecondary: "#0066cc",
      textMuted: "#5a7a9a",
      textInverse: "#ffffff",
      textLink: "#0066cc",
      
      // Border colors
      borderLight: "rgba(0, 102, 204, 0.1)",
      borderMedium: "rgba(0, 102, 204, 0.2)",
      borderDark: "rgba(0, 102, 204, 0.4)",
      borderFocus: "#0066cc",
      
      // Status colors
      success: "#00c853",
      successLight: "#5efc82",
      successDark: "#00962a",
      warning: "#ffab00",
      warningLight: "#ffdd4b",
      warningDark: "#c67c00",
      error: "#d50000",
      errorLight: "#ff5131",
      errorDark: "#9b0000",
      info: "#2196f3",
      infoLight: "#6ec6ff",
      infoDark: "#0069c0",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.05)",
      shadowMedium: "rgba(0, 102, 204, 0.1)",
      shadowDark: "rgba(0, 102, 204, 0.25)",
      
      // Special colors
      accent: "#00bcd4",
      highlight: "rgba(0, 102, 204, 0.08)",
      selection: "rgba(0, 102, 204, 0.2)",
      scrollbar: "#e6f2ff",
      scrollbarThumb: "#99ccff",
    }
  },
  
  forest: {
    name: "Forest Green",
    id: "forest",
    description: "Natural green theme inspired by nature",
    isDark: false,
    colors: {
      // Primary colors
      primary: "#2e7d32",
      primaryLight: "#60ad5e",
      primaryDark: "#005005",
      primaryAlpha10: "rgba(46, 125, 50, 0.1)",
      primaryAlpha20: "rgba(46, 125, 50, 0.2)",
      
      // Secondary colors
      secondary: "#795548",
      secondaryLight: "#a98274",
      secondaryDark: "#4b2c20",
      
      // Background colors
      backgroundMain: "#f1f8e9",
      backgroundPaper: "#ffffff",
      backgroundSidebar: "#e8f5e9",
      backgroundCard: "#ffffff",
      backgroundHover: "#dcedc8",
      backgroundOverlay: "rgba(0, 0, 0, 0.5)",
      
      // Text colors
      textPrimary: "#1b3a1b",
      textSecondary: "#2e7d32",
      textMuted: "#5a7a5a",
      textInverse: "#ffffff",
      textLink: "#1976d2",
      
      // Border colors
      borderLight: "rgba(46, 125, 50, 0.1)",
      borderMedium: "rgba(46, 125, 50, 0.2)",
      borderDark: "rgba(46, 125, 50, 0.4)",
      borderFocus: "#2e7d32",
      
      // Status colors
      success: "#43a047",
      successLight: "#76d275",
      successDark: "#00701a",
      warning: "#fb8c00",
      warningLight: "#ffbd45",
      warningDark: "#c25e00",
      error: "#e53935",
      errorLight: "#ff6f60",
      errorDark: "#ab000d",
      info: "#039be5",
      infoLight: "#63ccff",
      infoDark: "#006db3",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.05)",
      shadowMedium: "rgba(46, 125, 50, 0.1)",
      shadowDark: "rgba(46, 125, 50, 0.25)",
      
      // Special colors
      accent: "#4caf50",
      highlight: "rgba(46, 125, 50, 0.08)",
      selection: "rgba(46, 125, 50, 0.2)",
      scrollbar: "#e8f5e9",
      scrollbarThumb: "#a5d6a7",
    }
  },
  
  sunset: {
    name: "Sunset Orange",
    id: "sunset",
    description: "Warm orange and pink theme",
    isDark: false,
    colors: {
      // Primary colors
      primary: "#ff6b35",
      primaryLight: "#ff9558",
      primaryDark: "#cc4125",
      primaryAlpha10: "rgba(255, 107, 53, 0.1)",
      primaryAlpha20: "rgba(255, 107, 53, 0.2)",
      
      // Secondary colors
      secondary: "#f72585",
      secondaryLight: "#ff5fa3",
      secondaryDark: "#c4005d",
      
      // Background colors
      backgroundMain: "#fff5f0",
      backgroundPaper: "#ffffff",
      backgroundSidebar: "#fff0e6",
      backgroundCard: "#ffffff",
      backgroundHover: "#ffe8dd",
      backgroundOverlay: "rgba(0, 0, 0, 0.5)",
      
      // Text colors
      textPrimary: "#3a2520",
      textSecondary: "#ff6b35",
      textMuted: "#8a6a5a",
      textInverse: "#ffffff",
      textLink: "#7209b7",
      
      // Border colors
      borderLight: "rgba(255, 107, 53, 0.1)",
      borderMedium: "rgba(255, 107, 53, 0.2)",
      borderDark: "rgba(255, 107, 53, 0.4)",
      borderFocus: "#ff6b35",
      
      // Status colors
      success: "#4cc9f0",
      successLight: "#7ed8f5",
      successDark: "#0099cc",
      warning: "#ffbe0b",
      warningLight: "#ffd23f",
      warningDark: "#cc9600",
      error: "#ef476f",
      errorLight: "#f37395",
      errorDark: "#c41e48",
      info: "#4361ee",
      infoLight: "#6f86f4",
      infoDark: "#1a3cc0",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.05)",
      shadowMedium: "rgba(255, 107, 53, 0.1)",
      shadowDark: "rgba(255, 107, 53, 0.25)",
      
      // Special colors
      accent: "#f72585",
      highlight: "rgba(255, 107, 53, 0.08)",
      selection: "rgba(255, 107, 53, 0.2)",
      scrollbar: "#fff0e6",
      scrollbarThumb: "#ffb399",
    }
  },
  
  highContrast: {
    name: "High Contrast",
    id: "highContrast",
    description: "Maximum contrast for accessibility",
    isDark: false,
    colors: {
      // Primary colors
      primary: "#000000",
      primaryLight: "#333333",
      primaryDark: "#000000",
      primaryAlpha10: "rgba(0, 0, 0, 0.1)",
      primaryAlpha20: "rgba(0, 0, 0, 0.2)",
      
      // Secondary colors
      secondary: "#0000ff",
      secondaryLight: "#3333ff",
      secondaryDark: "#0000cc",
      
      // Background colors
      backgroundMain: "#ffffff",
      backgroundPaper: "#ffffff",
      backgroundSidebar: "#f0f0f0",
      backgroundCard: "#ffffff",
      backgroundHover: "#e0e0e0",
      backgroundOverlay: "rgba(0, 0, 0, 0.8)",
      
      // Text colors
      textPrimary: "#000000",
      textSecondary: "#000000",
      textMuted: "#333333",
      textInverse: "#ffffff",
      textLink: "#0000ff",
      
      // Border colors
      borderLight: "#cccccc",
      borderMedium: "#999999",
      borderDark: "#000000",
      borderFocus: "#0000ff",
      
      // Status colors
      success: "#008000",
      successLight: "#00a000",
      successDark: "#006000",
      warning: "#ff8800",
      warningLight: "#ffa000",
      warningDark: "#cc6600",
      error: "#ff0000",
      errorLight: "#ff3333",
      errorDark: "#cc0000",
      info: "#0000ff",
      infoLight: "#3333ff",
      infoDark: "#0000cc",
      
      // Shadow colors
      shadowLight: "rgba(0, 0, 0, 0.1)",
      shadowMedium: "rgba(0, 0, 0, 0.2)",
      shadowDark: "rgba(0, 0, 0, 0.4)",
      
      // Special colors
      accent: "#0000ff",
      highlight: "rgba(0, 0, 0, 0.1)",
      selection: "rgba(0, 0, 255, 0.2)",
      scrollbar: "#cccccc",
      scrollbarThumb: "#666666",
    }
  }
};

export const getTheme = (themeId: string): Theme => {
  return themes[themeId] || themes.classic;
};

export const getAvailableThemes = (): Theme[] => {
  return Object.values(themes);
};