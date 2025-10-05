import React, { useState, useEffect } from 'react';
import { useDebateCore } from '../../../hooks/useDebateCore';
import { Topic, UserBelief } from '../../../types/wasm';
import { FlippableTopicCard } from '../FlippableTopicCard/FlippableTopicCard';
import './FlippableTopicBrowser.css';

interface FlippableTopicBrowserProps {
  onTopicSelect: (topic: Topic) => void;
}

export const FlippableTopicBrowser: React.FC<FlippableTopicBrowserProps> = ({ onTopicSelect }) => {
  const { isReady, getTopicsByComplexity, searchTopics, getUserBelief, recordBelief } = useDebateCore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityRange, setComplexityRange] = useState({ min: 1, max: 10 });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [belief, setBelief] = useState<UserBelief | null>(null);
  const [beliefForm, setBeliefForm] = useState<{
    position: 'for' | 'against' | 'neutral';
    conviction: number;
  }>({
    position: 'neutral',
    conviction: 5
  });

  // Get unique categories from topics
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(topics.map(topic => topic.category))];
    return ['All', ...uniqueCategories];
  }, [topics]);

  // Filter topics by category
  const filteredTopics = React.useMemo(() => {
    if (selectedCategory === 'All') return topics;
    return topics.filter(topic => topic.category === selectedCategory);
  }, [topics, selectedCategory]);

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

  const handleTopicContinue = (topic: Topic) => {
    setSelectedTopic(topic);
    const userBelief = getUserBelief(topic.id);
    setBelief(userBelief);
    if (userBelief) {
      setBeliefForm({
        position: userBelief.position,
        conviction: userBelief.conviction_level
      });
    } else {
      // Reset to defaults for new topic
      setBeliefForm({
        position: 'neutral',
        conviction: 5
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

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setBelief(null);
  };

  if (!isReady) {
    return <div className="loading">Loading debate engine...</div>;
  }

  return (
    <div className="flippable-topic-browser">
      {!selectedTopic ? (
        <>
          <div className="browser-header">
            <h2>Choose Your Debate Topic</h2>
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
              <div className="range-inputs">
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

            <div className="category-filter">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-grid">
            {filteredTopics.map((topic) => (
              <FlippableTopicCard
                key={topic.id}
                topic={topic}
                onContinue={handleTopicContinue}
              />
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="no-topics">
              <h3>No topics found</h3>
              <p>Try adjusting your search criteria or complexity range.</p>
            </div>
          )}
        </>
      ) : (
        <div className="belief-setup">
          <button className="back-btn" onClick={handleBackToTopics}>
            ← Back to Topics
          </button>
          
          <div className="selected-topic-info">
            <h2>Setting up: {selectedTopic.title}</h2>
            <p className="topic-description">{selectedTopic.description}</p>
            <div className="topic-meta">
              <span className="category-badge">{selectedTopic.category}</span>
              <span className="complexity-info">Complexity Level: {selectedTopic.complexity_level}/10</span>
            </div>
          </div>

          <div className="belief-panel">
            <h3>Your Position on this Topic</h3>
            
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
                <div className="conviction-labels">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>

              <button className="start-debate-btn" onClick={handleBeliefSubmit}>
                Start Preparing Your Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};