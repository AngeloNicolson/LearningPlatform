-- Users table with security fields and roles
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT 0,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'student', -- owner, admin, teacher, parent, student
  parent_id INTEGER, -- For linking students to parents
  
  -- Security fields
  mfa_enabled BOOLEAN DEFAULT 0,
  mfa_secret TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_attempt DATETIME,
  account_locked_until DATETIME,
  password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Audit fields
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  last_login_ip TEXT,
  last_login_user_agent TEXT,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Refresh tokens table (for token rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  family_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tutors table
CREATE TABLE IF NOT EXISTS tutors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subjects TEXT NOT NULL, -- JSON array
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  price_per_hour INTEGER NOT NULL,
  avatar TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tutor_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  subject TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  price INTEGER NOT NULL,
  payment_id TEXT,
  payment_status TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES tutors(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Security audit log for tracking events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table for active user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Articles table for educational content
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- elementary, middle, high-school, college
  subject TEXT, -- algebra, geometry, calculus, etc
  author_id INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT 0,
  featured BOOLEAN DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Teacher profiles with additional info
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  bio TEXT,
  specializations TEXT, -- JSON array
  hourly_rate INTEGER,
  availability TEXT, -- JSON schedule
  rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  calendar_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor_id ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);

-- Math Resources Tables

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_range TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  grade_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE
);

-- Subtopics table
CREATE TABLE IF NOT EXISTS subtopics (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Resources table (for worksheets, videos, practice, quizzes)
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  subtopic_id TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK(resource_type IN ('worksheets', 'videos', 'practice', 'quizzes')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  time_limit INTEGER,
  visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- History articles table
CREATE TABLE IF NOT EXISTS history_articles (
  id TEXT PRIMARY KEY,
  subtopic_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for math resources
CREATE INDEX IF NOT EXISTS idx_topics_grade ON topics(grade_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_resources_subtopic ON resources(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_history_subtopic ON history_articles(subtopic_id);