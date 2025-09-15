import React, { useState } from 'react';
import { Topic } from '../types/wasm';
import './FlippableTopicCard.css';

interface FlippableTopicCardProps {
  topic: Topic;
  onContinue: (topic: Topic) => void;
}

// Sample talking points for different topics (would eventually come from backend)
const getTalkingPoints = (topic: Topic): string[] => {
  const pointsMap: { [key: string]: string[] } = {
    "Climate Change": [
      "Rising global temperatures and extreme weather",
      "Economic costs vs. environmental protection", 
      "Renewable energy transition challenges",
      "Government regulation vs. market solutions",
      "International cooperation and agreements",
      "Individual vs. collective responsibility",
      "Green technology development",
      "Carbon pricing and taxation"
    ],
    "Universal Healthcare": [
      "Access to healthcare as a human right",
      "Government costs and taxation impact",
      "Quality of care vs. coverage breadth",
      "Private vs. public healthcare systems",
      "Rural and urban healthcare access",
      "Prescription drug pricing",
      "Doctor shortage and wait times",
      "Preventive care emphasis"
    ],
    "Artificial Intelligence Ethics": [
      "Job displacement and automation fears",
      "Privacy and surveillance concerns",
      "Bias in algorithmic decision-making",
      "Autonomous systems accountability",
      "Human agency in AI-dominated future",
      "Data ownership and control",
      "AI in criminal justice systems",
      "Military applications of AI"
    ],
    "Gun Control": [
      "Second Amendment constitutional rights",
      "Public safety and mass shooting prevention",
      "Mental health vs. gun access debate",
      "Rural vs. urban perspectives",
      "Background check effectiveness",
      "Assault weapon classifications",
      "Concealed carry policies",
      "Gun education and training"
    ],
    "Immigration Policy": [
      "Economic impact on local communities",
      "Cultural integration and identity",
      "Border security and enforcement",
      "Humanitarian obligations",
      "Skilled vs. unskilled immigration",
      "Refugee and asylum policies",
      "Family separation concerns",
      "Path to citizenship programs"
    ]
  };

  return pointsMap[topic.title] || [
    "Multiple perspectives to consider",
    "Economic and social implications", 
    "Historical context and precedents",
    "Stakeholder impact analysis",
    "Short-term vs. long-term effects",
    "Regional and global considerations"
  ];
};

export const FlippableTopicCard: React.FC<FlippableTopicCardProps> = ({ topic, onContinue }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking continue
    onContinue(topic);
  };

  const getComplexityColor = (level: number) => {
    if (level <= 3) return '#4CAF50'; // Green - Easy
    if (level <= 6) return '#FF9800'; // Orange - Medium
    return '#F44336'; // Red - Hard
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Environmental': '#059669',
      'Healthcare': '#0d9488', 
      'Technology': '#7c3aed',
      'Politics': '#dc2626',
      'Economics': '#ea580c',
      'Social': '#be123c',
      'Education': '#2563eb',
      'Science': '#7c2d12',
      'Ethics': '#a21caf'
    };
    return colorMap[category] || '#3b82f6';
  };

  const talkingPoints = getTalkingPoints(topic);

  return (
    <div 
      className={`flippable-card ${isFlipped ? 'flip' : ''}`}
      onClick={handleCardClick}
      style={{ '--category-color': getCategoryColor(topic.category) } as React.CSSProperties}
    >
      <div className="front">
        <div className="back-header">
          <h3>{topic.title}</h3>
          <span
            className="complexity-badge"
            style={{ backgroundColor: getComplexityColor(topic.complexity_level) }}
          >
            Level {topic.complexity_level}
          </span>
        </div>
        
        <div className="talking-points">
          <h4>Common Arguments & Perspectives:</h4>
          <ul>
            {talkingPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        <button 
          className="continue-btn"
          onClick={handleContinueClick}
        >
          Continue with this topic
        </button>
      </div>

      <div className="back">
        <div className="topic-header">
          <h3>{topic.title}</h3>
          <span
            className="complexity-badge"
            style={{ backgroundColor: getComplexityColor(topic.complexity_level) }}
          >
            Level {topic.complexity_level}
          </span>
        </div>
        <p className="topic-description">{topic.description}</p>
        <div className="topic-footer">
          <span className="topic-category">{topic.category}</span>
          <div className="flip-hint">Click to see talking points ←</div>
        </div>
      </div>
    </div>
  );
};