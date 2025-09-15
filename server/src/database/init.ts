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
  
  // Elementary - Arithmetic subtopics
  insertSubtopic.run('elem-counting', 'elem-arithmetic', 'Counting & Number Sense', 1);
  insertSubtopic.run('elem-addition', 'elem-arithmetic', 'Addition', 2);
  insertSubtopic.run('elem-subtraction', 'elem-arithmetic', 'Subtraction', 3);
  insertSubtopic.run('elem-multiplication', 'elem-arithmetic', 'Multiplication', 4);
  insertSubtopic.run('elem-division', 'elem-arithmetic', 'Division', 5);
  insertSubtopic.run('elem-word-problems', 'elem-arithmetic', 'Word Problems', 6);
  
  // Elementary - Fractions & Decimals subtopics
  insertSubtopic.run('elem-frac-intro', 'elem-fractions', 'Introduction to Fractions', 1);
  insertSubtopic.run('elem-frac-equiv', 'elem-fractions', 'Equivalent Fractions', 2);
  insertSubtopic.run('elem-frac-add-sub', 'elem-fractions', 'Adding & Subtracting Fractions', 3);
  insertSubtopic.run('elem-decimals', 'elem-fractions', 'Introduction to Decimals', 4);
  insertSubtopic.run('elem-dec-ops', 'elem-fractions', 'Decimal Operations', 5);
  insertSubtopic.run('elem-frac-dec-convert', 'elem-fractions', 'Converting Fractions & Decimals', 6);
  
  // Elementary - Basic Geometry subtopics
  insertSubtopic.run('elem-shapes', 'elem-geometry', 'Shapes & Properties', 1);
  insertSubtopic.run('elem-angles', 'elem-geometry', 'Introduction to Angles', 2);
  insertSubtopic.run('elem-perimeter', 'elem-geometry', 'Perimeter', 3);
  insertSubtopic.run('elem-area', 'elem-geometry', 'Area', 4);
  insertSubtopic.run('elem-symmetry', 'elem-geometry', 'Symmetry', 5);
  insertSubtopic.run('elem-3d-shapes', 'elem-geometry', '3D Shapes', 6);
  
  // Elementary - Measurement subtopics
  insertSubtopic.run('elem-length', 'elem-measurement', 'Length & Distance', 1);
  insertSubtopic.run('elem-weight', 'elem-measurement', 'Weight & Mass', 2);
  insertSubtopic.run('elem-volume', 'elem-measurement', 'Volume & Capacity', 3);
  insertSubtopic.run('elem-time', 'elem-measurement', 'Time', 4);
  insertSubtopic.run('elem-money', 'elem-measurement', 'Money', 5);
  insertSubtopic.run('elem-temperature', 'elem-measurement', 'Temperature', 6);
  
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
  
  // Middle School - Pre-Algebra subtopics
  insertSubtopic.run('middle-integers', 'middle-algebra', 'Integers & Rational Numbers', 1);
  insertSubtopic.run('middle-expressions', 'middle-algebra', 'Algebraic Expressions', 2);
  insertSubtopic.run('middle-equations', 'middle-algebra', 'Linear Equations', 3);
  insertSubtopic.run('middle-inequalities', 'middle-algebra', 'Inequalities', 4);
  insertSubtopic.run('middle-ratios', 'middle-algebra', 'Ratios & Proportions', 5);
  insertSubtopic.run('middle-percent', 'middle-algebra', 'Percentages', 6);
  
  // Middle School - Geometry subtopics
  insertSubtopic.run('middle-angles-lines', 'middle-geometry', 'Angles & Lines', 1);
  insertSubtopic.run('middle-triangles', 'middle-geometry', 'Triangles', 2);
  insertSubtopic.run('middle-quadrilaterals', 'middle-geometry', 'Quadrilaterals', 3);
  insertSubtopic.run('middle-circles', 'middle-geometry', 'Circles', 4);
  insertSubtopic.run('middle-volume-surface', 'middle-geometry', 'Volume & Surface Area', 5);
  insertSubtopic.run('middle-transformations', 'middle-geometry', 'Transformations', 6);
  
  // Middle School - Statistics subtopics
  insertSubtopic.run('middle-data-collection', 'middle-stats', 'Data Collection', 1);
  insertSubtopic.run('middle-graphs', 'middle-stats', 'Graphs & Charts', 2);
  insertSubtopic.run('middle-central-tendency', 'middle-stats', 'Mean, Median, Mode', 3);
  insertSubtopic.run('middle-variability', 'middle-stats', 'Range & Variability', 4);
  insertSubtopic.run('middle-probability', 'middle-stats', 'Basic Probability', 5);
  insertSubtopic.run('middle-predictions', 'middle-stats', 'Making Predictions', 6);
  
  // High School - Algebra I subtopics
  insertSubtopic.run('high-alg1-foundations', 'high-algebra1', 'Foundations', 1);
  insertSubtopic.run('high-alg1-linear-eq', 'high-algebra1', 'Linear Equations & Graphs', 2);
  insertSubtopic.run('high-alg1-systems', 'high-algebra1', 'Systems of Equations', 3);
  insertSubtopic.run('high-alg1-polynomials', 'high-algebra1', 'Polynomials', 4);
  insertSubtopic.run('high-alg1-factoring', 'high-algebra1', 'Factoring', 5);
  insertSubtopic.run('high-alg1-quadratics', 'high-algebra1', 'Quadratic Equations', 6);
  
  // High School - Algebra II subtopics
  insertSubtopic.run('high-alg2-functions', 'high-algebra2', 'Functions', 1);
  insertSubtopic.run('high-alg2-polynomials', 'high-algebra2', 'Advanced Polynomials', 2);
  insertSubtopic.run('high-alg2-rational', 'high-algebra2', 'Rational Expressions', 3);
  insertSubtopic.run('high-alg2-exponential', 'high-algebra2', 'Exponential & Logarithmic', 4);
  insertSubtopic.run('high-alg2-sequences', 'high-algebra2', 'Sequences & Series', 5);
  insertSubtopic.run('high-alg2-matrices', 'high-algebra2', 'Matrices', 6);
  
  // High School - Geometry subtopics
  insertSubtopic.run('high-geom-logic', 'high-geometry', 'Logic & Proofs', 1);
  insertSubtopic.run('high-geom-congruence', 'high-geometry', 'Congruence', 2);
  insertSubtopic.run('high-geom-similarity', 'high-geometry', 'Similarity', 3);
  insertSubtopic.run('high-geom-right-triangles', 'high-geometry', 'Right Triangles & Trigonometry', 4);
  insertSubtopic.run('high-geom-circles', 'high-geometry', 'Circles', 5);
  insertSubtopic.run('high-geom-solids', 'high-geometry', 'Solid Geometry', 6);
  
  // High School - Calculus subtopics
  insertSubtopic.run('high-calc-limits', 'high-calculus', 'Limits & Continuity', 1);
  insertSubtopic.run('high-calc-derivatives', 'high-calculus', 'Derivatives', 2);
  insertSubtopic.run('high-calc-applications', 'high-calculus', 'Applications of Derivatives', 3);
  insertSubtopic.run('high-calc-integrals', 'high-calculus', 'Integrals', 4);
  insertSubtopic.run('high-calc-fundamental', 'high-calculus', 'Fundamental Theorem', 5);
  insertSubtopic.run('high-calc-integration-tech', 'high-calculus', 'Integration Techniques', 6);
  
  // College - Calculus I-III subtopics
  insertSubtopic.run('college-calc1', 'college-calculus', 'Calculus I: Differential', 1);
  insertSubtopic.run('college-calc2', 'college-calculus', 'Calculus II: Integral', 2);
  insertSubtopic.run('college-calc3', 'college-calculus', 'Calculus III: Multivariable', 3);
  insertSubtopic.run('college-vector-calc', 'college-calculus', 'Vector Calculus', 4);
  insertSubtopic.run('college-diff-equations-intro', 'college-calculus', 'Intro to Differential Equations', 5);
  insertSubtopic.run('college-series', 'college-calculus', 'Infinite Series', 6);
  
  // College - Linear Algebra subtopics
  insertSubtopic.run('college-vectors', 'college-linear', 'Vectors & Vector Spaces', 1);
  insertSubtopic.run('college-matrices-ops', 'college-linear', 'Matrix Operations', 2);
  insertSubtopic.run('college-determinants', 'college-linear', 'Determinants', 3);
  insertSubtopic.run('college-eigenvalues', 'college-linear', 'Eigenvalues & Eigenvectors', 4);
  insertSubtopic.run('college-transformations', 'college-linear', 'Linear Transformations', 5);
  insertSubtopic.run('college-orthogonality', 'college-linear', 'Orthogonality', 6);
  
  // College - Differential Equations subtopics
  insertSubtopic.run('college-first-order', 'college-diffeq', 'First Order ODEs', 1);
  insertSubtopic.run('college-second-order', 'college-diffeq', 'Second Order ODEs', 2);
  insertSubtopic.run('college-laplace', 'college-diffeq', 'Laplace Transforms', 3);
  insertSubtopic.run('college-systems-ode', 'college-diffeq', 'Systems of ODEs', 4);
  insertSubtopic.run('college-partial', 'college-diffeq', 'Partial Differential Equations', 5);
  insertSubtopic.run('college-numerical', 'college-diffeq', 'Numerical Methods', 6);
  
  console.log('Math resources seeded successfully');
  console.log('Seed data inserted successfully');
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
  db.close();
}