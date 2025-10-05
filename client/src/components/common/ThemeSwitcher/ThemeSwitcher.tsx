import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './ThemeSwitcher.css';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeId, setTheme, availableThemes, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (selectedThemeId: string) => {
    setTheme(selectedThemeId);
    setIsOpen(false);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T to open theme switcher
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      // Ctrl/Cmd + Shift + D to toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDarkMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, toggleDarkMode]);

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme (Ctrl+Shift+T)"
        aria-label="Open theme switcher"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 2 L10 6 M10 14 L10 18 M2 10 L6 10 M14 10 L18 10" stroke="currentColor" strokeWidth="2"/>
          <circle cx="10" cy="10" r="3" fill="currentColor"/>
        </svg>
        <span className="theme-name">{currentTheme.name}</span>
      </button>

      {isOpen && (
        <div className="theme-switcher-modal">
          <div className="theme-switcher-header">
            <h3>Choose Theme</h3>
            <button
              className="theme-switcher-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="theme-switcher-content">
            <div className="theme-list">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-option ${themeId === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  type="button"
                >
                  <div className="theme-preview">
                    <div 
                      className="theme-preview-colors"
                      style={{
                        background: `linear-gradient(135deg, 
                          ${theme.colors.primary} 0%, 
                          ${theme.colors.primary} 25%, 
                          ${theme.colors.secondary} 25%, 
                          ${theme.colors.secondary} 50%,
                          ${theme.colors.backgroundMain} 50%,
                          ${theme.colors.backgroundMain} 75%,
                          ${theme.colors.accent} 75%,
                          ${theme.colors.accent} 100%)`
                      }}
                    />
                  </div>
                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                    {theme.isDark && <span className="theme-badge dark">Dark</span>}
                    {theme.id === 'highContrast' && <span className="theme-badge accessible">A11y</span>}
                  </div>
                  {themeId === theme.id && (
                    <div className="theme-checkmark">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 3L6 10.5L2.5 7L3.5 6L6 8.5L12.5 2L13.5 3Z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="theme-switcher-footer">
              <div className="theme-shortcuts">
                <p>Keyboard shortcuts:</p>
                <div className="shortcut">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd>
                  <span>Open theme switcher</span>
                </div>
                <div className="shortcut">
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
                  <span>Toggle dark mode</span>
                </div>
              </div>
              <button
                className="quick-toggle-btn"
                onClick={toggleDarkMode}
                title="Toggle Dark Mode"
              >
                {currentTheme.isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="theme-switcher-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};