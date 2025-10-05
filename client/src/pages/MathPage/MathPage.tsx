import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ResourcePageLayout, Resource, Topic } from '../../components/common/ResourcePageLayout/ResourcePageLayout';

export const MathPage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.mathTab || 'all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [apiTopics, setApiTopics] = useState<Topic[]>([]);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`https://localhost:3001/api/resources/math/topics`, {
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

        const response = await fetch(`https://localhost:3001/api/resources/math?${params.toString()}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          // Map API data to match Resource interface
          const mappedResources = data.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            gradeLevel: r.gradeLevel,
            url: r.url,
            topic_id: r.topic_id,
            topicName: apiTopics.find(t => t.id === r.topic_id)?.name,
            topicIcon: apiTopics.find(t => t.id === r.topic_id)?.icon
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
    if (navigation.currentState.mathTab) {
      setSelectedTopic(navigation.currentState.mathTab);
    }
  }, [navigation.currentState.mathTab]);

  // Update navigation when topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    navigation.navigate({ mathTab: topic });
  };

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'worksheet', label: 'Worksheets', icon: '📝' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'quiz', label: 'Quizzes', icon: '📋' },
    { id: 'game', label: 'Games', icon: '🎮' }
  ];

  const gradeFilters = [
    { id: 'all', label: 'All Grades' },
    { id: 'elementary', label: 'Elementary' },
    { id: 'middle', label: 'Middle School' },
    { id: 'high', label: 'High School' },
    { id: 'college', label: 'College' }
  ];

  const comingSoonFeatures = [
    { icon: '🧮', name: 'Mental Math' },
    { icon: '📈', name: 'AP Courses' },
    { icon: '🔢', name: 'Number Theory' },
    { icon: '🎯', name: 'Competition Math' }
  ];

  const getResourceButtonLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Watch';
      case 'worksheet': return 'Download';
      case 'quiz': return 'Start Quiz';
      case 'game': return 'Play';
      default: return 'Open';
    }
  };

  return (
    <ResourcePageLayout
      title="Math Resources"
      tagline="Master mathematics from elementary to advanced levels"
      topics={apiTopics}
      resources={apiResources}
      resourceTypes={resourceTypes}
      gradeFilters={gradeFilters}
      topicsPerPage={3}
      searchPlaceholder="Search math resources..."
      historyStorageKey="mathResourcesHistory"
      comingSoonFeatures={comingSoonFeatures}
      getResourceButtonLabel={getResourceButtonLabel}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onTopicChange={handleTopicChange}
    />
  );
};
