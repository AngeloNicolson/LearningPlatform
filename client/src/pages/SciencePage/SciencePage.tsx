/**
 * @file SciencePage.tsx
 * @author Angelo Nicolson
 * @brief Science resources page with subject-based organization
 * @description Science learning page providing access to resources across Physics, Chemistry, Biology, and Earth Science.
 * Implements topic-based filtering, displays simulations, experiments, videos, and worksheets organized by subject and grade level.
 * Uses ResourcePageLayout for consistent presentation and includes mock data for various science topics with educational materials
 * suitable for elementary through high school students.
 */

import React, { useState, useEffect } from 'react';
import { ResourcePageLayout, Resource, Topic } from '../../components/common/ResourcePageLayout/ResourcePageLayout';

const scienceTopics: Topic[] = [
  { id: 'physics', name: 'Physics', icon: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
  { id: 'biology', name: 'Biology', icon: '🧬' },
  { id: 'earth-science', name: 'Earth Science', icon: '🌍' }
];

const scienceResources: Resource[] = [
  // Physics
  { id: 'phys-1', title: 'Newton\'s Laws of Motion', description: 'Interactive simulation exploring the three laws of motion', url: '#', type: 'simulation', gradeLevel: 'High School', topicName: 'Physics', topicIcon: '⚛️' },
  { id: 'phys-2', title: 'Electricity and Magnetism Lab', description: 'Virtual lab experiments with circuits and magnetic fields', url: '#', type: 'experiment', gradeLevel: 'High School', topicName: 'Physics', topicIcon: '⚛️' },
  { id: 'phys-3', title: 'Introduction to Waves', description: 'Video series on wave properties and behavior', url: '#', type: 'video', gradeLevel: 'Middle School', topicName: 'Physics', topicIcon: '⚛️' },
  // Chemistry
  { id: 'chem-1', title: 'Periodic Table Interactive', description: 'Explore elements with detailed properties and uses', url: '#', type: 'simulation', gradeLevel: 'High School', topicName: 'Chemistry', topicIcon: '🧪' },
  { id: 'chem-2', title: 'Chemical Reactions Lab', description: 'Virtual experiments with safe chemical reactions', url: '#', type: 'experiment', gradeLevel: 'High School', topicName: 'Chemistry', topicIcon: '🧪' },
  { id: 'chem-3', title: 'States of Matter', description: 'Worksheet on solids, liquids, gases, and plasma', url: '#', type: 'worksheet', gradeLevel: 'Elementary', topicName: 'Chemistry', topicIcon: '🧪' },
  // Biology
  { id: 'bio-1', title: 'Cell Structure and Function', description: '3D interactive model of plant and animal cells', url: '#', type: 'simulation', gradeLevel: 'Middle School', topicName: 'Biology', topicIcon: '🧬' },
  { id: 'bio-2', title: 'Genetics and Heredity', description: 'Video lessons on DNA, genes, and inheritance', url: '#', type: 'video', gradeLevel: 'High School', topicName: 'Biology', topicIcon: '🧬' },
  { id: 'bio-3', title: 'Ecosystem Dynamics', description: 'Explore food chains and ecological relationships', url: '#', type: 'experiment', gradeLevel: 'Middle School', topicName: 'Biology', topicIcon: '🧬' },
  // Earth Science
  { id: 'earth-1', title: 'Weather Patterns', description: 'Interactive weather map and prediction tools', url: '#', type: 'simulation', gradeLevel: 'Elementary', topicName: 'Earth Science', topicIcon: '🌍' },
  { id: 'earth-2', title: 'Rock Cycle', description: 'Worksheet on igneous, sedimentary, and metamorphic rocks', url: '#', type: 'worksheet', gradeLevel: 'Middle School', topicName: 'Earth Science', topicIcon: '🌍' },
  { id: 'earth-3', title: 'Solar System Explorer', description: '3D tour of planets, moons, and other celestial bodies', url: '#', type: 'simulation', gradeLevel: 'Elementary', topicName: 'Earth Science', topicIcon: '🌍' }
];

export const SciencePage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter resources by topic
  const filteredResources = selectedTopic === 'all'
    ? scienceResources
    : scienceResources.filter(r => r.topicName === scienceTopics.find(t => t.id === selectedTopic)?.name);

  const resourceTypes = [
    { id: 'all', label: 'All Resources', icon: '📚' },
    { id: 'worksheet', label: 'Worksheets', icon: '📝' },
    { id: 'video', label: 'Videos', icon: '🎬' },
    { id: 'experiment', label: 'Experiments', icon: '🔬' },
    { id: 'simulation', label: 'Simulations', icon: '💻' }
  ];

  const gradeFilters = [
    { id: 'all', label: 'All Grades' },
    { id: 'elementary', label: 'Elementary' },
    { id: 'middle', label: 'Middle School' },
    { id: 'high', label: 'High School' },
    { id: 'college', label: 'College' }
  ];

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
      topics={scienceTopics}
      resources={filteredResources}
      resourceTypes={resourceTypes}
      gradeFilters={gradeFilters}
      topicsPerPage={5}
      searchPlaceholder="Search science resources..."
      historyStorageKey="scienceResourcesHistory"
      comingSoonFeatures={comingSoonFeatures}
      getResourceButtonLabel={getResourceButtonLabel}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onTopicChange={setSelectedTopic}
    />
  );
};
