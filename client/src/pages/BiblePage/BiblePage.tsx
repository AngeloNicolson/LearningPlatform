/**
 * @file BiblePage.tsx
 * @author Angelo Nicolson
 * @brief Biblical Studies resources page with topic-based filtering
 * @description Biblical Studies learning page providing access to bible resources organized by topics (Old Testament, New Testament, Biblical History, etc.).
 * Fetches topics and resources from backend API, implements topic-based filtering with navigation state persistence, displays resources
 * in categorized layout, and integrates with ResourcePageLayout for consistent UI. Supports worksheets, videos, and educational content
 * focused on biblical literacy, history, and cultural understanding.
 */

import { authFetch } from '../../utils/authFetch';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ResourcePageLayout, Resource, Topic } from '../../components/common/ResourcePageLayout/ResourcePageLayout';

export const BiblePage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.bibleTab || 'all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [apiTopics, setApiTopics] = useState<Topic[]>([]);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/bible/topics`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setApiTopics(data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedTopic !== 'all') {
          params.append('topic', selectedTopic);
        }

        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/bible?${params.toString()}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          // Map API data to match Resource interface
          const mappedResources = data.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.resource_type || r.type,
            gradeLevel: r.grade_level || r.gradeLevel,
            url: r.url,
            topic_id: r.topic_id,
            topicName: apiTopics.find(t => t.id === r.topic_id)?.name,
            topicIcon: apiTopics.find(t => t.id === r.topic_id)?.icon,
            document_id: r.document_id,
            resource_type: r.resource_type
          }));
          setApiResources(mappedResources);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [selectedTopic, apiTopics]);

  // Sync with navigation state
  useEffect(() => {
    if (navigation.currentState.bibleTab) {
      setSelectedTopic(navigation.currentState.bibleTab);
    }
  }, [navigation.currentState.bibleTab]);

  // Update navigation when topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    navigation.navigate({ bibleTab: topic });
  };

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'worksheet', label: 'Study Guides', icon: '📝' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'article', label: 'Articles', icon: '📄' },
    { id: 'timeline', label: 'Timelines', icon: '📅' }
  ];

  const gradeFilters = [
    { id: 'all', label: 'All Levels' },
    { id: 'general', label: 'General Audience' },
    { id: 'youth', label: 'Youth Study' },
    { id: 'adult', label: 'Adult Study' },
    { id: 'academic', label: 'Academic Study' }
  ];

  const comingSoonFeatures = [
    { icon: '🗺️', name: 'Interactive Maps' },
    { icon: '📜', name: 'Ancient Texts' },
    { icon: '🏛️', name: 'Archaeology' },
    { icon: '🌍', name: 'World Religions' }
  ];

  const getResourceButtonLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Watch';
      case 'worksheet': return 'Download';
      case 'article': return 'Read';
      case 'timeline': return 'View';
      default: return 'Open';
    }
  };

  return (
    <ResourcePageLayout
      title="Biblical Studies"
      tagline="Ancient texts, historical context, and cultural impact"
      topics={apiTopics}
      resources={apiResources}
      resourceTypes={resourceTypes}
      gradeFilters={gradeFilters}
      topicsPerPage={4}
      searchPlaceholder="Search biblical resources..."
      historyStorageKey="bibleResourcesHistory"
      comingSoonFeatures={comingSoonFeatures}
      getResourceButtonLabel={getResourceButtonLabel}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onTopicChange={handleTopicChange}
    />
  );
};
