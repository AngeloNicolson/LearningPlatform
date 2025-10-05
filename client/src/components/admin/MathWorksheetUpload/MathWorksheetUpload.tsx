import React, { useState, useEffect } from 'react';
import './MathWorksheetUpload.css';

interface MathTopic {
  id: string;
  name: string;
  icon: string;
}

export const MathWorksheetUpload: React.FC = () => {
  const [topics, setTopics] = useState<MathTopic[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: '',
    gradeLevel: 'Elementary',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchMathTopics();
  }, []);

  const fetchMathTopics = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/math/topics`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setTopics(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, topicId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

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

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
      return;
    }

    if (!formData.topicId) {
      setMessage({ type: 'error', text: 'Please select a topic' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // Step 1: Upload the file
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('topic_id', formData.topicId);
      uploadFormData.append('grade_level', formData.gradeLevel);
      uploadFormData.append('category', 'math');

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/uploads/worksheet`,
        {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = `/api/uploads/download/${uploadResult.document.id}`;

      // Step 2: Create resource entry
      const resourceResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: 'math',
            topic_id: formData.topicId,
            title: formData.title,
            description: formData.description,
            resource_type: 'worksheet',
            grade_level: formData.gradeLevel,
            url: fileUrl,
            visible: true,
          }),
        }
      );

      if (!resourceResponse.ok) {
        throw new Error('Failed to create resource entry');
      }

      setMessage({
        type: 'success',
        text: `Worksheet "${formData.title}" uploaded successfully!`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        topicId: topics[0]?.id || '',
        gradeLevel: 'Elementary',
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('worksheet-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to upload worksheet'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="math-worksheet-upload">
      <div className="upload-header">
        <h2>Upload Math Worksheet</h2>
        <p className="upload-subtitle">Add PDF worksheets to the math resources library</p>
      </div>

      {message && (
        <div className={`upload-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="worksheet-form">
        <div className="form-group">
          <label htmlFor="title">Worksheet Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Linear Equations Practice"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the worksheet content"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="topic">Math Topic *</label>
            <select
              id="topic"
              value={formData.topicId}
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
              required
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.icon} {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade Level *</label>
            <select
              id="grade"
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
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

        <div className="form-group">
          <label htmlFor="worksheet-file">PDF File *</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="worksheet-file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            <div className="file-input-info">
              {selectedFile ? (
                <span className="file-selected">📄 {selectedFile.name}</span>
              ) : (
                <span className="file-placeholder">Choose a PDF file (max 10MB)</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="upload-btn"
          disabled={uploading || !selectedFile}
        >
          {uploading ? 'Uploading...' : 'Upload Worksheet'}
        </button>
      </form>

      <div className="upload-info">
        <h3>Guidelines:</h3>
        <ul>
          <li>Only PDF files are accepted</li>
          <li>Maximum file size: 10MB</li>
          <li>Ensure the worksheet is clear and readable</li>
          <li>Include answer keys as separate uploads</li>
          <li>Use descriptive titles for easy searching</li>
        </ul>
      </div>
    </div>
  );
};
