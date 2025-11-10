/**
 * @file reviews.ts
 * @author Angelo Nicolson
 * @brief Review management endpoints
 * @description API endpoints for creating, reading, and managing tutor reviews. Supports verified reviews from completed bookings
 * and general student feedback. Includes rating aggregation and automatic tutor rating updates via database triggers.
 */

import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all reviews for a tutor (public endpoint)
router.get('/tutor/:tutorId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.subject,
        r.is_verified,
        r.created_at,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      WHERE r.tutor_id = $1 AND r.is_visible = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [tutorId, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE tutor_id = $1 AND is_visible = true
    `, [tutorId]);

    return res.json({
      reviews: result.rows.map(review => ({
        id: review.id,
        rating: parseFloat(review.rating),
        comment: review.comment,
        subject: review.subject,
        isVerified: review.is_verified,
        createdAt: review.created_at,
        studentName: `${review.first_name} ${review.last_name.charAt(0)}.` // Privacy: only show first name and last initial
      })),
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review statistics for a tutor (public endpoint)
router.get('/tutor/:tutorId/stats', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId } = req.params;

    const result = await query(`
      SELECT
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 2) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_reviews
      FROM reviews
      WHERE tutor_id = $1 AND is_visible = true
    `, [tutorId]);

    const stats = result.rows[0];

    return res.json({
      totalReviews: parseInt(stats.total_reviews),
      averageRating: parseFloat(stats.average_rating) || 0,
      distribution: {
        5: parseInt(stats.five_star),
        4: parseInt(stats.four_star),
        3: parseInt(stats.three_star),
        2: parseInt(stats.two_star),
        1: parseInt(stats.one_star)
      },
      verifiedReviews: parseInt(stats.verified_reviews)
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
});

// Create a new review (requires authentication)
router.post('/', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId, rating, comment, subject, bookingId } = req.body;
    const user = (req as any).user;

    // Validate input
    if (!tutorId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields: tutorId, rating, comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify tutor exists
    const tutorCheck = await query('SELECT id FROM tutors WHERE id = $1', [tutorId]);
    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // If bookingId provided, verify booking exists and is completed
    let isVerified = false;
    if (bookingId) {
      const bookingCheck = await query(`
        SELECT id, status, student_id
        FROM bookings
        WHERE id = $1 AND tutor_id = $2
      `, [bookingId, tutorId]);

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = bookingCheck.rows[0];

      // Verify user is the student who booked
      if (booking.student_id !== user.userId) {
        return res.status(403).json({ error: 'You can only review your own bookings' });
      }

      // Mark as verified if booking is completed
      isVerified = booking.status === 'completed';
    }

    // Create review
    const result = await query(`
      INSERT INTO reviews (tutor_id, student_id, booking_id, rating, comment, subject, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `, [tutorId, user.userId, bookingId || null, rating, comment, subject || null, isVerified]);

    return res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error: any) {
    console.error('Error creating review:', error);

    // Handle duplicate review
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this tutor or booking' });
    }

    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review (requires authentication, must be review author)
router.patch('/:id', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = (req as any).user;

    // Verify review exists and user is the author
    const reviewCheck = await query(
      'SELECT student_id FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (reviewCheck.rows[0].student_id !== user.userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Update review
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      updates.push(`rating = $${paramCount++}`);
      values.push(rating);
    }

    if (comment !== undefined) {
      updates.push(`comment = $${paramCount++}`);
      values.push(comment);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(`
      UPDATE reviews
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    return res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review (requires authentication, must be review author or admin)
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verify review exists and check ownership
    const reviewCheck = await query(
      'SELECT student_id FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Allow deletion if user is the author or an admin
    if (reviewCheck.rows[0].student_id !== user.userId &&
        user.role !== 'admin' &&
        user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await query('DELETE FROM reviews WHERE id = $1', [id]);

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
