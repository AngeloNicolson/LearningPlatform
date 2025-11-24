/**
 * @file TutorProfile.tsx
 * @author Angelo Nicolson
 * @brief Detailed tutor profile page
 * @description Comprehensive tutor profile displaying full bio, credentials, subject expertise, availability calendar, reviews, pricing details, and booking interface for session scheduling.
 */

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
  date?: string; // Legacy field
  createdAt?: string; // From API
  subject: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

interface TutorContent {
  id: string;
  title: string;
  description: string;
  contentType: string;
  metadata: any;
  viewCount: number;
  purchaseCount: number;
  pricing: {
    model: string;
    price: number;
    currency: string;
    billingInterval?: string;
  };
}

// Mock data removed - now fetched from API

// Mock reviews removed - now fetched from API

export const TutorProfile: React.FC<TutorProfileProps> = ({ tutorId, onBackToTutors, onBookSession }) => {
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [tutor, setTutor] = useState<any>(null);
  const [content, setContent] = useState<TutorContent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [sessionTypesLoading, setSessionTypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'content' | 'reviews'>('about');

  useEffect(() => {
    fetchTutor();
    fetchTutorContent();
    fetchReviews();
    fetchSessionTypes();
  }, [tutorId]);
  
  const fetchTutor = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/tutors/${tutorId}`
      );
      
      if (!response.ok) {
        throw new Error('Tutor not found');
      }
      
      const data = await response.json();

      setTutor({
        ...data,
        photo: data.avatar || '👨‍🏫',
        title: `${data.grade} Math Specialist`,
        reviewCount: data.reviews_count || 0,
        totalHours: data.total_hours || 0,
        responseTime: data.response_time_hours ? `< ${data.response_time_hours} hours` : '< 24 hours',
        education: data.education || [],
        certifications: data.certifications || [],
        experience: data.experience_description || `${data.experience_years || 1}+ years of teaching experience`,
        bio: data.description || data.bio || 'Experienced tutor dedicated to helping students excel.',
        specialties: data.specialties || [],
        languages: data.languages || ['English'],
        availability: data.is_active ? 'available' : 'unavailable',
        weeklySchedule: data.availability || {}
      });
    } catch (err) {
      console.error('Error fetching tutor:', err);
      setError('Failed to load tutor profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorContent = async () => {
    try {
      setContentLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/tutors/${tutorId}/content`
      );

      if (!response.ok) {
        console.error('Failed to fetch tutor content');
        return;
      }

      const data = await response.json();
      setContent(data);
    } catch (err) {
      console.error('Error fetching tutor content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/reviews/tutor/${tutorId}`
      );

      if (!response.ok) {
        console.error('Failed to fetch reviews');
        return;
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchSessionTypes = async () => {
    try {
      setSessionTypesLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/session-types/tutor/${tutorId}`
      );

      if (!response.ok) {
        console.error('Failed to fetch session types');
        return;
      }

      const data = await response.json();
      // Map API response to expected format
      const mappedSessionTypes = data.map((st: any) => ({
        id: st.id.toString(),
        name: st.name,
        duration: `${st.durationMinutes} minutes`,
        price: st.price,
        description: st.description || ''
      }));
      setSessionTypes(mappedSessionTypes);
    } catch (err) {
      console.error('Error fetching session types:', err);
    } finally {
      setSessionTypesLoading(false);
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
    const numRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.floor(numRating) ? 'filled' : 'empty'}`}>
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

      <div className="header-wrapper">
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
                <span className="rating-text">{typeof tutor.rating === 'number' ? tutor.rating.toFixed(1) : '0.0'} ({tutor.reviewCount || 0} reviews)</span>
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

        <div className="booking-card">
          <h3>Book a Session</h3>

          {sessionTypesLoading ? (
            <p className="loading-text">Loading session types...</p>
          ) : sessionTypes.length === 0 ? (
            <p className="no-sessions">No session types available for this tutor yet.</p>
          ) : (
            <div className="session-types">
              {sessionTypes.map((sessionType: SessionType) => (
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
          )}

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

      <div className="profile-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content Library
              {content.length > 0 && <span className="tab-badge">{content.length}</span>}
            </button>
            <button
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
              {reviews.length > 0 && <span className="tab-badge">{reviews.length}</span>}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'about' && (
              <div className="tab-panel">
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
              </div>
            )}

            {activeTab === 'content' && (
              <div className="tab-panel">
                <section className="content-library-section">
                  <h3>Content Library</h3>
                  {contentLoading ? (
                    <p className="loading-text">Loading content...</p>
                  ) : content.length === 0 ? (
                    <p className="no-content">This tutor hasn't published any content yet.</p>
                  ) : (
                    <div className="content-grid">
                      {content.map((item) => (
                        <div key={item.id} className="content-card">
                          <div className="content-header">
                            <span className="content-type-badge">{item.contentType}</span>
                            {item.pricing.model === 'free' && (
                              <span className="free-badge">FREE</span>
                            )}
                          </div>
                          <h4 className="content-title">{item.title}</h4>
                          <p className="content-description">{item.description}</p>
                          <div className="content-stats">
                            <span>👁️ {item.viewCount} views</span>
                            <span>📦 {item.purchaseCount} purchases</span>
                          </div>
                          <div className="content-footer">
                            <div className="content-price">
                              {item.pricing.model === 'free' ? (
                                <span className="price-free">Free</span>
                              ) : item.pricing.model === 'subscription' ? (
                                <span className="price">${item.pricing.price}/{item.pricing.billingInterval}</span>
                              ) : (
                                <span className="price">${item.pricing.price}</span>
                              )}
                            </div>
                            <button className="btn-view-content">
                              {item.pricing.model === 'free' ? 'View' : 'Purchase'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-panel">
                <section className="reviews-section">
                  <h3>Student Reviews</h3>
                  {reviewsLoading ? (
                    <p className="loading-text">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first to review this tutor!</p>
                  ) : (
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
                            <span className="review-date">{new Date(review.createdAt || review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};
