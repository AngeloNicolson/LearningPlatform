/**
 * @file admin/subjects.ts
 * @author Angelo Nicolson
 * @brief Admin API endpoints for managing subjects, subject levels, and topics
 * @description Provides CRUD operations for subjects and their organizational structure.
 * All endpoints require admin or owner role authentication.
 */

import { Router, Request, Response } from 'express';
import { query } from '../../database/connection';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireRole('admin', 'owner'));

/**
 * POST /api/admin/subjects
 * Create a new subject
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, slug, icon, description, filter_label, display_order } = req.body;

    // Validate required fields
    if (!id || !name || !slug || !filter_label) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, slug, filter_label'
      });
    }

    const result = await query(`
      INSERT INTO subjects (id, name, slug, icon, description, filter_label, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, name, slug, icon || null, description || null, filter_label, display_order || 0]);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating subject:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Subject with this ID or slug already exists' });
    }
    return res.status(500).json({ error: 'Failed to create subject' });
  }
});

/**
 * PATCH /api/admin/subjects/:id
 * Update an existing subject
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, filter_label, display_order } = req.body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (filter_label !== undefined) {
      updates.push(`filter_label = $${paramCount++}`);
      values.push(filter_label);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(`
      UPDATE subjects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating subject:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug already in use' });
    }
    return res.status(500).json({ error: 'Failed to update subject' });
  }
});

/**
 * DELETE /api/admin/subjects/:id
 * Delete a subject (cascades to subject_levels and topics)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM subjects
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.json({
      message: 'Subject deleted successfully',
      subject: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ error: 'Failed to delete subject' });
  }
});

/**
 * POST /api/admin/subjects/:subjectId/levels
 * Create a new subject level
 */
router.post('/:subjectId/levels', async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { id, name, grade_range, description, display_order } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' });
    }

    // Verify subject exists
    const subjectCheck = await query('SELECT id FROM subjects WHERE id = $1', [subjectId]);
    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const result = await query(`
      INSERT INTO subject_levels (id, name, subject, subject_id, grade_range, description, display_order)
      VALUES ($1, $2, $3, $3, $4, $5, $6)
      RETURNING *
    `, [id, name, subjectId, grade_range || null, description || null, display_order || 0]);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating subject level:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Subject level with this ID already exists' });
    }
    return res.status(500).json({ error: 'Failed to create subject level' });
  }
});

/**
 * PATCH /api/admin/subjects/:subjectId/levels/:levelId
 * Update a subject level
 */
router.patch('/:subjectId/levels/:levelId', async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;
    const { name, grade_range, description, display_order } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (grade_range !== undefined) {
      updates.push(`grade_range = $${paramCount++}`);
      values.push(grade_range);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(levelId);
    const result = await query(`
      UPDATE subject_levels
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject level not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subject level:', error);
    return res.status(500).json({ error: 'Failed to update subject level' });
  }
});

/**
 * DELETE /api/admin/subjects/:subjectId/levels/:levelId
 * Delete a subject level (cascades to topics)
 */
router.delete('/:subjectId/levels/:levelId', async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;

    const result = await query(`
      DELETE FROM subject_levels
      WHERE id = $1
      RETURNING *
    `, [levelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject level not found' });
    }

    return res.json({
      message: 'Subject level deleted successfully',
      level: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting subject level:', error);
    return res.status(500).json({ error: 'Failed to delete subject level' });
  }
});

/**
 * POST /api/admin/topics
 * Create a new topic
 */
router.post('/topics', async (req: Request, res: Response) => {
  try {
    const { id, name, grade_level_id, icon, description, display_order } = req.body;

    if (!id || !name || !grade_level_id) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, grade_level_id'
      });
    }

    // Verify subject level exists
    const levelCheck = await query('SELECT id FROM subject_levels WHERE id = $1', [grade_level_id]);
    if (levelCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subject level not found' });
    }

    const result = await query(`
      INSERT INTO topics (id, name, grade_level_id, icon, description, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, name, grade_level_id, icon || null, description || null, display_order || 0]);

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating topic:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Topic with this ID already exists' });
    }
    return res.status(500).json({ error: 'Failed to create topic' });
  }
});

/**
 * PATCH /api/admin/topics/:id
 * Update a topic
 */
router.patch('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade_level_id, icon, description, display_order } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (grade_level_id !== undefined) {
      updates.push(`grade_level_id = $${paramCount++}`);
      values.push(grade_level_id);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(display_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(`
      UPDATE topics
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating topic:', error);
    return res.status(500).json({ error: 'Failed to update topic' });
  }
});

/**
 * DELETE /api/admin/topics/:id
 * Delete a topic
 */
router.delete('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM topics
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    return res.json({
      message: 'Topic deleted successfully',
      topic: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return res.status(500).json({ error: 'Failed to delete topic' });
  }
});

export default router;
