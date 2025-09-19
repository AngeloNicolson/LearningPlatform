import React, { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import './NavigationBar.css';

export const NavigationBar: React.FC = () => {
  const { 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward, 
    currentState,
    navigate 
  } = useNavigation();
  
  const [showHistory, setShowHistory] = useState(false);

  const getViewLabel = (view: string): string => {
    const labels: Record<string, string> = {
      'home': 'Home',
      'debate': 'Debate',
      'math': 'Mathematics',
      'science': 'Science',
      'history': 'History',
      'tutors': 'Find Tutors',
      'dashboard': 'Dashboard',
      'login': 'Login',
      'admin': 'Admin Panel',
      'onboarding': 'Tutor Onboarding'
    };
    return labels[view] || view;
  };

  const getCurrentPageInfo = () => {
    let label = getViewLabel(currentState.view);
    if (currentState.tutorView) {
      label += ` › ${currentState.tutorView}`;
    }
    return label;
  };

  return (
    <div className="navigation-bar">
      <div className="nav-controls">
        <button 
          className={`nav-btn ${!canGoBack ? 'disabled' : ''}`}
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back (Alt + ←)"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className={`nav-btn ${!canGoForward ? 'disabled' : ''}`}
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward (Alt + →)"
          aria-label="Go forward"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="current-page-info">
          {getCurrentPageInfo()}
        </div>

        <button
          className="nav-btn home-btn"
          onClick={() => navigate({ view: 'home' })}
          title="Go to home"
          aria-label="Go to home"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10L10 3L17 10M5 8V17H15V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  );
};