/**
 * @file BiblicalHistoryHubPage.tsx
 * @author Angelo Nicolson
 * @brief Biblical History subject hub with resources and learning pathways
 * @description Hub page for Biblical History showing options to browse resources or view learning pathways (courses).
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

interface BiblicalHistoryHubPageProps {
  onNavigateToResources: () => void;
  onNavigateToCourses: () => void;
}

export const BiblicalHistoryHubPage: React.FC<BiblicalHistoryHubPageProps> = ({
  onNavigateToResources,
  onNavigateToCourses
}) => {
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/biblical-history`,
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
