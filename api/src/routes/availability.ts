/**
 * @file availability.ts
 * @author Angelo Nicolson
 * @brief Tutor availability management endpoints
 * @description API endpoints for tutors to manage their weekly schedules, exceptions,
 * and for students to view available booking slots.
 */

import { Router, Request, Response } from 'express';
import { body, param, query as expressQuery } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { handleValidationErrors, sanitizeRequestBody } from '../middleware/security';
import { query } from '../database/connection';

const router = Router();

/**
 * Get tutor's weekly availability schedule
 * Public endpoint - anyone can view a tutor's availability
 */
router.get(
  '/tutors/:tutorId/schedule',
  [param('tutorId').isInt().withMessage('Invalid tutor ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;

      // Verify tutor exists
      const tutorCheck = await query(
        'SELECT id, display_name FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      // Get weekly schedule
      const scheduleResult = await query(
        `SELECT
          id,
          day_of_week,
          start_time,
          end_time,
          is_active
         FROM tutor_availability
         WHERE tutor_id = $1
         ORDER BY day_of_week ASC, start_time ASC`,
        [tutorId]
      );

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const schedule = scheduleResult.rows.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        dayName: dayNames[row.day_of_week],
        startTime: row.start_time,
        endTime: row.end_time,
        isActive: row.is_active
      }));

      return res.json({
        tutorId: parseInt(tutorId),
        tutorName: tutorCheck.rows[0].display_name,
        schedule
      });
    } catch (error) {
      console.error('[GET SCHEDULE ERROR]', error);
      return res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }
);

/**
 * Get tutor's exceptions (vacations, custom hours)
 * Requires authentication - only tutor or admin can view
 */
router.get(
  '/tutors/:tutorId/exceptions',
  requireAuth,
  [param('tutorId').isInt().withMessage('Invalid tutor ID')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get exceptions
      const exceptionsResult = await query(
        `SELECT
          id,
          exception_date,
          exception_type,
          start_time,
          end_time,
          reason
         FROM tutor_availability_exceptions
         WHERE tutor_id = $1
         ORDER BY exception_date ASC`,
        [tutorId]
      );

      return res.json({
        exceptions: exceptionsResult.rows.map(row => ({
          id: row.id,
          date: row.exception_date,
          type: row.exception_type,
          startTime: row.start_time,
          endTime: row.end_time,
          reason: row.reason
        }))
      });
    } catch (error) {
      console.error('[GET EXCEPTIONS ERROR]', error);
      return res.status(500).json({ error: 'Failed to fetch exceptions' });
    }
  }
);

/**
 * Add availability block to weekly schedule
 * Requires authentication - must be tutor owner
 */
router.post(
  '/tutors/:tutorId/schedule',
  requireAuth,
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
    body('startTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid start time format'),
    body('endTime').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid end time format')
  ],
  handleValidationErrors,
  sanitizeRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;
      const { dayOfWeek, startTime, endTime } = req.body;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Insert availability block (trigger will check for overlaps)
      const result = await query(
        `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [tutorId, dayOfWeek, startTime, endTime]
      );

      return res.status(201).json({
        message: 'Availability added successfully',
        availability: {
          id: result.rows[0].id,
          createdAt: result.rows[0].created_at
        }
      });
    } catch (error: any) {
      console.error('[ADD AVAILABILITY ERROR]', error);

      if (error.message?.includes('Overlapping')) {
        return res.status(409).json({
          error: 'This time slot overlaps with an existing availability block'
        });
      }

      return res.status(500).json({ error: 'Failed to add availability' });
    }
  }
);

/**
 * Update availability block
 */
router.patch(
  '/tutors/:tutorId/schedule/:availabilityId',
  requireAuth,
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    param('availabilityId').isInt().withMessage('Invalid availability ID'),
    body('startTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('endTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('isActive').optional().isBoolean()
  ],
  handleValidationErrors,
  sanitizeRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { tutorId, availabilityId } = req.params;
      const { startTime, endTime, isActive } = req.body;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (startTime !== undefined) {
        updates.push(`start_time = $${paramCount++}`);
        values.push(startTime);
      }

      if (endTime !== undefined) {
        updates.push(`end_time = $${paramCount++}`);
        values.push(endTime);
      }

      if (isActive !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(isActive);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(availabilityId, tutorId);

      await query(
        `UPDATE tutor_availability
         SET ${updates.join(', ')}
         WHERE id = $${paramCount} AND tutor_id = $${paramCount + 1}`,
        values
      );

      return res.json({ message: 'Availability updated successfully' });
    } catch (error: any) {
      console.error('[UPDATE AVAILABILITY ERROR]', error);

      if (error.message?.includes('Overlapping')) {
        return res.status(409).json({
          error: 'This time slot overlaps with an existing availability block'
        });
      }

      return res.status(500).json({ error: 'Failed to update availability' });
    }
  }
);

/**
 * Delete availability block
 */
router.delete(
  '/tutors/:tutorId/schedule/:availabilityId',
  requireAuth,
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    param('availabilityId').isInt().withMessage('Invalid availability ID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId, availabilityId } = req.params;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await query(
        'DELETE FROM tutor_availability WHERE id = $1 AND tutor_id = $2',
        [availabilityId, tutorId]
      );

      return res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
      console.error('[DELETE AVAILABILITY ERROR]', error);
      return res.status(500).json({ error: 'Failed to delete availability' });
    }
  }
);

/**
 * Add exception (vacation, custom hours, unavailability)
 */
router.post(
  '/tutors/:tutorId/exceptions',
  requireAuth,
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('type').isIn(['unavailable', 'custom_hours']).withMessage('Type must be unavailable or custom_hours'),
    body('startTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('endTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('reason').optional().isString()
  ],
  handleValidationErrors,
  sanitizeRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;
      const { date, type, startTime, endTime, reason } = req.body;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate custom_hours has times
      if (type === 'custom_hours' && (!startTime || !endTime)) {
        return res.status(400).json({
          error: 'Custom hours must include startTime and endTime'
        });
      }

      // Insert exception
      const result = await query(
        `INSERT INTO tutor_availability_exceptions
         (tutor_id, exception_date, exception_type, start_time, end_time, reason)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at`,
        [tutorId, date, type, startTime || null, endTime || null, reason || null]
      );

      return res.status(201).json({
        message: 'Exception added successfully',
        exception: {
          id: result.rows[0].id,
          createdAt: result.rows[0].created_at
        }
      });
    } catch (error: any) {
      console.error('[ADD EXCEPTION ERROR]', error);

      if (error.code === '23505') {
        return res.status(409).json({
          error: 'An exception already exists for this date'
        });
      }

      return res.status(500).json({ error: 'Failed to add exception' });
    }
  }
);

/**
 * Delete exception
 */
router.delete(
  '/tutors/:tutorId/exceptions/:exceptionId',
  requireAuth,
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    param('exceptionId').isInt().withMessage('Invalid exception ID')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId, exceptionId } = req.params;
      const user = (req as any).user;

      // Verify authorization
      const tutorCheck = await query(
        'SELECT user_id FROM tutors WHERE id = $1',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found' });
      }

      if (tutorCheck.rows[0].user_id !== user.userId &&
          !['admin', 'owner'].includes(user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await query(
        'DELETE FROM tutor_availability_exceptions WHERE id = $1 AND tutor_id = $2',
        [exceptionId, tutorId]
      );

      return res.json({ message: 'Exception deleted successfully' });
    } catch (error) {
      console.error('[DELETE EXCEPTION ERROR]', error);
      return res.status(500).json({ error: 'Failed to delete exception' });
    }
  }
);

/**
 * Get available booking slots for a specific date
 * Public endpoint - used by booking calendar
 */
router.get(
  '/tutors/:tutorId/slots',
  [
    param('tutorId').isInt().withMessage('Invalid tutor ID'),
    expressQuery('date').isISO8601().withMessage('Valid date required'),
    expressQuery('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be 15-180 minutes')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { tutorId } = req.params;
      const { date, duration = 60 } = req.query;

      // Verify tutor exists
      const tutorCheck = await query(
        'SELECT id, display_name FROM tutors WHERE id = $1 AND is_active = true',
        [tutorId]
      );

      if (tutorCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Tutor not found or inactive' });
      }

      // Call database function to get available slots
      const slotsResult = await query(
        `SELECT * FROM get_available_slots($1, $2, $3, 30)
         ORDER BY slot_time ASC`,
        [tutorId, date, duration]
      );

      const availableSlots = slotsResult.rows
        .filter(row => row.is_available)
        .map(row => ({
          startTime: row.slot_time,
          endTime: row.slot_end_time
        }));

      return res.json({
        tutorId: parseInt(tutorId as string),
        tutorName: tutorCheck.rows[0].display_name,
        date,
        duration: parseInt(duration as string),
        slots: availableSlots,
        totalSlots: availableSlots.length
      });
    } catch (error) {
      console.error('[GET SLOTS ERROR]', error);
      return res.status(500).json({ error: 'Failed to fetch available slots' });
    }
  }
);

export default router;
