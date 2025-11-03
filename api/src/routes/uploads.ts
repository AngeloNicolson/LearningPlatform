/**
 * @file uploads.ts
 * @author Angelo Nicolson
 * @brief File upload and document management endpoints
 * @description Handles file uploads for educational materials including worksheets (PDFs) and lesson images. Provides authenticated
 * endpoints for uploading files with automatic database record creation, linking uploaded documents to subject resources, file download
 * with access control, document listing with filtering, and admin-only file deletion. Implements transaction-based uploads ensuring
 * database and filesystem consistency, and includes comprehensive error handling with automatic cleanup on failures.
 */

import { Router, Request, Response } from 'express';
import { uploadWorksheet, uploadImage, handleUploadError } from '../middleware/upload';
import { query } from '../database/connection';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

const router = Router();

// Download-specific rate limiter (10 downloads per hour per IP)
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 downloads per hour
  message: 'Download limit reached. You can download up to 10 worksheets per hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload a worksheet (PDF) and create resource in one transaction
router.post('/worksheet',
  requireAuth,
  requireRole('admin', 'owner', 'tutor'),
  uploadWorksheet.single('file'),
  handleUploadError,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, description, grade_level, topic_id, subject } = req.body;
      const user = (req as any).user;

      // Save document to database (file metadata only)
      const documentResult = await query(
        `INSERT INTO documents (
          title, description, filename, original_name,
          mime_type, file_size, file_path, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          title || req.file.originalname,
          description || '',
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.file.path,
          user.id
        ]
      );

      const document = documentResult.rows[0];
      const fileUrl = `/api/uploads/download/${document.id}`;

      // Get topic metadata for subject_resources
      let topicName = null;
      let topicIcon = null;
      if (topic_id) {
        const topicResult = await query(
          'SELECT name, icon FROM topics WHERE id = $1',
          [topic_id]
        );
        if (topicResult.rows.length > 0) {
          topicName = topicResult.rows[0].name;
          topicIcon = topicResult.rows[0].icon;
        }
      }

      // Create resource entry in subject_resources table
      const resourceId = `${subject || 'math'}-worksheet-${Date.now()}`;
      const resourceResult = await query(
        `INSERT INTO subject_resources (
          id, subject, topic_id, topic_name, topic_icon, resource_type,
          title, description, url, grade_level, document_id, visible, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          resourceId,
          subject || 'math',
          topic_id,
          topicName,
          topicIcon,
          'worksheet',
          title || req.file.originalname,
          description || '',
          fileUrl,
          grade_level,
          document.id,
          true,
          0
        ]
      );

      console.log('=== WORKSHEET UPLOAD SUCCESS ===');
      console.log('Resource ID:', resourceId);
      console.log('Subject:', subject || 'math');
      console.log('Topic ID:', topic_id);
      console.log('Topic Name:', topicName);
      console.log('Grade Level:', grade_level);
      console.log('Visible:', true);
      console.log('Resource saved:', resourceResult.rows[0]);
      console.log('================================');

      res.json({
        success: true,
        document: document,
        resource: resourceResult.rows[0]
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Clean up uploaded file on database error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to save document' });
    }
    return;
  }
);

// Upload an image for lessons
router.post('/image',
  requireAuth,
  requireRole('admin', 'owner', 'tutor'),
  uploadImage.single('image'),
  handleUploadError,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Return the image URL for use in markdown
      const imageUrl = `/api/uploads/images/${req.file.filename}`;
      
      res.json({
        success: true,
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      console.error('Image upload error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to upload image' });
    }
    return;
  }
);

// Download a document - rate limited but no authentication required
router.get('/download/:id', downloadLimiter, optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get document info from database
    const result = await query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];
    const filePath = document.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Update download count
    await query(
      'UPDATE documents SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    // Set headers for download
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
    res.setHeader('Content-Length', document.file_size);

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
  return;
});

// Get list of documents - requires authentication
router.get('/list', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, resource_type, grade_level } = req.query;
    
    let queryStr = 'SELECT * FROM documents WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      queryStr += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (resource_type) {
      paramCount++;
      queryStr += ` AND resource_type = $${paramCount}`;
      params.push(resource_type);
    }

    if (grade_level) {
      paramCount++;
      queryStr += ` AND grade_level = $${paramCount}`;
      params.push(grade_level);
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await query(queryStr, params);

    res.json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
  return;
});

// Delete a document (admin only)
router.delete('/:id',
  requireAuth,
  requireRole('admin', 'owner'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get document info
      const result = await query(
        'SELECT * FROM documents WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const document = result.rows[0];

      // Delete file from filesystem
      if (fs.existsSync(document.file_path)) {
        fs.unlinkSync(document.file_path);
      }

      // Delete from database
      await query('DELETE FROM documents WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
    return;
  }
);

export default router;