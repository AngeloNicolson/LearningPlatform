import { Router, Request, Response } from 'express';
import { query } from '../database/connection';

const router = Router();

// Get all grade levels with their topics and subtopics
router.get('/grades', async (_req: Request, res: Response) => {
  try {
    // Fetch all grade levels
    const gradesResult = await query(`
      SELECT id, name, grade_range, display_order
      FROM grade_levels
      ORDER BY display_order, id
    `);

    // Fetch all topics
    const topicsResult = await query(`
      SELECT id, grade_level_id, name, display_order
      FROM topics
      ORDER BY display_order, id
    `);

    // Fetch all subtopics
    const subtopicsResult = await query(`
      SELECT s.id, s.topic_id, s.name, s.display_order
      FROM subtopics s
      JOIN topics t ON s.topic_id = t.id
      ORDER BY s.display_order, s.id
    `);

    // Build the nested structure
    const grades = gradesResult.rows.map(grade => {
      const gradeTOpics = topicsResult.rows.filter(topic => topic.grade_level_id === grade.id);
      
      return {
        id: grade.id,
        name: grade.name,
        grade_range: grade.grade_range,
        topics: gradeTOpics.map(topic => {
          const topicSubtopics = subtopicsResult.rows.filter(subtopic => subtopic.topic_id === topic.id);
          
          return {
            id: topic.id,
            name: topic.name,
            subtopics: topicSubtopics.map(subtopic => ({
              id: subtopic.id,
              name: subtopic.name
            }))
          };
        })
      };
    });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Get math topics (redirect to new topics endpoint)
router.get('/math/topics', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, name, icon
      FROM topics
      WHERE subject = 'math'
      ORDER BY display_order
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching math topics:', error);
    res.status(500).json({ error: 'Failed to fetch math topics' });
  }
});

// Get math resources by topic (with JOIN to topics table)
router.get('/math', async (req: Request, res: Response) => {
  try {
    const { topic } = req.query;
    
    let queryText = `
      SELECT 
        r.id, r.title, r.description, 
        r.resource_type as type, 
        r.grade_level as "gradeLevel", 
        r.url, r.content, r.topic_id,
        t.name as "topicName",
        t.icon as "topicIcon"
      FROM resources r
      LEFT JOIN topics t ON r.topic_id = t.id
      WHERE r.subject = 'math' AND r.visible = true
    `;
    const params: any[] = [];
    
    if (topic && topic !== 'all') {
      queryText += ` AND LOWER(r.topic_id) = LOWER($1)`;
      params.push(topic);
    }
    
    queryText += ` ORDER BY r.display_order, r.created_at DESC`;
    
    const result = await query(queryText, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching math resources:', error);
    res.status(500).json({ error: 'Failed to fetch math resources' });
  }
});

// Get resources for a specific subtopic
router.get('/subtopics/:subtopicId/resources', async (req: Request, res: Response) => {
  try {
    const { subtopicId } = req.params;

    // Fetch resources
    const resourcesResult = await query(`
      SELECT id, resource_type, title, description, url, content, 
             video_url, pdf_url, time_limit, visible, display_order
      FROM resources
      WHERE subtopic_id = $1 AND visible = true
      ORDER BY display_order, id
    `, [subtopicId]);

    // Fetch history article if exists
    const historyResult = await query(`
      SELECT id, title, content
      FROM history_articles
      WHERE subtopic_id = $1
      LIMIT 1
    `, [subtopicId]);

    // For quizzes, fetch questions
    const quizIds = resourcesResult.rows
      .filter(r => r.resource_type === 'quiz')
      .map(r => r.id);

    let quizQuestions: Record<string, any[]> = {};
    if (quizIds.length > 0) {
      const questionsResult = await query(`
        SELECT resource_id, id, question, options, answer, explanation, display_order
        FROM quiz_questions
        WHERE resource_id = ANY($1)
        ORDER BY display_order, id
      `, [quizIds]);

      // Group questions by resource_id
      questionsResult.rows.forEach(q => {
        if (!quizQuestions[q.resource_id]) {
          quizQuestions[q.resource_id] = [];
        }
        quizQuestions[q.resource_id].push({
          id: q.id,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation
        });
      });
    }

    // For practice problems, fetch problems
    const practiceIds = resourcesResult.rows
      .filter(r => r.resource_type === 'practice')
      .map(r => r.id);

    let practiceProblems: Record<string, any[]> = {};
    if (practiceIds.length > 0) {
      const problemsResult = await query(`
        SELECT resource_id, id, problem, solution, hint, difficulty, display_order
        FROM practice_problems
        WHERE resource_id = ANY($1)
        ORDER BY display_order, id
      `, [practiceIds]);

      // Group problems by resource_id
      problemsResult.rows.forEach(p => {
        if (!practiceProblems[p.resource_id]) {
          practiceProblems[p.resource_id] = [];
        }
        practiceProblems[p.resource_id].push({
          id: p.id,
          problem: p.problem,
          solution: p.solution,
          hint: p.hint,
          difficulty: p.difficulty
        });
      });
    }

    // Group resources by type
    const grouped: Record<string, any[]> = {
      worksheets: [],
      videos: [],
      practice: [],
      quizzes: []
    };

    resourcesResult.rows.forEach(resource => {
      const resourceData: any = {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        url: resource.url || resource.video_url || resource.pdf_url,
        content: resource.content,
        visible: resource.visible,
        timeLimit: resource.time_limit
      };

      // Add questions for quizzes
      if (resource.resource_type === 'quiz' && quizQuestions[resource.id]) {
        resourceData.questions = quizQuestions[resource.id];
      }

      // Add problems for practice
      if (resource.resource_type === 'practice' && practiceProblems[resource.id]) {
        resourceData.problems = practiceProblems[resource.id];
      }

      // Map resource_type to plural form for grouped object
      const typeMap: Record<string, string> = {
        'worksheet': 'worksheets',
        'video': 'videos',
        'practice': 'practice',
        'quiz': 'quizzes'
      };

      const groupKey = typeMap[resource.resource_type];
      if (grouped[groupKey]) {
        grouped[groupKey].push(resourceData);
      }
    });

    res.json({
      resources: grouped,
      history: historyResult.rows.length > 0 ? historyResult.rows[0] : null
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get all resources (admin endpoint)
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT r.*, s.name as subtopic_name, t.name as topic_name, g.name as grade_name
      FROM resources r
      JOIN subtopics s ON r.subtopic_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN grade_levels g ON t.grade_level_id = g.id
      ORDER BY g.display_order, t.display_order, s.display_order, r.display_order
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create a new resource (admin)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      subtopic_id,
      resource_type,
      title,
      description,
      url,
      content,
      video_url,
      pdf_url,
      time_limit,
      visible = true,
      display_order = 0
    } = req.body;

    // Generate a unique ID
    const id = `${resource_type}-${Date.now()}`;

    const result = await query(`
      INSERT INTO resources (
        id, subtopic_id, resource_type, title, description, 
        url, content, video_url, pdf_url, time_limit, 
        visible, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      id, subtopic_id, resource_type, title, description,
      url, content, video_url, pdf_url, time_limit,
      visible, display_order
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update a resource (admin)
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      url,
      content,
      video_url,
      pdf_url,
      time_limit,
      visible,
      display_order
    } = req.body;

    const result = await query(`
      UPDATE resources
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          url = COALESCE($4, url),
          content = COALESCE($5, content),
          video_url = COALESCE($6, video_url),
          pdf_url = COALESCE($7, pdf_url),
          time_limit = COALESCE($8, time_limit),
          visible = COALESCE($9, visible),
          display_order = COALESCE($10, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [
      id, title, description, url, content,
      video_url, pdf_url, time_limit, visible, display_order
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource (admin)
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM resources
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    return res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;