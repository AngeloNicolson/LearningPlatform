/**
 * @file LessonViewer.tsx
 * @author Angelo Nicolson
 * @brief Lesson content viewer with markdown rendering
 * @description Renders lesson content with markdown support, MathJax integration for mathematical notation, and formatted educational material display with syntax highlighting.
 */

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './LessonViewer.css';

interface LessonViewerProps {
  lessonId?: string;
  markdownContent?: string;
  title?: string;
  onClose?: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ 
  lessonId, 
  markdownContent, 
  title,
  onClose 
}) => {
  const [content, setContent] = useState<string>(markdownContent || '');
  const [lessonTitle, setLessonTitle] = useState<string>(title || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    if (lessonId && !markdownContent) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    if (!lessonId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/content/lesson/${lessonId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load lesson');
      }
      
      const data = await response.json();
      setContent(data.lesson.markdown_content || '');
      setLessonTitle(data.lesson.title || 'Untitled Lesson');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const handleExportPDF = () => {
    // This would require a library like jsPDF or html2pdf
    // For now, we'll use the browser's print to PDF functionality
    window.print();
  };

  if (loading) {
    return (
      <div className="lesson-viewer-container">
        <div className="lesson-loading">
          <div className="loading-spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-viewer-container">
        <div className="lesson-error">
          <p>Error: {error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-viewer-container">
      <div className="lesson-viewer">
        <div className="lesson-header no-print">
          <h1>{lessonTitle}</h1>
          <div className="lesson-controls">
            <div className="font-controls">
              <button onClick={decreaseFontSize} title="Decrease font size">
                A-
              </button>
              <span>{fontSize}px</span>
              <button onClick={increaseFontSize} title="Increase font size">
                A+
              </button>
            </div>
            <button onClick={handlePrint} className="print-btn">
              🖨️ Print
            </button>
            <button onClick={handleExportPDF} className="export-btn">
              📄 Export PDF
            </button>
            {onClose && (
              <button onClick={onClose} className="close-btn">
                ✕ Close
              </button>
            )}
          </div>
        </div>

        <div 
          className="lesson-content" 
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="lesson-title-print">
            <h1>{lessonTitle}</h1>
          </div>
          
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Custom rendering for various markdown elements
              h1: ({children}) => <h1 className="lesson-h1">{children}</h1>,
              h2: ({children}) => <h2 className="lesson-h2">{children}</h2>,
              h3: ({children}) => <h3 className="lesson-h3">{children}</h3>,
              h4: ({children}) => <h4 className="lesson-h4">{children}</h4>,
              p: ({children}) => <p className="lesson-paragraph">{children}</p>,
              ul: ({children}) => <ul className="lesson-list">{children}</ul>,
              ol: ({children}) => <ol className="lesson-list ordered">{children}</ol>,
              li: ({children}) => <li className="lesson-list-item">{children}</li>,
              blockquote: ({children}) => (
                <blockquote className="lesson-blockquote">{children}</blockquote>
              ),
              code: ({className, children, ...props}) => {
                const inline = !className?.startsWith('language-');
                const match = /language-(\w+)/.exec(className || '');
                return inline ? (
                  <code className="lesson-code-inline">{children}</code>
                ) : (
                  <pre className={`lesson-code-block ${match ? `language-${match[1]}` : ''}`}>
                    <code>{children}</code>
                  </pre>
                );
              },
              table: ({children}) => (
                <div className="lesson-table-wrapper">
                  <table className="lesson-table">{children}</table>
                </div>
              ),
              img: ({src, alt}) => (
                <figure className="lesson-figure">
                  <img src={src} alt={alt} className="lesson-image" />
                  {alt && <figcaption>{alt}</figcaption>}
                </figure>
              ),
              a: ({href, children}) => (
                <a href={href} className="lesson-link" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        <div className="lesson-footer no-print">
          <p className="lesson-info">
            Press Ctrl+P (or Cmd+P on Mac) to print this lesson
          </p>
        </div>
      </div>
    </div>
  );
};
