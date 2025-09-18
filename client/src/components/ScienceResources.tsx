import React, { useState } from 'react';
import './ScienceResources.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'video' | 'worksheet' | 'experiment' | 'simulation';
  gradeLevel: string;
  topicName?: string;
  topicIcon?: string;
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
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'video' | 'worksheet' | 'experiment' | 'simulation'>('all');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Simulate initial load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get all resources or filter by topic
  const allResources = selectedTopic === 'all' 
    ? scienceTopics.flatMap(topic => 
        topic.resources.map(resource => ({ ...resource, topicName: topic.name, topicIcon: topic.icon }))
      )
    : scienceTopics.find(t => t.id === selectedTopic)?.resources.map(resource => 
        ({ ...resource, topicName: scienceTopics.find(t => t.id === selectedTopic)?.name || '', 
           topicIcon: scienceTopics.find(t => t.id === selectedTopic)?.icon || '' })
      ) || [];
  
  const filteredResources = allResources.filter(resource => {
    const gradeMatch = selectedGrade === 'all' || resource.gradeLevel.toLowerCase().includes(selectedGrade);
    const typeMatch = activeResourceType === 'all' || resource.type === activeResourceType;
    const searchMatch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.topicName && resource.topicName.toLowerCase().includes(searchQuery.toLowerCase()));
    return gradeMatch && typeMatch && searchMatch;
  });

  // Infinite scroll implementation
  React.useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // Load more when user scrolls to 80% of the page
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        if (visibleCount < filteredResources.length) {
          setVisibleCount(prev => Math.min(prev + 10, filteredResources.length));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredResources.length, isLoading]);

  const visibleResources = filteredResources.slice(0, visibleCount);

  // Topics carousel settings - Show all 4 topics since they fit with "All Topics"
  const topicsPerPage = 4; // All 4 science topics fit perfectly
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

  const handleResourceClick = (resource: Resource) => {
    // Add to history with timestamp
    const resourceWithTimestamp = { ...resource, viewedAt: new Date().toISOString() };
    const savedHistory = localStorage.getItem('scienceResourcesHistory');
    let history = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
    const newHistory = [resourceWithTimestamp, ...history.filter((r: any) => r.id !== resource.id)].slice(0, 50);
    localStorage.setItem('scienceResourcesHistory', JSON.stringify(newHistory));
  };


  return (
    <div className="science-resources">
      <div className="resources-header">
        <h1>Science Resources</h1>
        <p className="tagline">Explore interactive science content across multiple disciplines</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search science resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
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
            <button
              className={`topic-filter ${selectedTopic === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedTopic('all');
                setVisibleCount(8);
              }}
            >
              <span className="topic-icon">📚</span>
              <span className="topic-name">All Topics</span>
            </button>
            {visibleTopics.map(topic => (
              <button
                key={topic.id}
                className={`topic-filter ${selectedTopic === topic.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setVisibleCount(8);
                }}
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

        <div className="carousel-dots">
          {Array.from({ length: totalTopicPages }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${topicPage === index ? 'active' : ''}`}
              onClick={() => setTopicPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        <div className="grade-filters">
          <button
            className={`grade-filter ${selectedGrade === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('all')}
          >
            All Grades
          </button>
          <button
            className={`grade-filter ${selectedGrade === 'elementary' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('elementary')}
          >
            Elementary
          </button>
          <button
            className={`grade-filter ${selectedGrade === 'middle' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('middle')}
          >
            Middle School
          </button>
          <button
            className={`grade-filter ${selectedGrade === 'high' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('high')}
          >
            High School
          </button>
          <button
            className={`grade-filter ${selectedGrade === 'college' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('college')}
          >
            College
          </button>
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
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="resource-card skeleton">
              <div className="skeleton-type"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-meta">
                <div className="skeleton-grade"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))
        ) : filteredResources.length > 0 ? (
          <>
            {visibleResources.map(resource => (
              <div key={resource.id} className="resource-card">
                {resource.topicIcon && selectedTopic === 'all' && (
                  <div className="resource-topic-badge">
                    <span className="badge-icon">{resource.topicIcon}</span>
                    <span className="badge-name">{resource.topicName}</span>
                  </div>
                )}
                <div className="resource-type">
                  <span className="type-icon">{getTypeIcon(resource.type)}</span>
                  <span className="type-label">{resource.type}</span>
                </div>
                <h3>{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-meta">
                  <span className="grade-level">{resource.gradeLevel}</span>
                </div>
                <button 
                  className="resource-button"
                  onClick={() => handleResourceClick(resource)}
                >
                  {resource.type === 'video' ? 'Watch' : 
                   resource.type === 'worksheet' ? 'Download' : 
                   resource.type === 'experiment' ? 'Start Lab' : 
                   'Launch'}
                </button>
              </div>
            ))}
            {visibleCount < filteredResources.length && (
              <div className="loading-more">
                <div className="loading-spinner"></div>
                <p>Loading more resources...</p>
              </div>
            )}
          </>
        ) : (
          <div className="no-resources">
            <p>No resources found matching your criteria.</p>
            {searchQuery && (
              <p className="search-hint">Try adjusting your search terms or filters.</p>
            )}
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