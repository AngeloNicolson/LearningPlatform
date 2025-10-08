import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import './MathResourceUpload.css';

interface MathResourceUploadProps {
  onClose?: () => void;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  grade_level: string;
}

export const MathResourceUpload: React.FC<MathResourceUploadProps> = ({ onClose }) => {
  const [resourceType, setResourceType] = useState<'worksheet' | 'video' | 'lesson'>('worksheet');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: '',
    gradeLevel: 'Elementary',
    videoUrl: '',
    externalUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/math/topics`,
          { credentials: 'include' }
        );
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Only PDF files are allowed' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 10MB' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    setMessage(null);

    try {
      // Validate based on resource type
      if (resourceType === 'worksheet' && !selectedFile) {
        setMessage({ type: 'error', text: 'Please select a PDF file' });
        setSaving(false);
        return;
      }
      if (resourceType === 'video' && !formData.videoUrl) {
        setMessage({ type: 'error', text: 'Please provide a video URL' });
        setSaving(false);
        return;
      }
      if (resourceType === 'lesson' && !formData.externalUrl) {
        setMessage({ type: 'error', text: 'Please provide a URL' });
        setSaving(false);
        return;
      }

      // For worksheets, upload file and create resource in one step
      if (resourceType === 'worksheet') {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile!);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('topic_id', formData.topicId);
        uploadFormData.append('grade_level', formData.gradeLevel);
        uploadFormData.append('subject', 'math');

        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/uploads/worksheet`,
          {
            method: 'POST',
            credentials: 'include',
            body: uploadFormData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload worksheet');
        }

        setMessage({ type: 'success', text: 'Worksheet uploaded successfully! Refresh the page to see it.' });
      } else {
        // For videos and lessons, just create resource entry
        const selectedTopic = topics.find(t => t.id === formData.topicId);

        const resourceData = {
          topic_id: formData.topicId || null,
          topic_name: selectedTopic?.name || null,
          topic_icon: selectedTopic?.icon || null,
          resource_type: resourceType,
          title: formData.title,
          description: formData.description,
          url: resourceType === 'video' ? formData.videoUrl : formData.externalUrl,
          grade_level: formData.gradeLevel
        };

        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/math/resources`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(resourceData)
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || 'Failed to save resource');
        }

        setMessage({ type: 'success', text: 'Resource created successfully! Refresh the page to see it.' });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        topicId: '',
        gradeLevel: 'Elementary',
        videoUrl: '',
        externalUrl: ''
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('worksheet-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error saving resource:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save resource. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="math-resource-upload-container">
      <div className="math-resource-upload">
        <div className="upload-header">
          <h1>Upload Math Resource</h1>
          {onClose && (
            <button className="close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        <div className="resource-type-selector">
          <button
            className={`type-btn ${resourceType === 'worksheet' ? 'active' : ''}`}
            onClick={() => setResourceType('worksheet')}
          >
            📝 PDF Worksheet
          </button>
          <button
            className={`type-btn ${resourceType === 'video' ? 'active' : ''}`}
            onClick={() => setResourceType('video')}
          >
            🎬 Video URL
          </button>
          <button
            className={`type-btn ${resourceType === 'lesson' ? 'active' : ''}`}
            onClick={() => setResourceType('lesson')}
          >
            🔗 External Link
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Resource Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Enter resource title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              placeholder="Brief description of the resource"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <select
                id="topic"
                value={formData.topicId}
                onChange={(e) => setFormData(prev => ({ ...prev, topicId: e.target.value }))}
              >
                <option value="">Select a topic (optional)</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.icon} {topic.name} ({topic.grade_level})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="grade">Grade Level *</label>
              <select
                id="grade"
                value={formData.gradeLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                required
              >
                <option value="Elementary">Elementary</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          {resourceType === 'worksheet' && (
            <div className="form-group">
              <label htmlFor="worksheet-file">Upload PDF Worksheet *</label>
              <input
                type="file"
                id="worksheet-file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              {selectedFile && (
                <div className="uploaded-file-info">
                  ✅ {selectedFile.name}
                </div>
              )}
              <small className="field-hint">PDF files only, max 10MB</small>
            </div>
          )}

          {resourceType === 'video' && (
            <div className="form-group">
              <label htmlFor="videoUrl">Video URL *</label>
              <input
                type="url"
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
              <small className="field-hint">YouTube, Vimeo, or any video link</small>
            </div>
          )}

          {resourceType === 'lesson' && (
            <div className="form-group">
              <label htmlFor="externalUrl">External URL *</label>
              <input
                type="url"
                id="externalUrl"
                value={formData.externalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                placeholder="https://example.com/resource"
                required
              />
              <small className="field-hint">Link to an external resource or activity</small>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Create Resource'}
          </button>
        </form>
      </div>
    </div>
  );
};
