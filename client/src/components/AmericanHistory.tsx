import React, { useState } from 'react';
import './AmericanHistory.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'lessons' | 'video' | 'timeline' | 'quiz' | 'primary-source';
  era: string;
  topicName?: string;
  topicIcon?: string;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  resources: Resource[];
}

const historyTopics: Topic[] = [
  {
    id: 'colonial',
    name: 'Colonial America',
    icon: '⛵',
    resources: [
      {
        id: 'col-1',
        title: 'The First Settlements',
        description: 'Jamestown, Plymouth, and early colonial life',
        url: '#',
        type: 'video',
        era: '1607-1700'
      },
      {
        id: 'col-2',
        title: 'Colonial Economy and Trade',
        description: 'Triangular trade, mercantilism, and colonial economics',
        url: '#',
        type: 'lessons',
        era: '1650-1750'
      },
      {
        id: 'col-3',
        title: 'Life in the 13 Colonies',
        description: 'Daily life, social structure, and colonial culture',
        url: '#',
        type: 'timeline',
        era: '1700-1770'
      },
      {
        id: 'col-4',
        title: 'French and Indian War',
        description: 'Causes, battles, and consequences',
        url: '#',
        type: 'video',
        era: '1754-1763'
      }
    ]
  },
  {
    id: 'revolution',
    name: 'Revolutionary War',
    icon: '🔔',
    resources: [
      {
        id: 'rev-1',
        title: 'Road to Revolution',
        description: 'Taxation without representation and colonial unrest',
        url: '#',
        type: 'timeline',
        era: '1763-1775'
      },
      {
        id: 'rev-2',
        title: 'Declaration of Independence',
        description: 'Original document and its meaning',
        url: '#',
        type: 'primary-source',
        era: '1776'
      },
      {
        id: 'rev-3',
        title: 'Major Battles',
        description: 'Lexington, Bunker Hill, Yorktown, and more',
        url: '#',
        type: 'video',
        era: '1775-1781'
      },
      {
        id: 'rev-4',
        title: 'Founding Fathers',
        description: 'Washington, Jefferson, Franklin, and others',
        url: '#',
        type: 'lessons',
        era: '1770-1790'
      }
    ]
  },
  {
    id: 'early-republic',
    name: 'Early Republic',
    icon: '🏛️',
    resources: [
      {
        id: 'er-1',
        title: 'The Constitution',
        description: 'Creation, ratification, and Bill of Rights',
        url: '#',
        type: 'primary-source',
        era: '1787-1791'
      },
      {
        id: 'er-2',
        title: 'First Presidents',
        description: 'Washington through Jefferson',
        url: '#',
        type: 'video',
        era: '1789-1809'
      },
      {
        id: 'er-3',
        title: 'Louisiana Purchase',
        description: 'Doubling the size of the nation',
        url: '#',
        type: 'lessons',
        era: '1803'
      },
      {
        id: 'er-4',
        title: 'War of 1812',
        description: 'The second war for independence',
        url: '#',
        type: 'timeline',
        era: '1812-1815'
      }
    ]
  },
  {
    id: 'westward',
    name: 'Westward Expansion',
    icon: '🤠',
    resources: [
      {
        id: 'west-1',
        title: 'Manifest Destiny',
        description: 'The belief in American expansion',
        url: '#',
        type: 'lessons',
        era: '1840s'
      },
      {
        id: 'west-2',
        title: 'Trail of Tears',
        description: 'Native American removal and its impact',
        url: '#',
        type: 'video',
        era: '1830-1840'
      },
      {
        id: 'west-3',
        title: 'California Gold Rush',
        description: 'The 49ers and rapid western growth',
        url: '#',
        type: 'timeline',
        era: '1849-1855'
      },
      {
        id: 'west-4',
        title: 'Oregon Trail',
        description: 'Pioneer life and westward migration',
        url: '#',
        type: 'quiz',
        era: '1840-1860'
      }
    ]
  },
  {
    id: 'civil-war',
    name: 'Civil War',
    icon: '⚔️',
    resources: [
      {
        id: 'cw-1',
        title: 'Causes of the Civil War',
        description: 'Slavery, states\' rights, and sectionalism',
        url: '#',
        type: 'video',
        era: '1850-1861'
      },
      {
        id: 'cw-2',
        title: 'Abraham Lincoln',
        description: 'Leadership during America\'s greatest crisis',
        url: '#',
        type: 'lessons',
        era: '1861-1865'
      },
      {
        id: 'cw-3',
        title: 'Major Civil War Battles',
        description: 'Gettysburg, Antietam, Bull Run, and more',
        url: '#',
        type: 'timeline',
        era: '1861-1865'
      },
      {
        id: 'cw-4',
        title: 'Emancipation Proclamation',
        description: 'Freeing the enslaved and changing war aims',
        url: '#',
        type: 'primary-source',
        era: '1863'
      }
    ]
  },
  {
    id: 'reconstruction',
    name: 'Reconstruction',
    icon: '🔨',
    resources: [
      {
        id: 'rec-1',
        title: 'Rebuilding the South',
        description: 'Plans for reconstruction and readmission',
        url: '#',
        type: 'lessons',
        era: '1865-1877'
      },
      {
        id: 'rec-2',
        title: '13th, 14th, 15th Amendments',
        description: 'Constitutional changes after the Civil War',
        url: '#',
        type: 'primary-source',
        era: '1865-1870'
      },
      {
        id: 'rec-3',
        title: 'Rise of Jim Crow',
        description: 'Segregation and the end of Reconstruction',
        url: '#',
        type: 'video',
        era: '1877-1900'
      }
    ]
  },
  {
    id: 'industrial',
    name: 'Industrial Age',
    icon: '🏭',
    resources: [
      {
        id: 'ind-1',
        title: 'Rise of Big Business',
        description: 'Rockefeller, Carnegie, and industrial giants',
        url: '#',
        type: 'video',
        era: '1870-1900'
      },
      {
        id: 'ind-2',
        title: 'Immigration Waves',
        description: 'Ellis Island and the American melting pot',
        url: '#',
        type: 'timeline',
        era: '1880-1920'
      },
      {
        id: 'ind-3',
        title: 'Labor Movement',
        description: 'Unions, strikes, and workers\' rights',
        url: '#',
        type: 'lessons',
        era: '1880-1920'
      }
    ]
  },
  {
    id: 'world-wars',
    name: 'World Wars Era',
    icon: '✈️',
    resources: [
      {
        id: 'ww-1',
        title: 'World War I',
        description: 'America enters the Great War',
        url: '#',
        type: 'video',
        era: '1917-1918'
      },
      {
        id: 'ww-2',
        title: 'Roaring Twenties',
        description: 'Jazz age, prohibition, and prosperity',
        url: '#',
        type: 'timeline',
        era: '1920-1929'
      },
      {
        id: 'ww-3',
        title: 'Great Depression',
        description: 'Economic collapse and the New Deal',
        url: '#',
        type: 'lessons',
        era: '1929-1941'
      },
      {
        id: 'ww-4',
        title: 'World War II',
        description: 'Pearl Harbor to V-J Day',
        url: '#',
        type: 'video',
        era: '1941-1945'
      }
    ]
  },
  {
    id: 'cold-war',
    name: 'Cold War',
    icon: '🚀',
    resources: [
      {
        id: 'cold-1',
        title: 'Origins of the Cold War',
        description: 'US vs USSR and the Iron Curtain',
        url: '#',
        type: 'video',
        era: '1945-1950'
      },
      {
        id: 'cold-2',
        title: 'Korean War',
        description: 'The forgotten war',
        url: '#',
        type: 'timeline',
        era: '1950-1953'
      },
      {
        id: 'cold-3',
        title: 'Space Race',
        description: 'Sputnik to the Moon landing',
        url: '#',
        type: 'video',
        era: '1957-1969'
      },
      {
        id: 'cold-4',
        title: 'Vietnam War',
        description: 'America\'s longest war',
        url: '#',
        type: 'lessons',
        era: '1955-1975'
      }
    ]
  },
  {
    id: 'civil-rights',
    name: 'Civil Rights',
    icon: '✊',
    resources: [
      {
        id: 'cr-1',
        title: 'Brown v. Board of Education',
        description: 'Ending school segregation',
        url: '#',
        type: 'primary-source',
        era: '1954'
      },
      {
        id: 'cr-2',
        title: 'Martin Luther King Jr.',
        description: 'Leader of the civil rights movement',
        url: '#',
        type: 'video',
        era: '1955-1968'
      },
      {
        id: 'cr-3',
        title: 'March on Washington',
        description: 'I Have a Dream speech',
        url: '#',
        type: 'primary-source',
        era: '1963'
      },
      {
        id: 'cr-4',
        title: 'Civil Rights Act',
        description: 'Landmark legislation',
        url: '#',
        type: 'lessons',
        era: '1964'
      }
    ]
  },
  {
    id: 'modern',
    name: 'Modern America',
    icon: '💻',
    resources: [
      {
        id: 'mod-1',
        title: 'End of the Cold War',
        description: 'Fall of the Berlin Wall and Soviet collapse',
        url: '#',
        type: 'video',
        era: '1989-1991'
      },
      {
        id: 'mod-2',
        title: 'September 11th',
        description: 'Terror attacks and their aftermath',
        url: '#',
        type: 'timeline',
        era: '2001'
      },
      {
        id: 'mod-3',
        title: 'Digital Revolution',
        description: 'Internet age and social media',
        url: '#',
        type: 'lessons',
        era: '1990-present'
      }
    ]
  }
];

export const AmericanHistory: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'lessons' | 'video' | 'timeline' | 'quiz' | 'primary-source'>('all');
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
    ? historyTopics.flatMap(topic => 
        topic.resources.map(resource => ({ ...resource, topicName: topic.name, topicIcon: topic.icon }))
      )
    : historyTopics.find(t => t.id === selectedTopic)?.resources.map(resource => 
        ({ ...resource, topicName: historyTopics.find(t => t.id === selectedTopic)?.name || '', 
           topicIcon: historyTopics.find(t => t.id === selectedTopic)?.icon || '' })
      ) || [];
  
  const filteredResources = allResources.filter(resource => {
    const eraMatch = selectedEra === 'all' || resource.era.toLowerCase().includes(selectedEra.toLowerCase());
    const typeMatch = activeResourceType === 'all' || resource.type === activeResourceType;
    const searchMatch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.topicName && resource.topicName.toLowerCase().includes(searchQuery.toLowerCase()));
    return eraMatch && typeMatch && searchMatch;
  });

  // Infinite scroll implementation
  React.useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
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

  // Topics carousel settings - Always show 3 topics + "All Eras" = 4 total
  const topicsPerPage = 3; // 3 topics + "All" button = 4 items
  const totalTopicPages = Math.ceil(historyTopics.length / topicsPerPage);
  const topicStartIndex = topicPage * topicsPerPage;
  const topicEndIndex = topicStartIndex + topicsPerPage;
  const visibleTopics = historyTopics.slice(topicStartIndex, topicEndIndex);

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
      case 'lessons': return '📖';
      case 'video': return '🎬';
      case 'timeline': return '📅';
      case 'quiz': return '❓';
      case 'primary-source': return '📜';
      default: return '📚';
    }
  };

  const handleResourceClick = (resource: Resource) => {
    // Add to history with timestamp
    const resourceWithTimestamp = { ...resource, viewedAt: new Date().toISOString(), source: 'history' };
    const savedHistory = localStorage.getItem('historyResourcesHistory');
    let history = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
    const newHistory = [resourceWithTimestamp, ...history.filter((r: any) => r.id !== resource.id)].slice(0, 50);
    localStorage.setItem('historyResourcesHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="american-history">
      <div className="resources-header">
        <h1>American History</h1>
        <p className="tagline">Explore the journey of the United States from colonial times to today</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search history resources..."
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
              <span className="topic-name">All Eras</span>
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

        <div className="era-filters">
          <button
            className={`era-filter ${selectedEra === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedEra('all')}
          >
            All Periods
          </button>
          <button
            className={`era-filter ${selectedEra === '1600' ? 'active' : ''}`}
            onClick={() => setSelectedEra('1600')}
          >
            1600s-1700s
          </button>
          <button
            className={`era-filter ${selectedEra === '18' ? 'active' : ''}`}
            onClick={() => setSelectedEra('18')}
          >
            1800s
          </button>
          <button
            className={`era-filter ${selectedEra === '19' ? 'active' : ''}`}
            onClick={() => setSelectedEra('19')}
          >
            1900s
          </button>
          <button
            className={`era-filter ${selectedEra === '20' ? 'active' : ''}`}
            onClick={() => setSelectedEra('20')}
          >
            2000s
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
          className={`resource-tab ${activeResourceType === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('lessons')}
        >
          <span className="tab-icon">📖</span>
          <span className="tab-label">Lessons</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'video' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('video')}
        >
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Videos</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('timeline')}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-label">Timelines</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'primary-source' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('primary-source')}
        >
          <span className="tab-icon">📜</span>
          <span className="tab-label">Primary Sources</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('quiz')}
        >
          <span className="tab-icon">❓</span>
          <span className="tab-label">Quizzes</span>
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
                <div className="skeleton-era"></div>
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
                  <span className="type-label">{resource.type.replace('-', ' ')}</span>
                </div>
                <h3>{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-meta">
                  <span className="era-label">{resource.era}</span>
                </div>
                <button 
                  className="resource-button"
                  onClick={() => handleResourceClick(resource)}
                >
                  {resource.type === 'lessons' ? 'Study Lesson' :
                   resource.type === 'video' ? 'Watch' : 
                   resource.type === 'timeline' ? 'Explore' :
                   resource.type === 'quiz' ? 'Take Quiz' :
                   resource.type === 'primary-source' ? 'View Source' : 'Open'}
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
        <h2>More History Resources Coming Soon!</h2>
        <p>We're constantly adding new historical content and primary sources.</p>
        <div className="upcoming-features">
          <div className="upcoming-card">
            <span className="feature-icon">🗺️</span>
            <span className="feature-name">Interactive Maps</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🎙️</span>
            <span className="feature-name">Historical Podcasts</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🏛️</span>
            <span className="feature-name">Virtual Museum Tours</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">📰</span>
            <span className="feature-name">Historical Newspapers</span>
          </div>
        </div>
      </div>
    </div>
  );
};