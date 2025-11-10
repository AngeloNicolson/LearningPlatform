/**
 * @file sessionTypes.ts
 * @author Angelo Nicolson
 * @brief Session type management endpoints
 * @description API endpoints for managing tutor session offerings (duration, pricing, descriptions).
 * Allows tutors to define different session types (e.g., 30min, 60min, test prep packages) with custom pricing.
 */

import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all session types for a tutor (public endpoint)
router.get('/tutor/:tutorId', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId } = req.params;
    const { includeInactive = 'false' } = req.query;

    let whereClause = 'tutor_id = $1';
    if (includeInactive !== 'true') {
      whereClause += ' AND is_active = true';
    }

    const result = await query(`
      SELECT
        id,
        name,
        duration_minutes,
        price,
        description,
        is_active,
        display_order
      FROM session_types
      WHERE ${whereClause}
      ORDER BY display_order ASC, price ASC
    `, [tutorId]);

    return res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      durationMinutes: row.duration_minutes,
      price: parseFloat(row.price),
      description: row.description,
      isActive: row.is_active,
      displayOrder: row.display_order
    })));
  } catch (error) {
    console.error('Error fetching session types:', error);
    return res.status(500).json({ error: 'Failed to fetch session types' });
  }
});

// Get a specific session type
router.get('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        st.id,
        st.tutor_id,
        st.name,
        st.duration_minutes,
        st.price,
        st.description,
        st.is_active,
        st.display_order,
        t.display_name as tutor_name
      FROM session_types st
      JOIN tutors t ON st.tutor_id = t.id
      WHERE st.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session type not found' });
    }

    const row = result.rows[0];

    return res.json({
      id: row.id,
      tutorId: row.tutor_id,
      tutorName: row.tutor_name,
      name: row.name,
      durationMinutes: row.duration_minutes,
      price: parseFloat(row.price),
      description: row.description,
      isActive: row.is_active,
      displayOrder: row.display_order
    });
  } catch (error) {
    console.error('Error fetching session type:', error);
    return res.status(500).json({ error: 'Failed to fetch session type' });
  }
});

// Create a new session type (requires authentication, must be tutor)
router.post('/', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tutorId, name, durationMinutes, price, description, displayOrder } = req.body;
    const user = (req as any).user;

    // Validate input
    if (!tutorId || !name || !durationMinutes || price === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: tutorId, name, durationMinutes, price'
      });
    }

    if (durationMinutes <= 0) {
      return res.status(400).json({ error: 'Duration must be greater than 0' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }

    // Verify tutor exists and user owns it
    const tutorCheck = await query(
      'SELECT user_id FROM tutors WHERE id = $1',
      [tutorId]
    );

    if (tutorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Only the tutor themselves or admin can create session types
    if (tutorCheck.rows[0].user_id !== user.userId &&
        user.role !== 'admin' &&
        user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only create session types for your own tutor profile' });
    }

    // Create session type
    const result = await query(`
      INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [tutorId, name, durationMinutes, price, description || null, displayOrder || 0]);

    return res.status(201).json({
      message: 'Session type created successfully',
      sessionType: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error: any) {
    console.error('Error creating session type:', error);

    // Handle duplicate name for same tutor
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A session type with this name already exists for this tutor' });
    }

    return res.status(500).json({ error: 'Failed to create session type' });
  }
});

// Update a session type (requires authentication, must be tutor owner)
router.patch('/:id', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, durationMinutes, price, description, isActive, displayOrder } = req.body;
    const user = (req as any).user;

    // Verify session type exists and get tutor_id
    const sessionCheck = await query(`
      SELECT st.tutor_id, t.user_id
      FROM session_types st
      JOIN tutors t ON st.tutor_id = t.id
      WHERE st.id = $1
    `, [id]);

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session type not found' });
    }

    const session = sessionCheck.rows[0];

    // Verify ownership
    if (session.user_id !== user.userId &&
        user.role !== 'admin' &&
        user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only edit your own session types' });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (durationMinutes !== undefined) {
      if (durationMinutes <= 0) {
        return res.status(400).json({ error: 'Duration must be greater than 0' });
      }
      updates.push(`duration_minutes = $${paramCount++}`);
      values.push(durationMinutes);
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ error: 'Price cannot be negative' });
      }
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (displayOrder !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(displayOrder);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await query(`
      UPDATE session_types
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    return res.json({ message: 'Session type updated successfully' });
  } catch (error: any) {
    console.error('Error updating session type:', error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'A session type with this name already exists for this tutor' });
    }

    return res.status(500).json({ error: 'Failed to update session type' });
  }
});

// Delete a session type (requires authentication, must be tutor owner)
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verify session type exists and get tutor_id
    const sessionCheck = await query(`
      SELECT st.tutor_id, t.user_id
      FROM session_types st
      JOIN tutors t ON st.tutor_id = t.id
      WHERE st.id = $1
    `, [id]);

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session type not found' });
    }

    const session = sessionCheck.rows[0];

    // Verify ownership
    if (session.user_id !== user.userId &&
        user.role !== 'admin' &&
        user.role !== 'owner') {
      return res.status(403).json({ error: 'You can only delete your own session types' });
    }

    // Check if any bookings use this session type
    const bookingCheck = await query(
      'SELECT COUNT(*) as count FROM bookings WHERE session_type_id = $1',
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete session type with existing bookings. Consider deactivating it instead.'
      });
    }

    await query('DELETE FROM session_types WHERE id = $1', [id]);

    return res.json({ message: 'Session type deleted successfully' });
  } catch (error) {
    console.error('Error deleting session type:', error);
    return res.status(500).json({ error: 'Failed to delete session type' });
  }
});

export default router;
