import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { renderMath } from '../../../utils/mathjax';
import { EquationEditor } from '../EquationEditor/EquationEditor';
import './MarkdownEditor.css';

interface MathMarkdownEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  title?: string;
  readOnly?: boolean;
  className?: string;
  enableMath?: boolean;
}

const MathComponent: React.FC<{ children: string }> = ({ children }) => {
  const mathRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mathRef.current) {
      renderMath(mathRef.current);
    }
  }, [children]);

  return <span ref={mathRef}>{children}</span>;
};

export const MathMarkdownEditor: React.FC<MathMarkdownEditorProps> = ({
  content,
  onSave,
  title,
  readOnly = false,
  className = '',
  enableMath = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEquationEditor, setShowEquationEditor] = useState(false);
  const [equationValue, setEquationValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
    setError(null);
    setShowEquationEditor(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(editContent);
      setIsEditing(false);
      setShowEquationEditor(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const insertEquation = () => {
    if (textareaRef.current && equationValue.trim()) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const mathExpression = `$$${equationValue}$$`;
      const newContent = editContent.substring(0, start) + mathExpression + editContent.substring(end);
      
      setEditContent(newContent);
      setEquationValue('');
      setShowEquationEditor(false);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + mathExpression.length, start + mathExpression.length);
      }, 0);
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

  // Custom renderer for math expressions
  const renderMarkdownWithMath = (text: string) => {
    if (!enableMath) {
      return (
        <ReactMarkdown
          className="markdown-content"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        >
          {text}
        </ReactMarkdown>
      );
    }

    // Split text by math expressions
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Display math
        const mathContent = part.slice(2, -2);
        elements.push(
          <div key={index} className="math-display">
            <MathComponent>{`\\[${mathContent}\\]`}</MathComponent>
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const mathContent = part.slice(1, -1);
        elements.push(
          <span key={index} className="math-inline">
            <MathComponent>{`\\(${mathContent}\\)`}</MathComponent>
          </span>
        );
      } else if (part.trim()) {
        // Regular markdown
        elements.push(
          <ReactMarkdown
            key={index}
            className="markdown-content"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          >
            {part}
          </ReactMarkdown>
        );
      }
    });

    return <div>{elements}</div>;
  };

  return (
    <div className={`markdown-editor ${className}`}>
      <div className="markdown-header">
        {title && <h2 className="markdown-title">{title}</h2>}
        
        <div className="markdown-controls">
          {error && <span className="error-message">{error}</span>}
          
          {isEditing ? (
            <>
              {enableMath && (
                <button 
                  className="control-btn equation-btn"
                  onClick={() => setShowEquationEditor(!showEquationEditor)}
                  type="button"
                >
                  📐 Equation
                </button>
              )}
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

      {isEditing && showEquationEditor && enableMath && (
        <div className="equation-editor-panel">
          <EquationEditor
            value={equationValue}
            onChange={setEquationValue}
            placeholder="Enter LaTeX equation..."
          />
          <div className="equation-controls">
            <button 
              className="control-btn"
              onClick={insertEquation}
              disabled={!equationValue.trim()}
            >
              Insert Equation
            </button>
            <button 
              className="control-btn cancel-btn"
              onClick={() => setShowEquationEditor(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="markdown-edit-mode">
          <textarea
            ref={textareaRef}
            className="markdown-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={enableMath ? 
              "Enter your markdown content here...\n\nMath syntax:\n• Inline: $x^2 + y^2 = z^2$\n• Display: $$\\int_{a}^{b} f(x)dx$$" : 
              "Enter your markdown content here..."
            }
            autoFocus
          />
          <div className="edit-help">
            <small>
              <strong>Shortcuts:</strong> Ctrl+S to save, Escape to cancel
              {enableMath && <span> | Use $...$ for inline math, $$...$$ for display math</span>}
            </small>
          </div>
        </div>
      ) : (
        <div className="markdown-view-mode">
          {renderMarkdownWithMath(content)}
        </div>
      )}
    </div>
  );
};

export default MathMarkdownEditor;