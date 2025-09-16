-- Seed Educational Resources Data

-- Grade Levels
INSERT INTO grade_levels (id, name, grade_range, display_order) VALUES
('elementary', 'Elementary', 'Grades K-5', 1),
('middle', 'Middle School', 'Grades 6-8', 2),
('high', 'High School', 'Grades 9-12', 3),
('college', 'College', 'Undergraduate', 4);

-- Elementary Topics
INSERT INTO topics (id, grade_level_id, name, display_order) VALUES
('elem-arithmetic', 'elementary', 'Basic Arithmetic', 1),
('elem-geometry', 'elementary', 'Basic Geometry', 2),
('elem-measurement', 'elementary', 'Measurement & Data', 3),
('elem-fractions', 'elementary', 'Fractions & Decimals', 4);

-- Elementary Subtopics
INSERT INTO subtopics (id, topic_id, name, display_order) VALUES
('elem-counting', 'elem-arithmetic', 'Counting & Number Sense', 1),
('elem-addition', 'elem-arithmetic', 'Addition', 2),
('elem-subtraction', 'elem-arithmetic', 'Subtraction', 3),
('elem-multiplication', 'elem-arithmetic', 'Multiplication', 4),
('elem-division', 'elem-arithmetic', 'Division', 5);

-- Middle School Topics
INSERT INTO topics (id, grade_level_id, name, display_order) VALUES
('middle-prealgebra', 'middle', 'Pre-Algebra', 1),
('middle-geometry', 'middle', 'Geometry', 2),
('middle-statistics', 'middle', 'Statistics & Probability', 3),
('middle-ratios', 'middle', 'Ratios & Proportions', 4);

-- Middle School Subtopics
INSERT INTO subtopics (id, topic_id, name, display_order) VALUES
('middle-integers', 'middle-prealgebra', 'Integers & Rational Numbers', 1),
('middle-expressions', 'middle-prealgebra', 'Algebraic Expressions', 2),
('middle-equations', 'middle-prealgebra', 'Linear Equations', 3);

-- High School Topics
INSERT INTO topics (id, grade_level_id, name, display_order) VALUES
('high-algebra1', 'high', 'Algebra I', 1),
('high-algebra2', 'high', 'Algebra II', 2),
('high-geometry', 'high', 'Geometry', 3),
('high-trigonometry', 'high', 'Trigonometry', 4),
('high-precalculus', 'high', 'Pre-Calculus', 5);

-- High School Subtopics
INSERT INTO subtopics (id, topic_id, name, display_order) VALUES
('high-quadratics', 'high-algebra2', 'Quadratic Functions', 1),
('high-polynomials', 'high-algebra2', 'Polynomials', 2),
('high-exponentials', 'high-algebra2', 'Exponential Functions', 3);

-- College Topics
INSERT INTO topics (id, grade_level_id, name, display_order) VALUES
('college-calculus1', 'college', 'Calculus I', 1),
('college-calculus2', 'college', 'Calculus II', 2),
('college-linear', 'college', 'Linear Algebra', 3),
('college-stats', 'college', 'Statistics', 4),
('college-discrete', 'college', 'Discrete Mathematics', 5);

-- College Subtopics
INSERT INTO subtopics (id, topic_id, name, display_order) VALUES
('college-limits', 'college-calculus1', 'Limits & Continuity', 1),
('college-derivatives', 'college-calculus1', 'Derivatives', 2),
('college-integrals', 'college-calculus1', 'Integrals', 3);

-- Elementary Addition Resources
INSERT INTO resources (id, subtopic_id, resource_type, title, description, url, visible, display_order) VALUES
('ws-add-1', 'elem-addition', 'worksheet', 'Basic Addition Worksheet', 'Single-digit addition problems (PDF, 2 pages)', '/worksheets/basic-addition.pdf', true, 1),
('ws-add-2', 'elem-addition', 'worksheet', 'Addition with Regrouping', 'Two-digit addition practice (PDF, 4 pages)', '/worksheets/addition-regrouping.pdf', true, 2),
('vid-add-1', 'elem-addition', 'video', 'Introduction to Addition', 'YouTube • 12:45 min • Khan Academy', 'https://www.youtube.com/watch?v=example1', true, 1),
('vid-add-2', 'elem-addition', 'video', 'Visual Addition with Objects', 'Vimeo • 8:30 min • Math Antics', 'https://vimeo.com/example2', true, 2),
('pr-add-1', 'elem-addition', 'practice', 'Addition Facts 0-10', '20 problems • Auto-graded • Basic level', null, true, 1),
('pr-add-2', 'elem-addition', 'practice', 'Word Problems - Addition', '15 problems • Step-by-step solutions • Intermediate', null, true, 2),
('qz-add-1', 'elem-addition', 'quiz', 'Addition Quick Check', '10 questions • Multiple choice • 15 min time limit', null, true, 1),
('qz-add-2', 'elem-addition', 'quiz', 'Addition Unit Test', '25 questions • Mixed format • 30 min time limit', null, true, 2);

-- Update time limits for quizzes
UPDATE resources SET time_limit = 15 WHERE id = 'qz-add-1';
UPDATE resources SET time_limit = 30 WHERE id = 'qz-add-2';

-- Addition History Article
INSERT INTO history_articles (id, subtopic_id, title, content) VALUES
('hist-addition', 'elem-addition', 'The History of Addition', 
'# The Story of Addition

## Ancient Origins

Addition is one of the oldest mathematical operations known to humanity. Archaeological evidence suggests that humans have been adding quantities for over **20,000 years**.

### Early Counting Systems

- **Tally marks**: The earliest form of addition, found in prehistoric caves
- **Mesopotamian tokens** (8000 BCE): Clay tokens represented quantities of goods
- **Egyptian numerals** (3000 BCE): Hieroglyphic symbols for addition

## The Plus Sign (+)

The symbol we use for addition today has an interesting history:

> "The + sign was first used by **Nicole Oresme** in the 14th century, but it didn''t become standard until **Johannes Widmann** used it in a commercial arithmetic book in 1489."

### Evolution of Notation
1. Romans used the word "et" (meaning "and")
2. Medieval mathematicians abbreviated to "&"
3. Eventually simplified to "+"

## Cultural Contributions

**Ancient China**: The Chinese developed the abacus around 500 BCE, revolutionizing addition calculations.

**Ancient India**: Introduced the concept of zero (500 CE), which transformed addition and all of mathematics.

**Islamic Golden Age**: Al-Khwarizmi''s work (820 CE) formalized addition algorithms still used today.

## Fun Facts

- The word "addition" comes from the Latin word *addere*, meaning "to give to"
- Before calculators, people used **slide rules** and **adding machines**
- The fastest human calculator can add 15 three-digit numbers in just 1.7 seconds!

## Modern Applications

Today, addition is fundamental to:
- Computer science (binary addition)
- Economics (calculating GDP)
- Science (combining measurements)
- Daily life (shopping, budgeting, cooking)

---

*"Addition is the foundation upon which all of mathematics is built."* - Anonymous');

-- Sample quiz questions for Addition Quick Check
INSERT INTO quiz_questions (resource_id, question, options, answer, explanation, display_order) VALUES
('qz-add-1', 'What is 5 + 3?', '["6", "7", "8", "9"]'::jsonb, '8', 'When we add 5 and 3, we count 5 plus 3 more to get 8.', 1),
('qz-add-1', 'What is 7 + 2?', '["8", "9", "10", "11"]'::jsonb, '9', '7 plus 2 equals 9.', 2),
('qz-add-1', 'What is 4 + 4?', '["6", "7", "8", "9"]'::jsonb, '8', 'Adding 4 to itself gives us 8.', 3),
('qz-add-1', 'What is 6 + 0?', '["0", "5", "6", "7"]'::jsonb, '6', 'Adding zero to any number keeps it the same.', 4),
('qz-add-1', 'What is 3 + 5?', '["7", "8", "9", "10"]'::jsonb, '8', '3 + 5 = 8, the same as 5 + 3.', 5);

-- Sample practice problems for Addition Facts
INSERT INTO practice_problems (resource_id, problem, solution, hint, difficulty, display_order) VALUES
('pr-add-1', '2 + 3 = ?', '5', 'Count 2 fingers, then add 3 more', 'easy', 1),
('pr-add-1', '4 + 5 = ?', '9', 'Start with 4 and count up 5', 'easy', 2),
('pr-add-1', '6 + 4 = ?', '10', 'You can also think of this as 4 + 6', 'easy', 3),
('pr-add-1', '7 + 3 = ?', '10', 'This makes a complete ten!', 'easy', 4),
('pr-add-1', '8 + 1 = ?', '9', 'Adding 1 means the next number', 'easy', 5);

-- High School Quadratics Resources
INSERT INTO resources (id, subtopic_id, resource_type, title, description, url, visible, display_order) VALUES
('ws-quad-1', 'high-quadratics', 'worksheet', 'Quadratic Equations Practice', 'Solving by factoring, completing the square, quadratic formula', '/worksheets/quadratics.pdf', true, 1),
('vid-quad-1', 'high-quadratics', 'video', 'Understanding Quadratic Functions', 'YouTube • 20:15 min • Professor Leonard', 'https://youtube.com/example', true, 1),
('pr-quad-1', 'high-quadratics', 'practice', 'Quadratic Equations Solver', '30 problems • Progressive difficulty', null, true, 1),
('qz-quad-1', 'high-quadratics', 'quiz', 'Quadratics Assessment', '20 questions • 45 min time limit', null, true, 1);

UPDATE resources SET time_limit = 45 WHERE id = 'qz-quad-1';

-- College Calculus Resources
INSERT INTO resources (id, subtopic_id, resource_type, title, description, url, visible, display_order) VALUES
('ws-calc-1', 'college-derivatives', 'worksheet', 'Derivative Rules Practice', 'Power, product, quotient, and chain rules', '/worksheets/derivatives.pdf', true, 1),
('vid-calc-1', 'college-derivatives', 'video', 'Introduction to Derivatives', 'MIT OpenCourseWare • 50:00 min', 'https://ocw.mit.edu/example', true, 1),
('pr-calc-1', 'college-derivatives', 'practice', 'Derivative Calculator', 'Step-by-step solutions for derivative problems', null, true, 1);

-- Statistics Resources for Middle School
INSERT INTO resources (id, subtopic_id, resource_type, title, description, url, visible, display_order) VALUES
('ws-stats-1', 'middle-integers', 'worksheet', 'Mean, Median, Mode', 'Introduction to statistical measures', '/worksheets/statistics-intro.pdf', true, 1),
('vid-stats-1', 'middle-integers', 'video', 'Understanding Data Sets', 'Khan Academy • 15:30 min', 'https://khanacademy.org/example', true, 1);

-- Create some sample history articles for other topics
INSERT INTO history_articles (id, subtopic_id, title, content) VALUES
('hist-quadratics', 'high-quadratics', 'The History of Quadratic Equations',
'# Quadratic Equations Through History

## Ancient Babylon (2000 BCE)
The Babylonians were the first to solve quadratic equations, using geometric methods on clay tablets.

## Ancient Greece (300 BCE)
Euclid provided geometric solutions to quadratic equations in his famous work "Elements."

## Islamic Golden Age (820 CE)
Al-Khwarizmi gave the word "algebra" and systematically solved quadratic equations.

## Modern Era
The quadratic formula as we know it today was first published by Simon Stevin in 1594.');

-- Grant public read access to resources (optional, depending on your auth strategy)
-- This would typically be handled by your API middleware checking user roles