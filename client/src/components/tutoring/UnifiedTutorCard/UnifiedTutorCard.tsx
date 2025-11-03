/**
 * @file UnifiedTutorCard.tsx
 * @author Angelo Nicolson
 * @brief Tutor profile card component
 * @description Displays tutor information in card format including avatar, name, subjects, rating, price, experience, and booking button. Reusable across tutor discovery interfaces.
 */

import React from 'react';
import './UnifiedTutorCard.css';

interface TutorSubjects {
  math_topics?: string[];
  science_subjects?: string[];
}

interface UnifiedTutorCardProps {
  id: number;
  displayName: string;
  bio: string;
  subjects: TutorSubjects | string[];
  grades: string[];
  hourlyRate: string | number;
  rating: number | string;
  totalSessions: number;
  avatar?: string;
  onSelect: (tutorId: string) => void;
  variant?: 'compact' | 'full' | 'list';
}

export const UnifiedTutorCard: React.FC<UnifiedTutorCardProps> = ({
  id,
  displayName,
  bio,
  subjects,
  grades,
  hourlyRate,
  rating,
  totalSessions,
  avatar,
  onSelect,
  variant = 'full'
}) => {
  // Ensure rating is a number
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  // Parse subjects based on structure
  const getSubjectList = (): string[] => {
    if (Array.isArray(subjects)) {
      return subjects;
    }
    const allSubjects = [
      ...(subjects.math_topics || []),
      ...(subjects.science_subjects || [])
    ];
    return allSubjects;
  };

  const subjectList = getSubjectList();
  const primarySubjects = subjectList.slice(0, 3);
  const hasMoreSubjects = subjectList.length > 3;

  // Determine subject type for styling
  const subjectType = (() => {
    if (!Array.isArray(subjects)) {
      if (subjects.science_subjects && subjects.science_subjects.length > 0) return 'science';
      if (subjects.math_topics && subjects.math_topics.length > 0) return 'math';
    }
    return 'general';
  })();

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

  const renderAvatar = () => {
    if (avatar && avatar.startsWith('http')) {
      return <img src={avatar} alt={displayName} className="tutor-avatar-img" />;
    }
    
    const initials = avatar || displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return <div className="tutor-avatar-initials">{initials}</div>;
  };

  const formatGrades = () => {
    const gradeMap: Record<string, string> = {
      'elementary': 'Elementary',
      'middle_school': 'Middle School',
      'high_school': 'High School',
      'college': 'College'
    };
    return grades.map(g => gradeMap[g] || g).join(' • ');
  };

  const formatPrice = () => {
    const price = typeof hourlyRate === 'string' ? hourlyRate : `${hourlyRate}`;
    return price.includes('$') ? price : `$${price}/hr`;
  };

  if (variant === 'compact') {
    return (
      <div className={`unified-tutor-card compact ${subjectType}`} onClick={() => onSelect(id.toString())}>
        <div className="tutor-header">
          <div className="tutor-avatar">{renderAvatar()}</div>
          <div className="tutor-info">
            <h4>{displayName}</h4>
            <div className="tutor-rating">
              {renderStars(numericRating)}
              <span className="rating-value">{numericRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="tutor-subjects">
          {primarySubjects.join(' • ')}
        </div>
        <div className="tutor-footer">
          <span className="tutor-price">{formatPrice()}</span>
          <button className="view-btn">View →</button>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`unified-tutor-card list ${subjectType}`} onClick={() => onSelect(id.toString())}>
        <div className="tutor-avatar">{renderAvatar()}</div>
        <div className="tutor-content">
          <div className="tutor-header">
            <h3>{displayName}</h3>
            <span className="tutor-price">{formatPrice()}</span>
          </div>
          <div className="tutor-rating">
            {renderStars(numericRating)}
            <span className="rating-value">{numericRating.toFixed(1)}</span>
            <span className="sessions">({totalSessions} sessions)</span>
          </div>
          <p className="tutor-bio">{bio.substring(0, 150)}...</p>
          <div className="tutor-meta">
            <span className="grades">{formatGrades()}</span>
            <span className="subjects">
              {primarySubjects.join(', ')}
              {hasMoreSubjects && ` +${subjectList.length - 3} more`}
            </span>
          </div>
        </div>
        <button className="book-btn">View Profile</button>
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`unified-tutor-card full ${subjectType}`}>
      <div className="card-header">
        <div className="tutor-avatar">{renderAvatar()}</div>
        <div className="tutor-basic">
          <h3>{displayName}</h3>
          <div className="tutor-rating">
            {renderStars(numericRating)}
            <span className="rating-value">{numericRating.toFixed(1)}</span>
            <span className="sessions">• {totalSessions} sessions</span>
          </div>
        </div>
        <div className="tutor-price-badge">{formatPrice()}</div>
      </div>

      <div className="card-body">
        <p className="tutor-bio">{bio}</p>
        
        <div className="subjects-section">
          <h4>Specializes in:</h4>
          <div className="subject-tags">
            {subjectList.map((subject, index) => (
              <span key={index} className="subject-tag">{subject}</span>
            ))}
          </div>
        </div>

        <div className="grades-section">
          <span className="label">Teaches:</span>
          <span className="value">{formatGrades()}</span>
        </div>
      </div>

      <div className="card-footer">
        <button 
          className="book-session-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id.toString());
          }}
        >
          View Profile & Book Session
        </button>
      </div>
    </div>
  );
};
