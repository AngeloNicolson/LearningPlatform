import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface AdminDashboardProps {
  userRole: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'articles' | 'users' | 'settings' | 'bookings'>(
    userRole === 'teacher' ? 'bookings' : 'overview'
  );
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: 'elementary',
    subject: '',
    published: false
  });

  // Teacher profile state
  const [teacherProfile, setTeacherProfile] = useState({
    bio: '',
    specializations: [] as string[],
    hourlyRate: 50,
    availability: {}
  });
  
  // Bookings state
  const [teacherBookings, setTeacherBookings] = useState<any[]>([]);
  const [bookingsStats, setBookingsStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    monthlyEarnings: 0
  });

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;
  const isTeacher = userRole === 'teacher';

  // Mock data for demonstration
  const stats = {
    totalUsers: 847,
    totalTutors: 45,
    totalArticles: 234,
    totalBookings: 1567,
    revenue: 45678
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving article:', articleForm);
    // TODO: API call to save article
    alert('Article saved!');
  };

  const handleTeacherProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/teachers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teacherProfile),
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
  
  // Fetch teacher bookings
  useEffect(() => {
    if (isTeacher && activeTab === 'bookings') {
      fetchTeacherBookings();
    }
  }, [isTeacher, activeTab]);
  
  // Fetch teacher profile
  useEffect(() => {
    if (isTeacher && activeTab === 'settings') {
      fetchTeacherProfile();
    }
  }, [isTeacher, activeTab]);
  
  const fetchTeacherBookings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/bookings/teacher/bookings', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacherBookings(data.bookings || []);
        setBookingsStats(data.stats || {
          todayCount: 0,
          weekCount: 0,
          monthCount: 0,
          monthlyEarnings: 0
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  
  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/teachers/profile', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacherProfile({
          bio: data.bio || '',
          specializations: data.specializations || [],
          hourlyRate: data.hourlyRate || 50,
          availability: data.availability || {}
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const handleBookingConfirm = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/teacher/bookings/${bookingId}/confirm`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchTeacherBookings();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };
  
  const handleBookingDecline = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/teacher/bookings/${bookingId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        fetchTeacherBookings();
      }
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

  if (!isOwner && !isAdmin && !isTeacher) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>
          {isOwner ? 'Owner Dashboard' : isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}
        </h1>
        <p className="role-badge">{userRole.toUpperCase()}</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        
        {isAdmin && (
          <>
            <button 
              className={activeTab === 'tutors' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('tutors')}
            >
              Manage Tutors
            </button>
            <button 
              className={activeTab === 'articles' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('articles')}
            >
              Articles
            </button>
          </>
        )}
        
        {isOwner && (
          <button 
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        )}
        
        {isTeacher && (
          <>
            <button 
              className={activeTab === 'bookings' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings
            </button>
            <button 
              className={activeTab === 'settings' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('settings')}
            >
              My Profile
            </button>
          </>
        )}
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && !isTeacher && (
          <div className="overview-section">
            <h2>Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalTutors}</div>
                <div className="stat-label">Active Tutors</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalArticles}</div>
                <div className="stat-label">Articles</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              {isOwner && (
                <div className="stat-card">
                  <div className="stat-value">${stats.revenue}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tutors' && isAdmin && (
          <div className="tutors-section">
            <div className="section-header">
              <h2>Manage Tutors</h2>
              <button className="btn btn-primary">Add New Tutor</button>
            </div>
            
            <div className="tutors-list">
              <div className="tutor-item">
                <div className="tutor-info">
                  <h3>Dr. Sarah Johnson</h3>
                  <p>High School Math • $35/hour</p>
                  <p>Rating: 4.8 ⭐ (127 reviews)</p>
                </div>
                <div className="tutor-actions">
                  <button className="btn btn-small">Edit</button>
                  <button className="btn btn-small btn-danger">Remove</button>
                </div>
              </div>
              
              <div className="tutor-item">
                <div className="tutor-info">
                  <h3>Prof. Michael Chen</h3>
                  <p>College Math • $45/hour</p>
                  <p>Rating: 4.9 ⭐ (89 reviews)</p>
                </div>
                <div className="tutor-actions">
                  <button className="btn btn-small">Edit</button>
                  <button className="btn btn-small btn-danger">Remove</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && isAdmin && (
          <div className="articles-section">
            <div className="section-header">
              <h2>Manage Articles</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setEditingArticle({})}
              >
                Create New Article
              </button>
            </div>
            
            {editingArticle ? (
              <form onSubmit={handleArticleSubmit} className="article-form">
                <h3>{editingArticle.id ? 'Edit Article' : 'New Article'}</h3>
                
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                    placeholder="Article title..."
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}
                    >
                      <option value="elementary">Elementary</option>
                      <option value="middle">Middle School</option>
                      <option value="high-school">High School</option>
                      <option value="college">College</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={articleForm.subject}
                      onChange={(e) => setArticleForm({...articleForm, subject: e.target.value})}
                      placeholder="e.g., Algebra, Geometry"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Content (Markdown supported)</label>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                    rows={15}
                    placeholder="Write your article content here..."
                    required
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={articleForm.published}
                      onChange={(e) => setArticleForm({...articleForm, published: e.target.checked})}
                    />
                    Publish immediately
                  </label>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Save Article</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setEditingArticle(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="articles-list">
                <div className="article-item">
                  <div className="article-info">
                    <h3>Introduction to Calculus</h3>
                    <p>High School • Published 2 days ago</p>
                    <p>Views: 234</p>
                  </div>
                  <div className="article-actions">
                    <button className="btn btn-small">Edit</button>
                    <button className="btn btn-small">Unpublish</button>
                    <button className="btn btn-small btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && isOwner && (
          <div className="users-section">
            <h2>User Management</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>admin@example.com</td>
                    <td>Admin User</td>
                    <td><span className="role-tag admin">Admin</span></td>
                    <td>Jan 1, 2024</td>
                    <td>
                      <button className="btn btn-small">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td>teacher@example.com</td>
                    <td>Jane Smith</td>
                    <td><span className="role-tag teacher">Teacher</span></td>
                    <td>Jan 5, 2024</td>
                    <td>
                      <button className="btn btn-small">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td>parent@example.com</td>
                    <td>John Doe</td>
                    <td><span className="role-tag parent">Parent</span></td>
                    <td>Jan 10, 2024</td>
                    <td>
                      <button className="btn btn-small">Edit Role</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && isTeacher && (
          <div className="bookings-section">
            <h2>My Upcoming Bookings</h2>
            
            <div className="bookings-stats">
              <div className="booking-stat">
                <div className="stat-number">{bookingsStats.weekCount}</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="booking-stat">
                <div className="stat-number">{bookingsStats.monthCount}</div>
                <div className="stat-label">This Month</div>
              </div>
              <div className="booking-stat">
                <div className="stat-number">${bookingsStats.monthlyEarnings}</div>
                <div className="stat-label">Monthly Earnings</div>
              </div>
            </div>

            <div className="bookings-list">
              {teacherBookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                <>
                  {/* Today's bookings */}
                  {teacherBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length > 0 && (
                    <>
                      <h3>Today's Sessions</h3>
                      {teacherBookings
                        .filter(b => b.date === new Date().toISOString().split('T')[0])
                        .map(booking => (
                          <div key={booking.id} className="booking-item today">
                            <div className="booking-time">
                              <div className="time">{booking.time}</div>
                              <div className="duration">{booking.duration} min</div>
                            </div>
                            <div className="booking-info">
                              <h4>{booking.studentName}</h4>
                              <p>{booking.subject}</p>
                              <p className={`booking-status ${booking.status}`}>
                                {booking.status === 'confirmed' ? 'Confirmed' : 
                                 booking.status === 'pending' ? 'Pending Confirmation' : 
                                 'Cancelled'}
                              </p>
                            </div>
                            <div className="booking-actions">
                              {booking.status === 'confirmed' && (
                                <>
                                  <button className="btn btn-small">Start Session</button>
                                  <button className="btn btn-small btn-secondary">Message</button>
                                </>
                              )}
                              {booking.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-small btn-primary"
                                    onClick={() => handleBookingConfirm(booking.id)}
                                  >
                                    Confirm
                                  </button>
                                  <button 
                                    className="btn btn-small btn-danger"
                                    onClick={() => handleBookingDecline(booking.id)}
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </>
                  )}
                  
                  {/* Upcoming bookings */}
                  {teacherBookings.filter(b => b.date > new Date().toISOString().split('T')[0]).length > 0 && (
                    <>
                      <h3>Upcoming This Week</h3>
                      {teacherBookings
                        .filter(b => b.date > new Date().toISOString().split('T')[0])
                        .map(booking => {
                          const bookingDate = new Date(booking.date);
                          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          
                          return (
                            <div key={booking.id} className="booking-item">
                              <div className="booking-date">
                                <div className="day">{dayNames[bookingDate.getDay()]}</div>
                                <div className="date">{monthNames[bookingDate.getMonth()]} {bookingDate.getDate()}</div>
                              </div>
                              <div className="booking-time">
                                <div className="time">{booking.time}</div>
                                <div className="duration">{booking.duration} min</div>
                              </div>
                              <div className="booking-info">
                                <h4>{booking.studentName}</h4>
                                <p>{booking.subject}</p>
                                <p className={`booking-status ${booking.status}`}>
                                  {booking.status === 'confirmed' ? 'Confirmed' : 
                                   booking.status === 'pending' ? 'Pending Confirmation' : 
                                   'Cancelled'}
                                </p>
                              </div>
                              <div className="booking-actions">
                                {booking.status === 'pending' && (
                                  <>
                                    <button 
                                      className="btn btn-small btn-primary"
                                      onClick={() => handleBookingConfirm(booking.id)}
                                    >
                                      Confirm
                                    </button>
                                    <button 
                                      className="btn btn-small btn-danger"
                                      onClick={() => handleBookingDecline(booking.id)}
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button className="btn btn-small btn-secondary">View Details</button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      }
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && isTeacher && (
          <div className="teacher-settings">
            <h2>My Teaching Profile</h2>
            <form onSubmit={handleTeacherProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={teacherProfile.bio}
                  onChange={(e) => setTeacherProfile({...teacherProfile, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell students about yourself..."
                />
              </div>
              
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  value={teacherProfile.hourlyRate}
                  onChange={(e) => setTeacherProfile({...teacherProfile, hourlyRate: parseInt(e.target.value) || 0})}
                  min="10"
                  max="200"
                />
              </div>
              
              <div className="form-group">
                <label>Specializations</label>
                <input
                  type="text"
                  placeholder="e.g., Algebra, Calculus, Geometry (comma separated)"
                  value={teacherProfile.specializations.join(', ')}
                  onChange={(e) => setTeacherProfile({
                    ...teacherProfile, 
                    specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Availability</label>
                <div className="availability-grid">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <div key={day} className="day-schedule">
                      <label>{day}</label>
                      <input 
                        type="text" 
                        placeholder="9:00-17:00"
                        value={(teacherProfile.availability as any)[day.toLowerCase()] || ''}
                        onChange={(e) => setTeacherProfile({
                          ...teacherProfile,
                          availability: {
                            ...teacherProfile.availability,
                            [day.toLowerCase()]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};