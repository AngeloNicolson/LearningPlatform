/**
 * @file MathGradeSelector.tsx
 * @author Angelo Nicolson
 * @brief Math grade level selection interface
 * @description Allows students to select their grade level for math resources and tutor matching. Displays grade ranges from elementary through high school with appropriate math topics.
 */

import React from 'react';
import './MathGradeSelector.css';

interface MathGrade {
  id: string;
  title: string;
  description: string;
  gradeRange: string;
  subjects: string[];
  icon: string;
  color: string;
}

interface MathGradeSelectorProps {
  onGradeSelect: (gradeId: string) => void;
  onBack?: () => void;
}

const mathGrades: MathGrade[] = [
  {
    id: 'elementary',
    title: 'Elementary Math',
    description: 'Basic arithmetic, counting, shapes, and early problem solving',
    gradeRange: 'K-5',
    subjects: ['Addition & Subtraction', 'Multiplication', 'Fractions', 'Geometry Basics'],
    icon: '🎯',
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'middle',
    title: 'Middle School Math',
    description: 'Pre-algebra, ratios, percentages, and mathematical reasoning',
    gradeRange: '6-8',
    subjects: ['Pre-Algebra', 'Ratios & Proportions', 'Percentages', 'Basic Statistics'],
    icon: '📐',
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'high',
    title: 'High School Math',
    description: 'Algebra, geometry, trigonometry, and pre-calculus',
    gradeRange: '9-12',
    subjects: ['Algebra I & II', 'Geometry', 'Trigonometry', 'Pre-Calculus'],
    icon: '📊',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'college',
    title: 'College Math',
    description: 'Calculus, linear algebra, statistics, and advanced topics',
    gradeRange: 'College+',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics', 'Differential Equations'],
    icon: '🎓',
    color: 'from-red-400 to-orange-500'
  }
];

export const MathGradeSelector: React.FC<MathGradeSelectorProps> = ({ onGradeSelect, onBack }) => {
  return (
    <div className="grade-selector-page">
      <div className="grade-selector-container">
        <div className="grade-selector-header">
          {onBack && (
            <button className="grade-selector-back-button" onClick={onBack}>
              ← Back
            </button>
          )}
          <h1>Find a Math Tutor</h1>
          <p className="tagline">Select the grade level you need tutoring for</p>
        </div>
      
      <div className="grade-cards-grid">
        {mathGrades.map((grade) => (
          <div
            key={grade.id}
            className="grade-card"
            onClick={() => onGradeSelect(grade.id)}
          >
            <div className="grade-icon">{grade.icon}</div>
            <h3>{grade.title}</h3>
            <span className="grade-range">{grade.gradeRange}</span>
            <p className="grade-description">{grade.description}</p>

            <div className="grade-topics">
              <h4>Topics include:</h4>
              <ul>
                {grade.subjects.map((subject, index) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            </div>

            <button className="select-grade-btn">
              Find Tutors →
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
