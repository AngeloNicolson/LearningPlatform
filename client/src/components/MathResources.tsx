import React, { useState } from 'react';
import './MathResources.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: 'video' | 'worksheet' | 'practice' | 'quiz' | 'game';
  gradeLevel: string;
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
        type: 'practice',
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
        description: 'Master PEMDAS with practice problems',
        url: '#',
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
        type: 'practice',
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
  const [selectedTopic, setSelectedTopic] = useState<string>('arithmetic');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeResourceType, setActiveResourceType] = useState<'all' | 'video' | 'worksheet' | 'practice' | 'quiz' | 'game'>('all');

  const currentTopic = mathTopics.find(t => t.id === selectedTopic);
  
  const filteredResources = currentTopic?.resources.filter(resource => {
    const gradeMatch = selectedGrade === 'all' || resource.gradeLevel.toLowerCase().includes(selectedGrade);
    const typeMatch = activeResourceType === 'all' || resource.type === activeResourceType;
    return gradeMatch && typeMatch;
  }) || [];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return '🎬';
      case 'worksheet': return '📝';
      case 'practice': return '✏️';
      case 'quiz': return '📋';
      case 'game': return '🎮';
      default: return '📚';
    }
  };

  return (
    <div className="math-resources">
      <div className="resources-header">
        <h1>Math Resources</h1>
        <p className="tagline">Master mathematics from elementary to advanced levels</p>
      </div>

      <div className="filters-section">
        <div className="topic-filters">
          {mathTopics.map(topic => (
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
          className={`resource-tab ${activeResourceType === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveResourceType('practice')}
        >
          <span className="tab-icon">✏️</span>
          <span className="tab-label">Practice</span>
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
                 resource.type === 'practice' ? 'Practice' :
                 resource.type === 'quiz' ? 'Start Quiz' :
                 resource.type === 'game' ? 'Play' : 'Open'}
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