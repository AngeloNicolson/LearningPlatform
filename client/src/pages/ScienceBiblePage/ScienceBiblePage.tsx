/**
 * @file ScienceBiblePage.tsx
 * @author Angelo Nicolson
 * @brief Science & the Bible resources page with topic-based filtering
 * @description Science & the Bible learning page providing access to resources exploring the harmony between scientific discovery and biblical truth.
 * Topics include creation science, intelligent design, origins, astronomy, and faith-science integration.
 * Fetches topics and resources from backend API, implements topic-based filtering with navigation state persistence, displays resources
 * in categorized layout, and integrates with ResourcePageLayout for consistent UI. Supports worksheets, videos, and educational content
 * focused on reconciling scientific understanding with biblical worldview.
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

export const ScienceBiblePage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.scienceBibleTab || 'all');
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
        const subjectResponse = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/science-bible`, {
          credentials: 'include'
        });

        if (subjectResponse.ok) {
          const subjectData = await subjectResponse.json();
          setSubject(subjectData);
        }

        // Fetch subject levels (for filters)
        const levelsResponse = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/science-bible/levels`, {
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
        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/science-bible/topics`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[ScienceBiblePage] Fetched topics:', data);
          setApiTopics(data);
        } else {
          console.error('[ScienceBiblePage] Failed to fetch topics, status:', response.status);
        }
      } catch (error) {
        console.error('[ScienceBiblePage] Error fetching topics:', error);
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

        const response = await authFetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/resources/science-bible?${params.toString()}`, {
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
    if (navigation.currentState.scienceBibleTab) {
      setSelectedTopic(navigation.currentState.scienceBibleTab);
    }
  }, [navigation.currentState.scienceBibleTab]);

  // Update navigation when topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    navigation.navigate({ scienceBibleTab: topic });
  };

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'worksheet', label: 'Study Guides', icon: '📝' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'article', label: 'Articles', icon: '📄' },
    { id: 'timeline', label: 'Timelines', icon: '📅' }
  ];

  // Generate grade filters dynamically from subject levels
  const gradeFilters = React.useMemo(() => {
    if (subjectLevels.length === 0 || !subject) {
      // Fallback to default while loading
      return [{ id: 'all', label: 'All Levels' }];
    }

    // Create "All" option with dynamic label
    const allOption = {
      id: 'all',
      label: `All ${subject.filter_label}s`
    };

    // Map subject levels to filter options
    // Extract the short ID (e.g., "bible-general" → "general")
    const levelOptions = subjectLevels.map(level => ({
      id: level.id.split('-').slice(1).join('-'), // Remove subject prefix
      label: level.name
    }));

    return [allOption, ...levelOptions];
  }, [subjectLevels, subject]);

  const comingSoonFeatures = [
    { icon: '🌌', name: 'Astronomy & Creation' },
    { icon: '🧬', name: 'DNA & Design' },
    { icon: '🦴', name: 'Fossils & Flood' },
    { icon: '🔬', name: 'Lab Experiments' }
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
      title="Science & the Bible"
      tagline="Exploring the harmony between scientific discovery and biblical truth"
      topics={apiTopics}
      resources={apiResources}
      resourceTypes={resourceTypes}
      gradeFilters={gradeFilters}
      topicsPerPage={4}
      searchPlaceholder="Search science and faith resources..."
      historyStorageKey="scienceBibleResourcesHistory"
      comingSoonFeatures={comingSoonFeatures}
      getResourceButtonLabel={getResourceButtonLabel}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onTopicChange={handleTopicChange}
    />
  );
};
