-- Educational Platform Database Schema
-- Supports multiple subjects with topics and resources

-- Drop existing tables to start fresh (comment out in production)
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS topics CASCADE;

-- Topics table (categories within each subject)
CREATE TABLE topics (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table (all educational content)
CREATE TABLE resources (
  id VARCHAR(255) PRIMARY KEY,
  subject VARCHAR(50) NOT NULL,
  topic_id VARCHAR(100) REFERENCES topics(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) CHECK (resource_type IN ('worksheet', 'video', 'practice', 'quiz', 'game', 'lesson', 'article')),
  grade_level VARCHAR(50) CHECK (grade_level IN ('Elementary', 'Middle School', 'High School', 'College', 'All Levels')),
  url TEXT,
  content TEXT,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_topics_subject ON topics(subject);
CREATE INDEX idx_resources_subject_topic ON resources(subject, topic_id);
CREATE INDEX idx_resources_grade_level ON resources(grade_level);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_visible ON resources(visible);

-- Insert Math Topics
INSERT INTO topics (id, name, subject, icon, description, display_order) VALUES
  ('arithmetic', 'Arithmetic', 'math', '➕', 'Basic operations: addition, subtraction, multiplication, division', 1),
  ('fractions', 'Fractions & Decimals', 'math', '½', 'Working with fractions, decimals, and percentages', 2),
  ('algebra', 'Algebra', 'math', '𝑥', 'Variables, equations, and functions', 3),
  ('geometry', 'Geometry', 'math', '📐', 'Shapes, angles, and spatial reasoning', 4),
  ('trigonometry', 'Trigonometry', 'math', '△', 'Triangles and periodic functions', 5),
  ('calculus', 'Calculus', 'math', '∫', 'Limits, derivatives, and integrals', 6),
  ('statistics', 'Statistics', 'math', '📊', 'Data analysis and probability', 7),
  ('linear-algebra', 'Linear Algebra', 'math', '⊗', 'Vectors, matrices, and transformations', 8),
  ('discrete', 'Discrete Math', 'math', '🎲', 'Logic, sets, and combinatorics', 9);

-- Insert Science Topics
INSERT INTO topics (id, name, subject, icon, description, display_order) VALUES
  ('physics', 'Physics', 'science', '⚡', 'Forces, motion, energy, and waves', 1),
  ('chemistry', 'Chemistry', 'science', '🧪', 'Matter, reactions, and the periodic table', 2),
  ('biology', 'Biology', 'science', '🧬', 'Life, cells, genetics, and ecosystems', 3),
  ('earth-science', 'Earth Science', 'science', '🌍', 'Geology, weather, oceans, and space', 4),
  ('environmental', 'Environmental Science', 'science', '🌿', 'Climate, ecology, and conservation', 5);

-- Sample Math Resources (for testing)
INSERT INTO resources (id, subject, topic_id, title, description, resource_type, grade_level, url) VALUES
  ('math-arith-001', 'math', 'arithmetic', 'Single Digit Addition', 'Practice adding numbers 0-9', 'worksheet', 'Elementary', 'https://example.com/addition'),
  ('math-arith-002', 'math', 'arithmetic', 'Multiplication Tables', 'Learn multiplication facts', 'quiz', 'Elementary', 'https://example.com/multiplication'),
  ('math-alg-001', 'math', 'algebra', 'Solving Linear Equations', 'Introduction to solving for x', 'video', 'Middle School', 'https://example.com/linear'),
  ('math-geom-001', 'math', 'geometry', 'Area and Perimeter', 'Calculate area of shapes', 'worksheet', 'Middle School', 'https://example.com/area');

-- Sample Science Resources (for testing)
INSERT INTO resources (id, subject, topic_id, title, description, resource_type, grade_level, url) VALUES
  ('sci-phys-001', 'science', 'physics', 'Newtons Laws of Motion', 'Understanding forces and motion', 'video', 'High School', 'https://example.com/newton'),
  ('sci-chem-001', 'science', 'chemistry', 'The Periodic Table', 'Elements and their properties', 'lesson', 'High School', 'https://example.com/periodic'),
  ('sci-bio-001', 'science', 'biology', 'Cell Structure', 'Parts of plant and animal cells', 'worksheet', 'Middle School', 'https://example.com/cells'),
  ('sci-earth-001', 'science', 'earth-science', 'Rock Cycle', 'How rocks form and change', 'article', 'Middle School', 'https://example.com/rocks');