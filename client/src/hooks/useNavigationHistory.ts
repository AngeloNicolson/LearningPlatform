/**
 * @file useNavigationHistory.ts
 * @author Angelo Nicolson
 * @brief Custom React hook for navigation history
 * @description Provides React hook implementing browser-like navigation history with back/forward functionality, state merging, and history management. Used by NavigationContext for client-side routing.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { NavigationState, NavigationHistoryEntry, NavigationOptions } from '../types/navigation';

const MAX_HISTORY_SIZE = 50;

export function useNavigationHistory(initialState: NavigationState) {
  const [currentState, setCurrentState] = useState<NavigationState>(initialState);

  // Build URL from state
  const buildUrl = (state: NavigationState): string => {
    const params = new URLSearchParams();
    params.set('view', state.view);
    
    if (state.tutorView) params.set('tutorView', state.tutorView);
    if (state.selectedGrade) params.set('grade', state.selectedGrade);
    if (state.selectedTutor) params.set('tutor', state.selectedTutor);
    if (state.selectedSessionType) params.set('session', state.selectedSessionType);
    if (state.selectedScienceSubject) params.set('subject', state.selectedScienceSubject);
    if (state.tutorType) params.set('type', state.tutorType);
    if (state.adminTab) params.set('adminTab', state.adminTab);
    if (state.mathTab) params.set('mathTab', state.mathTab);
    if (state.scienceTab) params.set('scienceTab', state.scienceTab);
    if (state.historyCountry) params.set('country', state.historyCountry);
    if (state.workspaceTab) params.set('workspaceTab', state.workspaceTab);
    
    return `?${params.toString()}`;
  };

  // Parse state from URL
  const parseStateFromUrl = (): NavigationState => {
    const params = new URLSearchParams(window.location.search);
    return {
      view: (params.get('view') as NavigationState['view']) || 'home',
      tutorView: params.get('tutorView') as NavigationState['tutorView'] | undefined,
      selectedGrade: params.get('grade') || undefined,
      selectedTutor: params.get('tutor') || undefined,
      selectedSessionType: params.get('session') || undefined,
      selectedScienceSubject: params.get('subject') || undefined,
      tutorType: (params.get('type') as NavigationState['tutorType']) || undefined,
      adminTab: params.get('adminTab') || undefined,
      mathTab: params.get('mathTab') || undefined,
      scienceTab: params.get('scienceTab') || undefined,
      historyCountry: params.get('country') || undefined,
      workspaceTab: params.get('workspaceTab') || undefined,
    };
  };

  // Initialize from URL on mount
  useEffect(() => {
    const urlState = parseStateFromUrl();
    const stateToUse = (urlState.view !== 'home' || window.location.search) ? urlState : initialState;
    setCurrentState(stateToUse);
    // Store initial state in browser history so back button works
    window.history.replaceState(stateToUse, '', window.location.href);
  }, []);

  // Check if navigation is possible
  const canGoBack = window.history.length > 1;
  const canGoForward = false; // Browser doesn't expose forward history info

  // Navigate to a new state
  const navigate = useCallback((newState: Partial<NavigationState>, options?: NavigationOptions) => {
    const mergedState: NavigationState = {
      ...currentState,
      ...newState,
      timestamp: Date.now(),
      metadata: options?.metadata
    };

    setCurrentState(mergedState);
    
    const url = buildUrl(mergedState);
    
    if (options?.replace) {
      window.history.replaceState(mergedState, '', url);
    } else {
      window.history.pushState(mergedState, '', url);
    }

    // Save scroll position if not preserving
    if (!options?.preserveScroll) {
      window.scrollTo(0, 0);
    }
  }, [currentState]);

  // Go back in history
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // Go forward in history
  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  // Replace current state
  const replace = useCallback((newState: Partial<NavigationState>) => {
    navigate(newState, { replace: true });
  }, [navigate]);

  // Clear all history (not really possible with browser history, so just go home)
  const clearHistory = useCallback(() => {
    navigate({ view: 'home' }, { replace: true });
  }, [navigate]);

  // Get full history (simplified - browser doesn't expose full history)
  const getHistory = useCallback(() => {
    // Return current state as single entry since browser doesn't expose history
    return [{
      state: currentState,
      title: document.title,
      url: window.location.href
    }];
  }, [currentState]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Always update state on popstate
      if (event.state) {
        setCurrentState(event.state);
      } else {
        // No state means we're at initial page load or a page without state
        const urlState = parseStateFromUrl();
        setCurrentState(urlState);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Left Arrow for back
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      }
      // Alt + Right Arrow for forward
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        goForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward]);

  return {
    currentState,
    canGoBack,
    canGoForward,
    historyLength: window.history.length,
    currentIndex: 0, // Browser doesn't expose current position
    navigate,
    goBack,
    goForward,
    replace,
    clearHistory,
    getHistory
  };
}
