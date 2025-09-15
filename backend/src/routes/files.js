const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const FileService = require('../services/FileService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../storage/uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.md', '.txt', '.pdf', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${fileExt} not allowed`), false);
    }
  }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/files/upload - Upload files for a topic
router.post('/upload',
  upload.array('files', 5),
  body('topicId').trim().isLength({ min: 1 }).withMessage('Topic ID is required'),
  body('userId').optional().trim(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId, userId = 'default-user' } = req.body;
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const uploadedFiles = await FileService.processUploads(userId, topicId, files);
      
      res.json({
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/files/:userId/:topicId/export - Export topic as ZIP
router.get('/:userId/:topicId/export',
  param('userId').trim().isLength({ min: 1 }),
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, topicId } = req.params;
      
      const zipBuffer = await FileService.exportTopicAsZip(userId, topicId);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${topicId}-debate-files.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/files/:userId/:topicId/list - List files for a topic
router.get('/:userId/:topicId/list',
  param('userId').trim().isLength({ min: 1 }),
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, topicId } = req.params;
      
      const files = await FileService.listTopicFiles(userId, topicId);
      res.json({ files });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;