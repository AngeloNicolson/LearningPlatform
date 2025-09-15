const express = require('express');
const { body, param, validationResult } = require('express-validator');
const TopicService = require('../services/TopicService');
const FileService = require('../services/FileService');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/topics - List all topics
router.get('/', async (req, res) => {
  try {
    const { userId = 'default-user' } = req.query;
    const topics = await TopicService.listTopics(userId);
    res.json({ topics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/topics - Create new topic
router.post('/',
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 chars)'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required (1-50 chars)'),
  body('complexity_level').isInt({ min: 1, max: 10 }).withMessage('Complexity level must be 1-10'),
  body('description').trim().isLength({ max: 1000 }).withMessage('Description too long (max 1000 chars)'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId = 'default-user' } = req.query;
      const topicData = req.body;
      
      const topic = await TopicService.createTopic(userId, topicData);
      res.status(201).json({ topic });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/topics/:topicId - Get topic details
router.get('/:topicId',
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      
      const topic = await TopicService.getTopic(userId, topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      
      res.json({ topic });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/topics/:topicId - Update topic
router.put('/:topicId',
  param('topicId').trim().isLength({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('category').optional().trim().isLength({ min: 1, max: 50 }),
  body('complexity_level').optional().isInt({ min: 1, max: 10 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      const updates = req.body;
      
      const topic = await TopicService.updateTopic(userId, topicId, updates);
      res.json({ topic });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/topics/:topicId - Delete topic
router.delete('/:topicId',
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      
      await TopicService.deleteTopic(userId, topicId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/topics/:topicId/overview - Get topic overview content
router.get('/:topicId/overview',
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      
      const content = await FileService.getTopicFile(userId, topicId, 'overview.md');
      res.json({ content });
    } catch (error) {
      res.status(404).json({ error: 'Overview not found' });
    }
  }
);

// PUT /api/topics/:topicId/overview - Update topic overview
router.put('/:topicId/overview',
  param('topicId').trim().isLength({ min: 1 }),
  body('content').isString().withMessage('Content must be a string'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      const { content } = req.body;
      
      await FileService.saveTopicFile(userId, topicId, 'overview.md', content);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/topics/:topicId/position - Get topic position content
router.get('/:topicId/position',
  param('topicId').trim().isLength({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      
      const content = await FileService.getTopicFile(userId, topicId, 'my-position.md');
      res.json({ content });
    } catch (error) {
      res.status(404).json({ error: 'Position not found' });
    }
  }
);

// PUT /api/topics/:topicId/position - Update topic position
router.put('/:topicId/position',
  param('topicId').trim().isLength({ min: 1 }),
  body('content').isString().withMessage('Content must be a string'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { userId = 'default-user' } = req.query;
      const { content } = req.body;
      
      await FileService.saveTopicFile(userId, topicId, 'my-position.md', content);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;