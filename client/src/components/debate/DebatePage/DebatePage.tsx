import React, { useState } from 'react';
import './DebatePage.css';

interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  participants: number;
  lastActive: string;
  status: 'active' | 'closed' | 'upcoming';
}

const debateTopics: DebateTopic[] = [
  {
    id: '1',
    title: 'Should AI be regulated by governments?',
    description: 'Discuss the pros and cons of government regulation on artificial intelligence development and deployment.',
    category: 'Technology',
    participants: 24,
    lastActive: '2 hours ago',
    status: 'active'
  },
  {
    id: '2',
    title: 'Is remote work better than office work?',
    description: 'Debate the effectiveness and impact of remote work versus traditional office environments.',
    category: 'Work & Career',
    participants: 18,
    lastActive: '5 hours ago',
    status: 'active'
  },
  {
    id: '3',
    title: 'Universal Basic Income: Solution or Problem?',
    description: 'Explore whether UBI is a viable solution to economic inequality and automation.',
    category: 'Economics',
    participants: 31,
    lastActive: '1 day ago',
    status: 'active'
  },
  {
    id: '4',
    title: 'Climate Change: Individual vs Corporate Responsibility',
    description: 'Who bears more responsibility for addressing climate change - individuals or corporations?',
    category: 'Environment',
    participants: 42,
    lastActive: '3 hours ago',
    status: 'active'
  },
  {
    id: '5',
    title: 'Should social media platforms be liable for content?',
    description: 'Debate whether platforms should be held responsible for user-generated content.',
    category: 'Technology',
    participants: 0,
    lastActive: 'Starting soon',
    status: 'upcoming'
  },
  {
    id: '6',
    title: 'The Ethics of Gene Editing',
    description: 'Should we allow genetic modification of human embryos for medical purposes?',
    category: 'Science & Ethics',
    participants: 67,
    lastActive: '2 days ago',
    status: 'closed'
  }
];

const categories = ['All', 'Technology', 'Economics', 'Environment', 'Science & Ethics', 'Work & Career', 'Education', 'Politics'];

export const DebatePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'upcoming' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = debateTopics.filter(topic => {
    const categoryMatch = selectedCategory === 'All' || topic.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || topic.status === selectedStatus;
    const searchMatch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return '🔴';
      case 'upcoming': return '⏰';
      case 'closed': return '🔒';
      default: return '📝';
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-upcoming';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  return (
    <div className="debate-page">
      <div className="debate-header">
        <h1>Debate Arena</h1>
        <p className="tagline">Engage in thoughtful discussions and challenge perspectives</p>
      </div>

      <div className="debate-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search debates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-section">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="status-filters">
            <button
              className={`status-filter ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All Debates
            </button>
            <button
              className={`status-filter ${selectedStatus === 'active' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('active')}
            >
              🔴 Active
            </button>
            <button
              className={`status-filter ${selectedStatus === 'upcoming' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('upcoming')}
            >
              ⏰ Upcoming
            </button>
            <button
              className={`status-filter ${selectedStatus === 'closed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('closed')}
            >
              🔒 Closed
            </button>
          </div>
        </div>
      </div>

      <div className="debates-grid">
        {filteredTopics.length > 0 ? (
          filteredTopics.map(topic => (
            <div key={topic.id} className={`debate-card ${getStatusClass(topic.status)}`}>
              <div className="debate-card-header">
                <span className="debate-category">{topic.category}</span>
                <span className={`debate-status ${getStatusClass(topic.status)}`}>
                  {getStatusIcon(topic.status)} {topic.status}
                </span>
              </div>
              
              <h3 className="debate-title">{topic.title}</h3>
              <p className="debate-description">{topic.description}</p>
              
              <div className="debate-meta">
                <span className="participant-count">
                  👥 {topic.participants} participants
                </span>
                <span className="last-active">
                  🕐 {topic.lastActive}
                </span>
              </div>
              
              <button 
                className="join-debate-btn"
                disabled={topic.status === 'closed'}
              >
                {topic.status === 'active' ? 'Join Debate' : 
                 topic.status === 'upcoming' ? 'Set Reminder' : 
                 'View Archive'}
              </button>
            </div>
          ))
        ) : (
          <div className="no-debates">
            <p>No debates found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="create-debate-section">
        <h2>Start a New Debate</h2>
        <p>Have a topic you're passionate about? Start a new debate and invite others to participate.</p>
        <button className="create-debate-btn">
          ➕ Create New Debate
        </button>
      </div>

      <div className="debate-rules-section">
        <h2>Debate Guidelines</h2>
        <div className="rules-grid">
          <div className="rule-card">
            <span className="rule-icon">🤝</span>
            <h3>Be Respectful</h3>
            <p>Treat all participants with respect, even when disagreeing strongly.</p>
          </div>
          <div className="rule-card">
            <span className="rule-icon">📚</span>
            <h3>Use Evidence</h3>
            <p>Support your arguments with facts, data, and credible sources.</p>
          </div>
          <div className="rule-card">
            <span className="rule-icon">👂</span>
            <h3>Listen Actively</h3>
            <p>Consider opposing viewpoints and respond thoughtfully.</p>
          </div>
          <div className="rule-card">
            <span className="rule-icon">🎯</span>
            <h3>Stay On Topic</h3>
            <p>Keep discussions focused on the debate topic at hand.</p>
          </div>
        </div>
      </div>
    </div>
  );
};