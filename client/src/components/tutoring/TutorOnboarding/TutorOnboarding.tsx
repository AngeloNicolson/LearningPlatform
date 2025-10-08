import { authFetch } from '../../../utils/authFetch';
import React, { useState } from 'react';
import './TutorOnboarding.css';

interface TutorOnboardingProps {
  userId: number;
  userName: string;
  onComplete: () => void;
}

export const TutorOnboarding: React.FC<TutorOnboardingProps> = ({ userId, userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Experience
    experience_years: 0,
    qualifications: [] as string[],
    teaching_style: '',
    
    // Step 2: Subjects & Grades
    grade: 'Elementary',
    subjects: [] as string[],
    specializations: [] as string[],
    
    // Step 3: Availability & Rates
    price_per_hour: 30,
    availability: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[]
    },
    timezone: 'America/New_York',
    
    // Step 4: Profile
    description: '',
    avatar: ''
  });

  const steps = [
    { number: 1, title: 'Experience', description: 'Tell us about your teaching background' },
    { number: 2, title: 'Subjects', description: 'What and who do you teach?' },
    { number: 3, title: 'Availability', description: 'When can you teach?' },
    { number: 4, title: 'Profile', description: 'Introduce yourself to students' }
  ];

  const gradeOptions = ['Elementary', 'Middle School', 'High School', 'College'];
  
  const subjectOptions = {
    'Elementary': ['Basic Math', 'Arithmetic', 'Word Problems', 'Fractions'],
    'Middle School': ['Pre-Algebra', 'Algebra 1', 'Geometry Basics', 'Statistics'],
    'High School': ['Algebra 2', 'Geometry', 'Trigonometry', 'Precalculus', 'Calculus', 'AP Math'],
    'College': ['Calculus I-III', 'Linear Algebra', 'Differential Equations', 'Abstract Algebra']
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00'
  ];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (formData.experience_years < 0) {
          setError('Experience years cannot be negative');
          return false;
        }
        if (!formData.teaching_style.trim()) {
          setError('Please describe your teaching style');
          return false;
        }
        return true;
      case 2:
        if (formData.subjects.length === 0) {
          setError('Please select at least one subject');
          return false;
        }
        return true;
      case 3:
        if (formData.price_per_hour < 10 || formData.price_per_hour > 500) {
          setError('Price must be between $10 and $500 per hour');
          return false;
        }
        const hasAvailability = Object.values(formData.availability).some(slots => slots.length > 0);
        if (!hasAvailability) {
          setError('Please select at least one time slot');
          return false;
        }
        return true;
      case 4:
        if (!formData.description.trim() || formData.description.length < 50) {
          setError('Please write at least 50 characters about yourself');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/tutors/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          user_id: userId,
          name: userName,
          qualifications: JSON.stringify(formData.qualifications),
          subjects: JSON.stringify(formData.subjects),
          availability: JSON.stringify(formData.availability)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit profile');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTimeSlot = (day: string, time: string) => {
    const daySlots = formData.availability[day as keyof typeof formData.availability];
    const updated = daySlots.includes(time)
      ? daySlots.filter(t => t !== time)
      : [...daySlots, time].sort();
    
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: updated
      }
    });
  };

  const toggleSubject = (subject: string) => {
    const updated = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    
    setFormData({ ...formData, subjects: updated });
  };

  return (
    <div className="tutor-onboarding">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Complete Your Tutor Profile</h1>
          <p>Help students get to know you better</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentStep / 4) * 100}%` }} />
        </div>

        <div className="steps-indicator">
          {steps.map(step => (
            <div 
              key={step.number}
              className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="form-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Teaching Experience</h2>
              
              <div className="form-group">
                <label>Years of Teaching Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label>Qualifications & Certifications</label>
                <input
                  type="text"
                  placeholder="e.g., B.S. Mathematics, Teaching Certificate"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        setFormData({
                          ...formData,
                          qualifications: [...formData.qualifications, input.value.trim()]
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                <small>Press Enter to add each qualification</small>
                <div className="tags">
                  {formData.qualifications.map((qual, i) => (
                    <span key={i} className="tag">
                      {qual}
                      <button 
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          qualifications: formData.qualifications.filter((_, idx) => idx !== i)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Teaching Style & Approach</label>
                <textarea
                  rows={4}
                  value={formData.teaching_style}
                  onChange={e => setFormData({...formData, teaching_style: e.target.value})}
                  placeholder="Describe your teaching philosophy and methods..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>Subjects & Grade Levels</h2>
              
              <div className="form-group">
                <label>Primary Grade Level</label>
                <select
                  value={formData.grade}
                  onChange={e => {
                    setFormData({
                      ...formData, 
                      grade: e.target.value,
                      subjects: [] // Reset subjects when grade changes
                    });
                  }}
                >
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subjects You Teach</label>
                <div className="checkbox-grid">
                  {subjectOptions[formData.grade as keyof typeof subjectOptions].map(subject => (
                    <label key={subject} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h2>Availability & Rates</h2>
              
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={formData.price_per_hour}
                  onChange={e => setFormData({...formData, price_per_hour: parseInt(e.target.value) || 30})}
                />
              </div>

              <div className="form-group">
                <label>Weekly Availability</label>
                <div className="availability-grid">
                  {Object.keys(formData.availability).map(day => (
                    <div key={day} className="day-column">
                      <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                      <div className="time-slots">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            className={`time-slot ${formData.availability[day as keyof typeof formData.availability].includes(time) ? 'selected' : ''}`}
                            onClick={() => toggleTimeSlot(day, time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({...formData, timezone: e.target.value})}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-content">
              <h2>Your Profile</h2>
              
              <div className="form-group">
                <label>Profile Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Introduce yourself to potential students. What makes you a great tutor? What's your teaching experience?"
                />
                <small>{formData.description.length}/500 characters</small>
              </div>

              <div className="form-group">
                <label>Profile Avatar (Optional)</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={e => setFormData({...formData, avatar: e.target.value})}
                  placeholder="URL to your photo (optional)"
                />
              </div>

              <div className="profile-preview">
                <h3>Preview</h3>
                <div className="preview-card">
                  <div className="preview-header">
                    <div className="avatar">{formData.avatar || userName.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <h4>{userName}</h4>
                      <p>{formData.grade} • ${formData.price_per_hour}/hour</p>
                    </div>
                  </div>
                  <p className="preview-subjects">
                    <strong>Subjects:</strong> {formData.subjects.join(', ')}
                  </p>
                  <p className="preview-description">{formData.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};