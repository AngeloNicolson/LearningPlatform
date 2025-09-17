import React from 'react';
import { ScienceResources } from './ScienceResources';
import './SubjectHub.css';

interface ScienceHubProps {
  onNavigateToResources: () => void;
  onNavigateToTutors: () => void;
}

export const ScienceHub: React.FC<ScienceHubProps> = ({ onNavigateToTutors }) => {
  const [activeSection, setActiveSection] = React.useState<'overview' | 'resources'>('overview');

  if (activeSection === 'resources') {
    return (
      <div className="subject-hub">
        <div className="hub-header">
          <button className="back-button" onClick={() => setActiveSection('overview')}>
            ← Back to Science Hub
          </button>
        </div>
        <ScienceResources />
      </div>
    );
  }

  return (
    <div className="subject-hub">
      <div className="hub-header">
        <h1>Science Learning Center</h1>
        <p>Explore the wonders of science through interactive learning</p>
      </div>

      <div className="hub-sections">
        <div className="hub-card" onClick={() => setActiveSection('resources')}>
          <div className="card-icon">🔬</div>
          <h2>Science Resources</h2>
          <p>Discover experiments, labs, and educational materials across all science disciplines</p>
          <ul className="feature-list">
            <li>Physics, Chemistry, Biology</li>
            <li>Virtual lab experiments</li>
            <li>Interactive simulations</li>
            <li>Study guides and worksheets</li>
          </ul>
          <button className="hub-button">Browse Resources →</button>
        </div>

        <div className="hub-card" onClick={onNavigateToTutors}>
          <div className="card-icon">🎓</div>
          <h2>Find a Science Tutor</h2>
          <p>Connect with experienced science educators for personalized instruction</p>
          <ul className="feature-list">
            <li>Subject specialists</li>
            <li>Lab and theory support</li>
            <li>Exam preparation</li>
            <li>Project guidance</li>
          </ul>
          <button className="hub-button">Find Tutors →</button>
        </div>
      </div>

      <div className="hub-stats">
        <div className="stat">
          <span className="stat-number">300+</span>
          <span className="stat-label">Science Resources</span>
        </div>
        <div className="stat">
          <span className="stat-number">40+</span>
          <span className="stat-label">Science Tutors</span>
        </div>
        <div className="stat">
          <span className="stat-number">15+</span>
          <span className="stat-label">Science Topics</span>
        </div>
      </div>
    </div>
  );
};