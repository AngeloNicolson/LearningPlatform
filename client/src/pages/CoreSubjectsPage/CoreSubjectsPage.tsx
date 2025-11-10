/**
 * @file CoreSubjectsPage.tsx
 * @author Angelo Nicolson
 * @brief Landing page for core academic subjects
 * @description Displays cards for Math, Science, and History subjects with links to their respective subject pages.
 */

import React, { useState, useEffect } from 'react';
import './CoreSubjectsPage.css';

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
}

interface CoreSubjectsPageProps {
  onNavigate: (view: string) => void;
}

export const CoreSubjectsPage: React.FC<CoreSubjectsPageProps> = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoreSubjects();
  }, []);

  const fetchCoreSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/subjects/grouped`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data.core || []);
    } catch (err) {
      console.error('Error fetching core subjects:', err);
      setError('Failed to load core subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="core-subjects-page">
        <div className="loading">Loading core subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="core-subjects-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="core-subjects-page">
      <div className="page-header">
        <h1>Core Subjects</h1>
        <p className="page-description">
          Essential academic subjects covering mathematics, science, and history
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
            <button className="explore-btn">Explore</button>
          </div>
        ))}
      </div>
    </div>
  );
};
