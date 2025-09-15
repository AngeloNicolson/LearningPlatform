import React from 'react';
import './TutorCards.css';

interface Tutor {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: string;
  education: string;
  availability: 'available' | 'busy' | 'offline';
  bio: string;
  languages: string[];
}

interface TutorCardsProps {
  gradeLevel: string;
  onTutorSelect: (tutorId: string) => void;
  onBackToGrades: () => void;
}

const tutorsByGrade: Record<string, Tutor[]> = {
  elementary: [
    {
      id: 'sarah-elementary',
      name: 'Sarah Johnson',
      photo: '👩‍🏫',
      specialties: ['Basic Math', 'Addition/Subtraction', 'Fractions', 'Word Problems'],
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 25,
      experience: '8 years teaching experience',
      education: 'M.Ed Elementary Education',
      availability: 'available',
      bio: 'Passionate about making math fun and accessible for young learners',
      languages: ['English', 'Spanish']
    },
    {
      id: 'mike-elementary',
      name: 'Mike Chen',
      photo: '👨‍🎓',
      specialties: ['Mental Math', 'Problem Solving', 'Geometry Basics', 'Times Tables'],
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 22,
      experience: '5 years tutoring experience',
      education: 'B.S. Mathematics',
      availability: 'available',
      bio: 'Specializes in building strong foundational math skills',
      languages: ['English', 'Mandarin']
    },
    {
      id: 'emma-elementary',
      name: 'Emma Rodriguez',
      photo: '👩‍💻',
      specialties: ['Visual Learning', 'Math Games', 'Number Sense', 'Shapes & Patterns'],
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: 28,
      experience: '10 years teaching experience',
      education: 'M.A. Education Psychology',
      availability: 'busy',
      bio: 'Uses creative methods to make math engaging for all learning styles',
      languages: ['English', 'Spanish']
    }
  ],
  middle: [
    {
      id: 'david-middle',
      name: 'David Thompson',
      photo: '👨‍🏫',
      specialties: ['Pre-Algebra', 'Ratios & Proportions', 'Integers', 'Basic Statistics'],
      rating: 4.8,
      reviewCount: 203,
      hourlyRate: 32,
      experience: '12 years teaching experience',
      education: 'M.S. Mathematics Education',
      availability: 'available',
      bio: 'Expert in transitioning students from arithmetic to algebraic thinking',
      languages: ['English']
    },
    {
      id: 'lisa-middle',
      name: 'Lisa Park',
      photo: '👩‍🔬',
      specialties: ['Algebra Foundations', 'Percentages', 'Equations', 'Math Reasoning'],
      rating: 4.9,
      reviewCount: 174,
      hourlyRate: 35,
      experience: '15 years tutoring experience',
      education: 'Ph.D. Mathematics',
      availability: 'available',
      bio: 'Builds confidence in middle school students preparing for high school math',
      languages: ['English', 'Korean']
    }
  ],
  high: [
    {
      id: 'alex-high',
      name: 'Alex Martinez',
      photo: '👨‍💼',
      specialties: ['Algebra I & II', 'Geometry', 'Test Prep', 'SAT Math'],
      rating: 4.9,
      reviewCount: 289,
      hourlyRate: 45,
      experience: '18 years tutoring experience',
      education: 'M.S. Applied Mathematics',
      availability: 'available',
      bio: 'Specializes in high school algebra and standardized test preparation',
      languages: ['English', 'Spanish']
    },
    {
      id: 'rachel-high',
      name: 'Rachel Kim',
      photo: '👩‍🎓',
      specialties: ['Trigonometry', 'Pre-Calculus', 'Advanced Functions', 'AP Math'],
      rating: 4.8,
      reviewCount: 215,
      hourlyRate: 50,
      experience: '20 years teaching experience',
      education: 'Ph.D. Mathematics',
      availability: 'available',
      bio: 'Former AP Calculus teacher with expertise in advanced high school mathematics',
      languages: ['English', 'Korean']
    }
  ],
  college: [
    {
      id: 'james-college',
      name: 'Dr. James Wilson',
      photo: '👨‍🔬',
      specialties: ['Calculus I-III', 'Linear Algebra', 'Differential Equations', 'Real Analysis'],
      rating: 4.9,
      reviewCount: 167,
      hourlyRate: 65,
      experience: '25+ years university teaching',
      education: 'Ph.D. Pure Mathematics',
      availability: 'available',
      bio: 'University professor specializing in advanced mathematical concepts',
      languages: ['English']
    },
    {
      id: 'sophia-college',
      name: 'Dr. Sophia Zhang',
      photo: '👩‍🏫',
      specialties: ['Statistics', 'Probability', 'Data Analysis', 'Mathematical Modeling'],
      rating: 4.8,
      reviewCount: 134,
      hourlyRate: 60,
      experience: '15 years university teaching',
      education: 'Ph.D. Statistics',
      availability: 'available',
      bio: 'Statistics professor with industry experience in data science',
      languages: ['English', 'Mandarin']
    }
  ]
};

const gradeLabels: Record<string, string> = {
  elementary: 'Elementary Math (K-5)',
  middle: 'Middle School Math (6-8)',
  high: 'High School Math (9-12)',
  college: 'College Math'
};

export const TutorCards: React.FC<TutorCardsProps> = ({ gradeLevel, onTutorSelect, onBackToGrades }) => {
  const tutors = tutorsByGrade[gradeLevel] || [];

  const getAvailabilityStatus = (availability: string) => {
    switch (availability) {
      case 'available':
        return { text: 'Available now', color: 'text-green-600', dot: 'bg-green-500' };
      case 'busy':
        return { text: 'Busy', color: 'text-yellow-600', dot: 'bg-yellow-500' };
      case 'offline':
        return { text: 'Offline', color: 'text-gray-600', dot: 'bg-gray-400' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', dot: 'bg-gray-400' };
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="tutor-cards-container">
      <div className="tutor-cards-header">
        <button className="back-button" onClick={onBackToGrades}>
          ← Back to Grade Levels
        </button>
        <h2>{gradeLabels[gradeLevel]} Tutors</h2>
        <p>Choose from our qualified math tutors</p>
      </div>

      <div className="tutors-grid">
        {tutors.map((tutor) => {
          const availability = getAvailabilityStatus(tutor.availability);
          
          return (
            <div key={tutor.id} className="tutor-card" onClick={() => onTutorSelect(tutor.id)}>
              <div className="tutor-card-header">
                <div className="tutor-photo">{tutor.photo}</div>
                <div className="availability-indicator">
                  <span className={`availability-dot ${availability.dot}`}></span>
                  <span className={`availability-text ${availability.color}`}>
                    {availability.text}
                  </span>
                </div>
              </div>

              <div className="tutor-info">
                <h3 className="tutor-name">{tutor.name}</h3>
                <p className="tutor-education">{tutor.education}</p>
                <p className="tutor-experience">{tutor.experience}</p>

                <div className="tutor-rating">
                  <div className="stars">
                    {renderStars(tutor.rating)}
                  </div>
                  <span className="rating-text">
                    {tutor.rating} ({tutor.reviewCount} reviews)
                  </span>
                </div>

                <div className="tutor-specialties">
                  <span className="specialties-label">Specialties:</span>
                  <div className="specialty-tags">
                    {tutor.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                    {tutor.specialties.length > 3 && (
                      <span className="specialty-tag more">+{tutor.specialties.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="tutor-languages">
                  <span className="languages-label">Languages:</span>
                  <span className="languages-text">{tutor.languages.join(', ')}</span>
                </div>
              </div>

              <div className="tutor-card-footer">
                <div className="pricing">
                  <span className="price">${tutor.hourlyRate}</span>
                  <span className="price-unit">/hour</span>
                </div>
                <button className="view-profile-btn">
                  View Profile & Book
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};