/**
 * @file storage.ts
 * @author Angelo Nicolson
 * @brief TypeScript type definitions for storage layer
 * @description Defines TypeScript interfaces and types for the storage layer including TopicMetadata, StorageAdapter interface, and related types for topic persistence and content management.
 */

export interface TopicMetadata {
  id: string;
  title: string;
  category: string;
  complexity_level: number;
  description: string;
  created_at: string;
  last_modified: string;
  position?: 'pro' | 'con' | 'neutral';
  conviction?: number; // 1-10 scale
}

export interface ArgumentStructure {
  id: string;
  title: string;
  type: 'main' | 'supporting' | 'counter' | 'rebuttal';
  content: string;
  evidence_ids: string[];
  strength: number; // 1-5 scale
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'statistic' | 'study' | 'quote' | 'example' | 'expert_opinion';
  content: string;
  source: string;
  source_url?: string;
  credibility: number; // 1-5 scale
  created_at: string;
}

export interface PracticeNote {
  id: string;
  session_date: string;
  performance_notes: string;
  strengths: string[];
  areas_for_improvement: string[];
  ai_feedback?: string;
  rating: number; // 1-5 scale
}

export interface StorageAdapter {
  // Topic operations
  createTopic(userId: string, topicData: TopicMetadata): Promise<void>;
  getTopic(userId: string, topicId: string): Promise<TopicMetadata | null>;
  updateTopic(userId: string, topicId: string, updates: Partial<TopicMetadata>): Promise<void>;
  listTopics(userId: string): Promise<TopicMetadata[]>;
  deleteTopic(userId: string, topicId: string): Promise<void>;

  // File operations
  writeFile(filePath: string, content: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  fileExists(filePath: string): Promise<boolean>;
  
  // Directory operations
  createDirectory(dirPath: string): Promise<void>;
  listDirectory(dirPath: string): Promise<string[]>;
  deleteDirectory(dirPath: string): Promise<void>;
}

export interface FileTemplate {
  name: string;
  content: string;
  variables?: Record<string, string>;
}

export const TOPIC_TEMPLATES: Record<string, FileTemplate> = {
  overview: {
    name: 'overview.md',
    content: `# {{title}}

**Category:** {{category}}  
**Complexity:** {{complexity_level}}/10  
**Created:** {{created_at}}

## Description
{{description}}

## Key Context
- 

## Related Topics
- 

## Notes
- 
`
  },
  position: {
    name: 'my-position.md',
    content: `# My Position on {{title}}

**Stance:** {{position}}  
**Conviction:** {{conviction}}/10  
**Last Updated:** {{last_modified}}

## Core Position
Write your main stance here...

## Key Reasoning
1. 
2. 
3. 

## Potential Weaknesses
- 
- 

## Position Evolution
*Track how your thinking has changed*
- 
`
  },
  argument: {
    name: 'argument-template.md',
    content: `# {{title}}

**Type:** {{type}}  
**Strength:** {{strength}}/5  
**Created:** {{created_at}}

## Argument
{{content}}

## Supporting Evidence
{{#evidence_ids}}
- [[evidence/{{.}}]]
{{/evidence_ids}}

## Counter-arguments to Consider
- 

## Refinements
- 
`
  },
  evidence: {
    name: 'evidence-template.md',
    content: `# {{title}}

**Type:** {{type}}  
**Source:** {{source}}  
**Credibility:** {{credibility}}/5  
**Date Added:** {{created_at}}

## Content
{{content}}

## Source Details
{{#source_url}}
**URL:** {{source_url}}
{{/source_url}}

## Analysis
- **Strengths:** 
- **Limitations:** 
- **Context:** 

## Usage Notes
- 
`
  },
  practice: {
    name: 'practice-session.md',
    content: `# Practice Session - {{session_date}}

**Overall Rating:** {{rating}}/5

## Performance Notes
{{performance_notes}}

## Strengths Demonstrated
{{#strengths}}
- {{.}}
{{/strengths}}

## Areas for Improvement
{{#areas_for_improvement}}
- {{.}}
{{/areas_for_improvement}}

{{#ai_feedback}}
## AI Feedback
{{ai_feedback}}
{{/ai_feedback}}

## Action Items
- 
- 

## Next Session Goals
- 
`
  }
};
