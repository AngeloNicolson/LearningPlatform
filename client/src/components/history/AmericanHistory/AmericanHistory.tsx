import React, { useState } from 'react';
import { ResourcePageLayout } from '../../common/ResourcePageLayout/ResourcePageLayout';
import { americanHistoryTopics, americanHistoryResources } from './americanHistoryData';

interface AmericanHistoryProps {
  onBack: () => void;
}

export const AmericanHistory: React.FC<AmericanHistoryProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Filter resources by topic
  const filteredResources = selectedTopic === 'all'
    ? americanHistoryResources
    : americanHistoryResources.filter(r => r.topicName === americanHistoryTopics.find(t => t.id === selectedTopic)?.name);

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'lessons', label: 'Lessons', icon: '📖' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'quiz', label: 'Quizzes', icon: '📋' },
    { id: 'primary-source', label: 'Primary Sources', icon: '📜' }
  ];

  const gradeFilters = [
    { id: 'all', label: 'All Eras' },
    { id: '1600', label: 'Colonial Era' },
    { id: '1700', label: '18th Century' },
    { id: '1800', label: '19th Century' },
    { id: '1900', label: '20th Century' },
    { id: '2000', label: '21st Century' }
  ];

  const comingSoonFeatures = [
    { icon: '🗳️', name: 'Presidential Elections' },
    { icon: '📺', name: 'Documentary Series' },
    { icon: '🏛️', name: 'Government Structure' },
    { icon: '⚖️', name: 'Supreme Court Cases' }
  ];

  const getResourceButtonLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Watch';
      case 'lessons': return 'Learn';
      case 'quiz': return 'Start Quiz';
      case 'primary-source': return 'Read';
      default: return 'View';
    }
  };

  return (
    <div>
      <button onClick={onBack} className="back-button" style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        ← Back to Countries
      </button>
      <ResourcePageLayout
        title="American History"
        tagline="From colonial times through modern America"
        topics={americanHistoryTopics}
        resources={filteredResources}
        resourceTypes={resourceTypes}
        gradeFilters={gradeFilters}
        topicsPerPage={3}
        searchPlaceholder="Search American history resources..."
        historyStorageKey="americanHistoryResourcesHistory"
        comingSoonFeatures={comingSoonFeatures}
        getResourceButtonLabel={getResourceButtonLabel}
        selectedTopic={selectedTopic}
        onTopicChange={setSelectedTopic}
      />
    </div>
  );
};
