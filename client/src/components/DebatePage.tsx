import React from 'react';
import './DebatePage.css';

export const DebatePage: React.FC = () => {
  return (
    <div className="debate-page">
      <div className="placeholder-container">
        <div className="placeholder-icon">💬</div>
        <h1>Debate Arena</h1>
        <p className="coming-soon">Coming Soon</p>
        <p className="description">
          Engage in structured debates, participate in tournaments, and sharpen your critical thinking skills.
        </p>
        <div className="features-preview">
          <h3>Features in Development:</h3>
          <ul>
            <li>Live debate rooms with real-time scoring</li>
            <li>Tournament brackets and competitions</li>
            <li>Topic voting and community discussions</li>
            <li>Debate coaching and strategy guides</li>
            <li>Performance analytics and improvement tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};