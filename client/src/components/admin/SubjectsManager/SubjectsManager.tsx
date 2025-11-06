/**
 * @file SubjectsManager.tsx
 * @author Angelo Nicolson
 * @brief Subject management interface for admin panel
 * @description Comprehensive management interface for creating, editing, and organizing subjects, subject levels, and topics.
 * Allows admins to define new subjects (like "Languages", "Art"), configure filter labels ("Grade Level" vs "Audience Level"),
 * manage organizational levels, and create topics. Integrates with admin API endpoints for full CRUD operations.
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import './SubjectsManager.css';

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  filter_label: string;
  display_order: number;
}

interface SubjectLevel {
  id: string;
  name: string;
  subject_id: string;
  grade_range: string;
  description: string;
  display_order: number;
}

interface Topic {
  id: string;
  name: string;
  grade_level_id: string;
  icon: string;
  description: string;
  display_order: number;
}

export const SubjectsManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectLevels, setSubjectLevels] = useState<SubjectLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'subjects' | 'levels' | 'topics'>('subjects');

  // Form states
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLevel, setEditingLevel] = useState<SubjectLevel | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [subjectForm, setSubjectForm] = useState({
    id: '',
    name: '',
    slug: '',
    icon: '',
    description: '',
    filter_label: 'Grade Level',
    display_order: 0
  });

  const [levelForm, setLevelForm] = useState({
    id: '',
    name: '',
    grade_range: '',
    description: '',
    display_order: 0
  });

  const [topicForm, setTopicForm] = useState({
    id: '',
    name: '',
    grade_level_id: '',
    icon: '',
    description: '',
    display_order: 0
  });

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch levels when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchLevels(selectedSubject.id);
      fetchTopicsBySubject(selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (subjectId: string) => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/${subjectId}/levels`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSubjectLevels(data);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchTopicsBySubject = async (subjectSlug: string) => {
    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/${subjectSlug}/topics`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      });

      if (response.ok) {
        await fetchSubjects();
        setShowSubjectForm(false);
        resetSubjectForm();
        alert('Subject created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Failed to create subject');
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/${editingSubject.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm)
      });

      if (response.ok) {
        await fetchSubjects();
        setEditingSubject(null);
        setShowSubjectForm(false);
        resetSubjectForm();
        alert('Subject updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure? This will delete all levels and topics for this subject.')) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchSubjects();
        if (selectedSubject?.id === id) {
          setSelectedSubject(null);
        }
        alert('Subject deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/${selectedSubject.id}/levels`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelForm)
      });

      if (response.ok) {
        await fetchLevels(selectedSubject.id);
        setShowLevelForm(false);
        resetLevelForm();
        alert('Level created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating level:', error);
      alert('Failed to create level');
    }
  };

  const handleUpdateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !editingLevel) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/${selectedSubject.id}/levels/${editingLevel.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelForm)
      });

      if (response.ok) {
        await fetchLevels(selectedSubject.id);
        setEditingLevel(null);
        setShowLevelForm(false);
        resetLevelForm();
        alert('Level updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating level:', error);
      alert('Failed to update level');
    }
  };

  const handleDeleteLevel = async (subjectId: string, levelId: string) => {
    if (!confirm('Are you sure? This will delete all topics in this level.')) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/${subjectId}/levels/${levelId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchLevels(subjectId);
        alert('Level deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Failed to delete level');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/topics`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      if (response.ok) {
        if (selectedSubject) {
          await fetchTopicsBySubject(selectedSubject.slug);
        }
        setShowTopicForm(false);
        resetTopicForm();
        alert('Topic created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic');
    }
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/topics/${editingTopic.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      if (response.ok) {
        if (selectedSubject) {
          await fetchTopicsBySubject(selectedSubject.slug);
        }
        setEditingTopic(null);
        setShowTopicForm(false);
        resetTopicForm();
        alert('Topic updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/admin/subjects/topics/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        if (selectedSubject) {
          await fetchTopicsBySubject(selectedSubject.slug);
        }
        alert('Topic deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic');
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      id: '',
      name: '',
      slug: '',
      icon: '',
      description: '',
      filter_label: 'Grade Level',
      display_order: 0
    });
  };

  const resetLevelForm = () => {
    setLevelForm({
      id: '',
      name: '',
      grade_range: '',
      description: '',
      display_order: 0
    });
  };

  const resetTopicForm = () => {
    setTopicForm({
      id: '',
      name: '',
      grade_level_id: '',
      icon: '',
      description: '',
      display_order: 0
    });
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      icon: subject.icon,
      description: subject.description,
      filter_label: subject.filter_label,
      display_order: subject.display_order
    });
    setShowSubjectForm(true);
  };

  const openEditLevel = (level: SubjectLevel) => {
    setEditingLevel(level);
    setLevelForm({
      id: level.id,
      name: level.name,
      grade_range: level.grade_range,
      description: level.description,
      display_order: level.display_order
    });
    setShowLevelForm(true);
  };

  const openEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      id: topic.id,
      name: topic.name,
      grade_level_id: topic.grade_level_id,
      icon: topic.icon,
      description: topic.description,
      display_order: topic.display_order
    });
    setShowTopicForm(true);
  };

  if (loading) {
    return <div className="loading">Loading subjects...</div>;
  }

  return (
    <div className="subjects-manager">
      <div className="manager-header">
        <h2>Subjects Management</h2>
        <p>Configure subjects, organizational levels, and topics for the platform</p>
      </div>

      <div className="manager-layout">
        {/* Subjects List */}
        <div className="subjects-panel">
          <div className="panel-header">
            <h3>Subjects</h3>
            <button
              className="btn btn-primary btn-small"
              onClick={() => {
                resetSubjectForm();
                setEditingSubject(null);
                setShowSubjectForm(true);
              }}
            >
              + New Subject
            </button>
          </div>

          <div className="subjects-list">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className={`subject-item ${selectedSubject?.id === subject.id ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject)}
              >
                <div className="subject-info">
                  <span className="subject-icon">{subject.icon}</span>
                  <div>
                    <div className="subject-name">{subject.name}</div>
                    <div className="subject-meta">{subject.filter_label}</div>
                  </div>
                </div>
                <div className="subject-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    onClick={() => openEditSubject(subject)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDeleteSubject(subject.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="details-panel">
          {selectedSubject ? (
            <>
              <div className="panel-header">
                <h3>{selectedSubject.icon} {selectedSubject.name}</h3>
                <div className="view-tabs">
                  <button
                    className={view === 'levels' ? 'active' : ''}
                    onClick={() => setView('levels')}
                  >
                    Levels
                  </button>
                  <button
                    className={view === 'topics' ? 'active' : ''}
                    onClick={() => setView('topics')}
                  >
                    Topics
                  </button>
                </div>
              </div>

              {view === 'levels' && (
                <div className="levels-section">
                  <div className="section-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => {
                        resetLevelForm();
                        setEditingLevel(null);
                        setShowLevelForm(true);
                      }}
                    >
                      + New Level
                    </button>
                  </div>

                  <div className="items-list">
                    {subjectLevels.map(level => (
                      <div key={level.id} className="item-card">
                        <div className="item-info">
                          <h4>{level.name}</h4>
                          {level.grade_range && <p className="item-meta">{level.grade_range}</p>}
                          {level.description && <p className="item-desc">{level.description}</p>}
                        </div>
                        <div className="item-actions">
                          <button
                            className="btn-icon"
                            onClick={() => openEditLevel(level)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteLevel(selectedSubject.id, level.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'topics' && (
                <div className="topics-section">
                  <div className="section-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => {
                        resetTopicForm();
                        setEditingTopic(null);
                        setShowTopicForm(true);
                      }}
                    >
                      + New Topic
                    </button>
                  </div>

                  <div className="items-list">
                    {topics.map(topic => (
                      <div key={topic.id} className="item-card">
                        <div className="item-info">
                          <h4>
                            {topic.icon && <span className="topic-icon">{topic.icon}</span>}
                            {topic.name}
                          </h4>
                          {topic.description && <p className="item-desc">{topic.description}</p>}
                        </div>
                        <div className="item-actions">
                          <button
                            className="btn-icon"
                            onClick={() => openEditTopic(topic)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteTopic(topic.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a subject to manage its levels and topics</p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Form Modal */}
      {showSubjectForm && (
        <div className="modal-overlay" onClick={() => {
          setShowSubjectForm(false);
          setEditingSubject(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSubject ? 'Edit Subject' : 'Create New Subject'}</h3>
              <button className="close-btn" onClick={() => {
                setShowSubjectForm(false);
                setEditingSubject(null);
              }}>×</button>
            </div>
            <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}>
              <div className="form-group">
                <label>ID*</label>
                <input
                  type="text"
                  value={subjectForm.id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                  disabled={!!editingSubject}
                  placeholder="e.g., languages"
                  required
                />
              </div>
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g., Languages"
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug*</label>
                <input
                  type="text"
                  value={subjectForm.slug}
                  onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })}
                  placeholder="e.g., languages"
                  required
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input
                  type="text"
                  value={subjectForm.icon}
                  onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })}
                  placeholder="e.g., 🌍"
                />
              </div>
              <div className="form-group">
                <label>Filter Label*</label>
                <input
                  type="text"
                  value={subjectForm.filter_label}
                  onChange={(e) => setSubjectForm({ ...subjectForm, filter_label: e.target.value })}
                  placeholder="e.g., Grade Level, Skill Level, Historical Era"
                  required
                />
                <small>How the organizational levels will be labeled (e.g., "Grade Level", "Audience Level")</small>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Brief description of the subject"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={subjectForm.display_order}
                  onChange={(e) => setSubjectForm({ ...subjectForm, display_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowSubjectForm(false);
                  setEditingSubject(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubject ? 'Update' : 'Create'} Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Level Form Modal */}
      {showLevelForm && (
        <div className="modal-overlay" onClick={() => {
          setShowLevelForm(false);
          setEditingLevel(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingLevel ? 'Edit Level' : 'Create New Level'}</h3>
              <button className="close-btn" onClick={() => {
                setShowLevelForm(false);
                setEditingLevel(null);
              }}>×</button>
            </div>
            <form onSubmit={editingLevel ? handleUpdateLevel : handleCreateLevel}>
              <div className="form-group">
                <label>ID*</label>
                <input
                  type="text"
                  value={levelForm.id}
                  onChange={(e) => setLevelForm({ ...levelForm, id: e.target.value })}
                  disabled={!!editingLevel}
                  placeholder={`e.g., ${selectedSubject?.id}-beginner`}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  value={levelForm.name}
                  onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                  placeholder="e.g., Beginner"
                  required
                />
              </div>
              <div className="form-group">
                <label>Grade/Age Range</label>
                <input
                  type="text"
                  value={levelForm.grade_range}
                  onChange={(e) => setLevelForm({ ...levelForm, grade_range: e.target.value })}
                  placeholder="e.g., K-5, Ages 12-18, Beginner"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={levelForm.description}
                  onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={levelForm.display_order}
                  onChange={(e) => setLevelForm({ ...levelForm, display_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowLevelForm(false);
                  setEditingLevel(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLevel ? 'Update' : 'Create'} Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Form Modal */}
      {showTopicForm && (
        <div className="modal-overlay" onClick={() => {
          setShowTopicForm(false);
          setEditingTopic(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTopic ? 'Edit Topic' : 'Create New Topic'}</h3>
              <button className="close-btn" onClick={() => {
                setShowTopicForm(false);
                setEditingTopic(null);
              }}>×</button>
            </div>
            <form onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}>
              <div className="form-group">
                <label>ID*</label>
                <input
                  type="text"
                  value={topicForm.id}
                  onChange={(e) => setTopicForm({ ...topicForm, id: e.target.value })}
                  disabled={!!editingTopic}
                  placeholder={`e.g., ${selectedSubject?.id}-topic-name`}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name*</label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="e.g., Spanish Grammar"
                  required
                />
              </div>
              <div className="form-group">
                <label>Level*</label>
                <select
                  value={topicForm.grade_level_id}
                  onChange={(e) => setTopicForm({ ...topicForm, grade_level_id: e.target.value })}
                  required
                >
                  <option value="">Select a level</option>
                  {subjectLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input
                  type="text"
                  value={topicForm.icon}
                  onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })}
                  placeholder="e.g., 📝"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={topicForm.display_order}
                  onChange={(e) => setTopicForm({ ...topicForm, display_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowTopicForm(false);
                  setEditingTopic(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTopic ? 'Update' : 'Create'} Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
