import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tutoring_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'development',
});

// Get resources for a specific subject
router.get('/:subject/resources', async (req, res) => {
  try {
    const { subject } = req.params;
    const { topic, type, grade, era, search } = req.query;
    
    // Validate subject
    if (!['math', 'science', 'history'].includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject' });
    }

    let query = `
      SELECT * FROM subject_resources 
      WHERE subject = $1 AND visible = true
    `;
    const params: any[] = [subject];
    let paramIndex = 2;

    if (topic && topic !== 'all') {
      query += ` AND topic_id = $${paramIndex}`;
      params.push(topic);
      paramIndex++;
    }

    if (type && type !== 'all') {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (grade && grade !== 'all') {
      query += ` AND LOWER(grade_level) LIKE LOWER($${paramIndex})`;
      params.push(`%${grade}%`);
      paramIndex++;
    }

    if (era && era !== 'all') {
      query += ` AND LOWER(era) LIKE LOWER($${paramIndex})`;
      params.push(`%${era}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY display_order, created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get topics for a specific subject
router.get('/:subject/topics', async (req, res) => {
  try {
    const { subject } = req.params;
    
    // For math and science, get from grade_levels -> topics structure
    if (subject === 'math' || subject === 'science') {
      const query = `
        SELECT DISTINCT t.id, t.name, gl.name as grade_level
        FROM topics t
        JOIN grade_levels gl ON t.grade_level_id = gl.id
        WHERE gl.subject = $1
        ORDER BY gl.display_order, t.display_order
      `;
      const result = await pool.query(query, [subject]);
      res.json(result.rows);
    } else if (subject === 'history') {
      // For history, get from grade_levels (which represent eras)
      const query = `
        SELECT id, name, grade_range as era
        FROM grade_levels
        WHERE subject = 'history'
        ORDER BY display_order
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } else {
      res.status(400).json({ error: 'Invalid subject' });
    }
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Admin endpoints - require authentication
router.use(requireAuth);
router.use(requireRole(['admin', 'owner']));

// Create a new resource
router.post('/:subject/resources', async (req, res) => {
  try {
    const { subject } = req.params;
    const { 
      topic_id, topic_name, topic_icon, resource_type, 
      title, description, url, content, era, grade_level 
    } = req.body;
    
    const id = `${subject.slice(0, 2)}-${resource_type.slice(0, 2)}-${Date.now()}`;
    
    const query = `
      INSERT INTO subject_resources (
        id, subject, topic_id, topic_name, topic_icon,
        resource_type, title, description, url, content,
        era, grade_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id, subject, topic_id, topic_name, topic_icon || null,
      resource_type, title, description, url || null, content || null,
      era || null, grade_level || null
    ]);
    
    res.json({
      message: 'Resource created successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, content, visible } = req.body;
    
    const query = `
      UPDATE subject_resources 
      SET title = $1, description = $2, url = $3, content = $4, 
          visible = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      title, description, url || null, content || null, 
      visible !== false, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ 
      message: 'Resource updated successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource
router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM subject_resources WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Bulk insert resources (for initial data population)
router.post('/bulk-insert', async (req, res) => {
  try {
    const { resources } = req.body;
    
    if (!Array.isArray(resources)) {
      return res.status(400).json({ error: 'Resources must be an array' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const resource of resources) {
        const id = `${resource.subject.slice(0, 2)}-${resource.resource_type.slice(0, 2)}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        await client.query(`
          INSERT INTO subject_resources (
            id, subject, topic_id, topic_name, topic_icon,
            resource_type, title, description, url, content,
            era, grade_level, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          id, resource.subject, resource.topic_id, resource.topic_name, 
          resource.topic_icon || null, resource.resource_type, resource.title, 
          resource.description, resource.url || null, resource.content || null,
          resource.era || null, resource.grade_level || null, resource.display_order || 0
        ]);
      }
      
      await client.query('COMMIT');
      res.json({ 
        message: 'Resources inserted successfully',
        count: resources.length 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk inserting resources:', error);
    res.status(500).json({ error: 'Failed to insert resources' });
  }
});

export default router;