import React, { useState, useEffect } from 'react';
import { TopicMetadata } from '../../../types/storage';
import { MarkdownEditor } from '../../editors/MarkdownEditor/MarkdownEditor';
import apiService from '../../../services/ApiService';
import './TopicWorkspace.css';

interface TopicWorkspaceProps {
  topic: TopicMetadata;
  onClose: () => void;
}

export const TopicWorkspace: React.FC<TopicWorkspaceProps> = ({ topic, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'position' | 'arguments' | 'evidence'>('overview');
  const [overview, setOverview] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopicData();
  }, [topic.id]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewContent, positionContent] = await Promise.all([
        apiService.getTopicOverview(topic.id),
        apiService.getTopicPosition(topic.id)
      ]);
      
      setOverview(overviewContent);
      setPosition(positionContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topic data');
    } finally {
      setLoading(false);
    }
  };

  const handleOverviewSave = async (content: string) => {
    try {
      await apiService.updateTopicOverview(topic.id, content);
      setOverview(content); // Update local state after successful save
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save overview');
    }
  };

  const handlePositionSave = async (content: string) => {
    try {
      await apiService.updateTopicPosition(topic.id, content);
      setPosition(content); // Update local state after successful save
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save position');
    }
  };

  if (loading) {
    return (
      <div className="topic-workspace">
        <div className="workspace-header">
          <div className="workspace-title">
            <h2>{topic.title}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="workspace-loading">
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-workspace">
      <div className="workspace-header">
        <div className="workspace-title">
          <h2>{topic.title}</h2>
          <span className="topic-category">{topic.category}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <nav className="workspace-tabs">
          <button 
            className={activeTab === 'overview' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'position' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('position')}
          >
            My Position
          </button>
          <button 
            className={activeTab === 'arguments' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('arguments')}
          >
            Arguments
          </button>
          <button 
            className={activeTab === 'evidence' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('evidence')}
          >
            Evidence
          </button>
        </nav>
      </div>

      {error && (
        <div className="workspace-error">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="workspace-content">
        {activeTab === 'overview' && (
          <MarkdownEditor
            content={overview}
            onSave={handleOverviewSave}
            title="Topic Overview"
            className="workspace-editor"
          />
        )}

        {activeTab === 'position' && (
          <MarkdownEditor
            content={position}
            onSave={handlePositionSave}
            title="My Position"
            className="workspace-editor"
          />
        )}

        {activeTab === 'arguments' && (
          <div className="editor-section">
            <div className="editor-header">
              <h3>Arguments</h3>
              <button className="add-btn">Add Argument</button>
            </div>
            <div className="coming-soon">
              <h4>Structured Arguments Coming Soon</h4>
              <p>This will include:</p>
              <ul>
                <li>Argument templates and organization</li>
                <li>Evidence linking and citation</li>
                <li>Argument strength scoring</li>
                <li>Counter-argument preparation</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="editor-section">
            <div className="editor-header">
              <h3>Evidence</h3>
              <button className="add-btn">Add Evidence</button>
            </div>
            <div className="coming-soon">
              <h4>Evidence Management Coming Soon</h4>
              <p>This will include:</p>
              <ul>
                <li>Research collection and organization</li>
                <li>Source credibility tracking</li>
                <li>Citation management</li>
                <li>Evidence search and filtering</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};