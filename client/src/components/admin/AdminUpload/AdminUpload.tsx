/**
 * @file AdminUpload.tsx
 * @author Angelo Nicolson
 * @brief General resource upload interface
 * @description Administrative interface for uploading various educational resources with file selection, metadata entry, categorization by subject/topic, and upload progress tracking.
 */

import React, { useState } from 'react';
import { authFetch } from '../../../utils/authFetch';
import { FileUpload } from '../../common/FileUpload/FileUpload';
import './AdminUpload.css';

interface AdminUploadProps {
  onClose?: () => void;
}

export const AdminUpload: React.FC<AdminUploadProps> = ({ onClose }) => {
  const [uploadType, setUploadType] = useState<'lesson' | 'worksheet'>('lesson');
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    markdownContent: '',
    subtopicId: '',
    gradeLevel: 'Elementary'
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await authFetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/content/lesson`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: lessonData.title,
            description: lessonData.description,
            markdown_content: lessonData.markdownContent,
            subtopic_id: lessonData.subtopicId || null,
            grade_level: lessonData.gradeLevel
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save lesson');
      }

      await response.json();
      setMessage({ type: 'success', text: 'Lesson saved successfully!' });
      
      // Reset form
      setLessonData({
        title: '',
        description: '',
        markdownContent: '',
        subtopicId: '',
        gradeLevel: 'Elementary'
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save lesson. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleWorksheetUpload = (responses: any[]) => {
    setUploadedFiles(responses);
    if (responses.length > 0) {
      setMessage({ type: 'success', text: `${responses.length} file(s) uploaded successfully!` });
    }
  };

  const insertMarkdownElement = (element: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = lessonData.markdownContent.substring(start, end);
    
    let insertion = '';
    switch(element) {
      case 'bold':
        insertion = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        insertion = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading1':
        insertion = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'heading2':
        insertion = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'heading3':
        insertion = `\n### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'list':
        insertion = `\n- ${selectedText || 'List item 1'}\n- List item 2\n- List item 3\n`;
        break;
      case 'numbered':
        insertion = `\n1. ${selectedText || 'Item 1'}\n2. Item 2\n3. Item 3\n`;
        break;
      case 'link':
        insertion = `[${selectedText || 'Link text'}](https://example.com)`;
        break;
      case 'code':
        insertion = `\`${selectedText || 'code'}\``;
        break;
      case 'codeblock':
        insertion = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
        break;
      case 'quote':
        insertion = `\n> ${selectedText || 'Quote text'}\n`;
        break;
      case 'table':
        insertion = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
        break;
      case 'math':
        insertion = `$${selectedText || 'x^2 + y^2 = z^2'}$`;
        break;
      case 'mathblock':
        insertion = `\n$$\n${selectedText || '\\frac{1}{2} \\cdot \\sum_{i=1}^{n} x_i'}\n$$\n`;
        break;
    }

    const newContent = 
      lessonData.markdownContent.substring(0, start) +
      insertion +
      lessonData.markdownContent.substring(end);

    setLessonData(prev => ({ ...prev, markdownContent: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = start + insertion.length;
      textarea.selectionEnd = start + insertion.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="admin-upload-container">
      <div className="admin-upload">
        <div className="admin-upload-header">
          <h1>Upload Educational Content</h1>
          {onClose && (
            <button className="close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        <div className="upload-type-selector">
          <button
            className={`type-btn ${uploadType === 'lesson' ? 'active' : ''}`}
            onClick={() => setUploadType('lesson')}
          >
            📚 Create Lesson
          </button>
          <button
            className={`type-btn ${uploadType === 'worksheet' ? 'active' : ''}`}
            onClick={() => setUploadType('worksheet')}
          >
            📝 Upload Worksheet
          </button>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {uploadType === 'lesson' ? (
          <form className="lesson-form" onSubmit={handleLessonSubmit}>
            <div className="form-group">
              <label htmlFor="title">Lesson Title *</label>
              <input
                type="text"
                id="title"
                value={lessonData.title}
                onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Enter lesson title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={lessonData.description}
                onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the lesson"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subtopic">Subject/Topic</label>
                <input
                  type="text"
                  id="subtopic"
                  value={lessonData.subtopicId}
                  onChange={(e) => setLessonData(prev => ({ ...prev, subtopicId: e.target.value }))}
                  placeholder="e.g., math-arithmetic"
                />
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade Level</label>
                <select
                  id="grade"
                  value={lessonData.gradeLevel}
                  onChange={(e) => setLessonData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                >
                  <option value="Elementary">Elementary</option>
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="markdown-editor">Lesson Content (Markdown) *</label>
              <div className="markdown-toolbar">
                <button type="button" onClick={() => insertMarkdownElement('bold')} title="Bold">B</button>
                <button type="button" onClick={() => insertMarkdownElement('italic')} title="Italic">I</button>
                <div className="toolbar-separator" />
                <button type="button" onClick={() => insertMarkdownElement('heading1')} title="Heading 1">H1</button>
                <button type="button" onClick={() => insertMarkdownElement('heading2')} title="Heading 2">H2</button>
                <button type="button" onClick={() => insertMarkdownElement('heading3')} title="Heading 3">H3</button>
                <div className="toolbar-separator" />
                <button type="button" onClick={() => insertMarkdownElement('list')} title="Bullet List">•</button>
                <button type="button" onClick={() => insertMarkdownElement('numbered')} title="Numbered List">1.</button>
                <button type="button" onClick={() => insertMarkdownElement('quote')} title="Quote">"</button>
                <div className="toolbar-separator" />
                <button type="button" onClick={() => insertMarkdownElement('link')} title="Link">🔗</button>
                <button type="button" onClick={() => insertMarkdownElement('code')} title="Inline Code">&lt;&gt;</button>
                <button type="button" onClick={() => insertMarkdownElement('codeblock')} title="Code Block">{ }</button>
                <button type="button" onClick={() => insertMarkdownElement('table')} title="Table">⊞</button>
                <div className="toolbar-separator" />
                <button type="button" onClick={() => insertMarkdownElement('math')} title="Math">∑</button>
                <button type="button" onClick={() => insertMarkdownElement('mathblock')} title="Math Block">∫</button>
              </div>
              <textarea
                id="markdown-editor"
                value={lessonData.markdownContent}
                onChange={(e) => setLessonData(prev => ({ ...prev, markdownContent: e.target.value }))}
                required
                placeholder="Write your lesson content in Markdown format..."
                rows={15}
              />
              <div className="markdown-help">
                Supports Markdown formatting, tables, math (LaTeX), and code blocks
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Lesson'}
            </button>
          </form>
        ) : (
          <div className="worksheet-upload">
            <p className="upload-info">
              Upload PDF worksheets that students can download and print. 
              These are perfect for homework, practice exercises, and offline activities.
            </p>
            
            <FileUpload
              uploadType="worksheet"
              accept=".pdf,.doc,.docx"
              multiple={true}
              maxSize={20}
              onUploadComplete={handleWorksheetUpload}
            />

            {uploadedFiles.length > 0 && (
              <div className="uploaded-list">
                <h3>Recently Uploaded</h3>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="uploaded-item">
                    ✅ {file.document?.title || 'Document uploaded'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
