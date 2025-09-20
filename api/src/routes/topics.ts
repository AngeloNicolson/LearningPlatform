import { Router, Request, Response } from 'express';
import { query } from '../database/connection';

const router = Router();

// Get all topics
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, name, icon, subject, description, display_order
      FROM topics
      ORDER BY subject, display_order
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get topics by subject
router.get('/:subject', async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    
    const result = await query(`
      SELECT id, name, icon, subject, description, display_order
      FROM topics
      WHERE subject = $1
      ORDER BY display_order
    `, [subject]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics by subject:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get resources for a specific topic
router.get('/:subject/:topicId/resources', async (req: Request, res: Response) => {
  try {
    const { subject, topicId } = req.params;
    const { gradeLevel, type } = req.query;
    
    let queryText = `
      SELECT r.id, r.title, r.description, r.resource_type as type, 
             r.grade_level as "gradeLevel", r.url, r.content,
             t.name as "topicName", t.icon as "topicIcon"
      FROM resources r
      INNER JOIN topics t ON r.topic_id = t.id
      WHERE t.subject = $1 AND r.topic_id = $2 AND r.visible = true
    `;
    const params: any[] = [subject, topicId];
    
    if (gradeLevel) {
      params.push(gradeLevel);
      queryText += ` AND r.grade_level = $${params.length}`;
    }
    
    if (type) {
      params.push(type);
      queryText += ` AND r.resource_type = $${params.length}`;
    }
    
    queryText += ` ORDER BY r.display_order, r.created_at DESC`;
    
    const result = await query(queryText, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topic resources:', error);
    res.status(500).json({ error: 'Failed to fetch topic resources' });
  }
});

// Get topic statistics (resource counts)
router.get('/:subject/stats', async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    
    const result = await query(`
      SELECT 
        t.id, t.name, t.icon,
        COUNT(r.id) as resource_count,
        COUNT(DISTINCT r.grade_level) as grade_levels_count
      FROM topics t
      LEFT JOIN resources r ON t.id = r.topic_id AND r.visible = true
      WHERE t.subject = $1
      GROUP BY t.id, t.name, t.icon, t.display_order
      ORDER BY t.display_order
    `, [subject]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    res.status(500).json({ error: 'Failed to fetch topic statistics' });
  }
});

export default router;