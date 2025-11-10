/**
 * @file CoursesComingSoon.tsx
 * @author Angelo Nicolson
 * @brief Placeholder page for Learning Pathways feature
 * @description Coming soon page that explains the upcoming Learning Pathways (courses) feature,
 * showing planned features like sequential lessons, progress tracking, and certificates.
 */

import React from 'react';
import './CoursesComingSoon.css';

interface CoursesComingSoonProps {
  subjectName: string;
  subjectIcon: string;
  onGoBack: () => void;
}

export const CoursesComingSoon: React.FC<CoursesComingSoonProps> = ({
  subjectName,
  subjectIcon,
  onGoBack
}) => {
  return (
    <div className="courses-coming-soon">
      <div className="coming-soon-container">
        <div className="coming-soon-header">
          <div className="coming-soon-icon">{subjectIcon}</div>
          <h1>Learning Pathways for {subjectName}</h1>
          <div className="coming-soon-badge-large">Coming Soon!</div>
          <p className="coming-soon-description">
            We're building structured learning pathways that will guide you through {subjectName.toLowerCase()}
            with carefully curated lessons, progress tracking, and assessments.
          </p>
        </div>

        <div className="planned-features">
          <h2>What to Expect</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-item-icon">📖</div>
              <h3>Sequential Lessons</h3>
              <p>Learn step-by-step with lessons that build on each other, from beginner to advanced concepts</p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">✓</div>
              <h3>Progress Tracking</h3>
              <p>Track your progress through each unit and see how far you've come in your learning journey</p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">🏆</div>
              <h3>Certificates</h3>
              <p>Earn certificates upon completion to showcase your achievements and knowledge</p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">📊</div>
              <h3>Practice & Assessments</h3>
              <p>Test your understanding with practice problems and quizzes throughout the course</p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Pathways adapted to your grade level and learning pace for optimal understanding</p>
            </div>

            <div className="feature-item">
              <div className="feature-item-icon">📚</div>
              <h3>Curated Content</h3>
              <p>Expertly selected resources and materials organized into comprehensive learning paths</p>
            </div>
          </div>
        </div>

        <div className="coming-soon-cta">
          <h3>In the meantime...</h3>
          <p>Explore our growing library of worksheets, videos, and learning materials for {subjectName.toLowerCase()}</p>
          <button className="back-to-hub-btn" onClick={onGoBack}>
            ← Back to {subjectName} Hub
          </button>
        </div>
      </div>
    </div>
  );
};
