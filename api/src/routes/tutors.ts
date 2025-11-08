/**
 * @file tutors.ts
 * @author Angelo Nicolson
 * @brief Tutor discovery, availability, and administration endpoints
 * @description Comprehensive tutor management API providing endpoints for tutor discovery with filtering by topic/subject/grade,
 * availability management (weekly schedules and date-specific overrides), tutor profile retrieval, booking schedule access,
 * and admin functions for tutor approval/rejection. Includes specialized endpoints for math topics and science subjects with
 * support for both individual and group tutoring sessions.
 */

import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get all approved tutors with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { topic, subject, grade } = req.query;
    
    let whereConditions = ['t.approval_status = \'approved\'', 't.is_active = true'];
    const params: any[] = [];
    
    // Filter by math topic
    if (topic) {
      params.push(topic);
      whereConditions.push(`t.subjects->'math_topics' ? $${params.length}`);
    }
    
    // Filter by science subject
    if (subject) {
      params.push(subject);
      whereConditions.push(`t.subjects->'science_subjects' ? $${params.length}`);
    }
    
    // Filter by grade
    if (grade) {
      params.push(grade);
      whereConditions.push(`$${params.length} = ANY(t.grades)`);
    }
    
    const queryText = `
      SELECT 
        t.id,
        t.display_name,
        t.bio,
        t.subjects,
        t.grades,
        t.hourly_rate,
        t.accepts_group_sessions,
        t.min_group_size,
        t.max_group_size,
        t.group_pricing,
        t.rating,
        t.total_sessions,
        u.first_name,
        u.last_name
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY t.rating DESC, t.total_sessions DESC
    `;
    
    const result = await query(queryText, params);
    
    // Add avatar field based on initials
    const tutorsWithAvatar = result.rows.map((tutor: any) => ({
      ...tutor,
      avatar: `${tutor.first_name?.charAt(0) || ''}${tutor.last_name?.charAt(0) || ''}`.toUpperCase() || 'TT'
    }));
    
    res.json(tutorsWithAvatar);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Get tutors by math topic
router.get('/by-topic/:topicName', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { topicName } = req.params;
    const limit = parseInt(req.query.limit as string) || 2; // Default to 2 tutors per topic
    
    const result = await query(`
      SELECT 
        t.id,
        t.display_name,
        t.bio,
        t.subjects,
        t.grades,
        t.hourly_rate,
        t.accepts_group_sessions,
        t.rating,
        t.total_sessions,
        u.first_name,
        u.last_name,
        SUBSTRING(u.first_name FROM 1 FOR 1) || SUBSTRING(u.last_name FROM 1 FOR 1) as avatar
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.approval_status = 'approved' 
        AND t.is_active = true
        AND t.subjects->'math_topics' ? $1
      ORDER BY t.rating DESC, t.total_sessions DESC
      LIMIT $2
    `, [topicName, limit]);
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tutors by topic:', error);
    return res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Get science tutors
router.get('/science/all', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const result = await query(`
      SELECT 
        t.id,
        t.display_name,
        t.bio,
        t.subjects,
        t.grades,
        t.hourly_rate,
        t.accepts_group_sessions,
        t.rating,
        t.total_sessions,
        u.first_name,
        u.last_name
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.approval_status = 'approved' 
        AND t.is_active = true
        AND jsonb_array_length(t.subjects->'science_subjects') > 0
      ORDER BY t.rating DESC, t.total_sessions DESC
    `);
    
    // Add avatar field based on initials
    const tutorsWithAvatar = result.rows.map((tutor: any) => ({
      ...tutor,
      avatar: `${tutor.first_name?.charAt(0) || ''}${tutor.last_name?.charAt(0) || ''}`.toUpperCase() || 'TT'
    }));
    
    return res.json(tutorsWithAvatar);
  } catch (error) {
    console.error('Error fetching science tutors:', error);
    return res.status(500).json({ error: 'Failed to fetch science tutors' });
  }
});

// Get tutors by science subject
router.get('/by-subject/:subject', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { subject } = req.params;
    
    const result = await query(`
      SELECT 
        t.id,
        t.display_name,
        t.bio,
        t.subjects,
        t.grades,
        t.hourly_rate,
        t.accepts_group_sessions,
        t.rating,
        t.total_sessions,
        u.first_name,
        u.last_name
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.approval_status = 'approved' 
        AND t.is_active = true
        AND t.subjects->'science_subjects' ? $1
      ORDER BY t.rating DESC, t.total_sessions DESC
    `, [subject]);
    
    // Add avatar field based on initials
    const tutorsWithAvatar = result.rows.map((tutor: any) => ({
      ...tutor,
      avatar: `${tutor.first_name?.charAt(0) || ''}${tutor.last_name?.charAt(0) || ''}`.toUpperCase() || 'TT'
    }));
    
    return res.json(tutorsWithAvatar);
  } catch (error) {
    console.error('Error fetching tutors by subject:', error);
    return res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Get a specific tutor by ID
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT
        t.id,
        t.display_name,
        t.bio,
        t.subjects,
        t.grades,
        t.hourly_rate,
        t.accepts_group_sessions,
        t.min_group_size,
        t.max_group_size,
        t.group_pricing,
        t.rating,
        t.total_sessions,
        u.first_name,
        u.last_name,
        u.email,
        SUBSTRING(u.first_name FROM 1 FOR 1) || SUBSTRING(u.last_name FROM 1 FOR 1) as avatar
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1 AND t.approval_status = 'approved'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutor = result.rows[0];

    // Extract specialties from subjects object
    let specialties: string[] = [];
    if (tutor.subjects) {
      if (tutor.subjects.math_topics) {
        specialties = [...specialties, ...tutor.subjects.math_topics];
      }
      if (tutor.subjects.science_subjects) {
        specialties = [...specialties, ...tutor.subjects.science_subjects];
      }
    }

    // Format the response to match what the frontend expects
    const response = {
      id: tutor.id,
      name: tutor.display_name,
      display_name: tutor.display_name,
      description: tutor.bio,
      bio: tutor.bio,
      subjects: tutor.subjects || {},
      specialties: specialties, // Frontend expects array of strings
      grade: tutor.grades ? tutor.grades.join(', ') : '',
      grades: tutor.grades || [],
      price_per_hour: tutor.hourly_rate,
      hourly_rate: tutor.hourly_rate,
      accepts_group_sessions: tutor.accepts_group_sessions,
      min_group_size: tutor.min_group_size,
      max_group_size: tutor.max_group_size,
      group_pricing: tutor.group_pricing,
      rating: tutor.rating,
      reviews_count: tutor.total_sessions,
      total_sessions: tutor.total_sessions,
      total_hours: tutor.total_sessions || 0, // Estimate: 1 session ≈ 1 hour
      experience_years: Math.floor((tutor.total_sessions || 0) / 100) || 1, // Estimate: 100 sessions ≈ 1 year
      languages: ['English'],
      certifications: [],
      education: [], // Placeholder - can be added to tutors table later
      avatar: tutor.avatar,
      is_active: true,
      first_name: tutor.first_name,
      last_name: tutor.last_name
    };

    return res.json(response);
  } catch (error) {
    console.error('Error fetching tutor:', error);
    return res.status(500).json({ error: 'Failed to fetch tutor' });
  }
});

// Get tutor availability for a specific tutor and date
router.get('/:tutorId/availability', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Get day of week from date (0 = Sunday, 6 = Saturday)
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.getDay();

    // First check for date-specific overrides
    const overrideResult = await query(`
      SELECT * FROM tutor_availability_overrides
      WHERE tutor_id = $1 AND override_date = $2
    `, [tutorId, date]);

    // If there's an override and it's marked as unavailable, return empty
    if (overrideResult.rows.length > 0 && !overrideResult.rows[0].is_available) {
      return res.json({ availableSlots: [] });
    }

    // Get regular weekly availability
    const availabilityResult = await query(`
      SELECT 
        start_time,
        end_time,
        is_available
      FROM tutor_availability
      WHERE tutor_id = $1 AND day_of_week = $2 AND is_available = true
      ORDER BY start_time
    `, [tutorId, dayOfWeek]);

    // Get existing bookings for this tutor on this date
    const bookingsResult = await query(`
      SELECT 
        start_time,
        end_time
      FROM bookings
      WHERE tutor_id = $1 
        AND session_date = $2 
        AND status IN ('confirmed', 'pending')
    `, [tutorId, date]);

    // Generate available time slots
    const availableSlots: string[] = [];
    const bookedSlots = new Set(
      bookingsResult.rows.map(b => {
        const slots = [];
        let current = new Date(`2000-01-01T${b.start_time}`);
        const end = new Date(`2000-01-01T${b.end_time}`);
        while (current < end) {
          slots.push(current.toTimeString().slice(0, 5));
          current.setHours(current.getHours() + 1);
        }
        return slots;
      }).flat()
    );

    // Process each availability window
    for (const window of availabilityResult.rows) {
      let current = new Date(`2000-01-01T${window.start_time}`);
      const end = new Date(`2000-01-01T${window.end_time}`);
      
      while (current < end) {
        const timeSlot = current.toTimeString().slice(0, 5);
        if (!bookedSlots.has(timeSlot)) {
          availableSlots.push(timeSlot);
        }
        current.setHours(current.getHours() + 1);
      }
    }

    return res.json({ 
      availableSlots,
      dayOfWeek,
      hasOverride: overrideResult.rows.length > 0
    });
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Get tutor's schedule with all bookings (for tutor dashboard)
router.get('/:tutorId/schedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;

    let whereClause = 'WHERE b.tutor_id = $1';
    const params: any[] = [tutorId];

    if (startDate && endDate) {
      whereClause += ' AND b.session_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    } else {
      // Default to next 30 days
      whereClause += ' AND b.session_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'30 days\'';
    }

    const result = await query(`
      SELECT 
        b.id,
        b.session_date,
        b.start_time,
        b.end_time,
        b.duration_minutes,
        b.is_group_session,
        b.total_participants,
        b.status,
        b.subject,
        b.notes,
        b.meeting_link,
        u.first_name as booked_by_first,
        u.last_name as booked_by_last,
        u.email as booked_by_email,
        array_agg(
          json_build_object(
            'student_id', bp.student_id,
            'first_name', s.first_name,
            'last_name', s.last_name
          )
        ) FILTER (WHERE bp.student_id IS NOT NULL) as participants
      FROM bookings b
      JOIN users u ON b.booked_by = u.id
      LEFT JOIN booking_participants bp ON b.id = bp.booking_id
      LEFT JOIN users s ON bp.student_id = s.id
      ${whereClause}
      GROUP BY b.id, u.first_name, u.last_name, u.email
      ORDER BY b.session_date, b.start_time
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tutor schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update tutor availability (for tutors to set their schedule)
router.put('/:tutorId/availability', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { availability } = req.body;
    const user = (req as any).user;

    // Verify ownership: user must be the tutor or an admin/owner
    const tutorCheck = await query(
      'SELECT user_id FROM tutors WHERE id = $1',
      [tutorId]
    );

    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutorUserId = tutorCheck.rows[0].user_id;
    if (tutorUserId !== user.userId && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only modify your own availability' });
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Clear existing availability
      await query('DELETE FROM tutor_availability WHERE tutor_id = $1', [tutorId]);

      // Insert new availability
      for (const slot of availability) {
        await query(`
          INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
          VALUES ($1, $2, $3, $4, $5)
        `, [tutorId, slot.dayOfWeek, slot.startTime, slot.endTime, slot.isAvailable ?? true]);
      }

      await query('COMMIT');
      return res.json({ success: true, message: 'Availability updated successfully' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating tutor availability:', error);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Add date-specific override (vacation, special hours, etc.)
router.post('/:tutorId/availability/override', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { date, isAvailable, reason, allDay, startTime, endTime } = req.body;
    const user = (req as any).user;

    // Verify ownership: user must be the tutor or an admin/owner
    const tutorCheck = await query(
      'SELECT user_id FROM tutors WHERE id = $1',
      [tutorId]
    );

    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const tutorUserId = tutorCheck.rows[0].user_id;
    if (tutorUserId !== user.userId && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only modify your own availability' });
    }

    await query(`
      INSERT INTO tutor_availability_overrides
      (tutor_id, override_date, is_available, reason, all_day, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tutor_id, override_date, start_time)
      DO UPDATE SET
        is_available = $3,
        reason = $4,
        all_day = $5,
        end_time = $7
    `, [tutorId, date, isAvailable, reason, allDay, startTime, endTime]);

    return res.json({ success: true, message: 'Override added successfully' });
  } catch (error) {
    console.error('Error adding availability override:', error);
    return res.status(500).json({ error: 'Failed to add override' });
  }
});

// Get tutor content catalog (public endpoint - no auth required)
router.get('/:id/content', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Verify tutor exists and is approved
    const tutorResult = await query(
      'SELECT id FROM tutors WHERE id = $1 AND approval_status = \'approved\'',
      [id]
    );

    if (tutorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Fetch tutor's content with pricing
    const result = await query(`
      SELECT
        tc.id,
        tc.title,
        tc.description,
        tc.content_type,
        tc.status,
        tc.metadata,
        tc.view_count,
        tc.purchase_count,
        tc.created_at,
        cp.pricing_model,
        cp.price_amount,
        cp.currency,
        cp.billing_interval
      FROM tutor_content tc
      LEFT JOIN content_pricing cp ON tc.id = cp.content_id AND cp.is_active = true
      WHERE tc.tutor_id = $1 AND tc.status = 'published'
      ORDER BY tc.created_at DESC
    `, [id]);

    const content = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      contentType: row.content_type,
      status: row.status,
      metadata: row.metadata,
      viewCount: row.view_count,
      purchaseCount: row.purchase_count,
      createdAt: row.created_at,
      pricing: {
        model: row.pricing_model,
        price: row.price_amount,
        currency: row.currency,
        billingInterval: row.billing_interval
      }
    }));

    return res.json(content);
  } catch (error) {
    console.error('Error fetching tutor content:', error);
    return res.status(500).json({ error: 'Failed to fetch tutor content' });
  }
});

// Admin routes
router.use(requireAuth);

// Get all tutors including inactive (admin only)
router.get('/admin/all', requireRole('admin', 'owner'), async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        t.*,
        u.email,
        u.first_name,
        u.last_name,
        u.account_status
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all tutors:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// Approve tutor application (admin only)
router.patch('/admin/:id/approve', requireRole('admin', 'owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query('BEGIN');

    try {
      // Update tutor approval status
      await query(`
        UPDATE tutors 
        SET approval_status = 'approved',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      // Update user account status
      await query(`
        UPDATE users 
        SET account_status = 'active',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT user_id FROM tutors WHERE id = $1)
      `, [id]);

      await query('COMMIT');
      res.json({ message: 'Tutor approved successfully' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error approving tutor:', error);
    res.status(500).json({ error: 'Failed to approve tutor' });
  }
});

// Reject tutor application (admin only)
router.patch('/admin/:id/reject', requireRole('admin', 'owner'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query('BEGIN');

    try {
      // Update tutor approval status
      await query(`
        UPDATE tutors 
        SET approval_status = 'rejected',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      // Update user account status
      await query(`
        UPDATE users 
        SET account_status = 'suspended',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT user_id FROM tutors WHERE id = $1)
      `, [id]);

      await query('COMMIT');
      res.json({ message: 'Tutor application rejected' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error rejecting tutor:', error);
    res.status(500).json({ error: 'Failed to reject tutor' });
  }
});

// Toggle tutor active status (admin only)
router.patch('/admin/:id/toggle', requireRole('admin', 'owner'), async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Get current status
    const result = await query('SELECT is_active FROM tutors WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const newStatus = !result.rows[0].is_active;

    await query(`
      UPDATE tutors 
      SET is_active = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newStatus, id]);

    return res.json({ 
      message: `Tutor ${newStatus ? 'activated' : 'deactivated'} successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling tutor status:', error);
    return res.status(500).json({ error: 'Failed to toggle tutor status' });
  }
});

export default router;