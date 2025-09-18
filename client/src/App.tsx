import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { MathResources } from './components/MathResources';
import { MathHub } from './components/MathHub';
import { ScienceHub } from './components/ScienceHub';
import { DebatePage } from './components/DebatePage';
import { AmericanHistory } from './components/AmericanHistory';
import { TopicWorkspace } from './components/TopicWorkspace';
import { MathGradeSelector } from './components/MathGradeSelector';
import { TutorCards } from './components/TutorCards';
import { TutorProfile } from './components/TutorProfile';
import { BookingCalendar } from './components/BookingCalendar';
import { TutorOnboarding } from './components/TutorOnboarding';
import { ScienceSubjectSelector } from './components/ScienceSubjectSelector';
import { ScienceTutorCards } from './components/ScienceTutorCards';
import { FindTutorsHub } from './components/FindTutorsHub';
import { Topic } from './types/wasm';
import { TopicMetadata } from './types/storage';
import { MathTemplate } from './utils/mathTemplates';
import { useTopics } from './hooks/useTopics';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('personal');
  const [accountStatus, setAccountStatus] = useState<string>('active');
  const [parentId, setParentId] = useState<number | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false); // Used in onboarding check
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [, setSelectedTopic] = useState<Topic | null>(null); // For future debates feature
  const [currentView, setCurrentView] = useState<'home' | 'debate' | 'math' | 'science' | 'history' | 'tutors' | 'dashboard' | 'login' | 'admin' | 'onboarding'>('home');
  const [, setWorkspaceTopicId] = useState<string | null>(null); // For future workspace feature
  const { getTopic, createTopic } = useTopics();
  const [workspaceTopic, setWorkspaceTopic] = useState<TopicMetadata | null>(null);
  const [impersonatingAs, setImpersonatingAs] = useState<{ role: string; name: string; } | null>(null);

  // Tutor booking flow state
  const [tutorView, setTutorView] = useState<'hub' | 'grades' | 'tutors' | 'profile' | 'booking' | 'science-subjects' | 'science-tutors'>('hub');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [selectedScienceSubject, setSelectedScienceSubject] = useState<string>('');
  const [tutorType, setTutorType] = useState<'math' | 'science' | 'all'>('all');

  // Check for existing session on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAuthenticated(true);
      setUserRole(user.role || 'personal');
      setAccountStatus(user.accountStatus || 'active');
      setParentId(user.parentId || null);
    }
  }, []);

  const handleLoginSuccess = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || 'personal');
      setAccountStatus(user.accountStatus || 'active');
      setParentId(user.parentId || null);
      setUserId(user.id || null);
      setUserName(`${user.firstName || ''} ${user.lastName || ''}`);
      
      // Check if tutor needs onboarding
      if (user.role === 'tutor' && user.needsOnboarding) {
        setNeedsOnboarding(true);
        setIsAuthenticated(true);
        setCurrentView('onboarding');
        return;
      }
    }
    setIsAuthenticated(true);
    setCurrentView('dashboard'); // Navigate to dashboard after login
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole('personal');
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
    // TODO: Implement debates view
    console.log('Topic selected:', topic);
  };

  const handleMathTopicSelect = async (template: MathTemplate) => {
    try {
      // Convert MathTemplate to Topic format
      const topic: Topic = {
        id: String(template.id),
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
        // TODO: Implement debates view
        console.log('Math topic created:', topic);
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
    setTutorType('all');
    setTutorView('hub');
    setSelectedGrade('');
    setSelectedScienceSubject('');
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
            className={currentView === 'debate' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('debate')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">DEBATE</span>
          </button>
          <button 
            className={currentView === 'math' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('math')}
          >
            <span className="nav-icon">📐</span>
            <span className="nav-label">MATH</span>
          </button>
          <button 
            className={currentView === 'science' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('science')}
          >
            <span className="nav-icon">🔬</span>
            <span className="nav-label">SCIENCE</span>
          </button>
          <button 
            className={currentView === 'history' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentView('history')}
          >
            <span className="nav-icon">📜</span>
            <span className="nav-label">HISTORY</span>
          </button>
          <button 
            className={currentView === 'tutors' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setCurrentView('tutors');
              resetTutorFlow();
            }}
          >
            <span className="nav-icon">🎓</span>
            <span className="nav-label">FIND TUTORS</span>
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
              accountStatus={accountStatus}
              parentId={parentId}
              impersonatingAs={impersonatingAs}
              onNavigateToTutors={() => {
                setCurrentView('tutors');
                resetTutorFlow();
              }}
            />
          ) : (
            <Login onSuccess={handleLoginSuccess} />
          )
        )}
        
        {currentView === 'debate' && (
          <DebatePage />
        )}
        
        {currentView === 'math' && (
          <MathHub 
            onNavigateToResources={() => setCurrentView('math')}
            onNavigateToTutors={() => {
              setTutorType('math');
              setTutorView('grades');
              setCurrentView('tutors');
              setSelectedGrade('');
            }}
          />
        )}
        
        {currentView === 'science' && (
          <ScienceHub 
            onNavigateToResources={() => setCurrentView('science')}
            onNavigateToTutors={() => {
              setTutorType('science');
              setTutorView('science-subjects');
              setCurrentView('tutors');
              setSelectedGrade('');
              setSelectedScienceSubject('');
            }}
          />
        )}
        
        {currentView === 'history' && (
          <AmericanHistory />
        )}
        
        {currentView === 'admin' && isAuthenticated && (
          <AdminPanel 
            userRole={userRole}
            onImpersonate={handleImpersonate}
          />
        )}
        
        {currentView === 'onboarding' && isAuthenticated && userRole === 'tutor' && (
          <TutorOnboarding
            userId={userId || 0}
            userName={userName}
            onComplete={() => {
              setNeedsOnboarding(false);
              setCurrentView('dashboard');
              // Update user in localStorage
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                user.needsOnboarding = false;
                localStorage.setItem('user', JSON.stringify(user));
              }
            }}
          />
        )}

        {currentView === 'tutors' && (
          <>
            {tutorView === 'hub' && (
              <FindTutorsHub
                onTutorSelect={handleTutorSelect}
                onNavigateToMath={() => {
                  setTutorType('math');
                  setTutorView('grades');
                }}
                onNavigateToScience={() => {
                  setTutorType('science');
                  setTutorView('science-subjects');
                }}
              />
            )}
            
            {tutorView === 'grades' && tutorType === 'math' && (
              <MathGradeSelector onGradeSelect={handleGradeSelect} />
            )}
            
            {tutorView === 'science-subjects' && (
              <ScienceSubjectSelector 
                onSubjectSelect={(subject) => {
                  setSelectedScienceSubject(subject);
                  setTutorView('science-tutors');
                }}
              />
            )}
            
            {tutorView === 'tutors' && tutorType === 'math' && (
              <TutorCards 
                gradeLevel={selectedGrade}
                onTutorSelect={handleTutorSelect}
                onBackToGrades={() => setTutorView('grades')}
              />
            )}
            
            {tutorView === 'science-tutors' && (
              <ScienceTutorCards 
                subject={selectedScienceSubject}
                onTutorSelect={handleTutorSelect}
                onBackToSubjects={() => setTutorView('science-subjects')}
              />
            )}
            
            {tutorView === 'profile' && (
              <TutorProfile 
                tutorId={selectedTutor}
                onBackToTutors={() => {
                  if (tutorType === 'science') {
                    setTutorView('science-tutors');
                  } else if (tutorType === 'math') {
                    setTutorView('tutors');
                  } else {
                    setTutorView('hub');
                  }
                }}
                onBookSession={handleBookSession}
              />
            )}
            
            {tutorView === 'booking' && (
              <BookingCalendar 
                tutorId={selectedTutor}
                sessionType={selectedSessionType}
                onBackToProfile={() => setTutorView('profile')}
                onBookingConfirm={handleBookingConfirm}
                userRole={userRole}
                parentId={parentId}
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