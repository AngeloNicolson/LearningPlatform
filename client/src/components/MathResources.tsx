import React, { useState, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
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
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  resources: Resource[];
}

const mathTopics: Topic[] = [
  {
    id: 'arithmetic',
    name: 'Arithmetic',
    icon: '➕',
    resources: [
      {
        id: 'arith-1',
        title: 'Single Digit Addition',
        description: 'Master adding numbers from 0-9',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'arith-2',
        title: 'Addition with Carrying',
        description: 'Learn to add multi-digit numbers',
        url: '#',
        type: 'video',
        gradeLevel: 'Elementary'
      },
      {
        id: 'arith-3',
        title: 'Multiplication Tables Game',
        description: 'Fun way to memorize multiplication facts',
        url: '#',
        type: 'game',
        gradeLevel: 'Elementary'
      },
      {
        id: 'arith-4',
        title: 'Long Division Tutorial',
        description: 'Step-by-step guide to division',
        url: '#',
        type: 'video',
        gradeLevel: 'Elementary'
      },
      {
        id: 'arith-5',
        title: 'Word Problems Workshop',
        description: 'Apply arithmetic to real-world scenarios',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'arith-6',
        title: 'Order of Operations',
        description: 'Master PEMDAS with interactive worksheets',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'arith-7',
        title: 'Mental Math Strategies',
        description: 'Quick calculation techniques',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      }
    ]
  },
  {
    id: 'fractions',
    name: 'Fractions & Decimals',
    icon: '½',
    resources: [
      {
        id: 'frac-1',
        title: 'What is a Fraction?',
        description: 'Visual introduction to fractions',
        url: '#',
        type: 'video',
        gradeLevel: 'Elementary'
      },
      {
        id: 'frac-2',
        title: 'Fraction Pizzas',
        description: 'Interactive fraction visualization',
        url: '#',
        type: 'game',
        gradeLevel: 'Elementary'
      },
      {
        id: 'frac-3',
        title: 'Decimal Place Values',
        description: 'Understanding tenths and hundredths',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'frac-4',
        title: 'Converting Fractions to Decimals',
        description: 'Learn the conversion process',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'frac-5',
        title: 'Adding and Subtracting Fractions',
        description: 'Common denominators and mixed numbers',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'frac-6',
        title: 'Multiplying and Dividing Fractions',
        description: 'Advanced fraction operations',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'frac-7',
        title: 'Decimal Operations',
        description: 'Add, subtract, multiply, and divide decimals',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'frac-8',
        title: 'Percentage Problems',
        description: 'Converting and calculating percentages',
        url: '#',
        type: 'quiz',
        gradeLevel: 'Middle School'
      }
    ]
  },
  {
    id: 'algebra',
    name: 'Algebra',
    icon: '𝑥',
    resources: [
      {
        id: 'alg-1',
        title: 'Introduction to Variables',
        description: 'Understanding unknowns in math',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'alg-2',
        title: 'Simplifying Expressions',
        description: 'Combine like terms and simplify',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'alg-3',
        title: 'Solving One-Step Equations',
        description: 'Basic equation solving techniques',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'alg-4',
        title: 'Two-Step Equations',
        description: 'Advanced equation solving',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'alg-5',
        title: 'Linear Functions',
        description: 'Slope, y-intercept, and graphing',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'alg-6',
        title: 'Systems of Equations',
        description: 'Solve multiple equations simultaneously',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'alg-7',
        title: 'Quadratic Functions',
        description: 'Parabolas and quadratic equations',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'alg-8',
        title: 'Factoring Polynomials',
        description: 'Factor and solve polynomial equations',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'alg-9',
        title: 'Exponential Functions',
        description: 'Growth and decay models',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'alg-10',
        title: 'Logarithms',
        description: 'Introduction to logarithmic functions',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      }
    ]
  },
  {
    id: 'geometry',
    name: 'Geometry',
    icon: '📐',
    resources: [
      {
        id: 'geom-1',
        title: '2D Shapes Explorer',
        description: 'Learn about circles, squares, and triangles',
        url: '#',
        type: 'game',
        gradeLevel: 'Elementary'
      },
      {
        id: 'geom-2',
        title: 'Pattern Recognition',
        description: 'Find and create patterns',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'geom-3',
        title: 'Types of Angles',
        description: 'Acute, obtuse, and right angles',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'geom-4',
        title: 'Triangle Properties',
        description: 'Sum of angles and triangle types',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'geom-5',
        title: 'Area and Perimeter',
        description: 'Calculate area of various shapes',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'geom-6',
        title: 'Volume and Surface Area',
        description: '3D shapes and their properties',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'geom-7',
        title: 'Geometric Proofs',
        description: 'Logic and reasoning in geometry',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'geom-8',
        title: 'Triangle Congruence',
        description: 'SSS, SAS, ASA, AAS, and HL',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'geom-9',
        title: 'Circle Theorems',
        description: 'Angles, arcs, and chords',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'geom-10',
        title: 'Coordinate Geometry',
        description: 'Distance, midpoint, and slope formulas',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      }
    ]
  },
  {
    id: 'trigonometry',
    name: 'Trigonometry',
    icon: '△',
    resources: [
      {
        id: 'trig-1',
        title: 'Introduction to Sine, Cosine, Tangent',
        description: 'Basic trigonometric ratios',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-2',
        title: 'Right Triangle Problems',
        description: 'Solve triangles using trig ratios',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-3',
        title: 'Unit Circle Mastery',
        description: 'Interactive unit circle exploration',
        url: '#',
        type: 'game',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-4',
        title: 'Trig Identities',
        description: 'Prove and use trigonometric identities',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-5',
        title: 'Graphing Trig Functions',
        description: 'Amplitude, period, and phase shift',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-6',
        title: 'Inverse Trig Functions',
        description: 'Arcsin, arccos, and arctan',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'trig-7',
        title: 'Law of Sines and Cosines',
        description: 'Solve any triangle',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      }
    ]
  },
  {
    id: 'calculus',
    name: 'Calculus',
    icon: '∫',
    resources: [
      {
        id: 'calc-1',
        title: 'Introduction to Limits',
        description: 'Understanding limits graphically',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'calc-2',
        title: 'Limit Laws',
        description: 'Calculate limits algebraically',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'High School'
      },
      {
        id: 'calc-3',
        title: 'Epsilon-Delta Definition',
        description: 'Rigorous definition of limits',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'calc-4',
        title: 'Differentiation Rules',
        description: 'Chain rule, product rule, quotient rule',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'calc-5',
        title: 'Implicit Differentiation',
        description: 'Derivatives of implicit functions',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'calc-6',
        title: 'Optimization Problems',
        description: 'Max/min applications',
        url: '#',
        type: 'quiz',
        gradeLevel: 'College'
      },
      {
        id: 'calc-7',
        title: 'Antiderivatives',
        description: 'Finding antiderivatives and indefinite integrals',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'calc-8',
        title: 'Definite Integrals',
        description: 'Riemann sums and FTC',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'calc-9',
        title: 'Integration Techniques',
        description: 'U-substitution, parts, and trig substitution',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'calc-10',
        title: 'Series and Sequences',
        description: 'Convergence tests and Taylor series',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      }
    ]
  },
  {
    id: 'statistics',
    name: 'Statistics',
    icon: '📊',
    resources: [
      {
        id: 'stat-1',
        title: 'Creating Bar Graphs',
        description: 'Visualize data with graphs',
        url: '#',
        type: 'video',
        gradeLevel: 'Elementary'
      },
      {
        id: 'stat-2',
        title: 'Reading Charts and Tables',
        description: 'Interpret data presentations',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Elementary'
      },
      {
        id: 'stat-3',
        title: 'Mean, Median, Mode',
        description: 'Measures of central tendency',
        url: '#',
        type: 'video',
        gradeLevel: 'Middle School'
      },
      {
        id: 'stat-4',
        title: 'Range and Variability',
        description: 'Understanding data spread',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'stat-5',
        title: 'Box and Whisker Plots',
        description: 'Visualizing data distribution',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'Middle School'
      },
      {
        id: 'stat-6',
        title: 'Probability Basics',
        description: 'Introduction to probability concepts',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'stat-7',
        title: 'Normal Distribution',
        description: 'Bell curves and standard deviation',
        url: '#',
        type: 'video',
        gradeLevel: 'High School'
      },
      {
        id: 'stat-8',
        title: 'Hypothesis Testing',
        description: 'Statistical inference and significance',
        url: '#',
        type: 'quiz',
        gradeLevel: 'College'
      },
      {
        id: 'stat-9',
        title: 'Regression Analysis',
        description: 'Linear regression and correlation',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      }
    ]
  },
  {
    id: 'linear-algebra',
    name: 'Linear Algebra',
    icon: '⊗',
    resources: [
      {
        id: 'la-1',
        title: 'Matrix Operations',
        description: 'Addition, multiplication, and inverses',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'la-2',
        title: 'Gaussian Elimination',
        description: 'Solving systems of equations',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'la-3',
        title: 'Determinants',
        description: 'Computing and using determinants',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'la-4',
        title: 'Vector Spaces',
        description: 'Understanding abstract vector spaces',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'la-5',
        title: 'Eigenvalues and Eigenvectors',
        description: 'Finding and using eigenvalues',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'la-6',
        title: 'Linear Transformations',
        description: 'Mappings between vector spaces',
        url: '#',
        type: 'quiz',
        gradeLevel: 'College'
      }
    ]
  },
  {
    id: 'discrete',
    name: 'Discrete Math',
    icon: '🎲',
    resources: [
      {
        id: 'disc-1',
        title: 'Propositional Logic',
        description: 'Truth tables and logical operations',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'disc-2',
        title: 'Proof Techniques',
        description: 'Direct, contradiction, and induction',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'disc-3',
        title: 'Set Theory',
        description: 'Operations and cardinality',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'disc-4',
        title: 'Graph Theory Basics',
        description: 'Vertices, edges, and representations',
        url: '#',
        type: 'video',
        gradeLevel: 'College'
      },
      {
        id: 'disc-5',
        title: 'Trees and Algorithms',
        description: 'MST algorithms and applications',
        url: '#',
        type: 'worksheet',
        gradeLevel: 'College'
      },
      {
        id: 'disc-6',
        title: 'Combinatorics',
        description: 'Counting principles and permutations',
        url: '#',
        type: 'quiz',
        gradeLevel: 'College'
      }
    ]
  }
];

export const MathResources: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTopic, setSelectedTopic] = useState<string>(navigation.currentState.mathTab || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'video' | 'worksheet' | 'quiz' | 'game'>('all');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);

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

  // Simulate initial load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get all resources or filter by topic
  const allResources = selectedTopic === 'all' 
    ? mathTopics.flatMap(topic => 
        topic.resources.map(resource => ({ ...resource, topicName: topic.name, topicIcon: topic.icon }))
      )
    : mathTopics.find(t => t.id === selectedTopic)?.resources.map(resource => 
        ({ ...resource, topicName: mathTopics.find(t => t.id === selectedTopic)?.name || '', 
           topicIcon: mathTopics.find(t => t.id === selectedTopic)?.icon || '' })
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

  // Topics carousel settings - Always show 3 topics + "All Topics" = 4 total
  const topicsPerPage = 3; // 3 topics + "All" button = 4 items
  const totalTopicPages = Math.ceil(mathTopics.length / topicsPerPage);
  const topicStartIndex = topicPage * topicsPerPage;
  const topicEndIndex = topicStartIndex + topicsPerPage;
  const visibleTopics = mathTopics.slice(topicStartIndex, topicEndIndex);

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
          className={`resource-tab ${activeResourceType === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('quiz')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Quizzes</span>
        </button>
        <button
          className={`resource-tab ${activeResourceType === 'game' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('game')}
        >
          <span className="tab-icon">🎮</span>
          <span className="tab-label">Games</span>
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