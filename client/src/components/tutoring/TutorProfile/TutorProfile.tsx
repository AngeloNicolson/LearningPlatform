import React, { useState, useEffect } from 'react';
import './TutorProfile.css';

interface TutorProfileProps {
  tutorId: string;
  onBackToTutors: () => void;
  onBookSession: (tutorId: string, sessionType: string) => void;
}

interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  subject: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

// Mock data - in real app, this would come from API
const tutorProfiles: Record<string, any> = {
  'sarah-elementary': {
    name: 'Sarah Johnson',
    photo: '👩‍🏫',
    title: 'Elementary Math Specialist',
    rating: 4.9,
    reviewCount: 127,
    totalHours: 850,
    responseTime: '< 1 hour',
    education: [
      'M.Ed Elementary Education - University of California, Berkeley',
      'B.A. Mathematics - UCLA'
    ],
    certifications: [
      'California Teaching Credential',
      'Elementary Mathematics Specialist Certificate',
      'Gifted and Talented Education Certification'
    ],
    experience: '8+ years of elementary math teaching and tutoring experience',
    bio: "Hi! I'm Sarah, and I absolutely love helping young students discover the joy of mathematics. With over 8 years of experience teaching elementary math, I've developed creative and engaging methods to make learning fun and effective. I believe every child can succeed in math with the right approach and encouragement.",
    specialties: ['Basic Arithmetic', 'Fractions & Decimals', 'Word Problems', 'Mental Math', 'Math Confidence Building'],
    languages: ['English', 'Spanish'],
    availability: 'available',
    sessionTypes: [
      { id: '30min', name: '30-Minute Session', duration: '30 minutes', price: 25, description: 'Perfect for quick homework help or concept review' },
      { id: '60min', name: '1-Hour Session', duration: '1 hour', price: 45, description: 'Standard tutoring session with comprehensive learning' },
      { id: '90min', name: '90-Minute Session', duration: '1.5 hours', price: 65, description: 'Extended session for deeper concept exploration' }
    ]
  },
  'alex-high': {
    name: 'Alex Martinez',
    photo: '👨‍💼',
    title: 'High School Algebra & Test Prep Expert',
    rating: 4.9,
    reviewCount: 289,
    totalHours: 1450,
    responseTime: '< 30 minutes',
    education: [
      'M.S. Applied Mathematics - Stanford University',
      'B.S. Mathematics Education - UC San Diego'
    ],
    certifications: [
      'SAT Math Subject Test Prep Certification',
      'AP Calculus Teaching Certificate',
      'High School Mathematics Teaching License'
    ],
    experience: '18+ years of high school math tutoring and test preparation',
    bio: "Hello! I'm Alex, a dedicated math tutor specializing in high school algebra and standardized test preparation. My passion is helping students not just understand math concepts, but truly master them with confidence. I've helped hundreds of students improve their SAT math scores and excel in their algebra courses.",
    specialties: ['Algebra I & II', 'Geometry', 'SAT/ACT Math Prep', 'Test-Taking Strategies', 'Mathematical Problem Solving'],
    languages: ['English', 'Spanish'],
    availability: 'available',
    sessionTypes: [
      { id: '60min', name: '1-Hour Session', duration: '1 hour', price: 45, description: 'Standard algebra tutoring session' },
      { id: '90min', name: '90-Minute Session', duration: '1.5 hours', price: 65, description: 'Extended session for complex topics' },
      { id: 'test-prep', name: 'Test Prep Package', duration: '2 hours', price: 85, description: 'Focused SAT/ACT math preparation' }
    ]
  }
  // Add more tutor profiles as needed
};

const mockReviews: Record<string, Review[]> = {
  'sarah-elementary': [
    {
      id: '1',
      studentName: 'Parent of Emma (Grade 3)',
      rating: 5,
      comment: 'Sarah is amazing! My daughter went from struggling with math to actually enjoying it. Her teaching methods are so creative and engaging.',
      date: '2 weeks ago',
      subject: 'Addition & Subtraction'
    },
    {
      id: '2',
      studentName: 'Parent of Marcus (Grade 5)',
      rating: 5,
      comment: 'Excellent tutor! Sarah helped Marcus understand fractions in a way that finally clicked. Very patient and encouraging.',
      date: '1 month ago',
      subject: 'Fractions'
    },
    {
      id: '3',
      studentName: 'Parent of Sofia (Grade 4)',
      rating: 4,
      comment: 'Great experience. Sofia looks forward to her sessions with Sarah every week. Math homework is no longer a battle!',
      date: '1 month ago',
      subject: 'Multiplication Tables'
    }
  ],
  'alex-high': [
    {
      id: '1',
      studentName: 'Parent of David (Grade 11)',
      rating: 5,
      comment: 'Alex helped David raise his SAT math score by 150 points! His test-taking strategies are incredibly effective.',
      date: '1 week ago',
      subject: 'SAT Math Prep'
    },
    {
      id: '2',
      studentName: 'Jessica (Grade 10)',
      rating: 5,
      comment: 'Finally understand Algebra II thanks to Alex. He explains everything so clearly and patiently.',
      date: '3 weeks ago',
      subject: 'Algebra II'
    },
    {
      id: '3',
      studentName: 'Parent of Michael (Grade 9)',
      rating: 4,
      comment: 'Very knowledgeable and professional. Michael\'s grades have improved significantly since working with Alex.',
      date: '1 month ago',
      subject: 'Algebra I'
    }
  ]
};

export const TutorProfile: React.FC<TutorProfileProps> = ({ tutorId, onBackToTutors, onBookSession }) => {
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const reviews = mockReviews[tutorId] || [];
  
  useEffect(() => {
    fetchTutor();
  }, [tutorId]);
  
  const fetchTutor = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/${tutorId}`
      );
      
      if (!response.ok) {
        throw new Error('Tutor not found');
      }
      
      const data = await response.json();
      
      // Use mock data as fallback for missing fields
      const mockProfile = tutorProfiles[`tutor-${tutorId}`] || tutorProfiles['sarah-elementary'];
      
      setTutor({
        ...data,
        photo: data.avatar || '👨‍🏫',
        title: `${data.grade} Math Specialist`,
        reviewCount: data.reviews_count || 0,
        totalHours: 850,
        responseTime: '< 2 hours',
        education: mockProfile?.education || [],
        certifications: mockProfile?.certifications || [],
        experience: `${data.experience_years || 1}+ years of teaching experience`,
        bio: data.description || 'Experienced tutor dedicated to helping students excel in mathematics.',
        specialties: data.subjects || [],
        languages: ['English'],
        availability: data.is_active ? 'available' : 'unavailable',
        sessionTypes: [
          {
            id: '1',
            name: 'Individual Session',
            duration: '60 minutes',
            price: data.price_per_hour,
            description: 'One-on-one personalized tutoring'
          },
          {
            id: '2',
            name: 'Group Session',
            duration: '90 minutes',
            price: Math.round(data.price_per_hour * 0.7),
            description: 'Small group session (2-4 students)'
          }
        ],
        weeklySchedule: data.availability || mockProfile?.weeklySchedule || {}
      });
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="tutor-profile">
        <div className="profile-container">
          <div className="loading">Loading tutor profile...</div>
        </div>
      </div>
    );
  }
  
  if (error || !tutor) {
    return (
      <div className="tutor-profile">
        <div className="profile-container">
          <div className="error">
            <h2>Tutor Not Found</h2>
            <p>{error || 'The requested tutor could not be found.'}</p>
            <button onClick={onBackToTutors} className="btn btn-primary">
              Back to Tutors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  const handleBookNow = () => {
    if (selectedSessionType) {
      onBookSession(tutorId, selectedSessionType);
    }
  };

  return (
    <div className="tutor-profile-container">
      <button className="back-button" onClick={onBackToTutors}>
        ← Back to Tutors
      </button>

      <div className="tutor-profile-header">
        <div className="tutor-photo-large">{tutor.photo}</div>
        <div className="tutor-main-info">
          <h1 className="tutor-name">{tutor.name}</h1>
          <p className="tutor-title">{tutor.title}</p>
          
          <div className="tutor-stats">
            <div className="stat">
              <div className="stars">
                {renderStars(tutor.rating)}
              </div>
              <span className="rating-text">{tutor.rating} ({tutor.reviewCount} reviews)</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Hours:</span>
              <span className="stat-value">{tutor.totalHours}+</span>
            </div>
            <div className="stat">
              <span className="stat-label">Response Time:</span>
              <span className="stat-value">{tutor.responseTime}</span>
            </div>
          </div>

          <div className="availability-status">
            <span className="availability-dot available"></span>
            <span>Available for new students</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-left">
          <section className="bio-section">
            <h3>About Me</h3>
            <p>{tutor.bio}</p>
          </section>

          <section className="specialties-section">
            <h3>Specialties</h3>
            <div className="specialty-tags">
              {tutor.specialties.map((specialty: string, index: number) => (
                <span key={index} className="specialty-tag">{specialty}</span>
              ))}
            </div>
          </section>

          <section className="education-section">
            <h3>Education</h3>
            <ul>
              {tutor.education.map((edu: string, index: number) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </section>

          <section className="certifications-section">
            <h3>Certifications</h3>
            <ul>
              {tutor.certifications.map((cert: string, index: number) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </section>

          <section className="languages-section">
            <h3>Languages</h3>
            <p>{tutor.languages.join(', ')}</p>
          </section>

          <section className="reviews-section">
            <h3>Student Reviews</h3>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{review.studentName}</span>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                  <div className="review-meta">
                    <span className="review-subject">{review.subject}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="profile-right">
          <div className="booking-card">
            <h3>Book a Session</h3>
            
            <div className="session-types">
              {tutor.sessionTypes.map((sessionType: SessionType) => (
                <div
                  key={sessionType.id}
                  className={`session-type ${selectedSessionType === sessionType.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSessionType(sessionType.id)}
                >
                  <div className="session-info">
                    <div className="session-name">{sessionType.name}</div>
                    <div className="session-duration">{sessionType.duration}</div>
                    <div className="session-description">{sessionType.description}</div>
                  </div>
                  <div className="session-price">${sessionType.price}</div>
                </div>
              ))}
            </div>

            <button 
              className={`book-now-btn ${selectedSessionType ? '' : 'disabled'}`}
              onClick={handleBookNow}
              disabled={!selectedSessionType}
            >
              {selectedSessionType ? 'Book Now & Choose Time' : 'Select a Session Type'}
            </button>

            <p className="booking-note">
              💡 Free consultation available for first-time students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};