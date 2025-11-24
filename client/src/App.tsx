/**
 * @file App.tsx
 * @author Angelo Nicolson
 * @brief Main application component with routing and state management
 * @description Root component managing the entire application state and navigation. Orchestrates view routing,
 * authentication flow, tutor booking workflow, educational resource navigation (math/science/history), admin panel access,
 * user impersonation, and workspace management. Provides a retro-styled sidebar navigation with role-based menu items
 * and integrates ThemeProvider, NavigationProvider, and AuthProvider contexts for global state management.
 */

import { useState, useEffect } from 'react';
import { Login } from './components/auth/Login/Login';
import { Home } from './components/layout/Home/Home';
import { Dashboard } from './components/layout/Dashboard/Dashboard';
import { AdminPanel } from './components/admin/AdminPanel/AdminPanel';
import { MathPage } from './pages/MathPage/MathPage';
import { SciencePage } from './pages/SciencePage/SciencePage';
import { HistoryPage } from './pages/HistoryPage/HistoryPage';
import { BiblePage } from './pages/BiblePage/BiblePage';
import { CoreSubjectsPage } from './pages/CoreSubjectsPage/CoreSubjectsPage';
import { ElectivesPage } from './pages/ElectivesPage/ElectivesPage';
import { BiblicalHistoryPage } from './pages/BiblicalHistoryPage/BiblicalHistoryPage';
import { ScienceBiblePage } from './pages/ScienceBiblePage/ScienceBiblePage';
import { MathHubPage } from './pages/MathHubPage/MathHubPage';
import { ScienceHubPage } from './pages/ScienceHubPage/ScienceHubPage';
import { HistoryHubPage } from './pages/HistoryHubPage/HistoryHubPage';
import { BibleHubPage } from './pages/BibleHubPage/BibleHubPage';
import { BiblicalHistoryHubPage } from './pages/BiblicalHistoryHubPage/BiblicalHistoryHubPage';
import { ScienceBibleHubPage } from './pages/ScienceBibleHubPage/ScienceBibleHubPage';
import { CoursesComingSoon } from './pages/CoursesComingSoon/CoursesComingSoon';
// import { DebatePage } from './components/debate/DebatePage/DebatePage'; // Moved to debating branch
import { TopicWorkspace } from './components/resources/TopicWorkspace/TopicWorkspace';
import { MathGradeSelector } from './components/math/MathGradeSelector/MathGradeSelector';
import { TutorCards } from './components/tutoring/TutorCards/TutorCards';
import { TutorProfile } from './components/tutoring/TutorProfile/TutorProfile';
import { BookingCalendar } from './components/tutoring/BookingCalendar/BookingCalendar';
import { TutorOnboarding } from './components/tutoring/TutorOnboarding/TutorOnboarding';
import { ScienceSubjectSelector } from './components/science/ScienceSubjectSelector/ScienceSubjectSelector';
import { ScienceTutorCards } from './components/science/ScienceTutorCards/ScienceTutorCards';
import { FindTutorsHub } from './components/tutoring/FindTutorsHub/FindTutorsHub';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeSwitcher } from './components/common/ThemeSwitcher/ThemeSwitcher';
import { Topic } from './types/wasm';
import { MainView } from './types/navigation';
import { TopicMetadata } from './types/storage';
import { MathTemplate } from './utils/mathTemplates';
import { useTopics } from './hooks/useTopics';
import './styles/theme-variables.css';
import './App.css';

function AppContent() {
  const navigation = useNavigation();
  const currentState = navigation.currentState;
  const auth = useAuth();
  const { isAuthenticated, userRole, accountStatus, parentId, userId, userName, needsOnboarding, login, logout } = auth;
  const [, setSelectedTopic] = useState<Topic | null>(null); // For future debates feature
  const [, setWorkspaceTopicId] = useState<string | null>(null); // For future workspace feature
  const { getTopic, createTopic } = useTopics();
  const [workspaceTopic, setWorkspaceTopic] = useState<TopicMetadata | null>(null);
  const [impersonatingAs, setImpersonatingAs] = useState<{ role: string; name: string; } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Toggle sidebar and persist preference
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Extract navigation state
  const currentView = currentState.view;
  const tutorView = currentState.tutorView || 'hub';
  const selectedGrade = currentState.selectedGrade || '';
  const selectedTutor = currentState.selectedTutor || '';
  const selectedSessionType = currentState.selectedSessionType || '';
  const selectedScienceSubject = currentState.selectedScienceSubject || '';
  const tutorType = currentState.tutorType || 'all';

  const handleLoginSuccess = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      login(user); // Use auth context login
    }
  };

  const handleLogout = async () => {
    setImpersonatingAs(null);
    await logout(); // Use auth context logout
  };
  
  const handleImpersonate = (role: string, name: string) => {
    setImpersonatingAs({ role, name });
    navigation.navigate({ view: 'dashboard' });
  };
  
  const handleExitImpersonation = () => {
    setImpersonatingAs(null);
    navigation.navigate({ view: 'admin' });
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
    navigation.navigate({ 
      selectedGrade: gradeId,
      tutorView: 'tutors'
    });
  };

  const handleTutorSelect = (tutorId: string) => {
    navigation.navigate({ 
      selectedTutor: tutorId,
      tutorView: 'profile'
    });
  };

  const handleBookSession = (tutorId: string, sessionType: string) => {
    navigation.navigate({ 
      selectedTutor: tutorId,
      selectedSessionType: sessionType,
      tutorView: 'booking'
    });
  };

  const handleBookingConfirm = (bookingDetails: any) => {
    // Handle booking confirmation - would integrate with payment/booking system
    console.log('Booking confirmed:', bookingDetails);
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    
    // Reset tutor flow
    navigation.navigate({ 
      tutorView: 'grades',
      selectedGrade: '',
      selectedTutor: '',
      selectedSessionType: ''
    });
  };


  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ThemeSwitcher />
      <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <span>{sidebarCollapsed ? '»' : '«'}</span>
      </button>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h1>DebateRank</h1>
            <span className="tagline">CRITICAL THINKING TERMINAL</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={currentView === 'home' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigation.navigate({ view: 'home' })}
            title="Home"
          >
            <span className="nav-icon">⌂</span>
            <span className="nav-label">HOME</span>
          </button>
          {/* Debate feature moved to debating branch
          <button
            className={currentView === 'debate' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigation.navigate({ view: 'debate' })}
            title="Debate"
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">DEBATE</span>
          </button>
          */}
          <button
            className={currentView === 'core-subjects' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigation.navigate({ view: 'core-subjects' })}
            title="Core Subjects"
          >
            <span className="nav-icon">📚</span>
            <span className="nav-label">CORE SUBJECTS</span>
          </button>
          <button
            className={currentView === 'electives' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigation.navigate({ view: 'electives' })}
            title="Electives"
          >
            <span className="nav-icon">📖</span>
            <span className="nav-label">ELECTIVES</span>
          </button>
          <button
            className={currentView === 'tutors' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              navigation.navigate({
                view: 'tutors',
                tutorType: 'all',
                tutorView: 'hub',
                selectedGrade: '',
                selectedScienceSubject: '',
                selectedTutor: '',
                selectedSessionType: ''
              });
            }}
            title="Find Tutors"
          >
            <span className="nav-icon">🎓</span>
            <span className="nav-label">FIND TUTORS</span>
          </button>
          <button
            className={currentView === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              if (!isAuthenticated) {
                navigation.navigate({ view: 'login' });
              } else {
                navigation.navigate({ view: 'dashboard' });
              }
            }}
            title="Dashboard"
          >
            <span className="nav-icon">█</span>
            <span className="nav-label">DASHBOARD</span>
          </button>

          {/* Admin menu for owner and admin roles only */}
          {isAuthenticated && (userRole === 'owner' || userRole === 'admin') && (
            <button
              className={currentView === 'admin' ? 'nav-item active' : 'nav-item'}
              onClick={() => navigation.navigate({ view: 'admin' })}
              title="Admin Panel"
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
                <div className="user-avatar" title={`Logged in as ${userRole}`}>{userRole.toUpperCase()}</div>
                <div className="user-status">ONLINE</div>
              </div>
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <span className="nav-icon">⎋</span>
                <span className="nav-label">LOGOUT</span>
              </button>
            </>
          ) : (
            <button
              className="logout-btn"
              onClick={() => navigation.navigate({ view: 'login' })}
              title="Login"
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
                navigation.navigate({ 
                  view: 'tutors',
                  tutorType: 'all',
                  tutorView: 'hub',
                  selectedGrade: '',
                  selectedScienceSubject: '',
                  selectedTutor: '',
                  selectedSessionType: ''
                });
              }}
            />
          ) : (
            <Login onSuccess={handleLoginSuccess} />
          )
        )}
        
        {/* Debate page moved to debating branch
        {currentView === 'debate' && (
          <DebatePage />
        )}
        */}
        
        {currentView === 'math-hub' && (
          <MathHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'math-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'math' })}
            onBack={() => navigation.navigate({ view: 'core-subjects' })}
          />
        )}

        {currentView === 'math-resources' && (
          <MathPage onBack={() => navigation.navigate({ view: 'math-hub' })} />
        )}

        {currentView === 'science-hub' && (
          <ScienceHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'science-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'science' })}
            onBack={() => navigation.navigate({ view: 'core-subjects' })}
          />
        )}

        {currentView === 'science-resources' && (
          <SciencePage onBack={() => navigation.navigate({ view: 'science-hub' })} />
        )}

        {currentView === 'history-hub' && (
          <HistoryHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'history-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'history' })}
            onBack={() => navigation.navigate({ view: 'core-subjects' })}
          />
        )}

        {currentView === 'history-resources' && (
          <HistoryPage onBack={() => navigation.navigate({ view: 'history-hub' })} />
        )}

        {currentView === 'bible-hub' && (
          <BibleHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'bible-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'bible' })}
            onBack={() => navigation.navigate({ view: 'electives' })}
          />
        )}

        {currentView === 'bible-resources' && (
          <BiblePage onBack={() => navigation.navigate({ view: 'bible-hub' })} />
        )}

        {currentView === 'core-subjects' && (
          <CoreSubjectsPage onNavigate={(slug) => navigation.navigate({ view: slug as MainView })} />
        )}

        {currentView === 'electives' && (
          <ElectivesPage onNavigate={(slug) => navigation.navigate({ view: slug as MainView })} />
        )}

        {currentView === 'biblical-history-hub' && (
          <BiblicalHistoryHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'biblical-history-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'biblical-history' })}
            onBack={() => navigation.navigate({ view: 'electives' })}
          />
        )}

        {currentView === 'biblical-history-resources' && (
          <BiblicalHistoryPage onBack={() => navigation.navigate({ view: 'biblical-history-hub' })} />
        )}

        {currentView === 'science-bible-hub' && (
          <ScienceBibleHubPage
            onNavigateToResources={() => navigation.navigate({ view: 'science-bible-resources' })}
            onNavigateToCourses={() => navigation.navigate({ view: 'courses-coming-soon', courseSubject: 'science-bible' })}
            onBack={() => navigation.navigate({ view: 'electives' })}
          />
        )}

        {currentView === 'science-bible-resources' && (
          <ScienceBiblePage onBack={() => navigation.navigate({ view: 'science-bible-hub' })} />
        )}

        {currentView === 'courses-coming-soon' && (
          <CoursesComingSoon
            subjectName={
              currentState.courseSubject === 'math' ? 'Math' :
              currentState.courseSubject === 'science' ? 'Science' :
              currentState.courseSubject === 'history' ? 'History' :
              currentState.courseSubject === 'bible' ? 'Biblical Studies' :
              currentState.courseSubject === 'biblical-history' ? 'Biblical History' :
              currentState.courseSubject === 'science-bible' ? 'Science & the Bible' :
              'This Subject'
            }
            subjectIcon={
              currentState.courseSubject === 'math' ? '🔢' :
              currentState.courseSubject === 'science' ? '🔬' :
              currentState.courseSubject === 'history' ? '📜' :
              currentState.courseSubject === 'bible' ? '📖' :
              currentState.courseSubject === 'biblical-history' ? '⛪' :
              currentState.courseSubject === 'science-bible' ? '🧬' :
              '📚'
            }
            onGoBack={() => navigation.navigate({ view: `${currentState.courseSubject}-hub` as MainView })}
          />
        )}

        {currentView === 'admin' && isAuthenticated && (
          <AdminPanel 
            userRole={userRole}
            onImpersonate={handleImpersonate}
          />
        )}
        
        {currentView === 'onboarding' && isAuthenticated && userRole === 'tutor' && needsOnboarding && (
          <TutorOnboarding
            userId={userId || 0}
            userName={userName}
            onComplete={() => {
              // Update user to mark onboarding as complete
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                user.needsOnboarding = false;
                localStorage.setItem('user', JSON.stringify(user));
                login(user); // Re-login to update auth context
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
                  navigation.navigate({ 
                    tutorType: 'math',
                    tutorView: 'grades'
                  });
                }}
                onNavigateToScience={() => {
                  navigation.navigate({ 
                    tutorType: 'science',
                    tutorView: 'science-subjects'
                  });
                }}
              />
            )}
            
            {tutorView === 'grades' && tutorType === 'math' && (
              <MathGradeSelector
                onGradeSelect={handleGradeSelect}
                onBack={() => navigation.navigate({ tutorView: 'hub' })}
              />
            )}
            
            {tutorView === 'science-subjects' && (
              <ScienceSubjectSelector
                onSubjectSelect={(subject) => {
                  navigation.navigate({
                    selectedScienceSubject: subject,
                    tutorView: 'science-tutors'
                  });
                }}
                onBack={() => navigation.navigate({ tutorView: 'hub' })}
              />
            )}
            
            {tutorView === 'tutors' && tutorType === 'math' && (
              <TutorCards 
                gradeLevel={selectedGrade}
                onTutorSelect={handleTutorSelect}
                onBackToGrades={() => navigation.navigate({ tutorView: 'grades' })}
              />
            )}
            
            {tutorView === 'science-tutors' && (
              <ScienceTutorCards 
                subject={selectedScienceSubject}
                onTutorSelect={handleTutorSelect}
                onBackToSubjects={() => navigation.navigate({ tutorView: 'science-subjects' })}
              />
            )}
            
            {tutorView === 'profile' && (
              <TutorProfile 
                tutorId={selectedTutor}
                onBackToTutors={() => {
                  if (tutorType === 'science') {
                    navigation.navigate({ tutorView: 'science-tutors' });
                  } else if (tutorType === 'math') {
                    navigation.navigate({ tutorView: 'tutors' });
                  } else {
                    navigation.navigate({ tutorView: 'hub' });
                  }
                }}
                onBookSession={handleBookSession}
              />
            )}
            
            {tutorView === 'booking' && (
              <BookingCalendar 
                tutorId={selectedTutor}
                sessionType={selectedSessionType}
                onBackToProfile={() => navigation.navigate({ tutorView: 'profile' })}
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

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;