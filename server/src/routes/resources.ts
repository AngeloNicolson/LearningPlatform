import express, { Request, Response } from 'express';
import { db } from '../database/connection';
import { requireAuth, requireRole } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get all grades with topics and subtopics
router.get('/grades', async (req: Request, res: Response) => {
  try {
    const grades = db.prepare(`
      SELECT * FROM grades 
      ORDER BY order_index
    `).all() as any[];

    for (const grade of grades) {
      const topics = db.prepare(`
        SELECT * FROM topics 
        WHERE grade_id = ? 
        ORDER BY order_index
      `).all(grade.id) as any[];

      for (const topic of topics) {
        const subtopics = db.prepare(`
          SELECT * FROM subtopics 
          WHERE topic_id = ? 
          ORDER BY order_index
        `).all(topic.id) as any[];
        topic.subtopics = subtopics;
      }
      grade.topics = topics;
    }

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Get resources for a subtopic (public - only visible ones)
router.get('/subtopics/:subtopicId/resources', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;
    const { type } = req.query;

    let query = `
      SELECT * FROM resources 
      WHERE subtopic_id = ? AND visible = 1
    `;
    const params = [subtopicId];

    if (type) {
      query += ` AND resource_type = ?`;
      params.push(type as string);
    }

    query += ` ORDER BY created_at DESC`;

    const resources = db.prepare(query).all(...params);

    // Get history article if exists
    const history = db.prepare(`
      SELECT * FROM history_articles 
      WHERE subtopic_id = ?
    `).get(subtopicId);

    res.json({ resources, history });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Admin endpoints - require authentication
router.use(requireAuth);
router.use(requireRole(['admin', 'owner']));

// Get all resources for a subtopic (admin - including hidden)
router.get('/admin/subtopics/:subtopicId/resources', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;
    const { type } = req.query;

    let query = `
      SELECT r.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM resources r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.subtopic_id = ?
    `;
    const params = [subtopicId];

    if (type) {
      query += ` AND r.resource_type = ?`;
      params.push(type as string);
    }

    query += ` ORDER BY r.created_at DESC`;

    const resources = db.prepare(query).all(...params);

    // Get history article if exists
    const history = db.prepare(`
      SELECT h.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM history_articles h
      LEFT JOIN users u ON h.created_by = u.id
      WHERE h.subtopic_id = ?
    `).get(subtopicId);

    res.json({ resources, history });
  } catch (error) {
    console.error('Error fetching admin resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create a new resource
router.post('/admin/resources', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      subtopic_id, 
      resource_type, 
      title, 
      description, 
      url, 
      content, 
      time_limit, 
      visible 
    } = req.body;

    const id = `${resource_type.slice(0, 2)}-${Date.now()}`;
    const userId = req.user?.id;

    const result = db.prepare(`
      INSERT INTO resources (
        id, subtopic_id, resource_type, title, description, 
        url, content, time_limit, visible, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, subtopic_id, resource_type, title, description,
      url, content, time_limit, visible ? 1 : 0, userId
    );

    res.json({ 
      id, 
      message: 'Resource created successfully',
      changes: result.changes 
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource
router.put('/admin/resources/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      url, 
      content, 
      time_limit, 
      visible 
    } = req.body;

    const result = db.prepare(`
      UPDATE resources SET 
        title = ?, 
        description = ?, 
        url = ?, 
        content = ?, 
        time_limit = ?, 
        visible = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, description, url, content, 
      time_limit, visible ? 1 : 0, id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ message: 'Resource updated successfully' });
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Toggle resource visibility
router.patch('/admin/resources/:id/visibility', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const current = db.prepare('SELECT visible FROM resources WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const newVisibility = !(current as any).visible;
    
    db.prepare(`
      UPDATE resources 
      SET visible = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newVisibility ? 1 : 0, id);

    return res.json({ 
      message: 'Visibility updated', 
      visible: newVisibility 
    });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    return res.status(500).json({ error: 'Failed to update visibility' });
  }
});

// Delete a resource
router.delete('/admin/resources/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const result = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Create or update history article
router.post('/admin/history', async (req: AuthRequest, res: Response) => {
  try {
    const { subtopic_id, title, content } = req.body;
    const userId = req.user?.id;
    const id = `hist-${Date.now()}`;

    // Check if history already exists for this subtopic
    const existing = db.prepare(
      'SELECT id FROM history_articles WHERE subtopic_id = ?'
    ).get(subtopic_id);

    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE history_articles 
        SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE subtopic_id = ?
      `).run(title, content, subtopic_id);
      
      res.json({ message: 'History article updated' });
    } else {
      // Create new
      db.prepare(`
        INSERT INTO history_articles (
          id, subtopic_id, title, content, created_by
        ) VALUES (?, ?, ?, ?, ?)
      `).run(id, subtopic_id, title, content, userId);
      
      res.json({ id, message: 'History article created' });
    }
  } catch (error) {
    console.error('Error saving history article:', error);
    res.status(500).json({ error: 'Failed to save history article' });
  }
});

// Seed initial data (only if tables are empty)
router.post('/admin/seed', async (req: Request, res: Response): Promise<Response> => {
  try {
    // Check if grades already exist
    const gradeCount = db.prepare('SELECT COUNT(*) as count FROM grades').get();
    if ((gradeCount as any).count > 0) {
      return res.json({ message: 'Data already seeded' });
    }

    // Insert grades
    const grades = [
      { id: 'elementary', name: 'Elementary', grade_range: 'Grades K-5', order_index: 1 },
      { id: 'middle', name: 'Middle School', grade_range: 'Grades 6-8', order_index: 2 },
      { id: 'high', name: 'High School', grade_range: 'Grades 9-12', order_index: 3 },
      { id: 'college', name: 'College/AP', grade_range: 'Undergraduate', order_index: 4 }
    ];

    for (const grade of grades) {
      db.prepare(
        'INSERT INTO grades (id, name, grade_range, order_index) VALUES (?, ?, ?, ?)'
      ).run(grade.id, grade.name, grade.grade_range, grade.order_index);
    }

    // Insert topics for Elementary
    const elemTopics = [
      { id: 'elem-arithmetic', grade_id: 'elementary', name: 'Arithmetic', order_index: 1 },
      { id: 'elem-fractions', grade_id: 'elementary', name: 'Fractions & Decimals', order_index: 2 },
      { id: 'elem-geometry', grade_id: 'elementary', name: 'Basic Geometry', order_index: 3 },
      { id: 'elem-measurement', grade_id: 'elementary', name: 'Measurement', order_index: 4 }
    ];

    for (const topic of elemTopics) {
      db.prepare(
        'INSERT INTO topics (id, grade_id, name, order_index) VALUES (?, ?, ?, ?)'
      ).run(topic.id, topic.grade_id, topic.name, topic.order_index);
    }

    // Insert subtopics for Arithmetic
    const arithmeticSubtopics = [
      { id: 'elem-counting', topic_id: 'elem-arithmetic', name: 'Counting & Number Sense', order_index: 1 },
      { id: 'elem-addition', topic_id: 'elem-arithmetic', name: 'Addition', order_index: 2 },
      { id: 'elem-subtraction', topic_id: 'elem-arithmetic', name: 'Subtraction', order_index: 3 },
      { id: 'elem-multiplication', topic_id: 'elem-arithmetic', name: 'Multiplication', order_index: 4 },
      { id: 'elem-division', topic_id: 'elem-arithmetic', name: 'Division', order_index: 5 },
      { id: 'elem-word-problems', topic_id: 'elem-arithmetic', name: 'Word Problems', order_index: 6 }
    ];

    for (const subtopic of arithmeticSubtopics) {
      db.prepare(
        'INSERT INTO subtopics (id, topic_id, name, order_index) VALUES (?, ?, ?, ?)'
      ).run(subtopic.id, subtopic.topic_id, subtopic.name, subtopic.order_index);
    }

    // Insert sample resources for Addition
    const additionResources = [
      { 
        id: 'ws-add-1', 
        subtopic_id: 'elem-addition', 
        resource_type: 'worksheets',
        title: 'Basic Addition Worksheet',
        description: 'Single-digit addition problems (PDF, 2 pages)',
        url: '/worksheets/basic-addition.pdf',
        visible: 1
      },
      {
        id: 'vid-add-1',
        subtopic_id: 'elem-addition',
        resource_type: 'videos',
        title: 'Introduction to Addition - Khan Academy',
        description: 'Learn the basics of addition with visual examples',
        url: 'https://www.khanacademy.org/math/arithmetic/add-subtract/intro-to-addition',
        visible: 1
      },
      {
        id: 'pr-add-1',
        subtopic_id: 'elem-addition',
        resource_type: 'practice',
        title: 'Addition Facts 0-10',
        description: '20 problems • Auto-graded • Basic level',
        visible: 1
      },
      {
        id: 'qz-add-1',
        subtopic_id: 'elem-addition',
        resource_type: 'quizzes',
        title: 'Addition Quick Check',
        description: '10 questions • Multiple choice',
        time_limit: 15,
        visible: 1
      }
    ];

    for (const resource of additionResources) {
      db.prepare(`
        INSERT INTO resources (
          id, subtopic_id, resource_type, title, description, url, time_limit, visible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        resource.id,
        resource.subtopic_id,
        resource.resource_type,
        resource.title,
        resource.description,
        resource.url || null,
        (resource as any).time_limit || null,
        resource.visible
      );
    }

    return res.json({ message: 'Initial data seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    return res.status(500).json({ error: 'Failed to seed data' });
  }
});

export default router;