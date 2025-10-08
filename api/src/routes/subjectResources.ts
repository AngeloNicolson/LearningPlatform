import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireRole } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

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
      SELECT sr.*, d.original_name as document_name, d.file_size as document_size
      FROM subject_resources sr
      LEFT JOIN documents d ON sr.document_id = d.id
      WHERE sr.subject = $1 AND sr.visible = true
    `;
    const params: any[] = [subject];
    let paramIndex = 2;

    if (topic && topic !== 'all') {
      query += ` AND sr.topic_id = $${paramIndex}`;
      params.push(topic);
      paramIndex++;
    }

    if (type && type !== 'all') {
      query += ` AND sr.resource_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (grade && grade !== 'all') {
      query += ` AND LOWER(sr.grade_level) LIKE LOWER($${paramIndex})`;
      params.push(`%${grade}%`);
      paramIndex++;
    }

    if (era && era !== 'all') {
      query += ` AND LOWER(sr.era) LIKE LOWER($${paramIndex})`;
      params.push(`%${era}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(sr.title) LIKE LOWER($${paramIndex}) OR LOWER(sr.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY sr.display_order, sr.created_at DESC`;

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Download a worksheet resource
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Download request for resource ID:', id);

    // Get resource info from database
    const resourceResult = await pool.query(
      'SELECT * FROM subject_resources WHERE id = $1',
      [id]
    );

    console.log('Resource query result:', resourceResult.rows);

    if (resourceResult.rows.length === 0) {
      console.error('Resource not found:', id);
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resource = resourceResult.rows[0];
    console.log('Resource found:', resource);
    console.log('Document ID:', resource.document_id);

    // Check if resource has a linked document
    if (!resource.document_id) {
      console.error('No document_id for resource:', id);
      return res.status(404).json({ error: 'No downloadable file for this resource' });
    }

    // Get document info
    const documentResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [resource.document_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documentResult.rows[0];
    const filePath = document.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Update download count
    await pool.query(
      'UPDATE documents SET download_count = download_count + 1 WHERE id = $1',
      [document.id]
    );

    // Set headers for download
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
    res.setHeader('Content-Length', document.file_size);

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download resource' });
  }
  return;
});

// Get topics for a specific subject
router.get('/:subject/topics', async (req, res) => {
  try {
    const { subject } = req.params;
    
    // For math and science, get from grade_levels -> topics structure
    if (subject === 'math' || subject === 'science') {
      const query = `
        SELECT t.id, t.name, t.icon, gl.name as grade_level, gl.display_order as gl_order, t.display_order as t_order
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

// Alias route for cleaner API: /math instead of /math/resources
router.get('/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const { topic, type, grade, era, search } = req.query;

    // Validate subject
    if (!['math', 'science', 'history'].includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject' });
    }

    let query = `
      SELECT sr.*, d.original_name as document_name, d.file_size as document_size
      FROM subject_resources sr
      LEFT JOIN documents d ON sr.document_id = d.id
      WHERE sr.subject = $1 AND sr.visible = true
    `;
    const params: any[] = [subject];
    let paramIndex = 2;

    if (topic && topic !== 'all') {
      query += ` AND sr.topic_id = $${paramIndex}`;
      params.push(topic);
      paramIndex++;
    }

    if (type && type !== 'all') {
      query += ` AND sr.resource_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (grade && grade !== 'all') {
      query += ` AND LOWER(sr.grade_level) LIKE LOWER($${paramIndex})`;
      params.push(`%${grade}%`);
      paramIndex++;
    }

    if (era && era !== 'all') {
      query += ` AND LOWER(sr.era) LIKE LOWER($${paramIndex})`;
      params.push(`%${era}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (LOWER(sr.title) LIKE LOWER($${paramIndex}) OR LOWER(sr.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY sr.display_order, sr.created_at DESC`;

    console.log('=== FETCHING RESOURCES ===');
    console.log('Subject:', subject);
    console.log('Topic filter:', topic);
    console.log('Type filter:', type);
    console.log('Grade filter:', grade);
    console.log('SQL Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);

    console.log('Results count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('First 3 resources:', result.rows.slice(0, 3).map(r => ({
        id: r.id,
        title: r.title,
        topic_id: r.topic_id,
        grade_level: r.grade_level,
        visible: r.visible
      })));
    }
    console.log('========================');

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Admin endpoints - require authentication
router.use(requireAuth);
router.use(requireRole('admin', 'owner'));

// Create a new resource
router.post('/:subject/resources', async (req, res) => {
  try {
    const { subject } = req.params;
    const {
      topic_id, topic_name, topic_icon, resource_type,
      title, description, url, content, era, grade_level, document_id
    } = req.body;

    const id = `${subject.slice(0, 2)}-${resource_type.slice(0, 2)}-${Date.now()}`;

    const query = `
      INSERT INTO subject_resources (
        id, subject, topic_id, topic_name, topic_icon,
        resource_type, title, description, url, content,
        era, grade_level, document_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      id, subject, topic_id, topic_name, topic_icon || null,
      resource_type, title, description, url || null, content || null,
      era || null, grade_level || null, document_id || null
    ]);

    return res.json({
      message: 'Resource created successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return res.status(500).json({ error: 'Failed to create resource' });
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
    
    return res.json({ 
      message: 'Resource updated successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: 'Failed to update resource' });
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
    
    return res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ error: 'Failed to delete resource' });
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
      return res.json({ 
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
    return res.status(500).json({ error: 'Failed to insert resources' });
  }
});

export default router;