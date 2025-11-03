/**
 * @file NavigationContext.tsx
 * @author Angelo Nicolson
 * @brief Navigation state management with history support
 * @description Provides global navigation context using React Context API and custom useNavigationHistory hook.
 * Manages client-side routing with browser-like history navigation (back/forward), supports complex navigation
 * states including view selection, tutor filtering, grade/subject selection, and provides navigation methods
 * (navigate, goBack, goForward, replace, clearHistory) for seamless state transitions across the application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { NavigationContextValue, NavigationState } from '../types/navigation';
import { useNavigationHistory } from '../hooks/useNavigationHistory';

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialState?: NavigationState;
}

export function NavigationProvider({ 
  children, 
  initialState = { view: 'home' } 
}: NavigationProviderProps) {
  const navigationHistory = useNavigationHistory(initialState);

  const contextValue: NavigationContextValue = {
    currentState: navigationHistory.currentState,
    canGoBack: navigationHistory.canGoBack,
    canGoForward: navigationHistory.canGoForward,
    historyLength: navigationHistory.historyLength,
    currentIndex: navigationHistory.currentIndex,
    navigate: navigationHistory.navigate,
    goBack: navigationHistory.goBack,
    goForward: navigationHistory.goForward,
    replace: navigationHistory.replace,
    clearHistory: navigationHistory.clearHistory,
    getHistory: navigationHistory.getHistory
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}