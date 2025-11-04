/**
 * @file Home.tsx
 * @author Angelo Nicolson
 * @brief Homepage for educational resources platform
 * @description Main landing page showcasing available educational resources including math worksheets, science experiments,
 * history lessons, and educational videos. Features quick access to different subject areas, platform statistics, and highlights
 * of the various resource types available to students and educators.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-header">
        <div className="welcome-section">
          <h1>Educational Resources Hub</h1>
          <p className="tagline">Free worksheets, videos, and lessons for students and educators</p>
        </div>

        <div className="platform-stats">
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Free Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10/hr</div>
            <div className="stat-label">Download Limit</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Subject Areas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">K-12</div>
            <div className="stat-label">Grade Levels</div>
          </div>
        </div>
      </div>

      <div className="home-main">
        <div className="featured-section">
          <div className="section-header">
            <h2>📚 Subject Areas</h2>
            <p>Explore our collection of educational materials</p>
          </div>

          <div className="featured-debates">
            <div className="debate-card featured" onClick={() => navigate('/math')}>
              <div className="debate-header">
                <h3>🔢 Mathematics</h3>
                <div className="debate-meta">
                  <span className="complexity">Worksheets • Videos • Lessons</span>
                </div>
              </div>
              <div className="resource-preview">
                <div className="resource-type-grid">
                  <div className="resource-type-item">
                    <span className="icon">📝</span>
                    <span className="label">Algebra Worksheets</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">📐</span>
                    <span className="label">Geometry Practice</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">🎥</span>
                    <span className="label">Tutorial Videos</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">📊</span>
                    <span className="label">Statistics & Data</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-primary" onClick={() => navigate('/math')}>
                  Browse Math Resources
                </button>
              </div>
            </div>

            <div className="debate-card" onClick={() => navigate('/science')}>
              <div className="debate-header">
                <h3>🔬 Science</h3>
                <div className="debate-meta">
                  <span className="complexity">Experiments • Simulations • Videos</span>
                </div>
              </div>
              <div className="resource-preview">
                <div className="resource-type-grid">
                  <div className="resource-type-item">
                    <span className="icon">🧪</span>
                    <span className="label">Lab Experiments</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">🧬</span>
                    <span className="label">Biology Resources</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">⚗️</span>
                    <span className="label">Chemistry Guides</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">🌍</span>
                    <span className="label">Earth Science</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-primary" onClick={() => navigate('/science')}>
                  Browse Science Resources
                </button>
              </div>
            </div>

            <div className="debate-card" onClick={() => navigate('/history')}>
              <div className="debate-header">
                <h3>📜 History</h3>
                <div className="debate-meta">
                  <span className="complexity">Primary Sources • Lessons • Timelines</span>
                </div>
              </div>
              <div className="resource-preview">
                <div className="resource-type-grid">
                  <div className="resource-type-item">
                    <span className="icon">🏛️</span>
                    <span className="label">Ancient Civilizations</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">🗽</span>
                    <span className="label">US History</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">🌎</span>
                    <span className="label">World History</span>
                  </div>
                  <div className="resource-type-item">
                    <span className="icon">📖</span>
                    <span className="label">Historical Documents</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-primary" onClick={() => navigate('/history')}>
                  Browse History Resources
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="section-header">
            <h2>✨ Platform Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📥</div>
              <h3>Free Downloads</h3>
              <p>Download up to 10 worksheets per hour without creating an account</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>Video Player</h3>
              <p>Watch educational videos directly on the platform with embedded player</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Filtering</h3>
              <p>Filter resources by topic, grade level, and type to find exactly what you need</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access resources on any device with responsive design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};