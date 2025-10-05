import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { CassetteButton } from '../../common/CassetteButton/CassetteButton';
import './MathResources.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'video' | 'worksheet' | 'quiz' | 'game';
  gradeLevel: string;
  topicName?: string;
  topicIcon?: string;
  topic_id?: string;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
}

export const MathResources: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.mathTab || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'video' | 'worksheet' | 'quiz' | 'game'>('all');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [apiTopics, setApiTopics] = useState<Topic[]>([]);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`https://localhost:3001/api/resources/math/topics`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiTopics(data);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedTopic !== 'all') {
          params.append('topic', selectedTopic);
        }
        
        const response = await fetch(`https://localhost:3001/api/resources/math?${params.toString()}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Map API data to match Resource interface
          const mappedResources = data.map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            gradeLevel: r.gradeLevel,
            url: r.url,
            topic_id: r.topic_id,
            topicName: apiTopics.find(t => t.id === r.topic_id)?.name,
            topicIcon: apiTopics.find(t => t.id === r.topic_id)?.icon
          }));
          setApiResources(mappedResources);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [selectedTopic, apiTopics]);

  // Sync with navigation state
  useEffect(() => {
    if (navigation.currentState.mathTab) {
      setSelectedTopic(navigation.currentState.mathTab);
    }
  }, [navigation.currentState.mathTab]);

  // Update navigation when topic changes
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    navigation.navigate({ mathTab: topic });
  };

  // Get all resources or filter by topic (now uses API data)
  const allResources = apiResources;
  
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

  // Topics carousel settings - Always show 3 topics + "All Topics" = 4 total
  const topicsPerPage = 3; // 3 topics + "All" button = 4 items
  const totalTopicPages = Math.ceil(apiTopics.length / topicsPerPage);
  const topicStartIndex = topicPage * topicsPerPage;
  const topicEndIndex = topicStartIndex + topicsPerPage;
  const visibleTopics = apiTopics.slice(topicStartIndex, topicEndIndex);

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
      case 'quiz': return '📋';
      case 'game': return '🎮';
      default: return '📚';
    }
  };

  const handleResourceClick = (resource: Resource) => {
    // Add to history with timestamp
    const resourceWithTimestamp = { ...resource, viewedAt: new Date().toISOString() };
    const savedHistory = localStorage.getItem('mathResourcesHistory');
    let history = [];
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
    const newHistory = [resourceWithTimestamp, ...history.filter((r: any) => r.id !== resource.id)].slice(0, 50);
    localStorage.setItem('mathResourcesHistory', JSON.stringify(newHistory));
  };


  return (
    <div className="math-resources">
      <div className="resources-header">
        <h1>Math Resources</h1>
        <p className="tagline">Master mathematics from elementary to advanced levels</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search math resources..."
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
                handleTopicChange('all');
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
                  handleTopicChange(topic.id);
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
      <div className="resource-type-tabs"><CassetteButton
          icon="📚"
          label="All Resources"
          isActive={activeResourceType === 'all'}
          onClick={() => setActiveResourceType('all')}
        /><CassetteButton
          icon="📝"
          label="Worksheets"
          isActive={activeResourceType === 'worksheet'}
          onClick={() => setActiveResourceType('worksheet')}
        /><CassetteButton
          icon="🎬"
          label="Videos"
          isActive={activeResourceType === 'video'}
          onClick={() => setActiveResourceType('video')}
        /><CassetteButton
          icon="📋"
          label="Quizzes"
          isActive={activeResourceType === 'quiz'}
          onClick={() => setActiveResourceType('quiz')}
        /><CassetteButton
          icon="🎮"
          label="Games"
          isActive={activeResourceType === 'game'}
          onClick={() => setActiveResourceType('game')}
        /></div>

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
                   resource.type === 'quiz' ? 'Start Quiz' :
                   resource.type === 'game' ? 'Play' : 'Open'}
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
        <h2>More Math Resources Coming Soon!</h2>
        <p>We're constantly expanding our collection with new problems, videos, and interactive content.</p>
        <div className="upcoming-features">
          <div className="upcoming-card">
            <span className="feature-icon">🧮</span>
            <span className="feature-name">Mental Math</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">📈</span>
            <span className="feature-name">AP Courses</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🔢</span>
            <span className="feature-name">Number Theory</span>
          </div>
          <div className="upcoming-card">
            <span className="feature-icon">🎯</span>
            <span className="feature-name">Competition Math</span>
          </div>
        </div>
      </div>
    </div>
  );
};