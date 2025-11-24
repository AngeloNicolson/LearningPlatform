/**
 * @file ScienceBibleHubPage.tsx
 * @author Angelo Nicolson
 * @brief Science & the Bible subject hub with resources and learning pathways
 * @description Hub page for Science & the Bible showing options to browse resources or view learning pathways (courses).
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

interface ScienceBibleHubPageProps {
  onNavigateToResources: () => void;
  onNavigateToCourses: () => void;
  onBack: () => void;
}

export const ScienceBibleHubPage: React.FC<ScienceBibleHubPageProps> = ({
  onNavigateToResources,
  onNavigateToCourses,
  onBack
}) => {
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const response = await authFetch(
          `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/science-bible`,
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
      onBack={onBack}
    />
  );
};
