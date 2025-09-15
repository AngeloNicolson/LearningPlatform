import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcrypt';

const dbPath = process.env.DATABASE_PATH || '/data/database.db';
console.log('Initializing database at:', dbPath);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  console.log('Initializing database...');
  
  // Read and execute schema
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  
  console.log('Database schema created successfully');
  
  // Seed initial data
  seedData();
}

async function seedData() {
  console.log('Seeding initial data...');
  
  // Check if we already have data
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | null;
  
  if (userCount && userCount.count > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }
  
  // Create demo users with different roles
  const hashedPassword = await bcrypt.hash('Demo123!', 12);
  const ownerPassword = await bcrypt.hash('Owner123!', 12);
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const parentPassword = await bcrypt.hash('Parent123!', 12);
  
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, email_verified, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Owner account
  insertUser.run(
    'owner@example.com',
    ownerPassword,
    'Platform',
    'Owner',
    1,
    'owner'
  );
  
  // Admin account
  insertUser.run(
    'admin@example.com',
    hashedPassword,
    'Admin',
    'User',
    1,
    'admin'
  );
  
  // Teacher account
  const teacher = insertUser.run(
    'teacher@example.com',
    teacherPassword,
    'Jane',
    'Smith',
    1,
    'teacher'
  );
  
  // Parent account
  insertUser.run(
    'parent@example.com',
    parentPassword,
    'John',
    'Doe',
    1,
    'parent'
  );
  
  // Student account (linked to parent)
  insertUser.run(
    'student@example.com',
    hashedPassword,
    'Jimmy',
    'Doe',
    1,
    'student'
  );
  
  // Demo account (student)
  insertUser.run(
    'demo@example.com',
    hashedPassword,
    'Demo',
    'User',
    1,
    'student'
  );
  
  // Create teacher profile
  db.prepare(`
    INSERT INTO teacher_profiles (user_id, bio, specializations, hourly_rate, availability, rating, total_reviews)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    3, // Using hardcoded ID since stub doesn't return real lastInsertRowid
    'Experienced math teacher with 10+ years of teaching experience',
    JSON.stringify(['Algebra', 'Calculus', 'Geometry']),
    50,
    JSON.stringify({
      monday: ['09:00-12:00', '14:00-18:00'],
      tuesday: ['09:00-12:00', '14:00-18:00'],
      wednesday: ['09:00-12:00', '14:00-18:00'],
      thursday: ['09:00-12:00', '14:00-18:00'],
      friday: ['09:00-12:00', '14:00-17:00']
    }),
    4.8,
    127
  );
  
  // Create demo tutors
  const insertTutor = db.prepare(`
    INSERT INTO tutors (name, grade, subjects, rating, reviews_count, price_per_hour, avatar, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const tutors = [
    {
      name: 'Dr. Sarah Johnson',
      grade: 'High School',
      subjects: JSON.stringify(['Calculus', 'Linear Algebra', 'Trigonometry']),
      rating: 4.8,
      reviews_count: 127,
      price_per_hour: 35,
      avatar: 'SJ',
      description: 'PhD in Mathematics with 10+ years teaching experience'
    },
    {
      name: 'Prof. Michael Chen',
      grade: 'College',
      subjects: JSON.stringify(['Abstract Algebra', 'Real Analysis', 'Topology']),
      rating: 4.9,
      reviews_count: 89,
      price_per_hour: 45,
      avatar: 'MC',
      description: 'University professor specializing in advanced mathematics'
    },
    {
      name: 'Emily Rodriguez',
      grade: 'Middle School',
      subjects: JSON.stringify(['Pre-Algebra', 'Geometry', 'Problem Solving']),
      rating: 4.7,
      reviews_count: 234,
      price_per_hour: 25,
      avatar: 'ER',
      description: 'Making math fun and accessible for middle schoolers'
    },
    {
      name: 'Alex Thompson',
      grade: 'Elementary',
      subjects: JSON.stringify(['Basic Arithmetic', 'Fractions', 'Word Problems']),
      rating: 4.9,
      reviews_count: 156,
      price_per_hour: 20,
      avatar: 'AT',
      description: 'Patient and engaging elementary math specialist'
    }
  ];
  
  for (const tutor of tutors) {
    insertTutor.run(
      tutor.name,
      tutor.grade,
      tutor.subjects,
      tutor.rating,
      tutor.reviews_count,
      tutor.price_per_hour,
      tutor.avatar,
      tutor.description
    );
  }
  
  // Seed Math Resources Data
  console.log('Seeding math resources...');
  
  // Insert grades
  const insertGrade = db.prepare(`
    INSERT INTO grades (id, name, grade_range, order_index)
    VALUES (?, ?, ?, ?)
  `);
  
  insertGrade.run('elementary', 'Elementary', 'Grades K-5', 1);
  insertGrade.run('middle', 'Middle School', 'Grades 6-8', 2);
  insertGrade.run('high', 'High School', 'Grades 9-12', 3);
  insertGrade.run('college', 'College/AP', 'Undergraduate', 4);
  
  // Insert topics for Elementary
  const insertTopic = db.prepare(`
    INSERT INTO topics (id, grade_id, name, order_index)
    VALUES (?, ?, ?, ?)
  `);
  
  insertTopic.run('elem-arithmetic', 'elementary', 'Arithmetic', 1);
  insertTopic.run('elem-fractions', 'elementary', 'Fractions & Decimals', 2);
  insertTopic.run('elem-geometry', 'elementary', 'Basic Geometry', 3);
  insertTopic.run('elem-measurement', 'elementary', 'Measurement', 4);
  
  // Insert subtopics for Arithmetic
  const insertSubtopic = db.prepare(`
    INSERT INTO subtopics (id, topic_id, name, order_index)
    VALUES (?, ?, ?, ?)
  `);
  
  insertSubtopic.run('elem-counting', 'elem-arithmetic', 'Counting & Number Sense', 1);
  insertSubtopic.run('elem-addition', 'elem-arithmetic', 'Addition', 2);
  insertSubtopic.run('elem-subtraction', 'elem-arithmetic', 'Subtraction', 3);
  insertSubtopic.run('elem-multiplication', 'elem-arithmetic', 'Multiplication', 4);
  insertSubtopic.run('elem-division', 'elem-arithmetic', 'Division', 5);
  insertSubtopic.run('elem-word-problems', 'elem-arithmetic', 'Word Problems', 6);
  
  // Insert sample resources for Addition
  const insertResource = db.prepare(`
    INSERT INTO resources (id, subtopic_id, resource_type, title, description, url, time_limit, visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertResource.run(
    'ws-add-1', 
    'elem-addition', 
    'worksheets',
    'Basic Addition Worksheet',
    'Single-digit addition problems (PDF, 2 pages)',
    '/worksheets/basic-addition.pdf',
    null,
    1
  );
  
  insertResource.run(
    'vid-add-1',
    'elem-addition',
    'videos',
    'Introduction to Addition - Khan Academy',
    'Learn the basics of addition with visual examples',
    'https://www.khanacademy.org/math/arithmetic/add-subtract/intro-to-addition',
    null,
    1
  );
  
  insertResource.run(
    'pr-add-1',
    'elem-addition',
    'practice',
    'Addition Facts 0-10',
    '20 problems • Auto-graded • Basic level',
    null,
    null,
    1
  );
  
  insertResource.run(
    'qz-add-1',
    'elem-addition',
    'quizzes',
    'Addition Quick Check',
    '10 questions • Multiple choice',
    null,
    15,
    1
  );
  
  // Add topics for other grades
  insertTopic.run('middle-algebra', 'middle', 'Pre-Algebra', 1);
  insertTopic.run('middle-geometry', 'middle', 'Geometry', 2);
  insertTopic.run('middle-stats', 'middle', 'Statistics', 3);
  
  insertTopic.run('high-algebra1', 'high', 'Algebra I', 1);
  insertTopic.run('high-algebra2', 'high', 'Algebra II', 2);
  insertTopic.run('high-geometry', 'high', 'Geometry', 3);
  insertTopic.run('high-calculus', 'high', 'Calculus', 4);
  
  insertTopic.run('college-calculus', 'college', 'Calculus I-III', 1);
  insertTopic.run('college-linear', 'college', 'Linear Algebra', 2);
  insertTopic.run('college-diffeq', 'college', 'Differential Equations', 3);
  
  console.log('Math resources seeded successfully');
  console.log('Seed data inserted successfully');
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
  db.close();
}