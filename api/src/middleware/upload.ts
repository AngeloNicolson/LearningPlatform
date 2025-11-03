/**
 * @file upload.ts
 * @author Angelo Nicolson
 * @brief File upload middleware with type-specific validation and storage
 * @description Configures Multer middleware for handling file uploads with separate storage configurations for worksheets
 * (PDF files) and images (JPEG, PNG, GIF, WebP). Implements file type validation, secure filename generation using crypto,
 * file size limits (10MB for PDFs, 2MB for images), and comprehensive error handling for upload-related issues.
 */

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Configure storage for worksheets
const worksheetStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/worksheets'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `worksheet-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for lesson images
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `image-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter for worksheets (PDF only)
const worksheetFileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for worksheets'), false);
  }
};

// File filter for images
const imageFileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Create multer instances
export const uploadWorksheet = multer({
  storage: worksheetStorage,
  fileFilter: worksheetFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  }
});

export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for images
  }
});

// Error handling middleware
export const handleUploadError = (error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if ((error as any).code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File size exceeds the limit' });
    }
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
};