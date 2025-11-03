/**
 * @file ResourcePageLayout.tsx
 * @author Angelo Nicolson
 * @brief Reusable layout for resource pages
 * @description Provides consistent layout template for subject resource pages (Math, Science, History) with topic filtering, resource grid display, and search functionality.
 */

import React, { useState, useEffect } from 'react';
import { CassetteButton } from '../CassetteButton/CassetteButton';
import { ResourceSkeletonLoader } from '../skeletons';
import './ResourcePageLayout.css';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: string;
  gradeLevel: string;
  topicName?: string;
  topicIcon?: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
}

export interface ResourceType {
  id: string;
  label: string;
  icon: string;
}

export interface GradeFilter {
  id: string;
  label: string;
}

export interface ComingSoonFeature {
  icon: string;
  name: string;
}

interface ResourcePageLayoutProps {
  // Header
  title: string;
  tagline: string;

  // Data
  topics: Topic[];
  resources: Resource[];

  // Config
  resourceTypes: ResourceType[];
  gradeFilters: GradeFilter[];
  topicsPerPage?: number;

  // Customization
  searchPlaceholder: string;
  historyStorageKey: string;
  comingSoonFeatures: ComingSoonFeature[];
  getResourceButtonLabel: (type: string) => string;

  // State
  isLoading?: boolean;
  selectedTopic?: string;
  onTopicChange?: (topicId: string) => void;

  // Optional CSS class
  className?: string;
}

export const ResourcePageLayout: React.FC<ResourcePageLayoutProps> = ({
  title,
  tagline,
  topics,
  resources,
  resourceTypes,
  gradeFilters,
  topicsPerPage = 3,
  searchPlaceholder,
  historyStorageKey,
  comingSoonFeatures,
  getResourceButtonLabel,
  isLoading = false,
  selectedTopic: externalSelectedTopic,
  onTopicChange,
  className = ''
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(externalSelectedTopic || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<string>('all');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Sync external topic changes
  useEffect(() => {
    if (externalSelectedTopic !== undefined) {
      setSelectedTopic(externalSelectedTopic);
    }
  }, [externalSelectedTopic]);

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const gradeMatch = selectedGrade === 'all' || (resource.gradeLevel && resource.gradeLevel.toLowerCase().includes(selectedGrade));
    const typeMatch = activeResourceType === 'all' || resource.type === activeResourceType;
    const searchMatch = searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.topicName && resource.topicName.toLowerCase().includes(searchQuery.toLowerCase()));
    return gradeMatch && typeMatch && searchMatch;
  });

  // Infinite scroll implementation
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        if (visibleCount < filteredResources.length) {
          setVisibleCount(prev => Math.min(prev + 10, filteredResources.length));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredResources.length, isLoading]);

  const visibleResources = filteredResources.slice(0, visibleCount);

  // Topics carousel
  const totalTopicPages = Math.ceil(topics.length / topicsPerPage);
  const topicStartIndex = topicPage * topicsPerPage;
  const topicEndIndex = topicStartIndex + topicsPerPage;
  const visibleTopics = topics.slice(topicStartIndex, topicEndIndex);

  const handleNextTopicPage = () => {
    if (topicPage < totalTopicPages - 1) {
      setTopicPage(topicPage + 1);
    }
  };

  const handlePrevTopicPage = () => {
    if (topicPage > 0) {
      setTopicPage(topicPage - 1);
    }
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setVisibleCount(8);
    if (onTopicChange) {
      onTopicChange(topic);
    }
  };

  const getTypeIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.id === type);
    return resourceType?.icon || '📚';
  };

  const handleResourceClick = (resource: Resource) => {
    // Save to history
    const resourceWithTimestamp = { ...resource, viewedAt: new Date().toISOString() };
    const savedHistory = localStorage.getItem(historyStorageKey);
    let history = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
    const newHistory = [resourceWithTimestamp, ...history.filter((r: any) => r.id !== resource.id)].slice(0, 50);
    localStorage.setItem(historyStorageKey, JSON.stringify(newHistory));

    // Handle download for worksheets
    if (resource.type === 'worksheet') {
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/download/${resource.id}`;

      // Open download in new window
      window.open(downloadUrl, '_blank');
    } else if (resource.url) {
      // For other types with URLs, open in new tab
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div className={`resource-page-layout ${className}`}>
      <div className="resources-header">
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="filters-section">
        <div className="carousel-dots">
          {Array.from({ length: totalTopicPages }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${topicPage === index ? 'active' : ''}`}
              onClick={() => setTopicPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        <div className="topic-carousel-container">
          <button
            className={`topic-nav topic-nav-prev ${topicPage === 0 ? 'disabled' : ''}`}
            onClick={handlePrevTopicPage}
            disabled={topicPage === 0}
            aria-label="Previous topics"
          >
            ‹
          </button>

          <div className="topic-filters">
            <button
              className={`topic-filter ${selectedTopic === 'all' ? 'active' : ''}`}
              onClick={() => handleTopicChange('all')}
            >
              <span className="topic-icon">📚</span>
              <span className="topic-name">All Topics</span>
            </button>
            {visibleTopics.map(topic => (
              <button
                key={topic.id}
                className={`topic-filter ${selectedTopic === topic.id ? 'active' : ''}`}
                onClick={() => handleTopicChange(topic.id)}
              >
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-name">{topic.name}</span>
              </button>
            ))}
          </div>

          <button
            className={`topic-nav topic-nav-next ${topicPage === totalTopicPages - 1 ? 'disabled' : ''}`}
            onClick={handleNextTopicPage}
            disabled={topicPage === totalTopicPages - 1}
            aria-label="Next topics"
          >
            ›
          </button>
        </div>

        <div className="grade-filters">
          {gradeFilters.map(filter => (
            <button
              key={filter.id}
              className={`grade-filter ${selectedGrade === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedGrade(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Type Tabs */}
      <div className="resource-type-tabs">
        {resourceTypes.map(type => (
          <CassetteButton
            key={type.id}
            icon={type.icon}
            label={type.label}
            isActive={activeResourceType === type.id}
            onClick={() => setActiveResourceType(type.id)}
          />
        ))}
      </div>

      <div className="resources-grid">
        {isLoading ? (
          <ResourceSkeletonLoader count={4} />
        ) : filteredResources.length > 0 ? (
          <>
            {visibleResources.map(resource => (
              <div key={resource.id} className="resource-card">
                {resource.topicIcon && selectedTopic === 'all' && (
                  <div className="resource-topic-badge">
                    <span className="badge-icon">{resource.topicIcon}</span>
                    <span className="badge-name">{resource.topicName}</span>
                  </div>
                )}
                <div className="resource-type">
                  <span className="type-icon">{getTypeIcon(resource.type)}</span>
                  <span className="type-label">{resource.type}</span>
                </div>
                <h3>{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-meta">
                  <span className="grade-level">{resource.gradeLevel || 'All Levels'}</span>
                </div>
                <button
                  className="resource-button"
                  onClick={() => handleResourceClick(resource)}
                >
                  {getResourceButtonLabel(resource.type)}
                </button>
              </div>
            ))}
            {visibleCount < filteredResources.length && (
              <div className="loading-more">
                <div className="loading-spinner"></div>
                <p>Loading more resources...</p>
              </div>
            )}
          </>
        ) : (
          <div className="no-resources">
            <p>No resources found matching your criteria.</p>
            {searchQuery && (
              <p className="search-hint">Try adjusting your search terms or filters.</p>
            )}
          </div>
        )}
      </div>

      <div className="coming-soon-section">
        <h2>More Resources Coming Soon!</h2>
        <p>We're constantly expanding our collection with new content.</p>
        <div className="upcoming-features">
          {comingSoonFeatures.map((feature, index) => (
            <div key={index} className="upcoming-card">
              <span className="feature-icon">{feature.icon}</span>
              <span className="feature-name">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
