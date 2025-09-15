import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { MathResources } from './components/MathResources';
import { TopicWorkspace } from './components/TopicWorkspace';
import { MathGradeSelector } from './components/MathGradeSelector';
import { TutorCards } from './components/TutorCards';
import { TutorProfile } from './components/TutorProfile';
import { BookingCalendar } from './components/BookingCalendar';
import { Topic } from './types/wasm';
import { TopicMetadata } from './types/storage';
import { MathTemplate } from './utils/mathTemplates';
import { useTopics } from './hooks/useTopics';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('student');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'resources' | 'tutor' | 'login' | 'admin'>('home');
  const [workspaceTopicId, setWorkspaceTopicId] = useState<string | null>(null);
  const { getTopic, createTopic } = useTopics();
  const [workspaceTopic, setWorkspaceTopic] = useState<TopicMetadata | null>(null);
  const [impersonatingAs, setImpersonatingAs] = useState<{ role: string; name: string; } | null>(null);

  // Tutor booking flow state
  const [tutorView, setTutorView] = useState<'grades' | 'tutors' | 'profile' | 'booking'>('grades');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');

  // Check for existing session on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAuthenticated(true);
      setUserRole(user.role || 'student');
    }
  }, []);

  const handleLoginSuccess = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || 'student');
    }
    setIsAuthenticated(true);
    setCurrentView('dashboard'); // Navigate to dashboard after login
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole('student');
    setImpersonatingAs(null);
    setCurrentView('home');
  };
  
  const handleImpersonate = (role: string, name: string) => {
    setImpersonatingAs({ role, name });
    setCurrentView('dashboard');
  };
  
  const handleExitImpersonation = () => {
    setImpersonatingAs(null);
    setCurrentView('admin');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView('debates');
  };

  const handleMathTopicSelect = async (template: MathTemplate) => {
    try {
      // Convert MathTemplate to Topic format
      const topic: Topic = {
        id: template.id,
        title: template.title,
        category: template.category,
        complexity_level: template.complexity_level,
        description: template.description,
        position: 'neutral',
        conviction: 5
      };

      // Create the topic in our system with mathematical content
      const storedTopic = await createTopic(topic);
      if (storedTopic) {
        // Set the mathematical content
        setSelectedTopic(topic);
        setCurrentView('debates');
      }
    } catch (error) {
      console.error('Failed to create mathematical topic:', error);
    }
  };

  const openWorkspace = async (topicId: string) => {
    try {
      const topic = await getTopic(topicId);
      if (topic) {
        setWorkspaceTopic(topic);
        setWorkspaceTopicId(topicId);
      }
    } catch (err) {
      console.error('Failed to load topic for workspace:', err);
    }
  };

  const closeWorkspace = () => {
    setWorkspaceTopicId(null);
    setWorkspaceTopic(null);
  };

  // Tutor booking handlers
  const handleGradeSelect = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setTutorView('tutors');
  };

  const handleTutorSelect = (tutorId: string) => {
    setSelectedTutor(tutorId);
    setTutorView('profile');
  };

  const handleBookSession = (tutorId: string, sessionType: string) => {
    setSelectedTutor(tutorId);
    setSelectedSessionType(sessionType);
    setTutorView('booking');
  };

  const handleBookingConfirm = (bookingDetails: any) => {
    // Handle booking confirmation - would integrate with payment/booking system
    console.log('Booking confirmed:', bookingDetails);
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    
    // Reset tutor flow
    setTutorView('grades');
    setSelectedGrade('');
    setSelectedTutor('');
    setSelectedSessionType('');
  };

  const resetTutorFlow = () => {
    setTutorView('grades');
    setSelectedGrade('');
    setSelectedTutor('');
    setSelectedSessionType('');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h1>DebateRank</h1>
            <span className="tagline">CRITICAL THINKING TERMINAL</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={currentView === 'home' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('home')}
          >
            <span className="nav-icon">⌂</span>
            <span className="nav-label">HOME</span>
          </button>
          <button 
            className={currentView === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              if (!isAuthenticated) {
                setCurrentView('login');
              } else {
                setCurrentView('dashboard');
              }
            }}
          >
            <span className="nav-icon">█</span>
            <span className="nav-label">DASHBOARD</span>
          </button>
          <button 
            className={currentView === 'resources' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('resources')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">RESOURCES</span>
          </button>
          <button 
            className={currentView === 'tutor' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setCurrentView('tutor');
              resetTutorFlow();
            }}
          >
            <span className="nav-icon">🎓</span>
            <span className="nav-label">FIND A TUTOR</span>
          </button>
          
          {/* Admin menu for owner and admin roles only */}
          {isAuthenticated && (userRole === 'owner' || userRole === 'admin') && (
            <button 
              className={currentView === 'admin' ? 'nav-item active' : 'nav-item'}
              onClick={() => setCurrentView('admin')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">ADMIN</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <div className="user-avatar">{userRole.toUpperCase()}</div>
                <div className="user-status">ONLINE</div>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Sign Out"
              >
                <span className="nav-icon">⎋</span>
                <span className="nav-label">LOGOUT</span>
              </button>
            </>
          ) : (
            <button 
              className="logout-btn"
              onClick={() => setCurrentView('login')}
              title="Sign In"
            >
              <span className="nav-icon">→</span>
              <span className="nav-label">LOGIN</span>
            </button>
          )}
        </div>
      </aside>

      <main className="app-main">
        {/* Impersonation Banner */}
        {impersonatingAs && (
          <div className="impersonation-banner">
            <span className="impersonation-icon">🔍</span>
            <span className="impersonation-text">
              Viewing as: <strong>{impersonatingAs.name}</strong> ({impersonatingAs.role})
            </span>
            <button 
              className="exit-impersonation-btn"
              onClick={handleExitImpersonation}
            >
              Exit Impersonation
            </button>
          </div>
        )}
        
        {currentView === 'home' && (
          <Home />
        )}
        
        {currentView === 'login' && (
          <Login onSuccess={handleLoginSuccess} />
        )}
        
        {currentView === 'dashboard' && (
          isAuthenticated ? (
            <Dashboard 
              onTopicSelect={handleTopicSelect} 
              onOpenWorkspace={openWorkspace}
              userRole={userRole}
              impersonatingAs={impersonatingAs}
            />
          ) : (
            <Login onSuccess={handleLoginSuccess} />
          )
        )}
        
        {currentView === 'resources' && (
          <MathResources />
        )}
        
        {currentView === 'admin' && isAuthenticated && (
          <AdminPanel 
            userRole={userRole}
            onImpersonate={handleImpersonate}
          />
        )}

        {currentView === 'tutor' && (
          <>
            {tutorView === 'grades' && (
              <MathGradeSelector onGradeSelect={handleGradeSelect} />
            )}
            
            {tutorView === 'tutors' && (
              <TutorCards 
                gradeLevel={selectedGrade}
                onTutorSelect={handleTutorSelect}
                onBackToGrades={() => setTutorView('grades')}
              />
            )}
            
            {tutorView === 'profile' && (
              <TutorProfile 
                tutorId={selectedTutor}
                onBackToTutors={() => setTutorView('tutors')}
                onBookSession={handleBookSession}
              />
            )}
            
            {tutorView === 'booking' && (
              <BookingCalendar 
                tutorId={selectedTutor}
                sessionType={selectedSessionType}
                onBackToProfile={() => setTutorView('profile')}
                onBookingConfirm={handleBookingConfirm}
              />
            )}
          </>
        )}
        
      </main>

      {workspaceTopic && (
        <TopicWorkspace 
          topic={workspaceTopic} 
          onClose={closeWorkspace}
        />
      )}
    </div>
  );
}

export default App;