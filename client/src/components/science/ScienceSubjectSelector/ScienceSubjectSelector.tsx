import React from 'react';
import './MathGradeSelector.css'; // Reuse the same styles

interface ScienceSubjectSelectorProps {
  onSubjectSelect: (subjectId: string) => void;
}

export const ScienceSubjectSelector: React.FC<ScienceSubjectSelectorProps> = ({ onSubjectSelect }) => {
  const scienceSubjects = [
    {
      id: 'physics',
      name: 'Physics',
      description: 'Mechanics, Electromagnetism, Thermodynamics',
      icon: '⚛️',
      color: '#4CAF50',
      topics: ['AP Physics', 'Mechanics', 'Electromagnetism', 'Quantum Physics']
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      description: 'Organic, Inorganic, Analytical Chemistry',
      icon: '🧪',
      color: '#FF9800',
      topics: ['AP Chemistry', 'Organic Chemistry', 'Biochemistry', 'Physical Chemistry']
    },
    {
      id: 'biology',
      name: 'Biology',
      description: 'Molecular Biology, Genetics, Ecology',
      icon: '🧬',
      color: '#9C27B0',
      topics: ['AP Biology', 'Genetics', 'Molecular Biology', 'Anatomy']
    },
    {
      id: 'earth-science',
      name: 'Earth Science',
      description: 'Geology, Meteorology, Environmental Science',
      icon: '🌍',
      color: '#2196F3',
      topics: ['Geology', 'Environmental Science', 'Meteorology', 'Oceanography']
    }
  ];

  return (
    <div className="grade-selector-container">
      <div className="grade-selector-header">
        <h2>Select Your Science Subject</h2>
        <p>Choose a subject to find specialized science tutors</p>
      </div>
      
      <div className="grade-cards">
        {scienceSubjects.map((subject) => (
          <div
            key={subject.id}
            className="grade-card"
            style={{
              background: `linear-gradient(135deg, ${subject.color}20, ${subject.color}10)`,
              borderTop: `4px solid ${subject.color}`
            }}
            onClick={() => onSubjectSelect(subject.id)}
          >
            <div className="grade-icon" style={{ fontSize: '3rem' }}>
              {subject.icon}
            </div>
            <h3>{subject.name}</h3>
            <p className="grade-description">{subject.description}</p>
            
            <div className="grade-topics">
              <h4>Popular Topics:</h4>
              <ul>
                {subject.topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
            
            <button className="select-grade-btn" style={{ background: subject.color }}>
              Browse {subject.name} Tutors →
            </button>
          </div>
        ))}
      </div>
      
      <div className="selector-footer">
        <div className="info-section">
          <h3>Why Choose Our Science Tutors?</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🎓</span>
              <div>
                <h4>Expert Instructors</h4>
                <p>PhD and Masters degree holders in their respective fields</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🔬</span>
              <div>
                <h4>Lab Support</h4>
                <p>Help with lab reports, experiments, and practical applications</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📊</span>
              <div>
                <h4>Exam Preparation</h4>
                <p>Specialized AP, SAT Subject, and college exam preparation</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">💡</span>
              <div>
                <h4>Concept Mastery</h4>
                <p>Deep understanding through visual aids and real-world examples</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};