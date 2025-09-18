import React, { useState } from 'react';
import './ScienceResources.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'video' | 'worksheet' | 'experiment' | 'simulation';
  gradeLevel: string;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  resources: Resource[];
}

const scienceTopics: Topic[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    resources: [
      {
        id: 'phys-1',
        title: 'Newton\'s Laws of Motion',
        description: 'Interactive simulation exploring the three laws of motion',
        url: '#',
        type: 'simulation',
        gradeLevel: 'High School'
      },
      {
        id: 'phys-2',
        title: 'Electricity and Magnetism Lab',
        description: 'Virtual lab experiments with circuits and magnetic fields',
        url: '#',
        type: 'experiment',
        gradeLevel: 'High School'
      },
      {
        id: 'phys-3',
        title: 'Introduction to Waves',
        description: 'Video series on wave properties and behavior',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    resources: [
      {
        id: 'chem-1',
        title: 'Periodic Table Interactive',
        description: 'Explore elements with detailed properties and uses',
        url: '#',
        type: 'simulation',
        gradeLevel: 'High School'
      },
      {
        id: 'chem-2',
        title: 'Chemical Reactions Lab',
        description: 'Virtual experiments with safe chemical reactions',
        url: '#',
        type: 'experiment',
        gradeLevel: 'High School'
      },
      {
        id: 'chem-3',
        title: 'States of Matter',
        description: 'Worksheet on solids, liquids, gases, and plasma',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      }
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    resources: [
      {
        id: 'bio-1',
        title: 'Cell Structure and Function',
        description: '3D interactive model of plant and animal cells',
        url: '#',
        type: 'simulation',
        gradeLevel: 'Middle School'
      },
      {
        id: 'bio-2',
        title: 'Genetics and Heredity',
        description: 'Video lessons on DNA, genes, and inheritance',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'bio-3',
        title: 'Ecosystem Dynamics',
        description: 'Explore food chains and ecological relationships',
        url: '#',
        type: 'experiment',
        gradeLevel: 'Middle School'
      }
    ]
  },
  {
    id: 'earth-science',
    name: 'Earth Science',
    icon: '🌍',
    resources: [
      {
        id: 'earth-1',
        title: 'Weather Patterns',
        description: 'Interactive weather map and prediction tools',
        url: '#',
        type: 'simulation',
        gradeLevel: 'Elementary'
      },
      {
        id: 'earth-2',
        title: 'Rock Cycle',
        description: 'Worksheet on igneous, sedimentary, and metamorphic rocks',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'earth-3',
        title: 'Solar System Explorer',
        description: '3D tour of planets, moons, and other celestial bodies',
        url: '#',
        type: 'simulation',
        gradeLevel: 'Elementary'
      }
    ]
  }
];

export const ScienceResources: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('physics');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'video' | 'worksheet' | 'experiment' | 'simulation'>('all');
  const [topicPage, setTopicPage] = useState<number>(0);

  const currentTopic = scienceTopics.find(t => t.id === selectedTopic);
  
  const filteredResources = currentTopic?.resources.filter(resource => {
    const gradeMatch = selectedGrade === 'all' || resource.gradeLevel.toLowerCase().includes(selectedGrade);
    const typeMatch = activeResourceType === 'all' || resource.type === activeResourceType;
    return gradeMatch && typeMatch;
  }) || [];

  // Topics carousel settings
  const topicsPerPage = 4;
  const totalTopicPages = Math.ceil(scienceTopics.length / topicsPerPage);
  const topicStartIndex = topicPage * topicsPerPage;
  const topicEndIndex = topicStartIndex + topicsPerPage;
  const visibleTopics = scienceTopics.slice(topicStartIndex, topicEndIndex);

  const handleNextTopicPage = () => {
    if (topicPage < totalTopicPages - 1) {
      setTopicPage(topicPage + 1);
    }
  };

  const handlePrevTopicPage = () => {
    if (topicPage > 0) {
      setTopicPage(topicPage - 1);
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return '🎬';
      case 'worksheet': return '📝';
      case 'experiment': return '🔬';
      case 'simulation': return '💻';
      default: return '📚';
    }
  };

  return (
    <div className="science-resources">
      <div className="resources-header">
        <h1>Science Resources</h1>
        <p className="tagline">Explore interactive science content across multiple disciplines</p>
      </div>

      <div className="filters-section">
        <div className="topic-carousel-container">
          <button 
            className={`topic-nav topic-nav-prev ${topicPage === 0 ? 'disabled' : ''}`}
            onClick={handlePrevTopicPage}
            disabled={topicPage === 0}
            aria-label="Previous topics"
          >
            ‹
          </button>
          
          <div className="topic-filters">
            {visibleTopics.map(topic => (
              <button
                key={topic.id}
                className={`topic-filter ${selectedTopic === topic.id ? 'active' : ''}`}
                onClick={() => setSelectedTopic(topic.id)}
              >
                <span className="topic-icon">{topic.icon}</span>
                <span className="topic-name">{topic.name}</span>
              </button>
            ))}
          </div>
          
          <button 
            className={`topic-nav topic-nav-next ${topicPage === totalTopicPages - 1 ? 'disabled' : ''}`}
            onClick={handleNextTopicPage}
            disabled={topicPage === totalTopicPages - 1}
            aria-label="Next topics"
          >
            ›
          </button>
        </div>

        <div className="grade-filter">
          <label>Grade Level:</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            <option value="all">All Grades</option>
            <option value="elementary">Elementary</option>
            <option value="middle">Middle School</option>
            <option value="high">High School</option>
            <option value="college">College</option>
          </select>
        </div>
      </div>

      {/* Resource Type Tabs */}
      <div className="resource-type-tabs">
        <button
          className={`resource-tab ${activeResourceType === 'all' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('all')}
        >
          <span className="tab-icon">📚</span>
          <span className="tab-label">All Resources</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'worksheet' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('worksheet')}
        >
          <span className="tab-icon">📝</span>
          <span className="tab-label">Worksheets</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'video' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('video')}
        >
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Videos</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'experiment' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('experiment')}
        >
          <span className="tab-icon">🔬</span>
          <span className="tab-label">Experiments</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('simulation')}
        >
          <span className="tab-icon">💻</span>
          <span className="tab-label">Simulations</span>
        </button>
      </div>

      <div className="resources-grid">
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-type">
                <span className="type-icon">{getTypeIcon(resource.type)}</span>
                <span className="type-label">{resource.type}</span>
              </div>
              <h3>{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
              <div className="resource-meta">
                <span className="grade-level">{resource.gradeLevel}</span>
              </div>
              <button className="resource-button">
                {resource.type === 'video' ? 'Watch' : 
                 resource.type === 'worksheet' ? 'Download' : 
                 resource.type === 'experiment' ? 'Start Lab' : 
                 'Launch'}
              </button>
            </div>
          ))
        ) : (
          <div className="no-resources">
            <p>No resources found for the selected filters.</p>
          </div>
        )}
      </div>

      <div className="coming-soon-section">
        <h2>More Science Resources Coming Soon!</h2>
        <p>We're constantly adding new experiments, simulations, and educational content.</p>
        <div className="upcoming-features">
          <div className="upcoming-card">
            <span className="feature-icon">🔭</span>
            <span className="feature-name">Astronomy Lab</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🧫</span>
            <span className="feature-name">Microbiology</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">⚗️</span>
            <span className="feature-name">Advanced Chemistry</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🌡️</span>
            <span className="feature-name">Climate Science</span>
          </div>
        </div>
      </div>
    </div>
  );
};