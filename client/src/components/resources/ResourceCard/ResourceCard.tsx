/**
 * @file ResourceCard.tsx
 * @author Angelo Nicolson
 * @brief Educational resource card display
 * @description Displays individual educational resources (worksheets, videos, lessons) in card format with title, description, type icon, grade level, and action buttons for viewing or downloading.
 */

import React, { useState } from 'react';
import { LessonViewer } from '../LessonViewer/LessonViewer';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { downloadWorksheet } from '../../../services/downloadService';
import './ResourceCard.css';

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'worksheet' | 'quiz' | 'game' | 'lessons' | 'primary-source' | 'experiment' | 'simulation';
  gradeLevel?: string;
  topicName?: string;
  topicIcon?: string;
  contentFormat?: 'markdown' | 'pdf' | 'external';
  action?: 'view_lesson' | 'download' | 'external' | 'view';
  actionUrl?: string;
  showTopicBadge?: boolean;
  documentId?: number;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  description,
  type,
  gradeLevel,
  topicName,
  topicIcon,
  contentFormat,
  action,
  actionUrl,
  showTopicBadge = false,
  documentId
}) => {
  const [showLesson, setShowLesson] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const getTypeIcon = (resourceType: string): string => {
    switch(resourceType) {
      case 'video': return '🎥';
      case 'worksheet': return '📝';
      case 'quiz': return '❓';
      case 'game': return '🎮';
      case 'lessons': return '📚';
      case 'primary-source': return '📜';
      case 'experiment': return '🧪';
      case 'simulation': return '💻';
      default: return '📄';
    }
  };

  const handleAction = async () => {
    if (action === 'view_lesson' || contentFormat === 'markdown') {
      // Show lesson viewer modal
      setShowLesson(true);
    } else if (type === 'video') {
      // Show video player modal
      setShowVideo(true);
    } else if (action === 'download' && type === 'worksheet') {
      // Use authenticated download service for worksheets
      try {
        await downloadWorksheet(id, `${title}.pdf`);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
      }
    } else if (action === 'download' && actionUrl) {
      // Fallback for other download types
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}${actionUrl}`;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (action === 'external' && actionUrl) {
      // Open external link
      window.open(actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getActionButton = () => {
    if (action === 'view_lesson' || contentFormat === 'markdown') {
      return (
        <button className="resource-action view-lesson" onClick={handleAction}>
          📖 Read Lesson
        </button>
      );
    } else if (action === 'download' || (type === 'worksheet' && contentFormat === 'pdf')) {
      return (
        <button className="resource-action download" onClick={handleAction}>
          ⬇️ Download PDF
        </button>
      );
    } else if (action === 'external') {
      return (
        <button className="resource-action external" onClick={handleAction}>
          🔗 Open Link
        </button>
      );
    } else if (type === 'video') {
      return (
        <button className="resource-action watch" onClick={handleAction}>
          ▶️ Watch Video
        </button>
      );
    } else if (type === 'quiz') {
      return (
        <button className="resource-action quiz" onClick={handleAction}>
          ✏️ Take Quiz
        </button>
      );
    } else if (type === 'game') {
      return (
        <button className="resource-action game" onClick={handleAction}>
          🎮 Play Game
        </button>
      );
    }
    
    return (
      <button className="resource-action default" onClick={handleAction}>
        👁️ View
      </button>
    );
  };

  return (
    <>
      <div className="resource-card">
        {showTopicBadge && topicIcon && (
          <div className="resource-topic-badge">
            <span className="badge-icon">{topicIcon}</span>
            <span className="badge-name">{topicName}</span>
          </div>
        )}
        
        <div className="resource-type">
          <span className="type-icon">{getTypeIcon(type)}</span>
          <span className="type-label">{type}</span>
          {contentFormat && (
            <span className="format-badge">{contentFormat.toUpperCase()}</span>
          )}
        </div>
        
        <h3>{title}</h3>
        <p className="resource-description">{description}</p>
        
        <div className="resource-meta">
          {gradeLevel && <span className="grade-level">{gradeLevel}</span>}
        </div>
        
        <div className="resource-actions">
          {getActionButton()}
        </div>
      </div>

      {showLesson && (
        <LessonViewer
          lessonId={id}
          title={title}
          onClose={() => setShowLesson(false)}
        />
      )}

      {showVideo && (
        <VideoPlayer
          videoId={documentId ? documentId.toString() : undefined}
          videoUrl={!documentId && actionUrl ? actionUrl : undefined}
          title={title}
          description={description}
          gradeLevel={gradeLevel}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
};
