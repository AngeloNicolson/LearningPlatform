import { Router, Request, Response } from 'express';

const router = Router();

// Mock tutor data
const tutors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    grade: 'High School',
    subjects: ['Calculus', 'Linear Algebra', 'Trigonometry'],
    rating: 4.8,
    reviews: 127,
    price: 35,
    avatar: 'SJ',
    description: 'PhD in Mathematics with 10+ years teaching experience'
  },
  {
    id: '2', 
    name: 'Prof. Michael Chen',
    grade: 'College',
    subjects: ['Abstract Algebra', 'Real Analysis', 'Topology'],
    rating: 4.9,
    reviews: 89,
    price: 45,
    avatar: 'MC',
    description: 'University professor specializing in advanced mathematics'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    grade: 'Middle School',
    subjects: ['Pre-Algebra', 'Geometry', 'Problem Solving'],
    rating: 4.7,
    reviews: 234,
    price: 25,
    avatar: 'ER',
    description: 'Making math fun and accessible for middle schoolers'
  },
  {
    id: '4',
    name: 'Alex Thompson',
    grade: 'Elementary',
    subjects: ['Basic Arithmetic', 'Fractions', 'Word Problems'],
    rating: 4.9,
    reviews: 156,
    price: 20,
    avatar: 'AT',
    description: 'Patient and engaging elementary math specialist'
  }
];

// Get all tutors
router.get('/', (req: Request, res: Response) => {
  const { grade } = req.query;
  
  if (grade) {
    const filtered = tutors.filter(t => t.grade === grade);
    return res.json(filtered);
  }
  
  return res.json(tutors);
});

// Get tutor by ID
router.get('/:id', (req: Request, res: Response) => {
  const tutor = tutors.find(t => t.id === req.params.id);
  
  if (!tutor) {
    return res.status(404).json({ message: 'Tutor not found' });
  }
  
  return res.json(tutor);
});

// Get tutor availability
router.get('/:id/availability', (req: Request, res: Response) => {
  // Mock availability data
  const availability = {
    tutorId: req.params.id,
    timezone: 'America/New_York',
    slots: [
      { date: '2024-01-15', times: ['10:00', '11:00', '14:00', '15:00'] },
      { date: '2024-01-16', times: ['09:00', '10:00', '11:00', '16:00'] },
      { date: '2024-01-17', times: ['14:00', '15:00', '16:00', '17:00'] },
      { date: '2024-01-18', times: ['10:00', '11:00', '13:00', '14:00'] },
      { date: '2024-01-19', times: ['09:00', '10:00', '11:00', '12:00'] }
    ]
  };
  
  return res.json(availability);
});

export default router;