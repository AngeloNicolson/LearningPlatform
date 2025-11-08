/**
 * @file SciencePage.tsx
 * @author Angelo Nicolson
 * @brief Science resources page with subject-based organization
 * @description Science learning page providing access to resources across Physics, Chemistry, Biology, and Earth Science.
 * Fetches topics and resources from backend API, implements topic-based filtering with navigation state persistence, displays resources
 * in categorized layout, and integrates with ResourcePageLayout for consistent UI. Supports worksheets, videos, simulations, and experiments
 * across multiple grade levels.
 */

import { authFetch } from '../../utils/authFetch';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ResourcePageLayout, Resource, Topic } from '../../components/common/ResourcePageLayout/ResourcePageLayout';

interface SubjectLevel {
  id: string;
  name: string;
  grade_range: string;
  description: string;
  display_order: number;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  filter_label: string;
  display_order: number;
}

export const SciencePage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.scienceTab || 'all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [apiTopics, setApiTopics] = useState<Topic[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjectLevels, setSubjectLevels] = useState<SubjectLevel[]>([]);

  // Fetch subject info and levels
  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        // Fetch subject metadata
        const subjectResponse = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/science`, {
          credentials: 'include'
        });

        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          setSubject(subjectData);
        }

        // Fetch subject levels (for filters)
        const levelsResponse = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/science/levels`, {
          credentials: 'include'
        });

        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          setSubjectLevels(levelsData);
        }
      } catch (error) {
        console.error('Error fetching subject data:', error);
      }
    };

    fetchSubjectData();
  }, []);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/science/topics`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[SciencePage] Fetched topics:', data);
          setApiTopics(data);
        } else {
          console.error('[SciencePage] Failed to fetch topics, status:', response.status);
        }
      } catch (error) {
        console.error('[SciencePage] Error fetching topics:', error);
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

        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/science?${params.toString()}`, {
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
    if (navigation.currentState.scienceTab) {
      setSelectedTopic(navigation.currentState.scienceTab);
    }
  }, [navigation.currentState.scienceTab]);

  // Update navigation when topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    navigation.navigate({ scienceTab: topic });
  };

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'worksheet', label: 'Worksheets', icon: '📝' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'experiment', label: 'Experiments', icon: '🔬' },
    { id: 'simulation', label: 'Simulations', icon: '💻' }
  ];

  // Generate grade filters dynamically from subject levels
  const gradeFilters = React.useMemo(() => {
    if (subjectLevels.length === 0 || !subject) {
      // Fallback to default while loading
      return [{ id: 'all', label: 'All Grades' }];
    }

    // Create "All" option with dynamic label
    const allOption = {
      id: 'all',
      label: `All ${subject.filter_label}s`
    };

    // Map subject levels to filter options
    // Extract the short ID (e.g., "science-elementary" → "elementary")
    const levelOptions = subjectLevels.map(level => ({
      id: level.id.split('-').slice(1).join('-'), // Remove subject prefix
      label: level.name
    }));

    return [allOption, ...levelOptions];
  }, [subjectLevels, subject]);

  const comingSoonFeatures = [
    { icon: '🔭', name: 'Astronomy Lab' },
    { icon: '🧫', name: 'Microbiology' },
    { icon: '⚗️', name: 'Advanced Chemistry' },
    { icon: '🌡️', name: 'Climate Science' }
  ];

  const getResourceButtonLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Watch';
      case 'worksheet': return 'Download';
      case 'experiment': return 'Start Lab';
      case 'simulation': return 'Launch';
      default: return 'Open';
    }
  };

  return (
    <ResourcePageLayout
      title="Science Resources"
      tagline="Explore interactive science content across multiple disciplines"
      topics={apiTopics}
      resources={apiResources}
      resourceTypes={resourceTypes}
      gradeFilters={gradeFilters}
      topicsPerPage={4}
      searchPlaceholder="Search science resources..."
      historyStorageKey="scienceResourcesHistory"
      comingSoonFeatures={comingSoonFeatures}
      getResourceButtonLabel={getResourceButtonLabel}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onTopicChange={handleTopicChange}
    />
  );
};
