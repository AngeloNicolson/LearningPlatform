/**
 * @file DownloadStorageAdapter.ts
 * @author Angelo Nicolson
 * @brief Download-based storage adapter for unsupported browsers
 * @description Implements storage adapter that uses browser downloads as a fallback storage mechanism. Automatically downloads topic data as JSON files and provides instructions for manual file management on browsers without modern storage APIs.
 */

import { StorageAdapter, TopicMetadata, TOPIC_TEMPLATES } from '../types/storage';

// Download-based storage adapter for browsers without File System Access API
class DownloadStorageAdapter implements StorageAdapter {
  private topics: Map<string, TopicMetadata> = new Map();
  private files: Map<string, string> = new Map();

  async init(): Promise<void> {
    // Load from localStorage if available
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage(): void {
    try {
      const topicsData = Array.from(this.topics.entries());
      const filesData = Array.from(this.files.entries());
      
      localStorage.setItem('debaterank_topics', JSON.stringify(topicsData));
      localStorage.setItem('debaterank_files', JSON.stringify(filesData));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const topicsData = localStorage.getItem('debaterank_topics');
      const filesData = localStorage.getItem('debaterank_files');
      
      if (topicsData) {
        const topics = JSON.parse(topicsData);
        this.topics = new Map(topics);
      }
      
      if (filesData) {
        const files = JSON.parse(filesData);
        this.files = new Map(files);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    // Simple template rendering - replace {{variable}} with values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    });
    
    // Handle arrays like {{#items}}...{{/items}}
    rendered = rendered.replace(/{{#(\w+)}}(.*?){{\/\1}}/gs, (match, arrayKey, template) => {
      const array = variables[arrayKey];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        if (typeof item === 'string') {
          return template.replace(/{{\.}}/g, item);
        } else {
          let itemTemplate = template;
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            itemTemplate = itemTemplate.replace(new RegExp(`{{${itemKey}}}`, 'g'), String(itemValue));
          });
          return itemTemplate;
        }
      }).join('');
    });
    
    return rendered;
  }

  async createTopic(userId: string, topicData: TopicMetadata): Promise<void> {
    const topicSlug = this.slugify(topicData.title);
    const topicWithSlug = { ...topicData, id: topicSlug };
    
    // Store topic metadata
    this.topics.set(topicSlug, topicWithSlug);
    
    // Create initial files from templates
    const templateVars = {
      ...topicData,
      title: topicData.title,
      category: topicData.category,
      complexity_level: topicData.complexity_level,
      description: topicData.description,
      created_at: topicData.created_at,
      last_modified: topicData.last_modified,
      position: topicData.position || 'neutral',
      conviction: topicData.conviction || 5
    };
    
    // Create overview.md
    const overviewContent = this.renderTemplate(TOPIC_TEMPLATES.overview.content, templateVars);
    this.files.set(`users/${userId}/topics/${topicSlug}/overview.md`, overviewContent);
    
    // Create my-position.md
    const positionContent = this.renderTemplate(TOPIC_TEMPLATES.position.content, templateVars);
    this.files.set(`users/${userId}/topics/${topicSlug}/my-position.md`, positionContent);
    
    // Create README files in subdirectories
    this.files.set(`users/${userId}/topics/${topicSlug}/arguments/README.md`, '# Arguments\n\nStore your structured debate arguments here.\n');
    this.files.set(`users/${userId}/topics/${topicSlug}/evidence/README.md`, '# Evidence\n\nCollect research, studies, quotes, and supporting evidence here.\n');
    this.files.set(`users/${userId}/topics/${topicSlug}/practice/README.md`, '# Practice Notes\n\nTrack your practice sessions and feedback here.\n');
    this.files.set(`users/${userId}/topics/${topicSlug}/media/README.md`, '# Media\n\nStore diagrams, charts, and visual aids here.\n');

    // Store metadata
    this.files.set(`users/${userId}/topics/${topicSlug}/.debaterank-meta.json`, JSON.stringify(topicWithSlug, null, 2));
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // Auto-download the key topic files
    await this.downloadTopicFiles(userId, topicSlug);
  }

  async getTopic(userId: string, topicId: string): Promise<TopicMetadata | null> {
    return this.topics.get(topicId) || null;
  }

  async updateTopic(userId: string, topicId: string, updates: Partial<TopicMetadata>): Promise<void> {
    const existingTopic = this.topics.get(topicId);
    if (!existingTopic) {
      throw new Error('Topic not found');
    }

    const updatedTopic = { ...existingTopic, ...updates, last_modified: new Date().toISOString() };
    this.topics.set(topicId, updatedTopic);
    
    // Update metadata file
    this.files.set(`users/${userId}/topics/${topicId}/.debaterank-meta.json`, JSON.stringify(updatedTopic, null, 2));
    
    this.saveToLocalStorage();
  }

  async listTopics(userId: string): Promise<TopicMetadata[]> {
    return Array.from(this.topics.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async deleteTopic(userId: string, topicId: string): Promise<void> {
    this.topics.delete(topicId);
    
    // Remove all files for this topic
    const topicPrefix = `users/${userId}/topics/${topicId}/`;
    for (const [filePath] of this.files.entries()) {
      if (filePath.startsWith(topicPrefix)) {
        this.files.delete(filePath);
      }
    }
    
    this.saveToLocalStorage();
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    this.files.set(filePath, content);
    this.saveToLocalStorage();
  }

  async readFile(filePath: string): Promise<string> {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`File not found: ${filePath}`);
    }
    return content;
  }

  async deleteFile(filePath: string): Promise<void> {
    this.files.delete(filePath);
    this.saveToLocalStorage();
  }

  async fileExists(filePath: string): Promise<boolean> {
    return this.files.has(filePath);
  }

  async createDirectory(dirPath: string): Promise<void> {
    // No-op for download adapter - directories are implicit
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const items: string[] = [];
    const searchPath = dirPath.endsWith('/') ? dirPath : dirPath + '/';
    
    for (const [filePath] of this.files.entries()) {
      if (filePath.startsWith(searchPath)) {
        const relativePath = filePath.substring(searchPath.length);
        const parts = relativePath.split('/');
        const item = parts[0];
        
        if (item && !items.includes(item)) {
          items.push(item);
        }
      }
    }
    
    return items.filter(item => !item.startsWith('.'));
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    const searchPath = dirPath.endsWith('/') ? dirPath : dirPath + '/';
    
    for (const [filePath] of this.files.entries()) {
      if (filePath.startsWith(searchPath)) {
        this.files.delete(filePath);
      }
    }
    
    this.saveToLocalStorage();
  }

  // Download functionality - creates ZIP with proper folder structure
  private async downloadTopicFiles(userId: string, topicId: string): Promise<void> {
    try {
      // Import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const topicPrefix = `users/${userId}/topics/${topicId}/`;
      const topic = this.topics.get(topicId);
      const topicTitle = topic?.title || topicId;
      const sanitizedTitle = this.slugify(topicTitle);
      
      // Create the main topic folder in the ZIP
      const topicFolder = zip.folder(sanitizedTitle);
      if (!topicFolder) return;
      
      // Add all files for this topic to the ZIP with proper folder structure
      for (const [filePath, content] of this.files.entries()) {
        if (filePath.startsWith(topicPrefix) && !filePath.includes('.debaterank-meta.json')) {
          const relativePath = filePath.substring(topicPrefix.length);
          
          // Create nested folders if needed
          const pathParts = relativePath.split('/');
          if (pathParts.length > 1) {
            const fileName = pathParts.pop()!;
            const folderPath = pathParts.join('/');
            const nestedFolder = topicFolder.folder(folderPath);
            if (nestedFolder) {
              nestedFolder.file(fileName, content);
            }
          } else {
            topicFolder.file(relativePath, content);
          }
        }
      }
      
      // Generate and download the ZIP
      const zipContent = await zip.generateAsync({ type: 'blob' });
      this.downloadBlob(zipContent, `${sanitizedTitle}.zip`);
      
    } catch (error) {
      console.error('Failed to create ZIP download:', error);
      // Fallback: download just the main files individually
      await this.downloadMainFiles(userId, topicId);
    }
  }

  // Fallback method - downloads only the essential files
  private async downloadMainFiles(userId: string, topicId: string): Promise<void> {
    const topicPrefix = `users/${userId}/topics/${topicId}/`;
    const topic = this.topics.get(topicId);
    const topicTitle = topic?.title || topicId;
    const sanitizedTitle = this.slugify(topicTitle);
    
    // Download only the two main files
    const mainFiles = ['overview.md', 'my-position.md'];
    
    for (const fileName of mainFiles) {
      const filePath = `${topicPrefix}${fileName}`;
      const content = this.files.get(filePath);
      
      if (content) {
        const downloadFileName = `${sanitizedTitle}-${fileName}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        this.downloadBlob(blob, downloadFileName);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Method to download all topics with folder structure
  async downloadAllTopics(userId: string): Promise<void> {
    const topicIds = Array.from(this.topics.keys());
    
    for (const topicId of topicIds) {
      await this.downloadTopicFiles(userId, topicId);
      // Small delay between topics to avoid overwhelming browser
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  getSelectedDirectoryName(): string | null {
    return 'Downloads folder (as ZIP files - extract to get folders)';
  }
}

export default DownloadStorageAdapter;
