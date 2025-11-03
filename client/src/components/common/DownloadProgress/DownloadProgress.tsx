/**
 * @file DownloadProgress.tsx
 * @author Angelo Nicolson
 * @brief Download progress indicator with cancel functionality
 * @description Displays a progress bar for active downloads showing percentage, file size, and download speed.
 * Provides a cancel button to abort downloads and shows success/error states. Styled with retro terminal theme
 * to match the application's aesthetic.
 */

import React from 'react';
import './DownloadProgress.css';

export interface DownloadProgressProps {
  filename: string;
  loaded: number;
  total: number;
  percentage: number;
  onCancel?: () => void;
  status?: 'downloading' | 'success' | 'error';
  error?: string;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  filename,
  loaded,
  total,
  percentage,
  onCancel,
  status = 'downloading',
  error
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '↓';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Download Complete';
      case 'error':
        return error || 'Download Failed';
      case 'downloading':
        return `${formatBytes(loaded)} / ${formatBytes(total)}`;
    }
  };

  return (
    <div className={`download-progress ${status}`}>
      <div className="download-header">
        <span className="download-icon">{getStatusIcon()}</span>
        <span className="download-filename">{filename}</span>
        {status === 'downloading' && onCancel && (
          <button
            className="download-cancel"
            onClick={onCancel}
            title="Cancel download"
          >
            ✕
          </button>
        )}
      </div>

      {status === 'downloading' && (
        <>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
            <span className="progress-percentage">{percentage}%</span>
          </div>
          <div className="download-status">{getStatusText()}</div>
        </>
      )}

      {status === 'success' && (
        <div className="download-complete">✓ {filename} downloaded successfully</div>
      )}

      {status === 'error' && (
        <div className="download-error">✗ {getStatusText()}</div>
      )}
    </div>
  );
};
