import React from 'react';
import './Leaderboard.css';

interface DebaterProfile {
  id: number;
  name: string;
  rank: number;
  score: number;
  wins: number;
  totalDebates: number;
  specialization: string;
  recentActivity: string;
  avatar: string;
}

interface LeaderboardProps {
  onViewProfile?: (debater: DebaterProfile) => void;
  onChallengeDebater?: (debater: DebaterProfile) => void;
}

// Sample data - would come from backend
const sampleDebaters: DebaterProfile[] = [
  {
    id: 1,
    name: "Alex Chen",
    rank: 1,
    score: 2847,
    wins: 23,
    totalDebates: 28,
    specialization: "Technology",
    recentActivity: "2 hours ago",
    avatar: "AC"
  },
  {
    id: 2,
    name: "Maria Rodriguez", 
    rank: 2,
    score: 2756,
    wins: 19,
    totalDebates: 24,
    specialization: "Healthcare",
    recentActivity: "1 day ago",
    avatar: "MR"
  },
  {
    id: 3,
    name: "James Wilson",
    rank: 3,
    score: 2689,
    wins: 17,
    totalDebates: 22,
    specialization: "Politics",
    recentActivity: "3 hours ago",
    avatar: "JW"
  },
  {
    id: 4,
    name: "Sarah Kim",
    rank: 4,
    score: 2634,
    wins: 15,
    totalDebates: 19,
    specialization: "Environmental",
    recentActivity: "5 hours ago",
    avatar: "SK"
  },
  {
    id: 5,
    name: "David Brown",
    rank: 5,
    score: 2578,
    wins: 14,
    totalDebates: 18,
    specialization: "Economics",
    recentActivity: "1 day ago",
    avatar: "DB"
  }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  onViewProfile, 
  onChallengeDebater 
}) => {
  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge gold';
    if (rank === 2) return 'rank-badge silver';
    if (rank === 3) return 'rank-badge bronze';
    return 'rank-badge';
  };

  const getCategoryColor = (specialization: string) => {
    const colorMap: { [key: string]: string } = {
      'Technology': '#7c3aed',
      'Healthcare': '#0d9488',
      'Politics': '#dc2626',
      'Environmental': '#059669',
      'Economics': '#ea580c',
      'Social': '#be123c'
    };
    return colorMap[specialization] || '#3b82f6';
  };

  const getWinRate = (wins: number, total: number) => {
    return Math.round((wins / total) * 100);
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Top Debaters</h2>
        <p>Leading voices in critical thinking and argumentation</p>
      </div>

      <div className="leaderboard-list">
        {sampleDebaters.map((debater) => (
          <div key={debater.id} className="debater-card">
            <div className="debater-rank">
              <div className={getRankBadgeClass(debater.rank)}>
                #{debater.rank}
              </div>
            </div>

            <div className="debater-info">
              <div className="debater-avatar" style={{ backgroundColor: getCategoryColor(debater.specialization) }}>
                {debater.avatar}
              </div>
              
              <div className="debater-details">
                <div className="debater-name-section">
                  <h3 className="debater-name">{debater.name}</h3>
                  <span 
                    className="debater-specialization"
                    style={{ color: getCategoryColor(debater.specialization) }}
                  >
                    {debater.specialization}
                  </span>
                </div>
                
                <div className="debater-stats">
                  <div className="stat">
                    <span className="stat-value">{debater.score}</span>
                    <span className="stat-label">Score</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{getWinRate(debater.wins, debater.totalDebates)}%</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{debater.totalDebates}</span>
                    <span className="stat-label">Debates</span>
                  </div>
                </div>
                
                <div className="debater-activity">
                  <span className="activity-text">Active {debater.recentActivity}</span>
                </div>
              </div>
            </div>

            <div className="debater-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => onViewProfile?.(debater)}
              >
                View Profile
              </button>
              <button 
                className="action-btn challenge-btn"
                onClick={() => onChallengeDebater?.(debater)}
              >
                Challenge
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="leaderboard-footer">
        <button className="view-all-btn">
          View Full Rankings
        </button>
        <p className="rankings-note">
          Rankings updated every hour based on debate performance, argument quality, and community engagement.
        </p>
      </div>
    </div>
  );
};