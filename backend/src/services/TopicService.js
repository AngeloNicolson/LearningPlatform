const db = require('../config/database');
const FileService = require('./FileService');
const { v4: uuidv4 } = require('uuid');

class TopicService {
  static slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  static async createTopic(userId, topicData) {
    const topicId = this.slugify(topicData.title);
    const timestamp = new Date().toISOString();
    
    const topic = {
      id: topicId,
      user_id: userId,
      title: topicData.title,
      category: topicData.category,
      complexity_level: topicData.complexity_level,
      description: topicData.description || '',
      created_at: timestamp,
      last_modified: timestamp,
      position: topicData.position || 'neutral',
      conviction: topicData.conviction || 5
    };

    try {
      // Save to database
      await db('topics').insert(topic);
      
      // Create initial files
      await this.createInitialFiles(userId, topicId, topic);
      
      return topic;
    } catch (error) {
      if (error.code === '23505') { // Duplicate key error
        throw new Error(`Topic with title "${topicData.title}" already exists`);
      }
      throw error;
    }
  }

  static async createInitialFiles(userId, topicId, topic) {
    // Template for overview.md
    const overviewTemplate = `# ${topic.title}

**Category:** ${topic.category}  
**Complexity Level:** ${topic.complexity_level}/10  
**Created:** ${topic.created_at}

## Topic Description

${topic.description}

## Key Questions to Explore

- What are the main arguments on each side?
- What evidence supports different positions?
- What are the underlying values and assumptions?
- How do different stakeholders view this issue?

## Research Notes

*Add your research findings here...*

## Important Context

*Historical background, current events, relevant laws/policies...*
`;

    // Template for my-position.md
    const positionTemplate = `# My Position: ${topic.title}

**Current Position:** ${topic.position}  
**Conviction Level:** ${topic.conviction}/10  
**Last Updated:** ${topic.created_at}

## My Stance

*Clearly state your position on this topic...*

## Core Arguments

### Main Arguments
1. 
2. 
3. 

### Supporting Evidence
- 
- 
- 

## Counterarguments & Responses

### Potential Objections
1. **Objection:** 
   **Response:** 

2. **Objection:** 
   **Response:** 

## Areas for Improvement

*What aspects of your argument need more research or development?*

## Practice Notes

*Record insights from practice sessions...*
`;

    // Save initial files
    await FileService.saveTopicFile(userId, topicId, 'overview.md', overviewTemplate);
    await FileService.saveTopicFile(userId, topicId, 'my-position.md', positionTemplate);
    
    // Create README files for subdirectories
    await FileService.saveTopicFile(userId, topicId, 'arguments/README.md', 
      '# Arguments\n\nStore your structured debate arguments here.\n\n## Organization\n- One file per major argument\n- Include evidence links\n- Rate argument strength\n');
      
    await FileService.saveTopicFile(userId, topicId, 'evidence/README.md', 
      '# Evidence\n\nCollect research, studies, quotes, and supporting evidence here.\n\n## Guidelines\n- Include source information\n- Rate credibility\n- Note relevance to arguments\n');
      
    await FileService.saveTopicFile(userId, topicId, 'practice/README.md', 
      '# Practice Notes\n\nTrack your practice sessions and feedback here.\n\n## Session Format\n- Date and duration\n- Key strengths demonstrated\n- Areas for improvement\n- Next steps\n');
      
    await FileService.saveTopicFile(userId, topicId, 'media/README.md', 
      '# Media\n\nStore diagrams, charts, and visual aids here.\n\n## File Types\n- Images (PNG, JPG)\n- Documents (PDF)\n- Presentations\n');
  }

  static async getTopic(userId, topicId) {
    const topic = await db('topics')
      .where({ user_id: userId, id: topicId })
      .first();
      
    return topic;
  }

  static async listTopics(userId) {
    const topics = await db('topics')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
      
    return topics;
  }

  static async updateTopic(userId, topicId, updates) {
    const updatedData = {
      ...updates,
      last_modified: new Date().toISOString()
    };
    
    const [updatedTopic] = await db('topics')
      .where({ user_id: userId, id: topicId })
      .update(updatedData)
      .returning('*');
      
    if (!updatedTopic) {
      throw new Error('Topic not found');
    }
    
    return updatedTopic;
  }

  static async deleteTopic(userId, topicId) {
    // Delete files first
    await FileService.deleteTopicFiles(userId, topicId);
    
    // Delete from database
    const deleted = await db('topics')
      .where({ user_id: userId, id: topicId })
      .del();
      
    if (deleted === 0) {
      throw new Error('Topic not found');
    }
    
    return true;
  }
}

module.exports = TopicService;