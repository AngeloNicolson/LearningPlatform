import React, { useState, useEffect } from 'react';
import './TutorCards.css';

interface Tutor {
  id: number;
  display_name: string;
  avatar?: string;
  grades: string[];
  subjects: string[];
  rating: number;
  total_sessions: number;
  hourly_rate: string;
  bio: string;
  is_active?: boolean;
  first_name: string;
  last_name: string;
}

interface TutorCardsProps {
  gradeLevel: string;
  onTutorSelect: (tutorId: string) => void;
  onBackToGrades: () => void;
}

export const TutorCards: React.FC<TutorCardsProps> = ({ 
  gradeLevel, 
  onTutorSelect, 
  onBackToGrades 
}) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutors();
  }, [gradeLevel]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map grade level to database format (using underscore format)
      const gradeMap: Record<string, string> = {
        'elementary': 'elementary',
        'middle': 'middle_school',
        'high': 'high_school',
        'college': 'college'
      };
      
      const grade = gradeMap[gradeLevel] || gradeLevel;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors`,
        {
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }
      
      const data = await response.json();
      // Filter tutors by grade on client side for now
      const filteredTutors = data.filter((tutor: Tutor) => {
        const gradeMap: Record<string, string> = {
          'elementary': 'elementary',
          'middle': 'middle_school',
          'high': 'high_school',
          'college': 'college'
        };
        const targetGrade = gradeMap[gradeLevel] || gradeLevel;
        return tutor.grades && tutor.grades.includes(targetGrade);
      });
      setTutors(filteredTutors);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError('Failed to load tutors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeDisplayName = () => {
    const names: Record<string, string> = {
      'elementary': 'Elementary School',
      'middle': 'Middle School',
      'high': 'High School',
      'college': 'College/University'
    };
    return names[gradeLevel] || gradeLevel;
  };

  const getAvailabilityStatus = (tutor: Tutor) => {
    // You could implement real availability checking here
    const statuses = ['available', 'busy', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const renderAvatar = (tutor: Tutor) => {
    if (tutor.avatar) {
      // If avatar is a URL
      if (tutor.avatar.startsWith('http')) {
        return <img src={tutor.avatar} alt={tutor.display_name} className="tutor-avatar-img" />;
      }
      // If avatar is initials
      return <div className="tutor-avatar-initials">{tutor.avatar}</div>;
    }
    // Default to initials from display_name
    const initials = tutor.display_name.split(' ').map(n => n[0]).join('').toUpperCase();
    return <div className="tutor-avatar-initials">{initials}</div>;
  };

  if (loading) {
    return (
      <div className="tutor-cards-container">
        <div className="loading-message">Loading tutors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-cards-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchTutors} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-cards-container">
      <div className="tutor-cards-header">
        <button onClick={onBackToGrades} className="back-button">
          ← Back to Grade Selection
        </button>
        <h2>{getGradeDisplayName()} Tutors</h2>
        <p className="tutor-count">{tutors.length} tutors available</p>
      </div>

      {tutors.length === 0 ? (
        <div className="no-tutors-message">
          <p>No tutors available for this grade level.</p>
          <button onClick={onBackToGrades} className="back-btn">
            Choose Another Grade
          </button>
        </div>
      ) : (
        <div className="tutors-grid">
          {tutors.map(tutor => {
            const availability = getAvailabilityStatus(tutor);
            
            return (
              <div key={tutor.id} className="tutor-card">
                <div className={`availability-indicator ${availability}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">{availability}</span>
                </div>

                <div className="tutor-header">
                  <div className="tutor-avatar">
                    {renderAvatar(tutor)}
                  </div>
                  <div className="tutor-basic-info">
                    <h3>{tutor.display_name}</h3>
                    <div className="rating">
                      <span className="stars">{'⭐'.repeat(Math.floor(Number(tutor.rating)))}</span>
                      <span className="rating-number">{Number(tutor.rating).toFixed(1)}</span>
                      <span className="review-count">({tutor.total_sessions} sessions)</span>
                    </div>
                  </div>
                </div>

                <div className="tutor-details">
                  <div className="specialties">
                    <h4>Specialties:</h4>
                    <div className="specialty-tags">
                      {tutor.subjects.map((subject, index) => (
                        <span key={index} className="specialty-tag">{subject}</span>
                      ))}
                    </div>
                  </div>

                  <div className="tutor-info">
                    <p className="bio">{tutor.bio}</p>
                  </div>

                  <div className="tutor-meta">
                    <div className="hourly-rate">
                      <span className="rate-amount">${tutor.hourly_rate}</span>
                      <span className="rate-period">/hour</span>
                    </div>
                  </div>
                </div>

                <div className="tutor-actions">
                  <button 
                    className="view-profile-btn"
                    onClick={() => onTutorSelect(tutor.id.toString())}
                  >
                    View Profile
                  </button>
                  <button 
                    className="quick-book-btn"
                    onClick={() => onTutorSelect(tutor.id.toString())}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};