/**
 * @file HistoryHubPage.tsx
 * @author Angelo Nicolson
 * @brief History subject hub with resources and learning pathways
 * @description Hub page for History showing options to browse resources or view learning pathways (courses).
 */

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';
import { SubjectHub } from '../../components/shared/SubjectHub/SubjectHub';

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface HistoryHubPageProps {
  onNavigateToResources: () => void;
  onNavigateToCourses: () => void;
}

export const HistoryHubPage: React.FC<HistoryHubPageProps> = ({
  onNavigateToResources,
  onNavigateToCourses
}) => {
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/history`,
          { credentials: 'include' }
        );
        if (response.ok) {
          const data = await response.json();
          setSubject(data);
        }
      } catch (error) {
        console.error('Error fetching subject data:', error);
      }
    };

    fetchSubjectData();
  }, []);

  if (!subject) {
    return <div>Loading...</div>;
  }

  return (
    <SubjectHub
      subjectName={subject.name}
      subjectIcon={subject.icon}
      subjectDescription={subject.description}
      onBrowseResources={onNavigateToResources}
      onViewCourses={onNavigateToCourses}
    />
  );
};
