/**
 * @file navigation.ts
 * @author Angelo Nicolson
 * @brief TypeScript type definitions for navigation state
 * @description Defines TypeScript interfaces for navigation state management including NavigationState, NavigationContextValue, and view/tab selection types for client-side routing.
 */

export type MainView =
  | 'home'
  | 'debate'
  | 'math'
  | 'science'
  | 'history'
  | 'bible'
  | 'tutors'
  | 'dashboard'
  | 'login'
  | 'admin'
  | 'onboarding';

export type TutorView = 
  | 'hub' 
  | 'grades' 
  | 'tutors' 
  | 'profile' 
  | 'booking' 
  | 'science-subjects' 
  | 'science-tutors';

export interface NavigationState {
  view: MainView;
  tutorView?: TutorView;
  selectedGrade?: string;
  selectedTutor?: string;
  selectedSessionType?: string;
  selectedScienceSubject?: string;
  tutorType?: 'math' | 'science' | 'all';
  scrollPosition?: number;
  timestamp?: number;
  metadata?: Record<string, any>;
  // Tab states for different views
  adminTab?: string;
  mathTab?: string;
  scienceTab?: string;
  historyCountry?: string;
  bibleTab?: string;
  workspaceTab?: string;
}

export interface NavigationHistoryEntry {
  state: NavigationState;
  title?: string;
  url?: string;
}

export interface NavigationContextValue {
  currentState: NavigationState;
  canGoBack: boolean;
  canGoForward: boolean;
  historyLength: number;
  currentIndex: number;
  navigate: (state: Partial<NavigationState>, options?: NavigationOptions) => void;
  goBack: () => void;
  goForward: () => void;
  replace: (state: Partial<NavigationState>) => void;
  clearHistory: () => void;
  getHistory: () => NavigationHistoryEntry[];
}

export interface NavigationOptions {
  replace?: boolean;
  preserveScroll?: boolean;
  metadata?: Record<string, any>;
}
