import React, { useState, useEffect } from 'react';
import '../../tutoring/TutorCards/TutorCards.css'; // Reuse the same styles

interface ScienceTutor {
  id: number;
  display_name: string;
  avatar?: string;
  grades: string[];
  subjects: {
    math_topics: string[];
    science_subjects: string[];
  };
  rating: number;
  total_sessions: number;
  hourly_rate: string;
  bio: string;
  is_active?: boolean;
  first_name: string;
  last_name: string;
}

interface ScienceTutorCardsProps {
  subject: string;
  onTutorSelect: (tutorId: string) => void;
  onBackToSubjects: () => void;
}

export const ScienceTutorCards: React.FC<ScienceTutorCardsProps> = ({ 
  subject, 
  onTutorSelect, 
  onBackToSubjects 
}) => {
  const [tutors, setTutors] = useState<ScienceTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScienceTutors();
  }, [subject]);

  const fetchScienceTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map subject ID to proper subject name for API
      const subjectMap: Record<string, string> = {
        'physics': 'Physics',
        'chemistry': 'Chemistry',
        'biology': 'Biology',
        'earth-science': 'Earth Science'
      };
      
      const subjectName = subjectMap[subject] || subject;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/by-subject/${encodeURIComponent(subjectName)}`,
        {
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch science tutors');
      }
      
      const data = await response.json();
      setTutors(data);
    } catch (err) {
      console.error('Error fetching science tutors:', err);
      setError('Failed to load tutors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectDisplayName = () => {
    const names: Record<string, string> = {
      'physics': 'Physics',
      'chemistry': 'Chemistry',
      'biology': 'Biology',
      'earth-science': 'Earth Science'
    };
    return names[subject] || subject;
  };

  const getSubjectIcon = () => {
    const icons: Record<string, string> = {
      'physics': '⚛️',
      'chemistry': '🧪',
      'biology': '🧬',
      'earth-science': '🌍'
    };
    return icons[subject] || '🔬';
  };

  const getAvailabilityStatus = (tutor: ScienceTutor) => {
    // Simulate availability status
    const statuses = ['available', 'busy', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const renderAvatar = (tutor: ScienceTutor) => {
    if (tutor.avatar) {
      if (tutor.avatar.startsWith('http')) {
        return <img src={tutor.avatar} alt={tutor.display_name} className="tutor-avatar-img" />;
      }
      return <div className="tutor-avatar-initials">{tutor.avatar}</div>;
    }
    const initials = tutor.display_name.split(' ').map(n => n[0]).join('').toUpperCase();
    return <div className="tutor-avatar-initials">{initials}</div>;
  };

  const renderSpecializations = (tutor: ScienceTutor) => {
    const specs = tutor.subjects.science_subjects || [];
    if (specs.length === 0) return null;
    
    return (
      <div className="tutor-specializations">
        <strong>Specializations:</strong>
        <div className="spec-tags">
          {specs.slice(0, 3).map((spec, index) => (
            <span key={index} className="spec-tag">{spec}</span>
          ))}
          {specs.length > 3 && <span className="spec-tag">+{specs.length - 3} more</span>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tutor-cards-container">
        <div className="loading-message">Loading {getSubjectDisplayName()} tutors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tutor-cards-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchScienceTutors} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-cards-container">
      <div className="tutor-cards-header">
        <button onClick={onBackToSubjects} className="back-button">
          ← Back to Science Subjects
        </button>
        <h2>
          <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{getSubjectIcon()}</span>
          {getSubjectDisplayName()} Tutors
        </h2>
        <p className="tutor-count">{tutors.length} specialized tutor{tutors.length !== 1 ? 's' : ''} available</p>
      </div>

      {tutors.length === 0 ? (
        <div className="no-tutors-message">
          <p>No tutors available for {getSubjectDisplayName()} at this time.</p>
          <button onClick={onBackToSubjects} className="back-btn">
            Choose Another Subject
          </button>
        </div>
      ) : (
        <div className="tutor-grid">
          {tutors.map((tutor) => {
            const status = getAvailabilityStatus(tutor);
            return (
              <div key={tutor.id} className="tutor-card" onClick={() => onTutorSelect(tutor.id.toString())}>
                <div className={`availability-badge ${status}`}>
                  {status === 'available' ? '🟢' : status === 'busy' ? '🟡' : '⚫'} {status}
                </div>
                
                <div className="tutor-header">
                  <div className="tutor-avatar">
                    {renderAvatar(tutor)}
                  </div>
                  <div className="tutor-basic-info">
                    <h3>{tutor.display_name}</h3>
                    <div className="rating-container">
                      <span className="rating">⭐ {tutor.rating.toFixed(1)}</span>
                      <span className="sessions">• {tutor.total_sessions} sessions</span>
                    </div>
                  </div>
                </div>
                
                <div className="tutor-body">
                  <p className="tutor-description">{tutor.bio}</p>
                  {renderSpecializations(tutor)}
                  
                  <div className="tutor-meta">
                    <div className="meta-item">
                      <span className="meta-label">Levels:</span>
                      <span className="meta-value">
                        {tutor.grades.map(g => {
                          const gradeMap: Record<string, string> = {
                            'middle_school': 'Middle',
                            'high_school': 'High School',
                            'college': 'College'
                          };
                          return gradeMap[g] || g;
                        }).join(', ')}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rate:</span>
                      <span className="meta-value price">${tutor.hourly_rate}/hr</span>
                    </div>
                  </div>
                </div>
                
                <button className="book-now-btn">View Profile & Book</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};