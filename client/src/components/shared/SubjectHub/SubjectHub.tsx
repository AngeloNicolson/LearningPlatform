/**
 * @file SubjectHub.tsx
 * @author Angelo Nicolson
 * @brief Generic subject hub component for all subjects
 * @description Displays a subject hub with options to browse resources or access learning pathways (courses).
 */

import React from 'react';
import './SubjectHub.css';

interface SubjectHubProps {
  subjectName: string;
  subjectIcon: string;
  subjectDescription: string;
  onBrowseResources: () => void;
  onViewCourses: () => void;
  onBack: () => void;
}

export const SubjectHub: React.FC<SubjectHubProps> = ({
  subjectName,
  subjectIcon,
  subjectDescription,
  onBrowseResources,
  onViewCourses,
  onBack
}) => {
  return (
    <div className="subject-hub">
      <div className="subject-hub-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="subject-hub-icon">{subjectIcon}</div>
        <h1>{subjectName}</h1>
        <p className="subject-hub-description">{subjectDescription}</p>
      </div>

      <div className="subject-hub-options">
        <div className="hub-card" onClick={onBrowseResources}>
          <div className="hub-card-icon">📚</div>
          <h2>Browse Resources</h2>
          <p>Explore worksheets, videos, and learning materials organized by topic</p>
          <button className="hub-card-btn">Explore Resources →</button>
        </div>

        <div className="hub-card coming-soon" onClick={onViewCourses}>
          <div className="hub-card-icon">🎓</div>
          <h2>Learning Pathways</h2>
          <p>Structured courses with sequential lessons, progress tracking, and assessments</p>
          <div className="coming-soon-badge">Coming Soon!</div>
          <button className="hub-card-btn secondary">Learn More →</button>
        </div>
      </div>

      <div className="subject-hub-preview">
        <h3>What's a Learning Pathway?</h3>
        <div className="pathway-features">
          <div className="pathway-feature">
            <span className="feature-icon">📖</span>
            <span>Sequential lessons from beginner to advanced</span>
          </div>
          <div className="pathway-feature">
            <span className="feature-icon">✓</span>
            <span>Track your progress through each unit</span>
          </div>
          <div className="pathway-feature">
            <span className="feature-icon">🏆</span>
            <span>Earn certificates upon completion</span>
          </div>
          <div className="pathway-feature">
            <span className="feature-icon">📊</span>
            <span>Practice problems and assessments</span>
          </div>
        </div>
      </div>
    </div>
  );
};
