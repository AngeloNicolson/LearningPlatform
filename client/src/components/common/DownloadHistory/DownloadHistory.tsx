/**
 * @file DownloadHistory.tsx
 * @author Angelo Nicolson
 * @brief User download history component with re-download functionality
 * @description Displays a user's worksheet download history with metadata including download dates, subjects, and topics.
 * Provides quick re-download buttons for previously downloaded resources and handles pagination for large histories.
 * Styled with retro terminal theme and includes empty state messaging.
 */

import React, { useState, useEffect } from 'react';
import { getDownloadHistory } from '../../../services/downloadService';
import './DownloadHistory.css';

interface DownloadRecord {
  id: number;
  resource_id: string;
  downloaded_at: string;
  title: string;
  description: string;
  subject: string;
  topic_name: string;
  topic_icon: string;
  resource_type: string;
  grade_level: string;
}

interface DownloadHistoryProps {
  onDownload?: (resourceId: string, title: string) => void;
  limit?: number;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  onDownload,
  limit = 10
}) => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDownloadHistory();
  }, []);

  const fetchDownloadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDownloadHistory();
      setDownloads(response.downloads.slice(0, limit));
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load download history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  const handleRedownload = (resourceId: string, title: string) => {
    if (onDownload) {
      onDownload(resourceId, title);
    }
  };

  if (isLoading) {
    return (
      <div className="download-history loading">
        <div className="loading-text">Loading download history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="download-history error">
        <div className="error-text">✗ {error}</div>
        <button onClick={fetchDownloadHistory} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="download-history empty">
        <div className="empty-icon">📥</div>
        <div className="empty-text">No downloads yet</div>
        <div className="empty-subtext">Start exploring resources to build your library</div>
      </div>
    );
  }

  return (
    <div className="download-history">
      <div className="history-header">
        <h3>Recent Downloads</h3>
        <span className="download-count">{total} total</span>
      </div>

      <div className="history-list">
        {downloads.map((download) => (
          <div key={download.id} className="history-item">
            <div className="history-icon">
              {download.topic_icon || '📄'}
            </div>

            <div className="history-content">
              <div className="history-title">{download.title}</div>
              <div className="history-meta">
                <span className="history-subject">{download.subject}</span>
                {download.topic_name && (
                  <>
                    <span className="history-separator">•</span>
                    <span className="history-topic">{download.topic_name}</span>
                  </>
                )}
                {download.grade_level && (
                  <>
                    <span className="history-separator">•</span>
                    <span className="history-grade">{download.grade_level}</span>
                  </>
                )}
              </div>
              <div className="history-date">{formatDate(download.downloaded_at)}</div>
            </div>

            <button
              className="redownload-btn"
              onClick={() => handleRedownload(download.resource_id, download.title)}
              title="Download again"
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      {total > limit && (
        <div className="history-footer">
          <button className="view-all-btn" onClick={() => console.log('View all history')}>
            View All {total} Downloads →
          </button>
        </div>
      )}
    </div>
  );
};
