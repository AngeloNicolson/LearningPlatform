/**
 * @file bookings-secure.ts
 * @author Angelo Nicolson
 * @brief Secure tutoring session booking endpoints with database integration
 * @description Production-ready booking system with conflict detection, payment integration,
 * comprehensive validation, and security measures.
 */

import { Router, Request, Response } from 'express';
import { body, param, query as expressQuery } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import {
  bookingRateLimit,
  handleValidationErrors,
  sanitizeRequestBody
} from '../middleware/security';
import { query } from '../database/connection';

const router = Router();

/**
 * Get user's bookings (student or parent view)
 */
router.get(
  '/my-bookings',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Get bookings where user is the booker or the student
      const result = await query(
        `SELECT
          b.*,
          t.display_name as tutor_name,
          u.first_name as tutor_first_name,
          u.last_name as tutor_last_name,
          u.email as tutor_email
         FROM bookings b
         JOIN tutors t ON b.tutor_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE (b.booked_by_id = $1 OR b.student_id = $1)
           AND b.status != 'cancelled'
         ORDER BY b.session_date DESC, b.start_time DESC
         LIMIT 100`,
        [user.userId]
      );

      return res.json({
        bookings: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('[GET BOOKINGS ERROR]', error);
      return res.status(500).json({
        error: 'Failed to retrieve bookings'
      });
    }
  }
);

/**
 * Get specific booking details
 */
router.get(
  '/:id',
  requireAuth,
  [
    param('id').isInt().withMessage('Invalid booking ID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const bookingId = req.params.id;

      const result = await query(
        `SELECT
          b.*,
          t.display_name as tutor_name,
          u.first_name as tutor_first_name,
          u.last_name as tutor_last_name,
          u.email as tutor_email,
          t.user_id as tutor_user_id
         FROM bookings b
         JOIN tutors t ON b.tutor_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE b.id = $1
           AND (b.booked_by_id = $2 OR b.student_id = $2 OR t.user_id = $2 OR $3 = ANY(ARRAY['admin', 'owner']))`,
        [bookingId, user.userId, user.role]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Booking not found or unauthorized'
        });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('[GET BOOKING ERROR]', error);
      return res.status(500).json({
        error: 'Failed to retrieve booking'
      });
    }
  }
);

/**
 * Check availability for a tutor on a specific date
 */
router.get(
  '/check-availability/:tutorId',
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    expressQuery('date').isISO8601().withMessage('Valid date required'),
    expressQuery('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Valid start time required (HH:MM)'),
    expressQuery('endTime').matches(/^\d{2}:\d{2}$/).withMessage('Valid end time required (HH:MM)')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;
      const { date, startTime, endTime } = req.query;

      // Check for conflicts
      const conflictResult = await query(
        `SELECT COUNT(*) as conflict_count
         FROM bookings
         WHERE tutor_id = $1
           AND session_date = $2
           AND status IN ('pending', 'confirmed')
           AND (start_time, end_time) OVERLAPS ($3::time, $4::time)`,
        [tutorId, date, startTime, endTime]
      );

      const isAvailable = conflictResult.rows[0].conflict_count === '0';

      return res.json({
        available: isAvailable,
        date,
        startTime,
        endTime
      });
    } catch (error) {
      console.error('[CHECK AVAILABILITY ERROR]', error);
      return res.status(500).json({
        error: 'Failed to check availability'
      });
    }
  }
);

/**
 * Cancel a booking (with refund if applicable)
 */
router.delete(
  '/:id',
  requireAuth,
  bookingRateLimit,
  [
    param('id').isInt().withMessage('Invalid booking ID'),
    body('reason').optional().isString().trim().withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  sanitizeRequestBody,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const bookingId = req.params.id;
      const { reason } = req.body;

      // Get booking
      const bookingResult = await query(
        `SELECT * FROM bookings
         WHERE id = $1 AND (booked_by_id = $2 OR $3 = ANY(ARRAY['admin', 'owner']))`,
        [bookingId, user.userId, user.role]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Booking not found or unauthorized'
        });
      }

      const booking = bookingResult.rows[0];

      if (booking.status === 'cancelled') {
        return res.status(400).json({
          error: 'Booking already cancelled'
        });
      }

      if (booking.status === 'completed') {
        return res.status(400).json({
          error: 'Cannot cancel completed booking'
        });
      }

      // Update booking
      await query(
        `UPDATE bookings
         SET status = 'cancelled',
             cancellation_reason = $1,
             cancelled_at = NOW(),
             cancelled_by_id = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [reason || 'User cancellation', user.userId, bookingId]
      );

      // If payment was made, suggest using refund endpoint
      const refundEligible = booking.payment_intent_id && booking.status === 'confirmed';

      return res.json({
        success: true,
        message: 'Booking cancelled successfully',
        refundEligible,
        refundMessage: refundEligible
          ? 'To process a refund, please use the /api/payments/refund endpoint'
          : null
      });
    } catch (error) {
      console.error('[CANCEL BOOKING ERROR]', error);
      return res.status(500).json({
        error: 'Failed to cancel booking'
      });
    }
  }
);

/**
 * Mark booking as completed (tutor only)
 */
router.post(
  '/:id/complete',
  requireAuth,
  [
    param('id').isInt().withMessage('Invalid booking ID'),
    body('notes').optional().isString().trim()
  ],
  handleValidationErrors,
  sanitizeRequestBody,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const bookingId = req.params.id;
      const { notes } = req.body;

      // Verify user is the tutor for this booking
      const bookingResult = await query(
        `SELECT b.*, t.user_id as tutor_user_id
         FROM bookings b
         JOIN tutors t ON b.tutor_id = t.id
         WHERE b.id = $1 AND (t.user_id = $2 OR $3 = ANY(ARRAY['admin', 'owner']))`,
        [bookingId, user.userId, user.role]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Booking not found or unauthorized'
        });
      }

      const booking = bookingResult.rows[0];

      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          error: 'Only confirmed bookings can be marked as completed'
        });
      }

      // Check if session date has passed
      const sessionDateTime = new Date(`${booking.session_date}T${booking.end_time}`);
      if (sessionDateTime.getTime() > Date.now()) {
        return res.status(400).json({
          error: 'Cannot complete a future booking'
        });
      }

      // Update booking status
      await query(
        `UPDATE bookings
         SET status = 'completed',
             completed_at = NOW(),
             notes = COALESCE($1, notes),
             updated_at = NOW()
         WHERE id = $2`,
        [notes, bookingId]
      );

      // Trigger will automatically update tutor stats

      return res.json({
        success: true,
        message: 'Booking marked as completed'
      });
    } catch (error) {
      console.error('[COMPLETE BOOKING ERROR]', error);
      return res.status(500).json({
        error: 'Failed to complete booking'
      });
    }
  }
);

/**
 * Mark booking as no-show (tutor only)
 */
router.post(
  '/:id/no-show',
  requireAuth,
  [
    param('id').isInt().withMessage('Invalid booking ID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const bookingId = req.params.id;

      // Verify user is the tutor for this booking
      const bookingResult = await query(
        `SELECT b.*, t.user_id as tutor_user_id
         FROM bookings b
         JOIN tutors t ON b.tutor_id = t.id
         WHERE b.id = $1 AND (t.user_id = $2 OR $3 = ANY(ARRAY['admin', 'owner']))`,
        [bookingId, user.userId, user.role]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Booking not found or unauthorized'
        });
      }

      const booking = bookingResult.rows[0];

      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          error: 'Only confirmed bookings can be marked as no-show'
        });
      }

      // Update booking status
      await query(
        `UPDATE bookings
         SET status = 'no_show',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      // Tutor still gets paid for no-shows
      await query(
        `UPDATE bookings
         SET status = 'completed',
             completed_at = NOW(),
             notes = 'Marked as no-show by tutor',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      return res.json({
        success: true,
        message: 'Booking marked as no-show. Tutor will still receive payment.'
      });
    } catch (error) {
      console.error('[NO-SHOW BOOKING ERROR]', error);
      return res.status(500).json({
        error: 'Failed to mark booking as no-show'
      });
    }
  }
);

/**
 * Get tutor's bookings (teacher dashboard)
 */
router.get(
  '/teacher/my-bookings',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Verify user is a teacher/tutor
      if (!['teacher', 'admin', 'owner'].includes(user.role)) {
        return res.status(403).json({
          error: 'Unauthorized',
          message: 'Only teachers can access this endpoint'
        });
      }

      // Get tutor record
      const tutorResult = await query(
        'SELECT id FROM tutors WHERE user_id = $1',
        [user.userId]
      );

      if (tutorResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Tutor profile not found'
        });
      }

      const tutorId = tutorResult.rows[0].id;

      // Get bookings
      const bookingsResult = await query(
        `SELECT
          b.*,
          u.first_name as student_first_name,
          u.last_name as student_last_name,
          u.email as student_contact_email
         FROM bookings b
         LEFT JOIN users u ON b.student_id = u.id
         WHERE b.tutor_id = $1
         ORDER BY b.session_date DESC, b.start_time DESC
         LIMIT 200`,
        [tutorId]
      );

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const bookings = bookingsResult.rows;

      const stats = {
        todayCount: bookings.filter(b => b.session_date === today && b.status === 'confirmed').length,
        upcomingCount: bookings.filter(b => new Date(b.session_date) > new Date() && b.status === 'confirmed').length,
        completedCount: bookings.filter(b => b.status === 'completed').length,
        totalEarnings: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + parseFloat(b.tutor_earnings || 0), 0)
      };

      return res.json({
        bookings,
        stats
      });
    } catch (error) {
      console.error('[GET TEACHER BOOKINGS ERROR]', error);
      return res.status(500).json({
        error: 'Failed to retrieve bookings'
      });
    }
  }
);

/**
 * Get booking statistics for admin
 */
router.get(
  '/admin/stats',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({
          error: 'Unauthorized'
        });
      }

      const statsResult = await query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
          COUNT(*) FILTER (WHERE session_date >= CURRENT_DATE) as upcoming_bookings,
          SUM(amount_paid) FILTER (WHERE status = 'completed') as total_revenue,
          SUM(platform_fee) FILTER (WHERE status = 'completed') as total_platform_fees,
          SUM(tutor_earnings) FILTER (WHERE status = 'completed') as total_tutor_earnings,
          COUNT(DISTINCT tutor_id) as active_tutors,
          COUNT(DISTINCT student_id) as total_students
        FROM bookings
      `);

      return res.json(statsResult.rows[0]);
    } catch (error) {
      console.error('[GET ADMIN STATS ERROR]', error);
      return res.status(500).json({
        error: 'Failed to retrieve statistics'
      });
    }
  }
);

export default router;
