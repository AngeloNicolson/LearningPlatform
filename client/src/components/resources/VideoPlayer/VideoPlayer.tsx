/**
 * @file VideoPlayer.tsx
 * @author Angelo Nicolson
 * @brief Video player modal component with streaming support
 * @description Displays educational videos in a modal overlay with HTML5 video player controls. Supports video streaming
 * with HTTP range requests for seeking, provides loading states, error handling, and displays video metadata.
 * Includes keyboard controls (Escape to close) and responsive design for mobile devices.
 */

import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  videoId?: string;
  videoUrl?: string;
  title: string;
  onClose: () => void;
  description?: string;
  subject?: string;
  gradeLevel?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  videoUrl,
  title,
  onClose,
  description,
  subject,
  gradeLevel
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Helper function to convert YouTube/Vimeo URLs to embed format
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const isExternalVideo = !!videoUrl;
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  const streamUrl = videoId ? `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/uploads/stream/${videoId}` : null;

  useEffect(() => {
    // Handle ESC key to close
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleVideoLoaded = () => {
    setLoading(false);
    setError(null);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setLoading(false);
    setError('Failed to load video. The file may be corrupted or in an unsupported format.');
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div
      className="video-player-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="video-player-modal">
        <div className="video-player-header">
          <h2 className="video-player-title">🎥 {title}</h2>
          <button
            className="video-player-close"
            onClick={onClose}
            aria-label="Close video player"
          >
            ✕ Close
          </button>
        </div>

        <div className="video-player-container">
          {loading && (
            <div className="video-player-loading">
              <div className="video-player-loading-spinner">⏳</div>
              <div className="video-player-loading-text">Loading video...</div>
            </div>
          )}

          {error && (
            <div className="video-player-error">
              <div className="video-player-error-icon">⚠️</div>
              <div className="video-player-error-message">Video Error</div>
              <div className="video-player-error-details">{error}</div>
            </div>
          )}

          {isExternalVideo && embedUrl ? (
            // YouTube/Vimeo embedded player
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoaded}
              style={{
                width: '100%',
                height: '70vh',
                maxHeight: '70vh',
                border: 'none',
                display: loading ? 'none' : 'block'
              }}
            />
          ) : isExternalVideo && videoUrl ? (
            // Direct video URL (not YouTube/Vimeo)
            <video
              ref={videoRef}
              controls
              controlsList="nodownload"
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              style={{ display: loading ? 'none' : 'block' }}
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          ) : streamUrl ? (
            // Uploaded video from our server
            <video
              ref={videoRef}
              controls
              controlsList="nodownload"
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              style={{ display: loading ? 'none' : 'block' }}
            >
              <source src={streamUrl} type="video/mp4" />
              <source src={streamUrl} type="video/webm" />
              <source src={streamUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>

        {description && (
          <div className="video-player-info">
            <div style={{ marginBottom: '8px', color: 'var(--text-primary, #e0e0e0)' }}>
              {description}
            </div>
            <div className="video-player-meta">
              {subject && (
                <div className="video-player-meta-item">
                  <span className="video-player-meta-label">Subject:</span>
                  <span className="video-player-meta-value">{subject}</span>
                </div>
              )}
              {gradeLevel && (
                <div className="video-player-meta-item">
                  <span className="video-player-meta-label">Grade:</span>
                  <span className="video-player-meta-value">{gradeLevel}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
