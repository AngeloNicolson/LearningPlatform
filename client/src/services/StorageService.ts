/**
 * @file StorageService.ts
 * @author Angelo Nicolson
 * @brief Abstracted storage service with multiple backend adapters
 * @description Provides storage abstraction layer supporting multiple storage backends (localStorage, FileSystem API, downloads). Implements topic and content persistence with adapter pattern for flexible storage strategies across different browser capabilities.
 */

import { StorageAdapter, TopicMetadata } from '../types/storage';
import FileSystemStorageAdapter from '../storage/FileSystemStorageAdapter';
import DownloadStorageAdapter from '../storage/DownloadStorageAdapter';

class StorageService {
  private adapter: StorageAdapter;
  private currentUserId: string = 'default-user'; // In a real app, this would come from auth
  private initialized: boolean = false;
  private initializing: boolean = false;

  constructor() {
    // Detect browser support for File System Access API
    if ('showDirectoryPicker' in window) {
      this.adapter = new FileSystemStorageAdapter();
    } else {
      this.adapter = new DownloadStorageAdapter();
    }
    // Don't auto-initialize - let the UI handle it
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) {
      // Wait for ongoing initialization
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.initializing = true;
    try {
      await this.adapter.init();
      this.initialized = true;
    } catch (error) {
      this.initializing = false;
      throw error;
    }
    this.initializing = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  getSelectedDirectoryName(): string | null {
    if (this.adapter instanceof FileSystemStorageAdapter || this.adapter instanceof DownloadStorageAdapter) {
      return this.adapter.getSelectedDirectoryName();
    }
    return null;
  }

  // Method to check if browser supports File System Access API
  isFileSystemApiSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  // Wipe all stored data (localStorage + IndexedDB)
  async wipeAllData(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem('debaterank_topics');
      localStorage.removeItem('debaterank_files');
      
      // Clear IndexedDB databases
      await this.clearIndexedDB('DebateRankStorage');
      await this.clearIndexedDB('DebateRankLinkedFolders');
      
      console.log('All debate data has been wiped');
    } catch (error) {
      console.error('Error wiping data:', error);
      throw new Error('Failed to wipe all data');
    }
  }

  private async clearIndexedDB(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onblocked = () => {
        console.warn(`IndexedDB ${dbName} deletion blocked`);
        resolve(); // Don't fail if blocked, just continue
      };
    });
  }

  // Topic management methods
  async createTopicFromBrowserTopic(browserTopic: any): Promise<TopicMetadata> {
    await this.ensureInitialized();
    const topicMetadata: TopicMetadata = {
      id: this.slugify(browserTopic.title),
      title: browserTopic.title,
      category: browserTopic.category || 'General',
      complexity_level: browserTopic.complexity_level || 5,
      description: browserTopic.description || '',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      position: 'neutral',
      conviction: 5
    };

    await this.adapter.createTopic(this.currentUserId, topicMetadata);
    return topicMetadata;
  }

  async getTopic(topicId: string): Promise<TopicMetadata | null> {
    return this.adapter.getTopic(this.currentUserId, topicId);
  }

  async updateTopic(topicId: string, updates: Partial<TopicMetadata>): Promise<void> {
    return this.adapter.updateTopic(this.currentUserId, topicId, updates);
  }

  async listTopics(): Promise<TopicMetadata[]> {
    await this.ensureInitialized();
    return this.adapter.listTopics(this.currentUserId);
  }

  async deleteTopic(topicId: string): Promise<void> {
    return this.adapter.deleteTopic(this.currentUserId, topicId);
  }

  // File management methods
  async getTopicOverview(topicId: string): Promise<string> {
    await this.ensureInitialized();
    const path = this.getTopicFilePath(topicId, 'overview.md');
    try {
      return await this.adapter.readFile(path);
    } catch (error) {
      throw new Error(`Could not read overview for topic ${topicId}: ${error}`);
    }
  }

  async updateTopicOverview(topicId: string, content: string): Promise<void> {
    await this.ensureInitialized();
    const path = this.getTopicFilePath(topicId, 'overview.md');
    await this.adapter.writeFile(path, content);
  }

  async getTopicPosition(topicId: string): Promise<string> {
    await this.ensureInitialized();
    const path = this.getTopicFilePath(topicId, 'my-position.md');
    try {
      return await this.adapter.readFile(path);
    } catch (error) {
      throw new Error(`Could not read position for topic ${topicId}: ${error}`);
    }
  }

  async updateTopicPosition(topicId: string, content: string): Promise<void> {
    await this.ensureInitialized();
    const path = this.getTopicFilePath(topicId, 'my-position.md');
    await this.adapter.writeFile(path, content);
  }

  async createArgument(topicId: string, argumentTitle: string, content: string): Promise<string> {
    await this.ensureInitialized();
    const argumentId = this.slugify(argumentTitle);
    const path = `topics/${topicId}/arguments/${argumentId}.md`;
    
    const argumentContent = `# ${argumentTitle}

**Type:** main  
**Strength:** 3/5  
**Created:** ${new Date().toISOString()}

## Argument
${content}

## Supporting Evidence
*Link evidence files here using [[evidence/filename]]*

## Counter-arguments to Consider
- 

## Refinements
- 
`;

    await this.adapter.writeFile(path, argumentContent);
    return argumentId;
  }

  async getArgument(topicId: string, argumentId: string): Promise<string> {
    await this.ensureInitialized();
    const path = `topics/${topicId}/arguments/${argumentId}.md`;
    try {
      return await this.adapter.readFile(path);
    } catch (error) {
      throw new Error(`Could not read argument ${argumentId} for topic ${topicId}: ${error}`);
    }
  }

  async updateArgument(topicId: string, argumentId: string, content: string): Promise<void> {
    await this.ensureInitialized();
    const path = `topics/${topicId}/arguments/${argumentId}.md`;
    await this.adapter.writeFile(path, content);
  }

  async listArguments(topicId: string): Promise<string[]> {
    await this.ensureInitialized();
    const dirPath = `topics/${topicId}/arguments`;
    try {
      const files = await this.adapter.listDirectory(dirPath);
      return files.filter(file => file.endsWith('.md') && file !== 'README.md')
                 .map(file => file.replace('.md', ''));
    } catch (error) {
      return [];
    }
  }

  async createEvidence(topicId: string, evidenceTitle: string, content: string, source: string = ''): Promise<string> {
    await this.ensureInitialized();
    const evidenceId = this.slugify(evidenceTitle);
    const path = `topics/${topicId}/evidence/${evidenceId}.md`;
    
    const evidenceContent = `# ${evidenceTitle}

**Type:** study  
**Source:** ${source}  
**Credibility:** 3/5  
**Date Added:** ${new Date().toISOString()}

## Content
${content}

## Source Details
*Add source URL and publication details here*

## Analysis
- **Strengths:** 
- **Limitations:** 
- **Context:** 

## Usage Notes
- 
`;

    await this.adapter.writeFile(path, evidenceContent);
    return evidenceId;
  }

  async addPracticeNote(topicId: string, sessionNotes: string, rating: number = 3): Promise<string> {
    await this.ensureInitialized();
    const sessionId = `session-${Date.now()}`;
    const path = `topics/${topicId}/practice/${sessionId}.md`;
    
    const practiceContent = `# Practice Session - ${new Date().toLocaleDateString()}

**Overall Rating:** ${rating}/5

## Performance Notes
${sessionNotes}

## Strengths Demonstrated
- 

## Areas for Improvement
- 

## Action Items
- 
- 

## Next Session Goals
- 
`;

    await this.adapter.writeFile(path, practiceContent);
    return sessionId;
  }

  // Utility methods
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private getTopicFilePath(topicId: string, fileName: string): string {
    if (this.adapter instanceof DownloadStorageAdapter) {
      return `users/${this.currentUserId}/topics/${topicId}/${fileName}`;
    } else {
      // FileSystemStorageAdapter handles user directory internally
      return `topics/${topicId}/${fileName}`;
    }
  }

  // Export/Import functionality for Obsidian compatibility
  async exportTopicAsObsidianVault(topicId: string): Promise<Blob> {
    // This would create a ZIP file with the topic's folder structure
    // For now, we'll return the overview content as a simple export
    const overview = await this.getTopicOverview(topicId);
    return new Blob([overview], { type: 'text/markdown' });
  }

  // Search functionality
  async searchTopicContent(topicId: string, query: string): Promise<{file: string, matches: string[]}[]> {
    // Simple search implementation - in production, would use a proper search index
    const results: {file: string, matches: string[]}[] = [];
    const searchQuery = query.toLowerCase();
    
    try {
      // Search overview
      const overview = await this.getTopicOverview(topicId);
      const overviewMatches = this.findMatches(overview, searchQuery);
      if (overviewMatches.length > 0) {
        results.push({ file: 'overview.md', matches: overviewMatches });
      }
      
      // Search position
      const position = await this.getTopicPosition(topicId);
      const positionMatches = this.findMatches(position, searchQuery);
      if (positionMatches.length > 0) {
        results.push({ file: 'my-position.md', matches: positionMatches });
      }
      
      // Search arguments
      const argumentsList = await this.listArguments(topicId);
      for (const argId of argumentsList) {
        try {
          const argContent = await this.getArgument(topicId, argId);
          const argMatches = this.findMatches(argContent, searchQuery);
          if (argMatches.length > 0) {
            results.push({ file: `arguments/${argId}.md`, matches: argMatches });
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
    } catch (error) {
      console.warn('Error during search:', error);
    }
    
    return results;
  }

  private findMatches(content: string, query: string): string[] {
    const lines = content.split('\n');
    const matches: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        // Include some context around the match
        const start = Math.max(0, index - 1);
        const end = Math.min(lines.length - 1, index + 1);
        const context = lines.slice(start, end + 1).join('\n');
        matches.push(context);
      }
    });
    
    return matches;
  }
}

// Create and export a singleton instance
const storageService = new StorageService();
export default storageService;
