import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './MathResources.css';

interface Resource {
  id: string;
  title: string;
  description: string;
  url?: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  questions?: Question[];
  problems?: string[];
  timeLimit?: number;
  visible: boolean;
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface HistoryArticle {
  id: string;
  title: string;
  content: string; // Markdown content
}

interface Subtopic {
  id: string;
  name: string;
  worksheets: Resource[];
  videos: Resource[];
  practice: Resource[];
  quizzes: Resource[];
  history: HistoryArticle | null;
}

interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

interface GradeLevel {
  id: string;
  grade: string;
  gradeRange: string;
  topics: Topic[];
}

// Comprehensive grade-based curriculum data
const gradeData: GradeLevel[] = [
  {
    id: 'elementary',
    grade: 'Elementary',
    gradeRange: 'Grades K-5',
    topics: [
      {
        id: 'elem-arithmetic',
        name: 'Basic Arithmetic',
        subtopics: [
          {
            id: 'elem-counting',
            name: 'Counting & Number Sense',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-addition',
            name: 'Addition',
            worksheets: [
              {
                id: 'ws-add-1',
                title: 'Basic Addition Worksheet',
                description: 'Single-digit addition problems (PDF, 2 pages)',
                url: '/worksheets/basic-addition.pdf',
                visible: true
              },
              {
                id: 'ws-add-2',
                title: 'Addition with Regrouping',
                description: 'Two-digit addition practice (PDF, 4 pages)',
                url: '/worksheets/addition-regrouping.pdf',
                visible: false
              }
            ],
            videos: [
              {
                id: 'vid-add-1',
                title: 'Introduction to Addition',
                description: 'YouTube • 12:45 min • Khan Academy',
                url: 'https://www.youtube.com/watch?v=example1',
                visible: true
              },
              {
                id: 'vid-add-2',
                title: 'Visual Addition with Objects',
                description: 'Vimeo • 8:30 min • Math Antics',
                url: 'https://vimeo.com/example2',
                visible: true
              }
            ],
            practice: [
              {
                id: 'pr-add-1',
                title: 'Addition Facts 0-10',
                description: '20 problems • Auto-graded • Basic level',
                problems: [],
                visible: true
              },
              {
                id: 'pr-add-2',
                title: 'Word Problems - Addition',
                description: '15 problems • Step-by-step solutions • Intermediate',
                problems: [],
                visible: true
              }
            ],
            quizzes: [
              {
                id: 'qz-add-1',
                title: 'Addition Quick Check',
                description: '10 questions • Multiple choice • 15 min time limit',
                timeLimit: 15,
                visible: true
              },
              {
                id: 'qz-add-2',
                title: 'Addition Unit Test',
                description: '25 questions • Mixed format • 30 min time limit',
                timeLimit: 30,
                visible: false
              }
            ],
            history: {
              id: 'hist-addition',
              title: 'The History of Addition',
              content: `# The Story of Addition

## Ancient Origins

Addition is one of the oldest mathematical operations known to humanity. Archaeological evidence suggests that humans have been adding quantities for over **20,000 years**.

### Early Counting Systems

- **Tally marks**: The earliest form of addition, found in prehistoric caves
- **Mesopotamian tokens** (8000 BCE): Clay tokens represented quantities of goods
- **Egyptian numerals** (3000 BCE): Hieroglyphic symbols for addition

## The Plus Sign (+)

The symbol we use for addition today has an interesting history:

> "The + sign was first used by **Nicole Oresme** in the 14th century, but it didn't become standard until **Johannes Widmann** used it in a commercial arithmetic book in 1489."

### Evolution of Notation
1. Romans used the word "et" (meaning "and")
2. Medieval mathematicians abbreviated to "&"
3. Eventually simplified to "+"

## Cultural Contributions

**Ancient China**: The Chinese developed the abacus around 500 BCE, revolutionizing addition calculations.

**Ancient India**: Introduced the concept of zero (500 CE), which transformed addition and all of mathematics.

**Islamic Golden Age**: Al-Khwarizmi's work (820 CE) formalized addition algorithms still used today.

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

*"Addition is the foundation upon which all of mathematics is built."* - Anonymous`
            }
          },
          {
            id: 'elem-subtraction',
            name: 'Subtraction',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-multiplication',
            name: 'Multiplication',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: {
              id: 'history-multiplication',
              title: 'The History of Multiplication',
              content: `# The History of Multiplication

## Ancient Civilizations
The concept of multiplication emerged from the need to count groups of objects efficiently. Ancient civilizations developed various methods:

### Egyptian Method (3000 BCE)
The Egyptians used a doubling method, repeatedly doubling one number and adding the results. This binary approach was remarkably efficient for its time.

### Babylonian Tables (2000 BCE)
The Babylonians created the first multiplication tables on clay tablets, using their base-60 number system. These tables were used for trade and astronomy.

## The Times Tables
The familiar multiplication tables we use today have their roots in ancient China. The **Chinese multiplication table** dates back to 305 BCE, during the Warring States period.

## The Multiplication Symbol
The × symbol was introduced by William Oughtred in 1631, while the dot notation (·) was popularized by Leibniz in 1698.

## Modern Teaching Methods
Today, multiplication is taught through:
- **Visual arrays** - showing groups in rows and columns
- **Skip counting** - counting by 2s, 3s, 5s, etc.
- **Area models** - representing multiplication as rectangular areas

## Fun Fact
The word "multiplication" comes from the Latin *multiplicare*, meaning "to increase many fold."`
            }
          },
          {
            id: 'elem-division',
            name: 'Division',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-word-problems',
            name: 'Word Problems',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'elem-fractions',
        name: 'Fractions & Decimals',
        subtopics: [
          {
            id: 'elem-intro-fractions',
            name: 'Introduction to Fractions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: {
              id: 'history-fractions',
              title: 'The History of Fractions',
              content: `# The History of Fractions

## Ancient Origins
Fractions are one of humanity's oldest mathematical concepts, arising from the need to divide things fairly and measure partial quantities.

### Egyptian Fractions (3000 BCE)
The ancient Egyptians used only unit fractions (fractions with numerator 1), except for 2/3. They wrote complex fractions as sums of unit fractions. The **Eye of Horus** symbol represented fractions in powers of 1/2.

### Babylonian System (1800 BCE)
Babylonians used a sexagesimal (base-60) system, which naturally led to fractions. This is why we still have 60 minutes in an hour and 360 degrees in a circle.

## Medieval Developments
### Indian Contributions (500 CE)
Indian mathematicians like **Aryabhata** and **Brahmagupta** developed rules for operations with fractions, including the modern method of finding common denominators.

### Islamic Golden Age (800-1200 CE)
Islamic scholars translated and expanded upon Greek and Indian works. **Al-Khwarizmi** wrote extensively about fractions in his algebra texts.

## The Fraction Bar
The horizontal line separating numerator and denominator was introduced by **Al-Hassar** in the 12th century. Before this, fractions were written in various ways.

## Modern Notation
Our current way of writing fractions (a/b) became standard in Europe during the Renaissance, spreading through printed mathematics books.

## Teaching Fractions Today
Modern education uses:
- **Pizza slices** and **pie charts** for visualization
- **Fraction bars** and **number lines**
- **Equivalent fractions** through visual models

## Cultural Note
The word "fraction" comes from the Latin *fractus*, meaning "broken."`
            }
          },
          {
            id: 'elem-comparing-fractions',
            name: 'Comparing Fractions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-adding-fractions',
            name: 'Adding & Subtracting Fractions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-intro-decimals',
            name: 'Introduction to Decimals',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-decimal-operations',
            name: 'Decimal Operations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'elem-geometry',
        name: 'Basic Geometry',
        subtopics: [
          {
            id: 'elem-2d-shapes',
            name: '2D Shapes',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-3d-shapes',
            name: '3D Shapes',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-symmetry',
            name: 'Symmetry',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-patterns',
            name: 'Patterns & Sequences',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-perimeter-area',
            name: 'Perimeter & Area',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'elem-measurement',
        name: 'Measurement & Data',
        subtopics: [
          {
            id: 'elem-length',
            name: 'Length & Distance',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-weight-mass',
            name: 'Weight & Mass',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-time',
            name: 'Time & Calendar',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-money',
            name: 'Money & Currency',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'elem-graphs',
            name: 'Graphs & Charts',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      }
    ]
  },
  {
    id: 'middle',
    grade: 'Middle School',
    gradeRange: 'Grades 6-8',
    topics: [
      {
        id: 'ms-prealgebra',
        name: 'Pre-Algebra',
        subtopics: [
          {
            id: 'ms-integers',
            name: 'Integers & Rational Numbers',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-variables',
            name: 'Variables & Expressions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: {
              id: 'history-algebra',
              title: 'The Birth of Algebra',
              content: `# The Birth of Algebra

## From Arithmetic to Algebra
Algebra represents one of mathematics' greatest leaps - from calculating with known numbers to reasoning about unknown quantities.

## Ancient Beginnings
### Babylonian Algebra (2000 BCE)
The Babylonians solved quadratic equations using geometric methods, though they had no symbolic notation. They described problems in words like "I found a stone but did not weigh it..."

### Egyptian Algebra (1650 BCE)
The **Rhind Papyrus** contains algebraic problems, using the hieroglyph for "heap" to represent unknown quantities.

## The Father of Algebra
### Al-Khwarizmi (780-850 CE)
The Persian mathematician **Muhammad ibn Musa al-Khwarizmi** wrote *Al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala* ("The Compendious Book on Calculation by Completion and Balancing").

- The word **"algebra"** comes from "al-jabr" (restoration)
- The word **"algorithm"** comes from his name
- He solved equations by "balancing" both sides

## Symbolic Revolution
### François Viète (1540-1603)
Introduced the use of letters for unknowns and knowns, creating symbolic algebra.

### René Descartes (1596-1650)
Established our modern notation:
- Using x, y, z for unknowns
- Using a, b, c for known quantities
- Introducing the exponential notation (x²)

## Why Variables Matter
Variables allow us to:
- **Generalize patterns** - express rules that work for all numbers
- **Model relationships** - describe how quantities relate
- **Solve problems** - find unknown values systematically

## Modern Impact
Today, algebra is the gateway to:
- Computer programming (variables in code)
- Scientific modeling
- Economic forecasting
- Engineering design`
            }
          },
          {
            id: 'ms-one-step-equations',
            name: 'One-Step Equations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-two-step-equations',
            name: 'Two-Step Equations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-inequalities',
            name: 'Inequalities',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-coordinate-plane',
            name: 'Coordinate Plane',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-linear-relationships',
            name: 'Linear Relationships',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'ms-ratios',
        name: 'Ratios & Proportions',
        subtopics: [
          {
            id: 'ms-basic-ratios',
            name: 'Understanding Ratios',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-proportions',
            name: 'Proportions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-percent',
            name: 'Percentages',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-percent-change',
            name: 'Percent Change',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-scale-similar',
            name: 'Scale & Similar Figures',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'ms-geometry',
        name: 'Geometry',
        subtopics: [
          {
            id: 'ms-angles',
            name: 'Angles & Lines',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-triangles',
            name: 'Triangles',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-quadrilaterals',
            name: 'Quadrilaterals',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-circles',
            name: 'Circles',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-volume-surface',
            name: 'Volume & Surface Area',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-transformations',
            name: 'Transformations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-pythagorean',
            name: 'Pythagorean Theorem',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'ms-statistics',
        name: 'Statistics & Probability',
        subtopics: [
          {
            id: 'ms-data-collection',
            name: 'Data Collection & Display',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-mean-median-mode',
            name: 'Mean, Median, Mode',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-basic-probability',
            name: 'Basic Probability',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'ms-compound-events',
            name: 'Compound Events',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      }
    ]
  },
  {
    id: 'high-school',
    grade: 'High School',
    gradeRange: 'Grades 9-12',
    topics: [
      {
        id: 'hs-algebra1',
        name: 'Algebra I',
        subtopics: [
          {
            id: 'hs-alg1-foundations',
            name: 'Foundations of Algebra',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-linear-equations',
            name: 'Linear Equations & Inequalities',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-graphing',
            name: 'Graphing Linear Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-systems',
            name: 'Systems of Equations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-exponents',
            name: 'Exponents & Exponential Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-polynomials',
            name: 'Polynomials',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-factoring',
            name: 'Factoring',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-quadratics',
            name: 'Quadratic Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg1-radicals',
            name: 'Radicals & Rational Exponents',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'hs-geometry',
        name: 'Geometry',
        subtopics: [
          {
            id: 'hs-geo-basics',
            name: 'Points, Lines, and Planes',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-angles',
            name: 'Angles & Parallel Lines',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-triangles',
            name: 'Triangles & Congruence',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-similarity',
            name: 'Similarity',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-right-triangles',
            name: 'Right Triangles & Trigonometry',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: {
              id: 'history-trigonometry',
              title: 'The History of Trigonometry',
              content: `# The History of Trigonometry

## Measuring the Heavens
Trigonometry, literally "triangle measurement," arose from humanity's desire to understand the cosmos and navigate the Earth.

## Ancient Astronomy
### Babylonian Contributions (1900 BCE)
The Babylonians divided the circle into 360 degrees, based on their calendar of 360 days. They created the first chord tables, precursors to sine tables.

### Greek Foundations
**Hipparchus (190-120 BCE)** - "The Father of Trigonometry"
- Created the first trigonometric table
- Developed the chord function (related to sine)
- Applied trigonometry to predict eclipses

**Ptolemy (90-168 CE)**
- Wrote the *Almagest*, containing extensive trigonometric tables
- Used chords to map star positions
- His work dominated astronomy for 1,400 years

## Indian Innovations
### Aryabhata (476-550 CE)
- Introduced the **sine** function (jya in Sanskrit)
- Created sine tables accurate to 4 decimal places
- Defined cosine as kojya

### Brahmagupta (598-668 CE)
- Developed interpolation formulas for sine values
- Extended trigonometry beyond astronomy

## Islamic Golden Age
### Al-Battani (858-929 CE)
- Introduced the tangent function
- Discovered the sine rule for triangles

### Nasir al-Din al-Tusi (1201-1274)
- Wrote the first book devoted entirely to trigonometry
- Treated it as a mathematical discipline separate from astronomy

## European Renaissance
### Regiomontanus (1436-1476)
- Brought Islamic trigonometry to Europe
- Published *De Triangulis*, systematizing plane and spherical trigonometry

### Leonhard Euler (1707-1783)
- Introduced modern notation: sin, cos, tan
- Discovered Euler's formula: e^(iθ) = cos(θ) + i·sin(θ)
- Connected trigonometry to complex numbers

## Modern Applications
Today, trigonometry is essential for:
- **GPS navigation** - triangulating positions
- **Computer graphics** - rotating and transforming images
- **Sound engineering** - analyzing wave patterns
- **Architecture** - calculating structural forces
- **Medical imaging** - CT and MRI scans

## The Unit Circle
The unit circle, now central to teaching trigonometry, was formalized in the 20th century as a unifying concept linking angles, coordinates, and trigonometric functions.`
            }
          },
          {
            id: 'hs-geo-quadrilaterals',
            name: 'Quadrilaterals & Polygons',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-circles',
            name: 'Circles',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-area-volume',
            name: 'Area & Volume',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-transformations',
            name: 'Transformations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-geo-proofs',
            name: 'Geometric Proofs',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'hs-algebra2',
        name: 'Algebra II',
        subtopics: [
          {
            id: 'hs-alg2-functions',
            name: 'Functions & Relations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-polynomial-functions',
            name: 'Polynomial Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-rational',
            name: 'Rational Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-radical-functions',
            name: 'Radical Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-exponential-log',
            name: 'Exponential & Logarithmic Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-sequences-series',
            name: 'Sequences & Series',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-conic-sections',
            name: 'Conic Sections',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-matrices',
            name: 'Matrices',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-alg2-complex-numbers',
            name: 'Complex Numbers',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'hs-precalc',
        name: 'Pre-Calculus',
        subtopics: [
          {
            id: 'hs-precalc-functions-analysis',
            name: 'Functions Analysis',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-precalc-trig-functions',
            name: 'Trigonometric Functions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-precalc-trig-identities',
            name: 'Trigonometric Identities',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-precalc-vectors',
            name: 'Vectors',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-precalc-polar',
            name: 'Polar Coordinates',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-precalc-limits',
            name: 'Introduction to Limits',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'hs-statistics',
        name: 'Statistics',
        subtopics: [
          {
            id: 'hs-stats-descriptive',
            name: 'Descriptive Statistics',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-stats-probability',
            name: 'Probability',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-stats-distributions',
            name: 'Probability Distributions',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-stats-sampling',
            name: 'Sampling & Experimentation',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-stats-inference',
            name: 'Statistical Inference',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'hs-stats-regression',
            name: 'Regression Analysis',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      }
    ]
  },
  {
    id: 'college',
    grade: 'College/AP',
    gradeRange: 'Undergraduate',
    topics: [
      {
        id: 'col-calculus1',
        name: 'Calculus I',
        subtopics: [
          {
            id: 'col-calc1-limits',
            name: 'Limits & Continuity',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: {
              id: 'history-calculus',
              title: 'The Invention of Calculus',
              content: `# The Invention of Calculus

## The Grand Challenge
For centuries, mathematicians struggled with two fundamental problems:
1. Finding areas under curves and volumes of solids
2. Finding tangent lines to curves and rates of change

## Ancient Precursors
### Archimedes (287-212 BCE)
Used the **method of exhaustion** to find areas and volumes, essentially using limits without formalizing them. He calculated π to remarkable accuracy.

### Liu Hui (220-280 CE)
Chinese mathematician who independently developed similar exhaustion methods, calculating π to 5 decimal places.

## The Scientific Revolution
### Johannes Kepler (1571-1630)
Used infinitesimal methods to calculate areas, volumes, and planetary orbits. His work on wine barrel volumes led to early integration techniques.

### Pierre de Fermat (1601-1665)
- Developed methods for finding maxima and minima
- Found tangent lines to curves
- Calculated areas under curves using infinitesimals

## The Great Invention
### Isaac Newton (1642-1727)
Developed his **"Method of Fluxions"** around 1665:
- Created calculus to solve physics problems
- Focused on rates of change (derivatives as "fluxions")
- Used dot notation: ẋ for dx/dt
- Kept his work secret for decades

### Gottfried Wilhelm Leibniz (1646-1716)
Independently invented calculus around 1674:
- Developed our modern notation: dx, ∫
- Emphasized the inverse relationship between differentiation and integration
- Published first (1684), making calculus public
- Created the product rule and chain rule

## The Priority Dispute
The **Leibniz-Newton controversy** raged for decades:
- Newton invented it first but published later
- Leibniz published first with better notation
- National pride fueled bitter accusations
- Modern consensus: both deserve credit

## Making Calculus Rigorous
### Augustin-Louis Cauchy (1789-1857)
- Formalized the concept of limits
- Gave rigorous definitions of continuity and convergence
- Eliminated reliance on infinitesimals

### Karl Weierstrass (1815-1897)
- Created the ε-δ (epsilon-delta) definition of limits
- Put calculus on solid logical foundations
- His rigor shapes how we teach calculus today

## Modern Impact
Calculus is now essential for:
- **Physics** - describing motion, forces, and fields
- **Engineering** - optimizing designs and systems
- **Economics** - modeling growth and optimization
- **Machine Learning** - gradient descent and backpropagation
- **Medicine** - modeling drug concentrations and disease spread

## The Beauty of Calculus
The **Fundamental Theorem of Calculus**, linking derivatives and integrals, is considered one of the greatest achievements in mathematics, unifying two seemingly different concepts into one powerful framework.`
            }
          },
          {
            id: 'col-calc1-derivatives',
            name: 'Derivatives',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc1-applications-derivatives',
            name: 'Applications of Derivatives',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc1-integrals',
            name: 'Integrals',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc1-applications-integrals',
            name: 'Applications of Integrals',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'col-calculus2',
        name: 'Calculus II',
        subtopics: [
          {
            id: 'col-calc2-integration-techniques',
            name: 'Integration Techniques',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc2-differential-equations',
            name: 'Differential Equations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc2-sequences-series',
            name: 'Sequences & Series',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc2-parametric',
            name: 'Parametric & Polar Curves',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'col-calculus3',
        name: 'Calculus III',
        subtopics: [
          {
            id: 'col-calc3-vectors',
            name: 'Vectors in 3D',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc3-partial-derivatives',
            name: 'Partial Derivatives',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc3-multiple-integrals',
            name: 'Multiple Integrals',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-calc3-vector-calculus',
            name: 'Vector Calculus',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'col-linear-algebra',
        name: 'Linear Algebra',
        subtopics: [
          {
            id: 'col-linalg-matrices',
            name: 'Matrices & Systems',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-linalg-determinants',
            name: 'Determinants',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-linalg-vector-spaces',
            name: 'Vector Spaces',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-linalg-eigenvalues',
            name: 'Eigenvalues & Eigenvectors',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-linalg-transformations',
            name: 'Linear Transformations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'col-differential-equations',
        name: 'Differential Equations',
        subtopics: [
          {
            id: 'col-de-first-order',
            name: 'First Order ODEs',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-de-second-order',
            name: 'Second Order ODEs',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-de-laplace',
            name: 'Laplace Transforms',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-de-systems',
            name: 'Systems of ODEs',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-de-partial',
            name: 'Partial Differential Equations',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      },
      {
        id: 'col-discrete-math',
        name: 'Discrete Mathematics',
        subtopics: [
          {
            id: 'col-discrete-logic',
            name: 'Logic & Proofs',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-discrete-sets',
            name: 'Set Theory',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-discrete-combinatorics',
            name: 'Combinatorics',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-discrete-graphs',
            name: 'Graph Theory',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          },
          {
            id: 'col-discrete-algorithms',
            name: 'Algorithms',
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }
        ]
      }
    ]
  }
];

export const MathResources: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('elementary');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'worksheets' | 'videos' | 'practice' | 'quizzes' | 'history'>('worksheets');
  const [gradeData, setGradeData] = useState<GradeLevel[]>([]); // Use correct type
  const [resources, setResources] = useState<any>({
    worksheets: [],
    videos: [],
    practice: [],
    quizzes: []
  });
  const [history, setHistory] = useState<HistoryArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch grades data on mount
  useEffect(() => {
    fetchGrades();
  }, []);

  // Fetch resources when subtopic changes
  useEffect(() => {
    if (selectedSubtopic) {
      fetchResources(selectedSubtopic);
    }
  }, [selectedSubtopic]);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/grades`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      
      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedData = data.map((grade: any) => ({
        id: grade.id,
        grade: grade.name,
        gradeRange: grade.grade_range,
        topics: grade.topics.map((topic: any) => ({
          id: topic.id,
          name: topic.name,
          subtopics: topic.subtopics.map((subtopic: any) => ({
            id: subtopic.id,
            name: subtopic.name,
            worksheets: [],
            videos: [],
            practice: [],
            quizzes: [],
            history: null
          }))
        }))
      }));
      
      setGradeData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching grades:', error);
      // Fallback to static data if API fails
      setGradeData(gradeData); // Use the hardcoded data as fallback
      setLoading(false);
    }
  };

  const fetchResources = async (subtopicId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3001/api'}/resources/subtopics/${subtopicId}/resources`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      const data = await response.json();
      
      // API already returns grouped resources
      setResources(data.resources || {
        worksheets: [],
        videos: [],
        practice: [],
        quizzes: []
      });
      setHistory(data.history);
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Keep existing resources on error
    }
  };

  const currentGrade = gradeData.find(g => g.id === selectedGrade);
  const currentTopic = currentGrade?.topics.find(t => t.id === expandedTopic);
  const currentSubtopic = currentGrade?.topics
    .flatMap(t => t.subtopics)
    .find(s => s.id === selectedSubtopic);

  const handleGradeSelect = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setExpandedTopic(null);
    setSelectedSubtopic(null);
  };

  const handleTopicToggle = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
    setSelectedSubtopic(null);
  };

  const handleSubtopicSelect = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
  };

  const renderResources = () => {
    if (!currentSubtopic) return null;

    if (activeTab === 'history') {
      if (!history) {
        return (
          <div className="history-content">
            <p className="no-history">Historical context for this topic is coming soon.</p>
          </div>
        );
      }
      return (
        <div className="history-content">
          <h3>{history.title}</h3>
          <div className="history-article">
            <ReactMarkdown>{history.content}</ReactMarkdown>
          </div>
        </div>
      );
    }

    const currentResources = resources[activeTab] || [];
    // Resources from API are already filtered for visibility
    const visibleResources = currentResources;
    
    if (visibleResources.length === 0) {
      return (
        <div className="no-resources">
          <p>No {activeTab} available for this topic yet.</p>
          <p className="coming-soon">Check back soon for new content!</p>
        </div>
      );
    }
    
    return (
      <div className="resources-list">
        {visibleResources.map(resource => (
          <div key={resource.id} className="resource-item">
            <div className="resource-header">
              <h4>{resource.title}</h4>
              <span className="resource-type-badge">{activeTab}</span>
            </div>
            <p className="resource-description">{resource.description}</p>
            
            {activeTab === 'worksheets' && resource.url && (
              <a href={resource.url} className="download-btn" target="_blank" rel="noopener noreferrer">
                📥 Download PDF
              </a>
            )}
            
            {activeTab === 'videos' && resource.url && (
              <a href={resource.url} className="watch-btn" target="_blank" rel="noopener noreferrer">
                ▶️ Watch Video
              </a>
            )}
            
            {activeTab === 'practice' && (
              <div className="practice-content">
                <button className="solve-btn">Start Practice</button>
              </div>
            )}
            
            {activeTab === 'quizzes' && (
              <div className="quiz-info">
                {resource.timeLimit && <span className="time-limit">⏱️ {resource.timeLimit} min</span>}
                <button className="start-quiz-btn">Start Quiz</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="math-resources">
        <div className="resources-header">
          <h1>Mathematical Resources</h1>
          <p>Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="math-resources">
      <div className="resources-header">
        <h1>Mathematical Resources</h1>
        <p>Comprehensive learning materials organized by grade level</p>
      </div>

      {/* Grade Level Tabs */}
      <div className="grade-tabs">
        {gradeData.map(grade => (
          <button
            key={grade.id}
            className={`grade-tab ${selectedGrade === grade.id ? 'active' : ''}`}
            onClick={() => handleGradeSelect(grade.id)}
          >
            <span className="tab-label">{grade.grade}</span>
            <span className="tab-sublabel">{grade.gradeRange}</span>
          </button>
        ))}
      </div>

      {/* Breadcrumb Subtitle - Shows when subtopic is selected */}
      {selectedSubtopic && currentSubtopic && (
        <div className="breadcrumb-subtitle">
          <span className="breadcrumb-part clickable"
                onClick={() => handleGradeSelect(selectedGrade)}>
            {currentGrade?.grade}
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-part clickable"
                onClick={() => setSelectedSubtopic(null)}>
            {currentGrade?.topics.find(t => t.subtopics.some(s => s.id === selectedSubtopic))?.name}
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-part current">{currentSubtopic.name}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="content-area">
        {!selectedSubtopic && currentGrade && (
          <div className="topics-accordion">
            {currentGrade.topics.map(topic => (
              <div key={topic.id} className="topic-item">
                <div
                  className={`topic-header ${expandedTopic === topic.id ? 'expanded' : ''}`}
                  onClick={() => handleTopicToggle(topic.id)}
                >
                  <div className="topic-info">
                    <h3>{topic.name}</h3>
                    <span className="subtopic-count">
                      {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="expand-icon">
                    {expandedTopic === topic.id ? '−' : '+'}
                  </span>
                </div>
                
                {expandedTopic === topic.id && (
                  <div className="subtopics-container">
                    {topic.subtopics.map(subtopic => (
                      <div
                        key={subtopic.id}
                        className="subtopic-item"
                        onClick={() => handleSubtopicSelect(subtopic.id)}
                      >
                        <h4>{subtopic.name}</h4>
                        <div className="resource-counts">
                          <span>📄 {subtopic.worksheets.length}</span>
                          <span>🎥 {subtopic.videos.length}</span>
                          <span>✏️ {subtopic.practice.length}</span>
                          <span>📝 {subtopic.quizzes.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedSubtopic && currentSubtopic && (
          <div className="resources-section">
            
            {/* Resource Type Tabs */}
            <div className="resource-tabs">
              <button
                className={`tab ${activeTab === 'worksheets' ? 'active' : ''}`}
                onClick={() => setActiveTab('worksheets')}
              >
                📄 Worksheets ({(resources.worksheets || []).length})
              </button>
              <button
                className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
                onClick={() => setActiveTab('videos')}
              >
                🎥 Videos ({(resources.videos || []).length})
              </button>
              <button
                className={`tab ${activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => setActiveTab('practice')}
              >
                ✏️ Practice ({(resources.practice || []).length})
              </button>
              <button
                className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`}
                onClick={() => setActiveTab('quizzes')}
              >
                📝 Quizzes ({(resources.quizzes || []).length})
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📚 History
              </button>
            </div>

            {/* Resources Display */}
            <div className="tab-content">
              {renderResources()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};