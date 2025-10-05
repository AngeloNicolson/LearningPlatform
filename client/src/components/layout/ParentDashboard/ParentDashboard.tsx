import React, { useState, useEffect } from 'react';
import './ParentDashboard.css';

interface Child {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface ParentDashboardProps {
  userId: number;
  onNavigateToTutors?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigateToTutors }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  // const [showEditChildModal, setShowEditChildModal] = useState(false);
  // const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state for adding child
  const [childForm, setChildForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    grade: '',
    birthdate: ''
  });

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/users/children`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (childForm.password !== childForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (childForm.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/users/create-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: childForm.email,
          password: childForm.password,
          firstName: childForm.firstName,
          lastName: childForm.lastName,
          grade: childForm.grade,
          birthdate: childForm.birthdate
        })
      });

      if (response.ok) {
        alert('Child account created successfully!');
        setShowAddChildModal(false);
        setChildForm({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          grade: '',
          birthdate: ''
        });
        fetchChildren();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create child account');
      }
    } catch (error) {
      console.error('Error creating child:', error);
      alert('Error creating child account');
    }
  };

  const handleResetPassword = async (childId: number) => {
    const newPassword = prompt('Enter new password for child (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/users/child/${childId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        alert('Password reset successfully!');
      } else {
        alert('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  const handleDeleteChild = async (childId: number) => {
    if (!confirm('Are you sure you want to delete this child account? This will suspend their access.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/users/child/${childId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Child account suspended successfully');
        fetchChildren();
      } else {
        alert('Failed to delete child account');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Error deleting child account');
    }
  };

  return (
    <div className="parent-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Parent Dashboard</h1>
          <p className="tagline">Manage your family's learning journey</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">{children.length}</div>
            <div className="stat-label">Children</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Active Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">$0</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0%</div>
            <div className="stat-label">Attendance</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <div className="section-header">
            <h2>👨‍👩‍👧‍👦 Manage Children</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddChildModal(true)}
            >
              + Add Child Account
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading children...</div>
          ) : children.length === 0 ? (
            <div className="empty-state">
              <p>No child accounts yet.</p>
              <p>Click "Add Child Account" to create one.</p>
            </div>
          ) : (
            <div className="children-grid">
              {children.map(child => (
                <div key={child.id} className="child-card">
                  <div className="child-avatar">
                    {child.firstName[0]}{child.lastName[0]}
                  </div>
                  <div className="child-info">
                    <h3>{child.firstName} {child.lastName}</h3>
                    <p className="child-email">{child.email}</p>
                    <p className="child-meta">
                      Created: {new Date(child.createdAt).toLocaleDateString()}
                    </p>
                    {child.lastLoginAt && (
                      <p className="child-meta">
                        Last login: {new Date(child.lastLoginAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="child-actions">
                    <button 
                      className="btn btn-small"
                      onClick={() => {/* View activity */}}
                    >
                      View Activity
                    </button>
                    <button 
                      className="btn btn-small"
                      onClick={() => handleResetPassword(child.id)}
                    >
                      Reset Password
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteChild(child.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>📚 Upcoming Sessions</h2>
            <button 
              className="btn btn-secondary"
              onClick={onNavigateToTutors}
            >
              Book New Session
            </button>
          </div>
          <div className="empty-state">
            <p>No upcoming sessions.</p>
            <p>Book a tutor for your children to get started.</p>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="modal-overlay" onClick={() => setShowAddChildModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Child Account</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddChildModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddChild} className="child-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={childForm.firstName}
                    onChange={(e) => setChildForm({...childForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={childForm.lastName}
                    onChange={(e) => setChildForm({...childForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={childForm.email}
                  onChange={(e) => setChildForm({...childForm, email: e.target.value})}
                  placeholder="child@example.com"
                  required
                />
                <small>Your child will use this email to login</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={childForm.password}
                    onChange={(e) => setChildForm({...childForm, password: e.target.value})}
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={childForm.confirmPassword}
                    onChange={(e) => setChildForm({...childForm, confirmPassword: e.target.value})}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Grade Level</label>
                  <select
                    value={childForm.grade}
                    onChange={(e) => setChildForm({...childForm, grade: e.target.value})}
                  >
                    <option value="">Select Grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1">1st Grade</option>
                    <option value="2">2nd Grade</option>
                    <option value="3">3rd Grade</option>
                    <option value="4">4th Grade</option>
                    <option value="5">5th Grade</option>
                    <option value="6">6th Grade</option>
                    <option value="7">7th Grade</option>
                    <option value="8">8th Grade</option>
                    <option value="9">9th Grade</option>
                    <option value="10">10th Grade</option>
                    <option value="11">11th Grade</option>
                    <option value="12">12th Grade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Birth Date</label>
                  <input
                    type="date"
                    value={childForm.birthdate}
                    onChange={(e) => setChildForm({...childForm, birthdate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddChildModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Child Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};