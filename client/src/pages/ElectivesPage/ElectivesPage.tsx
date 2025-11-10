/**
 * @file ElectivesPage.tsx
 * @author Angelo Nicolson
 * @brief Landing page for elective subjects
 * @description Displays cards for Biblical Studies, Biblical History, and Science & the Bible subjects with links to their respective pages.
 */

import React, { useState, useEffect } from 'react';
import './ElectivesPage.css';

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
}

interface ElectivesPageProps {
  onNavigate: (view: string) => void;
}

export const ElectivesPage: React.FC<ElectivesPageProps> = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchElectiveSubjects();
  }, []);

  const fetchElectiveSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/grouped`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data.electives || []);
    } catch (err) {
      console.error('Error fetching elective subjects:', err);
      setError('Failed to load elective subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="electives-page">
        <div className="loading">Loading electives...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="electives-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="electives-page">
      <div className="page-header">
        <h1>Electives</h1>
        <p className="page-description">
          Faith-integrated subjects exploring the Bible, biblical history, and the harmony between science and faith
        </p>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="subject-card"
            onClick={() => onNavigate(`${subject.slug}-hub`)}
          >
            <div className="subject-icon">{subject.icon}</div>
            <h2 className="subject-name">{subject.name}</h2>
            <p className="subject-description">{subject.description}</p>
            <button className="explore-btn">Explore {subject.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
