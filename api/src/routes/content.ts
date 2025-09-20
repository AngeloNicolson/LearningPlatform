import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { requireAuth, requireRole } from '../middleware/auth';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const router = Router();

// Create DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Create or update a lesson
router.post('/lesson', 
  requireAuth,
  requireRole('admin', 'owner', 'tutor'),
  async (req: Request, res: Response) => {
    try {
      const { 
        resource_id,
        title, 
        description, 
        markdown_content, 
        subtopic_id
      } = req.body;
      
      const user = (req as any).user;

      // Sanitize markdown content
      const sanitizedContent = purify.sanitize(markdown_content);

      if (resource_id) {
        // Update existing resource
        const result = await query(
          `UPDATE resources 
           SET title = $1, 
               description = $2, 
               markdown_content = $3, 
               content_format = 'markdown',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4
           RETURNING *`,
          [title, description, sanitizedContent, resource_id]
        );

        res.json({
          success: true,
          resource: result.rows[0]
        });
      } else {
        // Create new resource
        const resourceId = `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = await query(
          `INSERT INTO resources (
            id, subtopic_id, resource_type, title, 
            description, markdown_content, content_format, 
            created_by, visible
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            resourceId,
            subtopic_id || null,
            'lessons',
            title,
            description || '',
            sanitizedContent,
            'markdown',
            user.id,
            true
          ]
        );

        res.json({
          success: true,
          resource: result.rows[0]
        });
      }
    } catch (error) {
      console.error('Save lesson error:', error);
      res.status(500).json({ error: 'Failed to save lesson' });
    }
    return;
  }
);

// Get lesson content
router.get('/lesson/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT r.*, u.first_name, u.last_name 
       FROM resources r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.id = $1 AND r.content_format = 'markdown'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = result.rows[0];

    // Convert markdown to HTML for preview
    const htmlContent = marked(lesson.markdown_content || '');

    res.json({
      success: true,
      lesson: {
        ...lesson,
        html_content: htmlContent,
        author_name: lesson.first_name ? `${lesson.first_name} ${lesson.last_name}` : 'Unknown'
      }
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
  return;
});

// Get resources by type and category
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const { type, subtopic_id, content_format } = req.query;
    
    let queryStr = `
      SELECT r.*, d.id as doc_id, d.title as doc_title, 
             d.file_size, d.download_count
      FROM resources r
      LEFT JOIN documents d ON r.document_id = d.id
      WHERE r.visible = true
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      queryStr += ` AND r.resource_type = $${paramCount}`;
      params.push(type);
    }

    if (subtopic_id) {
      paramCount++;
      queryStr += ` AND r.subtopic_id = $${paramCount}`;
      params.push(subtopic_id);
    }

    if (content_format) {
      paramCount++;
      queryStr += ` AND r.content_format = $${paramCount}`;
      params.push(content_format);
    }

    queryStr += ' ORDER BY r.created_at DESC';

    const result = await query(queryStr, params);

    // Process each resource to add appropriate action
    const processedResources = result.rows.map(resource => {
      let action = 'view';
      let action_url = null;

      if (resource.content_format === 'markdown') {
        action = 'view_lesson';
        action_url = `/api/content/lesson/${resource.id}`;
      } else if (resource.content_format === 'pdf' && resource.document_id) {
        action = 'download';
        action_url = `/api/uploads/download/${resource.document_id}`;
      } else if (resource.url) {
        action = 'external';
        action_url = resource.url;
      }

      return {
        ...resource,
        action,
        action_url
      };
    });

    res.json({
      success: true,
      resources: processedResources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
  return;
});

// Link a document to a resource
router.post('/link-document',
  requireAuth,
  requireRole('admin', 'owner', 'tutor'),
  async (req: Request, res: Response) => {
    try {
      const { resource_id, document_id } = req.body;

      const result = await query(
        `UPDATE resources 
         SET document_id = $1, 
             content_format = 'pdf',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [document_id, resource_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      res.json({
        success: true,
        resource: result.rows[0]
      });
    } catch (error) {
      console.error('Link document error:', error);
      res.status(500).json({ error: 'Failed to link document' });
    }
    return;
  }
);

export default router;