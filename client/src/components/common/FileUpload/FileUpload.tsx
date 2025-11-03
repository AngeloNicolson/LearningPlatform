/**
 * @file FileUpload.tsx
 * @author Angelo Nicolson
 * @brief File upload component with drag-and-drop
 * @description Reusable file upload component supporting drag-and-drop, file type validation, size limits, and upload progress indication for various file types.
 */

import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  uploadType: 'worksheet' | 'image' | 'lesson';
  onUpload?: (files: File[]) => void;
  onUploadComplete?: (responses: any[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  multiple = false,
  maxSize = 10,
  uploadType,
  onUpload,
  onUploadComplete
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} exceeds maximum size of ${maxSize}MB`;
    }

    // Check file type based on uploadType
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (uploadType === 'worksheet') {
      if (!['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
        return `File ${file.name} must be a PDF or Word document`;
      }
    } else if (uploadType === 'image') {
      if (!['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension || '')) {
        return `File ${file.name} must be an image`;
      }
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);
    
    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }

    if (onUpload && validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrors([]);
    const responses: any[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Determine the upload endpoint
        let endpoint = '';
        if (uploadType === 'worksheet') {
          endpoint = '/uploads/worksheet';
        } else if (uploadType === 'image') {
          endpoint = '/uploads/image';
        }

        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: percentComplete
            }));
          }
        });

        // Handle completion
        const response = await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));

          xhr.open('POST', `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}${endpoint}`);
          xhr.withCredentials = true; // Include authentication cookies
          xhr.send(formData);
        });

        responses.push(response);
      } catch (error) {
        setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
      }
    }

    setUploading(false);
    setUploadProgress({});
    
    if (onUploadComplete && responses.length > 0) {
      onUploadComplete(responses);
      setFiles([]); // Clear files after successful upload
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="file-upload-input"
        />
        
        <div className="file-upload-content">
          <div className="file-upload-icon">📁</div>
          <p className="file-upload-text">
            Drag and drop files here or click to browse
          </p>
          <p className="file-upload-hint">
            {uploadType === 'worksheet' && 'Accepts PDF and Word documents'}
            {uploadType === 'image' && 'Accepts PNG, JPG, JPEG, GIF images'}
            {uploadType === 'lesson' && 'Create lessons using the lesson editor'}
            {` (Max ${maxSize}MB per file)`}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="file-upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="file-upload-error">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="file-upload-list">
          <h3>Selected Files</h3>
          {files.map((file, index) => (
            <div key={index} className="file-upload-item">
              <div className="file-info">
                <span className="file-icon">{getFileIcon(file)}</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              
              {uploadProgress[file.name] !== undefined && (
                <div className="file-progress">
                  <div 
                    className="file-progress-bar" 
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  />
                </div>
              )}
              
              {!uploading && (
                <button 
                  className="file-remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button 
            className="file-upload-button"
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
};
