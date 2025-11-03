/**
 * @file downloadService.ts
 * @author Angelo Nicolson
 * @brief File download service with progress tracking and rate limiting
 * @description Provides comprehensive download functionality for worksheets and documents with optional authentication,
 * progress tracking, preview support, error handling, retry logic, and rate limiting (10 downloads per hour).
 * Handles mobile-specific download requirements and integrates with the download history tracking system.
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3777/api';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
  onSuccess?: (filename: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * Download a worksheet with progress tracking (rate limited to 10 per hour)
 */
export async function downloadWorksheet(
  resourceId: string,
  filename?: string,
  options?: DownloadOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track progress
    xhr.addEventListener('progress', (e) => {
      if (e.lengthComputable && options?.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100)
        });
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        try {
          // Get filename from Content-Disposition header or use provided filename
          const disposition = xhr.getResponseHeader('Content-Disposition');
          let downloadFilename = filename || 'worksheet.pdf';

          if (disposition && disposition.includes('filename=')) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
            if (matches && matches[1]) {
              downloadFilename = matches[1].replace(/['"]/g, '');
            }
          }

          // Create blob and trigger download
          const blob = new Blob([xhr.response], {
            type: xhr.getResponseHeader('Content-Type') || 'application/pdf'
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // Track download
          await trackDownload(resourceId);

          if (options?.onSuccess) {
            options.onSuccess(downloadFilename);
          }
          resolve();
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Download failed');
          if (options?.onError) {
            options.onError(err);
          }
          reject(err);
        }
      } else if (xhr.status === 429) {
        const error = new Error('Download limit reached. You can download up to 10 worksheets per hour.');
        if (options?.onError) {
          options.onError(error);
        }
        reject(error);
      } else if (xhr.status === 404) {
        const error = new Error('Worksheet not found.');
        if (options?.onError) {
          options.onError(error);
        }
        reject(error);
      } else {
        const error = new Error(`Download failed: ${xhr.statusText}`);
        if (options?.onError) {
          options.onError(error);
        }
        reject(error);
      }
    });

    xhr.addEventListener('error', () => {
      const error = new Error('Network error occurred during download');
      if (options?.onError) {
        options.onError(error);
      }
      reject(error);
    });

    xhr.addEventListener('abort', () => {
      const error = new Error('Download cancelled');
      if (options?.onError) {
        options.onError(error);
      }
      reject(error);
    });

    // Setup request
    xhr.open('GET', `${API_URL}/resources/download/${resourceId}`);
    xhr.responseType = 'arraybuffer';
    xhr.withCredentials = true; // Important for cookies

    // Handle abort signal
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    }

    xhr.send();
  });
}

/**
 * Download with retry logic (up to 3 attempts)
 */
export async function downloadWithRetry(
  resourceId: string,
  filename?: string,
  options?: DownloadOptions,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await downloadWorksheet(resourceId, filename, options);
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Download failed');

      // Don't retry on 404 (not found) or 429 (rate limit)
      if (lastError.message.includes('not found') || lastError.message.includes('limit reached')) {
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError || new Error('Download failed after retries');
}

/**
 * Get preview URL for worksheet (opens in new tab)
 */
export function getPreviewUrl(resourceId: string): string {
  return `${API_URL}/resources/download/${resourceId}`;
}

/**
 * Open worksheet preview in new tab
 */
export function previewWorksheet(resourceId: string): void {
  // For PDF, the browser will display it inline if possible
  const url = getPreviewUrl(resourceId);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Share worksheet using Web Share API (mobile)
 */
export async function shareWorksheet(
  resourceId: string,
  title: string
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  try {
    // Fetch the file
    const response = await fetch(`${API_URL}/resources/download/${resourceId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch worksheet');
    }

    const blob = await response.blob();
    const file = new File([blob], `${title}.pdf`, { type: 'application/pdf' });

    await navigator.share({
      title: title,
      text: `Check out this worksheet: ${title}`,
      files: [file]
    });

    // Track download
    await trackDownload(resourceId);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled share
      return;
    }
    throw error;
  }
}

/**
 * Check if device supports native share
 */
export function canShare(): boolean {
  return 'share' in navigator && navigator.canShare !== undefined;
}

/**
 * Detect if running on mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Track download event for analytics
 */
async function trackDownload(resourceId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/downloads/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ resourceId })
    });
  } catch (error) {
    // Don't fail download if tracking fails
    console.error('Failed to track download:', error);
  }
}

/**
 * Get user's download history
 */
export async function getDownloadHistory(): Promise<{
  downloads: any[];
  total: number;
  limit: number;
  offset: number;
}> {
  const response = await fetch(`${API_URL}/downloads/history`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch download history');
  }

  return response.json();
}

/**
 * Get popular/most downloaded worksheets
 */
export async function getPopularDownloads(limit: number = 10): Promise<any[]> {
  const response = await fetch(`${API_URL}/downloads/popular?limit=${limit}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular downloads');
  }

  return response.json();
}
