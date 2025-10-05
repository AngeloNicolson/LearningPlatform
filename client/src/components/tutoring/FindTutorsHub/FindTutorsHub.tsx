import React, { useState, useEffect } from 'react';
import { UnifiedTutorCard } from '../UnifiedTutorCard/UnifiedTutorCard';
import './FindTutorsHub.css';

interface Tutor {
  id: number;
  display_name: string;
  bio: string;
  subjects: {
    math_topics?: string[];
    science_subjects?: string[];
  };
  grades: string[];
  hourly_rate: string;
  rating: number;
  total_sessions: number;
  avatar?: string;
}

interface FindTutorsHubProps {
  onTutorSelect: (tutorId: string) => void;
  onNavigateToMath: () => void;
  onNavigateToScience: () => void;
}

export const FindTutorsHub: React.FC<FindTutorsHubProps> = ({
  onTutorSelect,
  onNavigateToMath,
  onNavigateToScience
}) => {
  const [activeView, setActiveView] = useState<'hub' | 'all' | 'filtered'>('hub');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'math' | 'science'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeView === 'all' || activeView === 'filtered') {
      fetchTutors();
    }
  }, [activeView, filter]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors`;
      
      // Add filter parameters if needed
      if (filter === 'math') {
        url += '?subject_type=math';
      } else if (filter === 'science') {
        url += '?subject_type=science';
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tutors: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Additional client-side filtering based on selected filter
      let filteredData = data;
      if (filter === 'math') {
        filteredData = data.filter((t: Tutor) => 
          t.subjects && t.subjects.math_topics && t.subjects.math_topics.length > 0
        );
      } else if (filter === 'science') {
        filteredData = data.filter((t: Tutor) => 
          t.subjects && t.subjects.science_subjects && t.subjects.science_subjects.length > 0
        );
      }
      
      setTutors(filteredData);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tutor.display_name.toLowerCase().includes(search) ||
      tutor.bio.toLowerCase().includes(search) ||
      (tutor.subjects.math_topics && tutor.subjects.math_topics.some(t => t.toLowerCase().includes(search))) ||
      (tutor.subjects.science_subjects && tutor.subjects.science_subjects.some(t => t.toLowerCase().includes(search)))
    );
  });

  const getTutorStats = () => {
    const mathTutors = tutors.filter(t => 
      t.subjects && t.subjects.math_topics && t.subjects.math_topics.length > 0
    ).length;
    const scienceTutors = tutors.filter(t => 
      t.subjects && t.subjects.science_subjects && t.subjects.science_subjects.length > 0
    ).length;
    
    return { total: tutors.length, math: mathTutors, science: scienceTutors };
  };

  if (activeView === 'hub') {
    return (
      <div className="find-tutors-hub">
        <div className="hub-header">
          <h1>Find the Perfect Tutor</h1>
          <p>Choose how you want to browse our expert tutors</p>
        </div>

        <div className="tutor-categories">
          <div className="category-card all" onClick={() => setActiveView('all')}>
            <div className="category-icon">👥</div>
            <h2>All Tutors</h2>
            <p>Browse our complete list of verified tutors across all subjects</p>
            <div className="category-stats">
              <span className="stat">50+ Active Tutors</span>
              <span className="stat">All Subjects</span>
              <span className="stat">K-12 & College</span>
            </div>
            <button className="category-btn">Browse All Tutors →</button>
          </div>

          <div className="category-card math" onClick={onNavigateToMath}>
            <div className="category-icon">📐</div>
            <h2>Math Tutors</h2>
            <p>Find specialized math tutors by grade level and topic</p>
            <div className="category-stats">
              <span className="stat">25+ Math Experts</span>
              <span className="stat">Elementary to Calculus</span>
              <span className="stat">AP & SAT Prep</span>
            </div>
            <button className="category-btn math-btn">Find Math Tutors →</button>
          </div>

          <div className="category-card science" onClick={onNavigateToScience}>
            <div className="category-icon">🔬</div>
            <h2>Science Tutors</h2>
            <p>Connect with science specialists in Physics, Chemistry, Biology & more</p>
            <div className="category-stats">
              <span className="stat">15+ Science Experts</span>
              <span className="stat">All Science Subjects</span>
              <span className="stat">Lab & Theory Support</span>
            </div>
            <button className="category-btn science-btn">Find Science Tutors →</button>
          </div>
        </div>

        <div className="hub-features">
          <h3>Why Choose Our Tutoring Platform?</h3>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <h4>Verified Experts</h4>
              <p>All tutors are thoroughly vetted and background checked</p>
            </div>
            <div className="feature">
              <span className="feature-icon">⭐</span>
              <h4>Top Rated</h4>
              <p>Average rating of 4.8+ stars from thousands of sessions</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h4>Perfect Match</h4>
              <p>Find tutors specialized in exactly what you need</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <h4>Fair Pricing</h4>
              <p>Competitive rates with group session discounts</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All tutors view
  return (
    <div className="find-tutors-all">
      <div className="all-header">
        <button className="back-button" onClick={() => setActiveView('hub')}>
          ← Back to Categories
        </button>
        <h1>
          {filter === 'all' ? 'All Tutors' : filter === 'math' ? 'Math Tutors' : 'Science Tutors'}
        </h1>
      </div>

      <div className="tutors-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All Subjects
          </button>
          <button 
            className={filter === 'math' ? 'filter-btn active math' : 'filter-btn'}
            onClick={() => setFilter('math')}
          >
            Math Only
          </button>
          <button 
            className={filter === 'science' ? 'filter-btn active science' : 'filter-btn'}
            onClick={() => setFilter('science')}
          >
            Science Only
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="tutors-stats">
        {(() => {
          const stats = getTutorStats();
          return (
            <>
              <span className="stat-item">
                Showing {filteredTutors.length} of {stats.total} tutors
              </span>
              {filter === 'all' && (
                <>
                  <span className="stat-divider">•</span>
                  <span className="stat-item">{stats.math} Math</span>
                  <span className="stat-divider">•</span>
                  <span className="stat-item">{stats.science} Science</span>
                </>
              )}
            </>
          );
        })()}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tutors...</p>
        </div>
      ) : (
        <div className="tutors-grid">
          {filteredTutors.length > 0 ? (
            filteredTutors.map(tutor => (
              <UnifiedTutorCard
                key={tutor.id}
                id={tutor.id}
                displayName={tutor.display_name}
                bio={tutor.bio}
                subjects={tutor.subjects}
                grades={tutor.grades}
                hourlyRate={tutor.hourly_rate}
                rating={tutor.rating}
                totalSessions={tutor.total_sessions}
                avatar={tutor.avatar}
                onSelect={onTutorSelect}
                variant="full"
              />
            ))
          ) : (
            <div className="no-results">
              <p>No tutors found matching your criteria.</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>Clear Search</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};