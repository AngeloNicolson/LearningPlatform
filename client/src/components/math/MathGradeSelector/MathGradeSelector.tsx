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

export const MathGradeSelector: React.FC<MathGradeSelectorProps> = ({ onGradeSelect }) => {
  return (
    <div className="math-grade-selector">
      <div className="grade-selector-header">
        <h2>Find a Math Tutor</h2>
        <p>Select the grade level you need tutoring for</p>
      </div>
      
      <div className="grade-cards-grid">
        {mathGrades.map((grade) => (
          <div
            key={grade.id}
            className="grade-card"
            onClick={() => onGradeSelect(grade.id)}
          >
            <div className={`grade-card-background bg-gradient-to-r ${grade.color}`}></div>
            <div className="grade-card-content">
              <div className="grade-icon">{grade.icon}</div>
              <div className="grade-info">
                <h3>{grade.title}</h3>
                <span className="grade-range">{grade.gradeRange}</span>
                <p className="grade-description">{grade.description}</p>
                
                <div className="grade-subjects">
                  <span className="subjects-label">Topics include:</span>
                  <ul className="subjects-list">
                    {grade.subjects.slice(0, 3).map((subject, index) => (
                      <li key={index}>{subject}</li>
                    ))}
                    {grade.subjects.length > 3 && <li>+ more</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grade-card-footer">
              <button className="select-grade-btn">
                Find Tutors →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};