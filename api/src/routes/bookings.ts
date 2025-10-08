import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { query } from '../database/connection';

const router = Router();

// Mock bookings data
const bookings: any[] = [
  {
    id: '1',
    tutorId: '3',
    studentName: 'Jimmy Doe',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    subject: 'Algebra - Quadratic Equations',
    status: 'confirmed',
    price: 35
  },
  {
    id: '2',
    tutorId: '3',
    studentName: 'Sarah Johnson',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    duration: 45,
    subject: 'Calculus - Derivatives',
    status: 'confirmed',
    price: 35
  },
  {
    id: '3',
    tutorId: '3',
    studentName: 'Mike Wilson',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00',
    duration: 60,
    subject: 'Geometry - Triangles',
    status: 'pending',
    price: 35
  },
  {
    id: '4',
    tutorId: '3',
    studentName: 'Emily Chen',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '17:00',
    duration: 90,
    subject: 'Calculus - Integrals',
    status: 'confirmed',
    price: 52.50
  }
];

// Create a new booking
router.post('/',
  requireAuth,
  [
    body('tutorId').notEmpty(),
    body('date').isISO8601(),
    body('time').matches(/^\d{2}:\d{2}$/),
    body('duration').isInt({ min: 30, max: 120 }),
    body('studentName').trim().notEmpty(),
    body('studentEmail').isEmail(),
    body('studentId').optional().isInt() // For parents booking for children
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = (req as any).user;
    
    // Check booking permissions
    // Child accounts (personal with parent relationship) cannot book
    if (user.role === 'personal') {
      // Check if this is a child account
      const relationshipCheck = await query(
        'SELECT id FROM user_relationships WHERE child_user_id = $1 LIMIT 1',
        [user.userId]
      );
      if (relationshipCheck.rows.length > 0) {
        return res.status(403).json({
          error: 'Child accounts cannot book tutoring sessions. Please ask your parent to book for you.'
        });
      }
    }

    // If parent is booking, they must specify which child (or themselves)
    if (user.role === 'parent' && req.body.studentId) {
      // Verify the student belongs to this parent
      const childCheck = await query(`
        SELECT u.id
        FROM users u
        INNER JOIN user_relationships ur ON u.id = ur.child_user_id
        WHERE u.id = $1 AND ur.parent_user_id = $2
      `, [req.body.studentId, user.userId]);

      if (childCheck.rows.length === 0 && req.body.studentId !== user.userId) {
        return res.status(403).json({
          error: 'You can only book sessions for yourself or your children.'
        });
      }
    }

    const booking = {
      id: Date.now().toString(),
      ...req.body,
      bookedBy: user.userId, // Track who made the booking
      studentId: req.body.studentId || user.userId, // Who the session is for
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    
    return res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  }
);

// Get user's bookings
router.get('/my-bookings', (_req: Request, res: Response) => {
  // TODO: Get user from auth token
  // For now, return mock data
  const userBookings = [
    {
      id: '1',
      tutorName: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      subject: 'Calculus',
      status: 'confirmed',
      price: 35
    },
    {
      id: '2',
      tutorName: 'Emily Rodriguez',
      date: '2024-01-18',
      time: '16:00',
      duration: 45,
      subject: 'Geometry',
      status: 'pending',
      price: 25
    }
  ];
  
  return res.json(userBookings);
});

// Cancel a booking
router.delete('/:id', (req: Request, res: Response) => {
  const index = bookings.findIndex(b => b.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  bookings[index].status = 'cancelled';
  
  return res.json({ message: 'Booking cancelled successfully' });
});

// Confirm a booking (for payment confirmation)
router.post('/:id/confirm', (req: Request, res: Response) => {
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  booking.status = 'confirmed';
  booking.paymentId = req.body.paymentIntentId;
  
  return res.json({
    message: 'Booking confirmed successfully',
    booking
  });
});

// Teacher endpoints
// Get teacher's bookings
router.get('/teacher/bookings', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Filter bookings for this teacher
    const teacherBookings = bookings.filter(b => b.tutorId === user.id);
    
    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);

    const todaysBookings = teacherBookings.filter(b => b.date === today);
    const weekBookings = teacherBookings.filter(b => new Date(b.date) >= thisWeekStart);
    const monthBookings = teacherBookings.filter(b => new Date(b.date) >= thisMonthStart);
    
    const monthlyEarnings = monthBookings.reduce((sum, b) => sum + b.price, 0);

    return res.json({
      bookings: teacherBookings,
      stats: {
        todayCount: todaysBookings.length,
        weekCount: weekBookings.length,
        monthCount: monthBookings.length,
        monthlyEarnings
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Confirm a teacher's booking
router.post('/teacher/bookings/:id/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const bookingId = req.params.id;
    
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const booking = bookings.find(b => b.id === bookingId && b.tutorId === user.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    booking.status = 'confirmed';
    return res.json({ success: true, booking });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// Decline a teacher's booking
router.post('/teacher/bookings/:id/decline', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const bookingId = req.params.id;
    
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const booking = bookings.find(b => b.id === bookingId && b.tutorId === user.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    booking.status = 'cancelled';
    return res.json({ success: true, booking });
  } catch (error) {
    console.error('Error declining booking:', error);
    return res.status(500).json({ error: 'Failed to decline booking' });
  }
});

export default router;