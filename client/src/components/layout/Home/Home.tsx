/**
 * @file Home.tsx
 * @author Angelo Nicolson
 * @brief Homepage for educational resources platform
 * @description Main landing page showcasing available educational resources including math worksheets, science experiments,
 * history lessons, and educational videos. Features quick access to different subject areas, platform statistics, and highlights
 * of the various resource types available to students and educators.
 */

import React from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useSiteData } from '../../../hooks/useSiteData';
import './Home.css';

export const Home: React.FC = () => {
  const navigation = useNavigation();
  const { siteData, loading } = useSiteData();

  return (
    <div className="home">
      <div className="home-header">
        <div className="welcome-section">
          <h1>Educational Resources Hub</h1>
          <p className="tagline">Free worksheets, videos, and lessons for students and educators</p>
        </div>

        <div className="platform-stats">
          <div className="stat-card">
            <div className="stat-number">{loading ? '...' : siteData.totalResources}</div>
            <div className="stat-label">Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{loading ? '...' : siteData.totalTutors}</div>
            <div className="stat-label">Tutors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{loading ? '...' : siteData.totalUsers}</div>
            <div className="stat-label">Users</div>
          </div>
        </div>
      </div>

      <div className="home-main">
        <div className="subjects-section">
          <div className="section-header">
            <h2>📚 Browse Subjects</h2>
            <p>Choose between core academic subjects and faith-integrated electives</p>
          </div>

          <div className="subjects-grid category-grid">
            <div className="subject-card category-card" onClick={() => navigation.navigate({ view: 'core-subjects' })}>
              <div className="subject-icon">📐</div>
              <h3>Core Subjects</h3>
              <p>Math, Science & History - Essential academic foundations</p>
            </div>

            <div className="subject-card category-card" onClick={() => navigation.navigate({ view: 'electives' })}>
              <div className="subject-icon">📖</div>
              <h3>Electives</h3>
              <p>Biblical Studies, Biblical History & Science & the Bible</p>
            </div>
          </div>
        </div>

        <div className="subjects-section">
          <div className="section-header">
            <h2>👨‍🏫 Learning Support</h2>
            <p>Get personalized help from expert educators</p>
          </div>

          <div className="subjects-grid">
            <div className="subject-card tutor-card" onClick={() => navigation.navigate({ view: 'tutors', tutorType: 'all', tutorView: 'hub' })}>
              <div className="subject-icon">👨‍🏫</div>
              <h3>Find a Tutor</h3>
              <p>Connect with Expert Educators</p>
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