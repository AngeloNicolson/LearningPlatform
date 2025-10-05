import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  title?: string;
  readOnly?: boolean;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onSave,
  title,
  readOnly = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(editContent);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Cancel with Escape
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`markdown-editor ${className}`}>
      <div className="markdown-header">
        {title && <h2 className="markdown-title">{title}</h2>}
        
        <div className="markdown-controls">
          {error && <span className="error-message">{error}</span>}
          
          {isEditing ? (
            <>
              <button 
                className="control-btn save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="control-btn cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            !readOnly && (
              <button 
                className="control-btn edit-btn"
                onClick={handleEdit}
              >
                ✏️ Edit
              </button>
            )
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="markdown-edit-mode">
          <textarea
            className="markdown-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your markdown content here..."
            autoFocus
          />
          <div className="edit-help">
            <small>
              <strong>Shortcuts:</strong> Ctrl+S to save, Escape to cancel
            </small>
          </div>
        </div>
      ) : (
        <div className="markdown-view-mode">
          <ReactMarkdown
            className="markdown-content"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeHighlight,
              rehypeSanitize, // SECURITY: Sanitizes HTML to prevent XSS
            ]}
            components={{
              // Custom component styling
              h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
              h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              p: ({ children }) => <p className="md-p">{children}</p>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
              blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
              code: ({ inline, children }) => 
                inline ? 
                  <code className="md-code-inline">{children}</code> : 
                  <code className="md-code-block">{children}</code>,
              pre: ({ children }) => <pre className="md-pre">{children}</pre>,
              table: ({ children }) => <table className="md-table">{children}</table>,
              th: ({ children }) => <th className="md-th">{children}</th>,
              td: ({ children }) => <td className="md-td">{children}</td>,
              a: ({ href, children }) => (
                <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};