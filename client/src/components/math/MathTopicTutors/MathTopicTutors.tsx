import { authFetch } from '../../../utils/authFetch';
import React, { useState, useEffect } from 'react';
import './MathTopicTutors.css';

interface Tutor {
  id: number;
  display_name: string;
  bio: string;
  subjects: {
    math_topics: string[];
    science_subjects: string[];
  };
  grades: string[];
  hourly_rate: string;
  rating: number;
  total_sessions: number;
  avatar?: string;
}

interface MathTopicTutorsProps {
  topicName: string;
  subtopicName?: string;
  onTutorSelect?: (tutorId: string) => void;
}

export const MathTopicTutors: React.FC<MathTopicTutorsProps> = ({ 
  topicName, 
  subtopicName,
  onTutorSelect 
}) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, [topicName]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await authFetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/tutors/by-topic/${encodeURIComponent(topicName)}?limit=${showAll ? 10 : 2}`,
        {
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }
      
      const data = await response.json();
      setTutors(data);
    } catch (error) {
      console.error('Error fetching topic tutors:', error);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="math-topic-tutors">
        <div className="loading-tutors">Loading tutors...</div>
      </div>
    );
  }

  if (tutors.length === 0) {
    return null; // Don't show section if no tutors available
  }

  return (
    <div className="math-topic-tutors">
      <div className="tutors-header">
        <h3>Available Tutors for {subtopicName || topicName}</h3>
        <span className="tutor-count">{tutors.length} tutor{tutors.length !== 1 ? 's' : ''} available</span>
      </div>
      
      <div className="topic-tutors-grid">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="topic-tutor-card">
            <div className="tutor-avatar">
              {tutor.avatar ? (
                <span className="avatar-initials">{tutor.avatar}</span>
              ) : (
                <span className="avatar-initials">
                  {tutor.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="tutor-info">
              <h4>{tutor.display_name}</h4>
              <div className="tutor-rating">
                {renderStars(typeof tutor.rating === 'string' ? parseFloat(tutor.rating) : tutor.rating)}
                <span className="rating-text">{(typeof tutor.rating === 'string' ? parseFloat(tutor.rating) : tutor.rating).toFixed(1)}</span>
                <span className="sessions">({tutor.total_sessions} sessions)</span>
              </div>
              
              <p className="tutor-bio">{tutor.bio.substring(0, 100)}...</p>
              
              <div className="tutor-details">
                <span className="tutor-price">${tutor.hourly_rate}/hr</span>
                <span className="tutor-subjects">
                  {tutor.subjects.math_topics.slice(0, 2).join(', ')}
                  {tutor.subjects.math_topics.length > 2 && '...'}
                </span>
              </div>
              
              <button 
                className="view-tutor-btn"
                onClick={() => onTutorSelect && onTutorSelect(tutor.id.toString())}
              >
                View Profile →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {!showAll && tutors.length === 2 && (
        <button 
          className="show-more-tutors"
          onClick={() => {
            setShowAll(true);
            fetchTutors();
          }}
        >
          Show More Tutors →
        </button>
      )}
    </div>
  );
};