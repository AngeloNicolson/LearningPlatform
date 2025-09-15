import React from 'react';
import { Leaderboard } from './Leaderboard';
import './Home.css';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="home-header">
        <div className="welcome-section">
          <h1>DebateRank Leaderboards</h1>
          <p className="tagline">Top performers in critical thinking and argumentation</p>
        </div>
        
        <div className="platform-stats">
          <div className="stat-card">
            <div className="stat-number">2,847</div>
            <div className="stat-label">Active Debaters</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">15,234</div>
            <div className="stat-label">Debates Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">847</div>
            <div className="stat-label">Active Tournaments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">95.2%</div>
            <div className="stat-label">User Satisfaction</div>
          </div>
        </div>
      </div>

      <div className="home-main">
        <div className="leaderboard-section">
          <Leaderboard />
        </div>

        <div className="featured-section">
          <div className="section-header">
            <h2>🎯 Featured Debates</h2>
            <p>Trending topics and high-stakes discussions</p>
          </div>

          <div className="featured-debates">
            <div className="debate-card featured">
              <div className="debate-header">
                <h3>Climate Change Action vs. Economic Growth</h3>
                <div className="debate-meta">
                  <span className="complexity">Complexity: 8/10</span>
                  <span className="viewers">👁 1,247 watching</span>
                </div>
              </div>
              <div className="debaters-faceoff">
                <div className="debater-profile pro">
                  <div className="profile-image-container">
                    <img 
                      src="https://via.placeholder.com/120x120/660B05/ffffff?text=SC" 
                      alt="Dr. Sarah Chen"
                      className="profile-image"
                    />
                  </div>
                  <div className="debater-info">
                    <span className="position">PRO</span>
                    <span className="name">Dr. Sarah Chen</span>
                    <span className="rating">⭐ 2,847</span>
                  </div>
                </div>
                <div className="versus-divider">
                  <div className="slash"></div>
                  <span className="vs-text">VS</span>
                </div>
                <div className="debater-profile con">
                  <div className="profile-image-container">
                    <img 
                      src="https://via.placeholder.com/120x120/8b7355/ffffff?text=MR" 
                      alt="Prof. Michael Rodriguez"
                      className="profile-image"
                    />
                  </div>
                  <div className="debater-info">
                    <span className="position">CON</span>
                    <span className="name">Prof. Michael Rodriguez</span>
                    <span className="rating">⭐ 2,823</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-primary">Watch Live</button>
                <button className="btn btn-secondary">View Analysis</button>
              </div>
            </div>

            <div className="debate-card">
              <div className="debate-header">
                <h3>Universal Basic Income Implementation</h3>
                <div className="debate-meta">
                  <span className="complexity">Complexity: 7/10</span>
                  <span className="status">Starting Soon</span>
                </div>
              </div>
              <div className="debaters-faceoff">
                <div className="debater-profile pro">
                  <div className="profile-image-container">
                    <div className="default-avatar">
                      <span className="avatar-initial">EW</span>
                    </div>
                  </div>
                  <div className="debater-info">
                    <span className="position">PRO</span>
                    <span className="name">Emma Watson</span>
                    <span className="rating">⭐ 2,756</span>
                  </div>
                </div>
                <div className="versus-divider">
                  <div className="slash"></div>
                  <span className="vs-text">VS</span>
                </div>
                <div className="debater-profile con">
                  <div className="profile-image-container">
                    <div className="default-avatar">
                      <span className="avatar-initial">JL</span>
                    </div>
                  </div>
                  <div className="debater-info">
                    <span className="position">CON</span>
                    <span className="name">James Liu</span>
                    <span className="rating">⭐ 2,634</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-secondary">Set Reminder</button>
                <button className="btn btn-secondary">View Details</button>
              </div>
            </div>

            <div className="debate-card">
              <div className="debate-header">
                <h3>AI Ethics in Healthcare Decision Making</h3>
                <div className="debate-meta">
                  <span className="complexity">Complexity: 9/10</span>
                  <span className="status">Recently Concluded</span>
                </div>
              </div>
              <div className="debaters-faceoff">
                <div className="debater-profile pro winner">
                  <div className="profile-image-container">
                    <img 
                      src="https://via.placeholder.com/120x120/2d7d32/ffffff?text=AK" 
                      alt="Dr. Alex Kumar"
                      className="profile-image"
                    />
                    <div className="winner-crown">👑</div>
                  </div>
                  <div className="debater-info">
                    <span className="position">PRO</span>
                    <span className="name">Dr. Alex Kumar</span>
                    <span className="rating">⭐ 2,891</span>
                    <span className="winner-badge">WINNER</span>
                  </div>
                </div>
                <div className="versus-divider">
                  <div className="slash"></div>
                  <span className="vs-text">VS</span>
                </div>
                <div className="debater-profile con">
                  <div className="profile-image-container">
                    <div className="default-avatar">
                      <span className="avatar-initial">LP</span>
                    </div>
                  </div>
                  <div className="debater-info">
                    <span className="position">CON</span>
                    <span className="name">Dr. Lisa Park</span>
                    <span className="rating">⭐ 2,778</span>
                  </div>
                </div>
              </div>
              <div className="debate-actions">
                <button className="btn btn-secondary">View Replay</button>
                <button className="btn btn-secondary">Read Summary</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};