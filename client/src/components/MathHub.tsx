import React from 'react';
import { MathResources } from './MathResources';
import './SubjectHub.css';

interface MathHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const MathHub: React.FC<MathHubProps> = ({ onNavigateToTutors }) => {
  const [activeSection, setActiveSection] = React.useState<'overview' | 'resources'>('overview');

  if (activeSection === 'resources') {
    return (
      <div className="subject-hub">
        <div className="hub-header">
          <button className="back-button" onClick={() => setActiveSection('overview')}>
            ← Back to Math Hub
          </button>
        </div>
        <MathResources />
      </div>
    );
  }

  return (
    <div className="subject-hub">
      <div className="hub-header">
        <h1>Math Learning Center</h1>
        <p>Master mathematics from elementary to advanced levels</p>
      </div>

      <div className="hub-sections">
        <div className="hub-card" onClick={() => setActiveSection('resources')}>
          <div className="card-icon">📚</div>
          <h2>Math Resources</h2>
          <p>Access worksheets, videos, practice problems, and quizzes organized by grade level</p>
          <ul className="feature-list">
            <li>Elementary to High School curriculum</li>
            <li>Interactive practice problems</li>
            <li>Video explanations</li>
            <li>Downloadable worksheets</li>
          </ul>
          <button className="hub-button">Browse Resources →</button>
        </div>

        <div className="hub-card" onClick={onNavigateToTutors}>
          <div className="card-icon">🎓</div>
          <h2>Find a Math Tutor</h2>
          <p>Connect with qualified math tutors for personalized learning</p>
          <ul className="feature-list">
            <li>Certified math educators</li>
            <li>All grade levels available</li>
            <li>1-on-1 and group sessions</li>
            <li>Flexible scheduling</li>
          </ul>
          <button className="hub-button">Find Tutors →</button>
        </div>
      </div>

      <div className="hub-stats">
        <div className="stat">
          <span className="stat-number">500+</span>
          <span className="stat-label">Math Resources</span>
        </div>
        <div className="stat">
          <span className="stat-number">50+</span>
          <span className="stat-label">Expert Tutors</span>
        </div>
        <div className="stat">
          <span className="stat-number">K-12</span>
          <span className="stat-label">Grade Coverage</span>
        </div>
      </div>
    </div>
  );
};