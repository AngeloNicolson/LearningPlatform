import React, { useState } from 'react';
import storageService from '../services/StorageService';
import './DirectoryPicker.css';

interface DirectoryPickerProps {
  onDirectorySelected: (directoryName: string) => void;
  onError: (error: string) => void;
}

export const DirectoryPicker: React.FC<DirectoryPickerProps> = ({ onDirectorySelected, onError }) => {
  const [isPickingDirectory, setIsPickingDirectory] = useState(false);
  const isFileSystemSupported = storageService.isFileSystemApiSupported();

  const handleSelectDirectory = async () => {
    setIsPickingDirectory(true);
    
    try {
      if (isFileSystemSupported) {
        // Chrome/Edge: Use File System Access API
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        onDirectorySelected(dirHandle.name);
      } else {
        // Firefox: Just indicate we'll use downloads
        onDirectorySelected('Downloads folder (as individual files)');
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled - don't show error
        console.log('User cancelled directory selection');
      } else if (error.name === 'NotSupportedError') {
        onError('File System Access API not supported. Using download fallback.');
      } else {
        onError(`Failed to select directory: ${error.message}`);
      }
    } finally {
      setIsPickingDirectory(false);
    }
  };

  return (
    <div className="directory-picker">
      <div className="directory-picker-content">
        <div className="directory-picker-icon">
          📁
        </div>
        <h3>{isFileSystemSupported ? 'Choose Your Debate Files Location' : 'Get Your Debate Files'}</h3>
        <p>
          {isFileSystemSupported 
            ? 'Select a folder on your computer where DebateRank will create your debate preparation files. This creates real .md files that you can open in any text editor or Obsidian.'
            : 'DebateRank will download your debate preparation files as organized ZIP archives to your Downloads folder. Extract the ZIP files to get proper folder structures for each topic.'
          }
        </p>
        <div className="directory-picker-features">
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Real markdown files on your computer</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Compatible with Obsidian and other editors</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>{isFileSystemSupported ? 'Organized folder structure per topic' : 'ZIP archives with complete folder structure'}</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Your data stays on your device</span>
          </div>
        </div>
        <button 
          className="select-directory-btn"
          onClick={handleSelectDirectory}
          disabled={isPickingDirectory}
        >
          {isPickingDirectory 
            ? (isFileSystemSupported ? 'Selecting Directory...' : 'Setting up...') 
            : (isFileSystemSupported ? 'Select Folder' : 'Continue')
          }
        </button>
        <p className="directory-picker-note">
          <strong>Note:</strong> {isFileSystemSupported 
            ? 'This feature requires a modern browser like Chrome or Edge. The browser will ask for permission to read and write files in your chosen folder.'
            : 'Firefox support: ZIP files will be downloaded to your Downloads folder. Extract them to get organized folder structures. For direct folder integration, try Chrome or Edge.'
          }
        </p>
      </div>
    </div>
  );
};