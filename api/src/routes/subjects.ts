/**
 * @file subjects.ts
 * @author Angelo Nicolson
 * @brief Public API endpoints for subjects and subject levels
 * @description Provides endpoints for retrieving subjects (Math, Science, Bible, etc.) and their organizational levels
 * (grade levels, audience levels, eras, etc.). Used by frontend to dynamically generate subject pages and filters.
 */

import { Router, Request, Response } from 'express';
import { query } from '../database/connection';

const router = Router();

/**
 * GET /api/subjects
 * Get all subjects ordered by display_order
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, name, slug, icon, description, filter_label, display_order
      FROM subjects
      ORDER BY display_order
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

/**
 * GET /api/subjects/:slug
 * Get a single subject by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await query(`
      SELECT id, name, slug, icon, description, filter_label, display_order
      FROM subjects
      WHERE slug = $1
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching subject:', error);
    return res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

/**
 * GET /api/subjects/:slug/levels
 * Get all organizational levels for a subject (for filters)
 * Returns array of levels with id, name, grade_range, description, display_order
 */
router.get('/:slug/levels', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // First get the subject
    const subjectResult = await query(`
      SELECT id FROM subjects WHERE slug = $1
    `, [slug]);

    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subjectId = subjectResult.rows[0].id;

    // Get all levels for this subject
    const levelsResult = await query(`
      SELECT id, name, grade_range, description, display_order
      FROM subject_levels
      WHERE subject_id = $1
      ORDER BY display_order
    `, [subjectId]);

    return res.json(levelsResult.rows);
  } catch (error) {
    console.error('Error fetching subject levels:', error);
    return res.status(500).json({ error: 'Failed to fetch subject levels' });
  }
});

export default router;
