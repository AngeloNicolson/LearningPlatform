import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { MathWorksheetUpload } from '../MathWorksheetUpload/MathWorksheetUpload';
import './AdminPanel.css';

interface AdminPanelProps {
  userRole: string;
  onImpersonate: (role: string, name: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userRole, onImpersonate }) => {
  const navigation = useNavigation();
  const initialTab = (navigation.currentState.adminTab as 'overview' | 'tutors' | 'articles' | 'users' | 'resources' | 'upload') || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'articles' | 'users' | 'resources' | 'upload'>(initialTab);

  // Update navigation when tab changes
  const handleTabChange = (tab: 'overview' | 'tutors' | 'articles' | 'users' | 'resources' | 'upload') => {
    setActiveTab(tab);
    navigation.navigate({ adminTab: tab });
  };
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: 'elementary',
    subject: '',
    published: false
  });
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [resourceType, setResourceType] = useState<'worksheets' | 'videos' | 'practice' | 'quizzes' | 'history'>('worksheets');
  const [editingResource, setEditingResource] = useState<any>(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [editingTutor, setEditingTutor] = useState<string | null>(null);
  const [tutorForm, setTutorForm] = useState({
    name: '',
    grade: 'Elementary',
    subjects: [] as string[],
    price_per_hour: 30,
    description: '',
    avatar: ''
  });

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;

  // Mock data for demonstration
  const stats = {
    totalUsers: 847,
    totalTutors: 45,
    totalArticles: 234,
    totalBookings: 1567,
    revenue: 45678
  };

  const mockUsers = [
    { id: '1', email: 'owner@example.com', name: 'Platform Owner', role: 'owner', joined: 'Jan 1, 2024' },
    { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin', joined: 'Jan 1, 2024' },
    { id: '3', email: 'teacher@example.com', name: 'Jane Smith', role: 'teacher', joined: 'Jan 5, 2024' },
    { id: '4', email: 'parent@example.com', name: 'John Doe', role: 'parent', joined: 'Jan 10, 2024' },
    { id: '5', email: 'student@example.com', name: 'Jimmy Doe', role: 'student', joined: 'Jan 10, 2024' },
  ];

  // Fetch grades on component mount
  useEffect(() => {
    fetchGrades();
    fetchTutors();
  }, []);

  // Fetch resources when subtopic changes
  useEffect(() => {
    if (selectedSubtopic) {
      fetchResources(selectedSubtopic);
    }
  }, [selectedSubtopic]);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/grades`);
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchTutors = async () => {
    setLoadingTutors(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/all`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Fall back to public endpoint if not authorized
        const publicResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors`);
        const data = await publicResponse.json();
        setTutors(data);
        setPendingTutors([]);
      } else if (response.ok) {
        const data = await response.json();
        console.log('Fetched tutors data:', data);
        // Map database fields to admin panel format
        const mappedData = data.map((t: any) => ({
          ...t,
          name: t.display_name || t.name,
          status: t.approval_status === 'pending' ? 'pending' : 
                  (t.is_active ? 'active' : 'suspended'),
          grade: Array.isArray(t.grades) ? t.grades.join(', ') : t.grade,
          price_per_hour: t.hourly_rate || t.price_per_hour,
          subjects: t.subjects ? (
            t.subjects.math_topics ? 
              [...(t.subjects.math_topics || []), ...(t.subjects.science_subjects || [])] :
              t.subjects
          ) : [],
          rating: t.rating || 0,
          reviews_count: t.total_sessions || t.reviews_count || 0,
          description: t.bio || t.description
        }));
        
        // Separate tutors by status
        const pending = mappedData.filter((t: any) => t.status === 'pending');
        const active = mappedData.filter((t: any) => t.status === 'active');
        const suspended = mappedData.filter((t: any) => t.status === 'suspended');
        console.log('Pending tutors:', pending);
        console.log('Active tutors:', active);
        console.log('Suspended tutors:', suspended);
        setPendingTutors(pending);
        setTutors([...active, ...suspended]); // Show both active and suspended in main list
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setTutors([]);
      setPendingTutors([]);
    } finally {
      setLoadingTutors(false);
    }
  };

  const fetchResources = async (subtopicId: string) => {
    setLoadingResources(true);
    try {
      // For admin, we need to get all resources including hidden ones
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/admin/subtopics/${subtopicId}/resources`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // If unauthorized, fall back to public endpoint
        const publicResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/subtopics/${subtopicId}/resources`);
        const data = await publicResponse.json();
        setResources(data.resources || []);
      } else {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const toggleResourceVisibility = async (resourceId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/admin/resources/${resourceId}/visibility`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.status === 401) {
        alert('Session expired. Please login again through the main app.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setResources(prev => prev.map(r => 
          r.id === resourceId ? { ...r, visible: data.visible ? 1 : 0 } : r
        ));
      } else {
        console.error('Failed to toggle visibility');
        alert('Failed to update visibility. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  const handleApproveTutor = async (tutorId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/${tutorId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Tutor approved successfully!');
        fetchTutors();
        setSelectedTutor(null);
      } else {
        const error = await response.json();
        alert(`Failed to approve tutor: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  const handleRejectTutor = async (tutorId: string, reason: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/${tutorId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Tutor application rejected.');
        fetchTutors();
        setSelectedTutor(null);
      } else {
        const error = await response.json();
        alert(`Failed to reject tutor: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  // Currently unused - will implement when edit UI is added
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateTutor = async (tutorId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/${tutorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(tutorForm)
      });

      if (response.ok) {
        alert('Tutor updated successfully!');
        setEditingTutor(null);
        setTutorForm({
          name: '',
          grade: 'Elementary',
          subjects: [],
          price_per_hour: 30,
          description: '',
          avatar: ''
        });
        fetchTutors();
      } else {
        const error = await response.json();
        alert(`Failed to update tutor: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating tutor:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  // Currently unused - will implement when delete UI is added
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteTutor = async (tutorId: string) => {
    if (!confirm('Are you sure you want to delete this tutor?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/${tutorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Tutor deleted successfully!');
        fetchTutors();
      } else {
        let errorMessage = 'Failed to delete tutor';
        try {
          const error = await response.json();
          errorMessage = `Failed to delete tutor: ${error.message || error.error || 'Unknown error'}`;
        } catch (e) {
          if (response.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting tutor:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  const handleToggleTutorStatus = async (tutorId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/tutors/admin/${tutorId}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchTutors();
      } else {
        let errorMessage = 'Failed to toggle tutor status';
        try {
          const error = await response.json();
          errorMessage = `Failed to toggle tutor status: ${error.message || error.error || 'Unknown error'}`;
        } catch (e) {
          if (response.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error toggling tutor status:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving article:', articleForm);
    alert('Article saved!');
    setEditingArticle(null);
  };

  const handleImpersonate = (user: any) => {
    if (user.role === 'owner' || (user.role === 'admin' && !isOwner)) {
      alert('Cannot impersonate this user');
      return;
    }
    onImpersonate(user.role, user.name);
  };

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>{isOwner ? 'Owner Panel' : 'Admin Panel'}</h1>
        <p className="role-badge">{userRole.toUpperCase()}</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'tutors' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('tutors')}
        >
          Manage Tutors
        </button>
        <button 
          className={activeTab === 'articles' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('articles')}
        >
          Articles
        </button>
        <button
          className={activeTab === 'resources' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('resources')}
        >
          Math Resources
        </button>
        <button
          className={activeTab === 'upload' ? 'tab active' : 'tab'}
          onClick={() => handleTabChange('upload')}
        >
          Upload Content
        </button>
        {isOwner && (
          <button
            className={activeTab === 'users' ? 'tab active' : 'tab'}
            onClick={() => handleTabChange('users')}
          >
            Users
          </button>
        )}
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
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

        {activeTab === 'tutors' && (
          <div className="tutors-section">
            <div className="section-header">
              <h2>Tutor Management</h2>
              <div className="stats-badges">
                <span className="badge badge-warning">
                  {pendingTutors.length} Pending Approval
                </span>
                <span className="badge badge-success">
                  {tutors.filter((t: any) => t.status === 'active').length} Active
                </span>
                <span className="badge badge-danger">
                  {tutors.filter((t: any) => t.status === 'suspended').length} Suspended
                </span>
              </div>
            </div>
            
            {/* Tutor Detail Modal */}
            {selectedTutor && (
              <div className="tutor-detail-modal">
                <div className="modal-overlay" onClick={() => setSelectedTutor(null)} />
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Tutor Details</h3>
                    <button className="close-btn" onClick={() => setSelectedTutor(null)}>×</button>
                  </div>
                  <div className="modal-body">
                    <h4>{selectedTutor.name}</h4>
                    <p><strong>Grade:</strong> {selectedTutor.grade}</p>
                    <p><strong>Rate:</strong> ${selectedTutor.price_per_hour}/hour</p>
                    <p><strong>Subjects:</strong> {Array.isArray(selectedTutor.subjects) ? selectedTutor.subjects.join(', ') : JSON.parse(selectedTutor.subjects || '[]').join(', ')}</p>
                    <p><strong>Status:</strong> <span className={`badge badge-${selectedTutor.status === 'active' ? 'success' : selectedTutor.status === 'pending' ? 'warning' : 'danger'}`}>{selectedTutor.status}</span></p>
                    {selectedTutor.description && (
                      <>
                        <p><strong>Description:</strong></p>
                        <p>{selectedTutor.description}</p>
                      </>
                    )}
                    {selectedTutor.experience_years && (
                      <p><strong>Experience:</strong> {selectedTutor.experience_years} years</p>
                    )}
                    {selectedTutor.qualifications && (
                      <p><strong>Qualifications:</strong> {JSON.parse(selectedTutor.qualifications || '[]').join(', ')}</p>
                    )}
                    <p><strong>Rating:</strong> {selectedTutor.rating ? `${selectedTutor.rating.toFixed(1)} ⭐` : 'No ratings yet'}</p>
                    <p><strong>Reviews:</strong> {selectedTutor.reviews_count || 0}</p>
                    <p><strong>Active:</strong> {selectedTutor.is_active ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setSelectedTutor(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Tutors */}
            {pendingTutors.length > 0 && (
              <div className="pending-tutors">
                <h3>Pending Approval</h3>
                <div className="tutors-list">
                  {pendingTutors.map(tutor => (
                    <div key={tutor.id} className="tutor-item pending">
                      <div className="tutor-info">
                        <h4>{tutor.name}</h4>
                        <p>{tutor.grade} • ${tutor.price_per_hour}/hour</p>
                        <p>Subjects: {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : JSON.parse(tutor.subjects || '[]').join(', ')}</p>
                        {tutor.description && <p className="description">{tutor.description}</p>}
                        {tutor.experience_years && <p>Experience: {tutor.experience_years} years</p>}
                      </div>
                      <div className="tutor-actions">
                        <button 
                          className="btn btn-small btn-success"
                          onClick={() => handleApproveTutor(tutor.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):');
                            if (reason !== null) {
                              handleRejectTutor(tutor.id, reason);
                            }
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Tutors List */}
            <h3>All Tutors</h3>
            {loadingTutors ? (
              <div className="loading">Loading tutors...</div>
            ) : (
              <div className="tutors-list">
                {tutors.map(tutor => (
                  <div key={tutor.id} className="tutor-item">
                    <div className="tutor-info">
                      <h3>{tutor.name}</h3>
                      <p>{tutor.grade} • ${tutor.price_per_hour}/hour</p>
                      <p>Subjects: {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects}</p>
                      <p>Rating: {tutor.rating ? `${tutor.rating.toFixed(1)} ⭐` : 'No ratings'} ({tutor.reviews_count || 0} reviews)</p>
                      <p className="status">
                        <span className={`badge badge-${tutor.status === 'active' ? 'success' : tutor.status === 'suspended' ? 'danger' : 'warning'}`}>
                          {tutor.status === 'active' ? 'Active' : tutor.status === 'suspended' ? 'Suspended' : 'Pending'}
                        </span>
                      </p>
                    </div>
                    <div className="tutor-actions">
                      <button 
                        className="btn btn-small"
                        onClick={() => setSelectedTutor(tutor)}
                      >
                        View
                      </button>
                      {tutor.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-small btn-success"
                            onClick={() => handleApproveTutor(tutor.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => {
                              const reason = prompt('Rejection reason (optional):');
                              if (reason !== null) {
                                handleRejectTutor(tutor.id, reason);
                              }
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {tutor.status === 'active' && (
                        <button 
                          className="btn btn-small btn-warning"
                          onClick={() => handleToggleTutorStatus(tutor.id)}
                        >
                          Suspend
                        </button>
                      )}
                      {tutor.status === 'suspended' && (
                        <button 
                          className="btn btn-small btn-success"
                          onClick={() => handleToggleTutorStatus(tutor.id)}
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {tutors.length === 0 && !loadingTutors && (
                  <div className="no-tutors">
                    <p>No active tutors yet. Tutors will appear here after approval.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'articles' && (
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
            <div className="impersonation-notice">
              <p>🔍 Click "View as" to impersonate a user and see their dashboard</p>
            </div>
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
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.name}</td>
                      <td><span className={`role-tag ${user.role}`}>{user.role.toUpperCase()}</span></td>
                      <td>{user.joined}</td>
                      <td>
                        <div className="user-actions">
                          <button className="btn btn-small">Edit Role</button>
                          {user.role !== 'owner' && user.role !== 'admin' && (
                            <button 
                              className="btn btn-small btn-impersonate"
                              onClick={() => handleImpersonate(user)}
                            >
                              View as
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-section">
            <h2>Math Resources Management</h2>
            
            <div className="resource-selector">
              <div className="selector-row">
                <div className="selector-group">
                  <label>Grade Level</label>
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedTopic('');
                      setSelectedSubtopic('');
                      setResources([]);
                    }}
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name} ({grade.grade_range})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGrade && (
                  <div className="selector-group">
                    <label>Topic</label>
                    <select 
                      value={selectedTopic}
                      onChange={(e) => {
                        setSelectedTopic(e.target.value);
                        setSelectedSubtopic('');
                        setResources([]);
                      }}
                    >
                      <option value="">Select Topic</option>
                      {grades
                        .find(g => g.id === selectedGrade)
                        ?.topics?.map((topic: any) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {selectedTopic && (
                  <div className="selector-group">
                    <label>Subtopic</label>
                    <select 
                      value={selectedSubtopic}
                      onChange={(e) => setSelectedSubtopic(e.target.value)}
                    >
                      <option value="">Select Subtopic</option>
                      {grades
                        .find(g => g.id === selectedGrade)
                        ?.topics?.find((t: any) => t.id === selectedTopic)
                        ?.subtopics?.map((subtopic: any) => (
                          <option key={subtopic.id} value={subtopic.id}>
                            {subtopic.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedSubtopic && (
                <div className="resource-type-tabs">
                  <button 
                    className={resourceType === 'worksheets' ? 'resource-tab active' : 'resource-tab'}
                    onClick={() => setResourceType('worksheets')}
                  >
                    Worksheets
                  </button>
                  <button 
                    className={resourceType === 'videos' ? 'resource-tab active' : 'resource-tab'}
                    onClick={() => setResourceType('videos')}
                  >
                    Videos
                  </button>
                  <button 
                    className={resourceType === 'practice' ? 'resource-tab active' : 'resource-tab'}
                    onClick={() => setResourceType('practice')}
                  >
                    Practice
                  </button>
                  <button 
                    className={resourceType === 'quizzes' ? 'resource-tab active' : 'resource-tab'}
                    onClick={() => setResourceType('quizzes')}
                  >
                    Quizzes
                  </button>
                  <button 
                    className={resourceType === 'history' ? 'resource-tab active' : 'resource-tab'}
                    onClick={() => setResourceType('history')}
                  >
                    History
                  </button>
                </div>
              )}
            </div>

            {selectedSubtopic && (
              <div className="resource-manager">
                {resourceType === 'history' ? (
                  <div className="history-editor">
                    <h3>Edit History Article</h3>
                    <div className="history-form">
                      <div className="form-group">
                        <label>Article Title</label>
                        <input 
                          type="text" 
                          placeholder="The History of..."
                          className="form-control"
                        />
                      </div>
                      
                      <div className="markdown-editor-group">
                        <div className="editor-toolbar">
                          <button 
                            className={!showMarkdownPreview ? 'toolbar-btn active' : 'toolbar-btn'}
                            onClick={() => setShowMarkdownPreview(false)}
                          >
                            Edit
                          </button>
                          <button 
                            className={showMarkdownPreview ? 'toolbar-btn active' : 'toolbar-btn'}
                            onClick={() => setShowMarkdownPreview(true)}
                          >
                            Preview
                          </button>
                        </div>
                        
                        {!showMarkdownPreview ? (
                          <div className="form-group">
                            <label>Content (Markdown)</label>
                            <textarea 
                              rows={20}
                              placeholder="# History Title&#10;&#10;## Section&#10;Content here..."
                              className="markdown-textarea"
                            />
                          </div>
                        ) : (
                          <div className="markdown-preview">
                            <p>Preview will appear here...</p>
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button className="btn btn-primary">Save History Article</button>
                        <button className="btn btn-secondary">Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="resource-list">
                    <div className="resource-header">
                      <h3>{resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}</h3>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setEditingResource({})}
                      >
                        Add New {resourceType.slice(0, -1)}
                      </button>
                    </div>

                    {editingResource ? (
                      <div className="resource-form">
                        <h4>{editingResource.id ? 'Edit' : 'Add New'} {resourceType.slice(0, -1)}</h4>
                        
                        <div className="form-group">
                          <label>Title</label>
                          <input 
                            type="text" 
                            placeholder={`${resourceType.slice(0, -1)} title`}
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <label>Description</label>
                          <textarea 
                            rows={3}
                            placeholder="Brief description..."
                            className="form-control"
                          />
                        </div>

                        {resourceType === 'worksheets' && (
                          <div className="form-group">
                            <label>Upload PDF</label>
                            <input 
                              type="file" 
                              accept=".pdf"
                              className="form-control"
                            />
                            <small>Max file size: 10MB</small>
                          </div>
                        )}

                        {resourceType === 'videos' && (
                          <div className="form-group">
                            <label>Video URL</label>
                            <input 
                              type="url" 
                              placeholder="https://youtube.com/..."
                              className="form-control"
                            />
                            <small>YouTube, Vimeo, or direct video URLs</small>
                          </div>
                        )}

                        {resourceType === 'practice' && (
                          <>
                            <div className="form-group">
                              <label>Problem Set</label>
                              <textarea 
                                rows={10}
                                placeholder="Enter problems (one per line)..."
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <label>Answer Key</label>
                              <textarea 
                                rows={10}
                                placeholder="Enter answers (one per line)..."
                                className="form-control"
                              />
                            </div>
                          </>
                        )}

                        {resourceType === 'quizzes' && (
                          <>
                            <div className="form-group">
                              <label>Quiz Type</label>
                              <select className="form-control">
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="short-answer">Short Answer</option>
                                <option value="mixed">Mixed</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Time Limit (minutes)</label>
                              <input 
                                type="number" 
                                min="5" 
                                max="120"
                                placeholder="30"
                                className="form-control"
                              />
                            </div>
                          </>
                        )}

                        <div className="form-group">
                          <label>
                            <input type="checkbox" /> Visible to students
                          </label>
                        </div>

                        <div className="form-group">
                          <label>Grade Restrictions</label>
                          <select className="form-control">
                            <option value="all">All grades</option>
                            <option value="k-2">K-2 only</option>
                            <option value="3-5">3-5 only</option>
                            <option value="6-8">6-8 only</option>
                            <option value="9-12">9-12 only</option>
                          </select>
                        </div>

                        <div className="form-actions">
                          <button className="btn btn-primary">Save</button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setEditingResource(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="resource-items">
                        {loadingResources ? (
                          <div className="loading">Loading resources...</div>
                        ) : (
                          <>
                            {resources
                              .filter(r => r.resource_type === resourceType)
                              .map(resource => (
                                <div key={resource.id} className="resource-item">
                                  <div className="resource-info">
                                    <h4>{resource.title}</h4>
                                    <p>{resource.description}</p>
                                    <span className="resource-meta">
                                      <span className={`visibility-badge ${resource.visible ? 'visible' : 'hidden'}`}>
                                        {resource.visible ? 'Visible' : 'Hidden'}
                                      </span>
                                      <span className="date">
                                        Updated: {new Date(resource.updated_at).toLocaleDateString()}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="resource-actions">
                                    <button className="btn btn-small">Edit</button>
                                    <button 
                                      className="btn btn-small"
                                      onClick={() => toggleResourceVisibility(resource.id)}
                                    >
                                      {resource.visible ? 'Hide' : 'Show'}
                                    </button>
                                    <button className="btn btn-small btn-danger">Delete</button>
                                  </div>
                                </div>
                              ))}
                            
                            {resources.filter(r => r.resource_type === resourceType).length === 0 && (
                              <div className="empty-state">
                                <p>No {resourceType} available for this subtopic.</p>
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => setEditingResource({})}
                                >
                                  Add First {resourceType.slice(0, -1)}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="upload-section">
            <MathWorksheetUpload />
          </div>
        )}
      </div>
    </div>
  );
};