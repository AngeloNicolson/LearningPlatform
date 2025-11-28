/**
 * @file TutorDashboardPage.tsx
 * @author Angelo Nicolson
 * @brief Main dashboard for tutors to manage their profile and availability
 * @description Provides tutors with tools to manage their schedule, view bookings,
 * and update their profile information.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import TutorAvailabilityManager from '../../components/tutor/AvailabilityManager/TutorAvailabilityManager';
import './TutorDashboardPage.css';

const TutorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'availability' | 'bookings' | 'profile'>('availability');

  useEffect(() => {
    console.log('TutorDashboardPage - User object:', user);
    if (user?.id) {
      fetchTutorProfile();
    } else {
      console.log('TutorDashboardPage - No user ID found');
      setLoading(false);
    }
  }, [user]);

  const fetchTutorProfile = async () => {
    console.log('Fetching tutor profile for user:', user?.id);

    if (!user?.id) {
      console.error('No user ID available');
      setLoading(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/tutors/user/${user.id}`;
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const tutor = await response.json();
        console.log('Tutor profile loaded:', tutor);
        setTutorId(tutor.id);
        setError('');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch tutor profile:', response.status, errorData);
        setError(`Failed to load tutor profile: ${errorData.error || 'Unknown error'} (${response.status})`);
      }
    } catch (error) {
      console.error('Failed to fetch tutor profile:', error);
      setError(`Error loading profile: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tutor-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!tutorId) {
    return (
      <div className="tutor-dashboard-error">
        <h2>⚠️ No Tutor Profile Found</h2>
        <p>You don't have a tutor profile yet. Please complete your tutor onboarding first.</p>
        <button className="btn-primary" onClick={() => navigation.navigate({ view: 'onboarding' })}>
          Start Tutor Onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="tutor-dashboard-page">
      <div className="dashboard-header">
        <h1>👨‍🏫 Tutor Dashboard</h1>
        <p>Welcome back, {user?.firstName}!</p>
      </div>

      <div className="dashboard-navigation">
        <button
          className={`nav-button ${activeSection === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveSection('availability')}
        >
          📅 Availability
        </button>
        <button
          className={`nav-button ${activeSection === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveSection('bookings')}
        >
          📚 My Bookings
        </button>
        <button
          className={`nav-button ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          👤 Profile Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeSection === 'availability' && tutorId && (
          <TutorAvailabilityManager tutorId={tutorId} />
        )}

        {activeSection === 'bookings' && (
          <div className="bookings-section">
            <h2>My Upcoming Sessions</h2>
            <p>Booking management coming soon...</p>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="profile-section">
            <h2>Profile Settings</h2>
            <p>Profile editing coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboardPage;
