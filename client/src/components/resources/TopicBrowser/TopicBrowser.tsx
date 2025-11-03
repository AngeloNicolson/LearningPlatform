/**
 * @file TopicBrowser.tsx
 * @author Angelo Nicolson
 * @brief Topic browsing interface with filtering
 * @description Provides interface for browsing educational topics with filtering, search, and categorization. Displays topics in organized grid with icons and descriptions.
 */

import React, { useState, useEffect } from 'react';
import { useDebateCore } from '../../../hooks/useDebateCore';
import { Topic, UserBelief } from '../../../types/wasm';
import './TopicBrowser.css';

interface TopicBrowserProps {
  onTopicSelect: (topic: Topic) => void;
}

export const TopicBrowser: React.FC<TopicBrowserProps> = ({ onTopicSelect }) => {
  const { isReady, getTopicsByComplexity, searchTopics, getUserBelief, recordBelief } = useDebateCore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityRange, setComplexityRange] = useState({ min: 1, max: 10 });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [belief, setBelief] = useState<UserBelief | null>(null);
  const [beliefForm, setBeliefForm] = useState<{
    position: 'for' | 'against' | 'neutral';
    conviction: number;
  }>({
    position: 'neutral',
    conviction: 5
  });

  useEffect(() => {
    if (isReady) {
      loadTopics();
    }
  }, [isReady, complexityRange]);

  const loadTopics = () => {
    const loadedTopics = getTopicsByComplexity(complexityRange.min, complexityRange.max);
    setTopics(loadedTopics);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchTopics(searchQuery);
      setTopics(results);
    } else {
      loadTopics();
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    const userBelief = getUserBelief(topic.id);
    setBelief(userBelief);
    if (userBelief) {
      setBeliefForm({
        position: userBelief.position,
        conviction: userBelief.conviction_level
      });
    }
  };

  const handleBeliefSubmit = () => {
    if (selectedTopic) {
      recordBelief(selectedTopic.id, beliefForm.conviction, beliefForm.position);
      const updatedBelief = getUserBelief(selectedTopic.id);
      setBelief(updatedBelief);
      onTopicSelect(selectedTopic);
    }
  };

  const getComplexityColor = (level: number) => {
    if (level <= 3) return '#4CAF50'; // Green - Easy
    if (level <= 6) return '#FF9800'; // Orange - Medium
    return '#F44336'; // Red - Hard
  };

  if (!isReady) {
    return <div className="loading">Loading debate engine...</div>;
  }

  return (
    <div className="topic-browser">
      <div className="browser-header">
        <h2>🎯 Choose Your Debate Topic</h2>
        <p>Select a topic you genuinely believe in - authentic conviction leads to better debates!</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="complexity-filter">
          <label>Complexity Range:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={complexityRange.min}
            onChange={(e) => setComplexityRange({ ...complexityRange, min: parseInt(e.target.value) })}
          />
          <span>{complexityRange.min}</span>
          <span> - </span>
          <input
            type="range"
            min="1"
            max="10"
            value={complexityRange.max}
            onChange={(e) => setComplexityRange({ ...complexityRange, max: parseInt(e.target.value) })}
          />
          <span>{complexityRange.max}</span>
        </div>
      </div>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`topic-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
            onClick={() => handleTopicClick(topic)}
          >
            <div className="topic-header">
              <h3>{topic.title}</h3>
              <span
                className="complexity-badge"
                style={{ backgroundColor: getComplexityColor(topic.complexity_level) }}
              >
                Level {topic.complexity_level}
              </span>
            </div>
            <p className="topic-description">{topic.description}</p>
            <span className="topic-category">{topic.category}</span>
          </div>
        ))}
      </div>

      {selectedTopic && (
        <div className="belief-panel">
          <h3>Your Position on: {selectedTopic.title}</h3>
          
          {belief && (
            <div className="current-belief">
              <p>Current: <strong>{belief.position}</strong> (Conviction: {belief.conviction_level}/10)</p>
            </div>
          )}

          <div className="belief-form">
            <div className="position-selector">
              <label>Your position:</label>
              <select
                value={beliefForm.position}
                onChange={(e) => setBeliefForm({ ...beliefForm, position: e.target.value as any })}
              >
                <option value="for">For</option>
                <option value="against">Against</option>
                <option value="neutral">Neutral/Unsure</option>
              </select>
            </div>

            <div className="conviction-slider">
              <label>How strongly do you believe this? ({beliefForm.conviction}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={beliefForm.conviction}
                onChange={(e) => setBeliefForm({ ...beliefForm, conviction: parseInt(e.target.value) })}
              />
            </div>

            <button className="start-debate-btn" onClick={handleBeliefSubmit}>
              Start Preparing Your Case
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
