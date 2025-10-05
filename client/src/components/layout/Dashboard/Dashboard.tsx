import React, { useState, useEffect } from 'react';
// import { Leaderboard } from './Leaderboard';
// import { FlippableTopicBrowser } from './FlippableTopicBrowser';
import { ParentDashboard } from '../ParentDashboard/ParentDashboard';
// import { Topic } from '../../../types/wasm';
// import { TopicMetadata } from '../../../types/storage';
// import { useTopics } from '../../../hooks/useTopics';
import './Dashboard.css';

interface DashboardProps {
  onTopicSelect?: (topic: any) => void;
  onOpenWorkspace?: (topicId: string) => void;
  userRole?: string;
  accountStatus?: string;
  parentId?: number | null;
  impersonatingAs?: { role: string; name: string; } | null;
  onNavigateToTutors?: () => void;
}

interface UpcomingSession {
  id: string;
  type: 'tutoring' | 'debate';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'pending';
  meetingLink?: string;
  opponent?: string;
  complexity?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTopicSelect, onOpenWorkspace, userRole = 'student', accountStatus = 'active', parentId, impersonatingAs, onNavigateToTutors }) => {
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);
  const [teacherBookings, setTeacherBookings] = useState<any[]>([]);
  const [bookingsStats, setBookingsStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    monthlyEarnings: 0
  });
  const [teacherProfile, setTeacherProfile] = useState({
    bio: '',
    specializations: [] as string[],
    hourlyRate: 50,
    availability: {}
  });
  
  // Use impersonated role if active, otherwise use actual role
  const effectiveRole = impersonatingAs?.role || userRole;
  // Mock data for upcoming sessions - would come from API in real app
  const upcomingSessions: UpcomingSession[] = [
    {
      id: '1',
      type: 'tutoring',
      title: 'Dr. Sarah Chen',
      subtitle: 'Mathematics - Algebra',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '60 minutes',
      status: 'confirmed',
      meetingLink: 'https://meet.example.com/abc123'
    },
    {
      id: '2',
      type: 'debate',
      title: 'Climate Change Policy Debate',
      subtitle: 'Environmental vs. Economic Priorities',
      date: '2024-01-16',
      time: '7:00 PM',
      duration: '45 minutes',
      status: 'confirmed',
      opponent: 'Michael Torres',
      complexity: 7,
      meetingLink: 'https://debate.example.com/xyz789'
    },
    {
      id: '3',
      type: 'tutoring',
      title: 'Prof. Michael Rodriguez',
      subtitle: 'Mathematics - Calculus',
      date: '2024-01-17',
      time: '4:00 PM',
      duration: '90 minutes',
      status: 'confirmed'
    },
    {
      id: '4',
      type: 'debate',
      title: 'Universal Basic Income',
      subtitle: 'Social Welfare Implementation',
      date: '2024-01-18',
      time: '6:30 PM',
      duration: '60 minutes',
      status: 'pending',
      opponent: 'Lisa Park',
      complexity: 8
    },
    {
      id: '5',
      type: 'tutoring',
      title: 'Ms. Emily Watson',
      subtitle: 'Mathematics - Geometry',
      date: '2024-01-20',
      time: '10:00 AM',
      duration: '30 minutes',
      status: 'pending'
    }
  ];

  // Fetch teacher-specific data
  useEffect(() => {
    if (effectiveRole === 'teacher') {
      fetchTeacherData();
    }
  }, [effectiveRole]);
  
  const fetchTeacherData = async () => {
    try {
      // Fetch bookings
      const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/bookings/teacher/bookings`, {
        credentials: 'include',
      });
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setTeacherBookings(data.bookings || []);
        setBookingsStats(data.stats || {
          todayCount: 0,
          weekCount: 0,
          monthCount: 0,
          monthlyEarnings: 0
        });
      }
      
      // Fetch profile
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/teachers/profile`, {
        credentials: 'include',
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setTeacherProfile(data);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };
  
  const handleBookingConfirm = async (bookingId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/bookings/teacher/bookings/${bookingId}/confirm`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchTeacherData();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };
  
  const handleBookingDecline = async (bookingId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/bookings/teacher/bookings/${bookingId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchTeacherData();
      }
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };
  
  // Render teacher dashboard
  if (effectiveRole === 'teacher') {
    return (
      <div className="dashboard teacher-dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Teacher Dashboard</h1>
            <p className="tagline">Manage your bookings and profile</p>
          </div>
          
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-number">{bookingsStats.todayCount}</div>
              <div className="stat-label">Today's Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{bookingsStats.weekCount}</div>
              <div className="stat-label">This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{bookingsStats.monthCount}</div>
              <div className="stat-label">This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">${bookingsStats.monthlyEarnings}</div>
              <div className="stat-label">Monthly Earnings</div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-main">
          <div className="dashboard-left">
            <div className="section">
              <div className="section-header">
                <h2>📅 Your Bookings</h2>
                <p>Manage your upcoming tutoring sessions</p>
              </div>
              
              {teacherBookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Bookings Yet</h3>
                  <p>You'll see student bookings here once they schedule sessions.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {teacherBookings.map(booking => {
                    const isToday = booking.date === new Date().toISOString().split('T')[0];
                    return (
                      <div key={booking.id} className={`session-card ${booking.status} tutoring ${isToday ? 'today' : ''}`}>
                        <div className="session-header">
                          <div className="session-info">
                            <div className="session-type-badge">📚 TUTORING</div>
                            <h3>{booking.studentName}</h3>
                            <p className="subtitle">{booking.subject}</p>
                          </div>
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status === 'confirmed' ? '✅ Confirmed' : 
                             booking.status === 'pending' ? '⏳ Pending' : 
                             '❌ Cancelled'}
                          </span>
                        </div>
                        
                        <div className="session-details">
                          <div className="detail-item">
                            <span className="label">📅 Date:</span>
                            <span className="value">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">⏰ Time:</span>
                            <span className="value">{booking.time}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">⏱️ Duration:</span>
                            <span className="value">{booking.duration} min</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">💰 Earnings:</span>
                            <span className="value">${booking.price}</span>
                          </div>
                        </div>
                        
                        <div className="session-actions">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleBookingConfirm(booking.id)}
                              >
                                Confirm
                              </button>
                              <button 
                                className="btn btn-danger"
                                onClick={() => handleBookingDecline(booking.id)}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && isToday && (
                            <button className="btn btn-primary">Start Session</button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button className="btn btn-secondary">Message Student</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-right">
            <div className="section">
              <div className="section-header">
                <h2>📈 Your Stats</h2>
                <p>Teaching performance metrics</p>
              </div>
              
              <div className="personal-stats">
                <div className="stat-item">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-info">
                    <div className="stat-value">{teacherProfile.hourlyRate ? `$${teacherProfile.hourlyRate}` : '-'}</div>
                    <div className="stat-name">Hourly Rate</div>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <div className="stat-value">{teacherProfile.specializations?.length || 0}</div>
                    <div className="stat-name">Specializations</div>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <div className="stat-value">${bookingsStats.monthlyEarnings}</div>
                    <div className="stat-name">This Month</div>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <div className="stat-value">{bookingsStats.monthCount}</div>
                    <div className="stat-name">Sessions</div>
                  </div>
                </div>
              </div>
              
              <div className="recent-achievements">
                <h3>📚 Your Specializations</h3>
                {teacherProfile.specializations?.map(spec => (
                  <div key={spec} className="achievement">
                    <span className="achievement-icon">✓</span>
                    <span className="achievement-text">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render parent dashboard
  if (effectiveRole === 'parent') {
    return <ParentDashboard userId={userId || 0} onNavigateToTutors={onNavigateToTutors} />;
  }
  
  // Default student dashboard
  return (
    <div className="dashboard">
      {/* Show pending status banner for pending tutors */}
      {userRole === 'tutor' && accountStatus === 'pending' && (
        <div className="pending-banner" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          color: '#856404',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>⏳</span>
          <div>
            <strong>Your tutor application is pending approval</strong>
            <p style={{ margin: '5px 0 0 0' }}>
              You can browse resources while waiting for admin approval. Once approved, you'll have access to tutor features.
            </p>
          </div>
        </div>
      )}
      
      {/* Show parent-managed indicator for child accounts */}
      {parentId && (
        <div className="managed-banner" style={{
          backgroundColor: '#e7f3ff',
          border: '1px solid #0066cc',
          color: '#004080',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>👨‍👩‍👧</span>
          <div>
            <strong>Account managed by parent</strong>
            <p style={{ margin: '5px 0 0 0' }}>
              Your parent manages bookings and account settings for you.
            </p>
          </div>
        </div>
      )}
      
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Your Personal Dashboard</h1>
          <p className="tagline">Track your upcoming sessions and monitor progress</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">{upcomingSessions.filter(s => s.status === 'confirmed').length}</div>
            <div className="stat-label">Confirmed Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{upcomingSessions.filter(s => s.type === 'tutoring').length}</div>
            <div className="stat-label">Tutoring Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{upcomingSessions.filter(s => s.type === 'debate').length}</div>
            <div className="stat-label">Debate Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1,247</div>
            <div className="stat-label">Debate Points</div>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-left">
          <div className="section">
            <div className="section-header">
              <h2>📅 Upcoming Sessions</h2>
              <p>Your scheduled tutoring and debate sessions</p>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No Upcoming Sessions</h3>
                <p>Book tutoring sessions or join debates to get started.</p>
              </div>
            ) : (
              <div className="sessions-list">
                {upcomingSessions.map(session => (
                  <div key={session.id} className={`session-card ${session.status} ${session.type}`}>
                    <div className="session-header">
                      <div className="session-info">
                        <div className="session-type-badge">
                          {session.type === 'tutoring' ? '📚 TUTORING' : '⚔ DEBATE'}
                        </div>
                        <h3>{session.title}</h3>
                        <p className="subtitle">{session.subtitle}</p>
                        {session.type === 'debate' && session.opponent && (
                          <p className="opponent">vs. {session.opponent}</p>
                        )}
                      </div>
                      <span className={`status-badge ${session.status}`}>
                        {session.status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <div className="session-details">
                      <div className="detail-item">
                        <span className="label">📅 Date:</span>
                        <span className="value">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">⏰ Time:</span>
                        <span className="value">{session.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">⏱️ Duration:</span>
                        <span className="value">{session.duration}</span>
                      </div>
                      {session.complexity && (
                        <div className="detail-item">
                          <span className="label">🎯 Complexity:</span>
                          <span className="value">{session.complexity}/10</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="session-actions">
                      {session.status === 'confirmed' && session.meetingLink && (
                        <button className="btn btn-primary">
                          {session.type === 'tutoring' ? 'Join Session' : 'Join Debate'}
                        </button>
                      )}
                      <button className="btn btn-secondary">
                        View Details
                      </button>
                      {session.type === 'debate' && (
                        <button className="btn btn-secondary">
                          Prepare Arguments
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="section">
            <div className="section-header">
              <h2>📈 Quick Stats</h2>
              <p>Your personal performance metrics</p>
            </div>
            
            <div className="personal-stats">
              <div className="stat-item">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-value">847</div>
                  <div className="stat-name">Debate Points</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⚔</div>
                <div className="stat-info">
                  <div className="stat-value">23</div>
                  <div className="stat-name">Debates Won</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <div className="stat-value">47</div>
                  <div className="stat-name">Study Hours</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">8.4</div>
                  <div className="stat-name">Avg Rating</div>
                </div>
              </div>
            </div>
            
            <div className="recent-achievements">
              <h3>🏅 Recent Achievements</h3>
              <div className="achievement">
                <span className="achievement-icon">🥇</span>
                <span className="achievement-text">Won Climate Change Debate</span>
              </div>
              <div className="achievement">
                <span className="achievement-icon">📈</span>
                <span className="achievement-text">Reached 800+ Debate Points</span>
              </div>
              <div className="achievement">
                <span className="achievement-icon">🎓</span>
                <span className="achievement-text">Completed 40+ Study Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};