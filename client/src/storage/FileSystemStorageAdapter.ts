import { StorageAdapter, TopicMetadata, TOPIC_TEMPLATES } from '../types/storage';

// File System Access API adapter for creating real files
class FileSystemStorageAdapter implements StorageAdapter {
  private rootDirHandle: FileSystemDirectoryHandle | null = null;
  private usersDirHandle: FileSystemDirectoryHandle | null = null;
  private currentUserDirHandle: FileSystemDirectoryHandle | null = null;
  private linkedFolders: Map<string, FileSystemDirectoryHandle> = new Map();

  async init(): Promise<void> {
    if (this.rootDirHandle) return;

    try {
      // Request directory access from user
      this.rootDirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      // Create or get users directory
      this.usersDirHandle = await this.getOrCreateDirectory(this.rootDirHandle, 'users');
      
      // Create or get default user directory
      this.currentUserDirHandle = await this.getOrCreateDirectory(this.usersDirHandle, 'default-user');
      
      // Load any previously linked folders
      await this.loadLinkedFolders();

    } catch (error) {
      if ((error as any).name === 'AbortError') {
        throw new Error('User cancelled directory selection. Please try again and select a folder for your debate files.');
      } else if ((error as any).name === 'NotSupportedError') {
        throw new Error('File System Access API not supported. Please use a modern browser like Chrome or Edge.');
      }
      throw error;
    }
  }

  private async getOrCreateDirectory(parentHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
    try {
      return await parentHandle.getDirectoryHandle(name);
    } catch (error) {
      // Directory doesn't exist, create it
      return await parentHandle.getDirectoryHandle(name, { create: true });
    }
  }

  private async ensureInit(): Promise<void> {
    if (!this.currentUserDirHandle) {
      await this.init();
    }
  }

  private getUserTopicPath(topicId: string): string {
    return `topics/${topicId}`;
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

  private async navigateToPath(path: string): Promise<{ dirHandle: FileSystemDirectoryHandle, fileName?: string }> {
    await this.ensureInit();
    
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1].includes('.') ? pathParts.pop() : undefined;
    
    let currentHandle = this.currentUserDirHandle!;
    
    for (const part of pathParts) {
      if (part) {
        currentHandle = await this.getOrCreateDirectory(currentHandle, part);
      }
    }
    
    return { dirHandle: currentHandle, fileName };
  }

  async createTopic(userId: string, topicData: TopicMetadata): Promise<void> {
    const topicSlug = this.slugify(topicData.title);
    const topicPath = this.getUserTopicPath(topicSlug);
    
    // Create topic directory structure
    const { dirHandle: topicDirHandle } = await this.navigateToPath(topicPath);
    
    // Create subdirectories
    await this.getOrCreateDirectory(topicDirHandle, 'arguments');
    await this.getOrCreateDirectory(topicDirHandle, 'evidence');
    await this.getOrCreateDirectory(topicDirHandle, 'practice');
    await this.getOrCreateDirectory(topicDirHandle, 'media');
    
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
    await this.writeFileToHandle(topicDirHandle, 'overview.md', overviewContent);
    
    // Create my-position.md
    const positionContent = this.renderTemplate(TOPIC_TEMPLATES.position.content, templateVars);
    await this.writeFileToHandle(topicDirHandle, 'my-position.md', positionContent);
    
    // Create README files in subdirectories
    const argumentsDir = await topicDirHandle.getDirectoryHandle('arguments');
    await this.writeFileToHandle(argumentsDir, 'README.md', '# Arguments\n\nStore your structured debate arguments here.\n');
    
    const evidenceDir = await topicDirHandle.getDirectoryHandle('evidence');
    await this.writeFileToHandle(evidenceDir, 'README.md', '# Evidence\n\nCollect research, studies, quotes, and supporting evidence here.\n');
    
    const practiceDir = await topicDirHandle.getDirectoryHandle('practice');
    await this.writeFileToHandle(practiceDir, 'README.md', '# Practice Notes\n\nTrack your practice sessions and feedback here.\n');
    
    const mediaDir = await topicDirHandle.getDirectoryHandle('media');
    await this.writeFileToHandle(mediaDir, 'README.md', '# Media\n\nStore diagrams, charts, and visual aids here.\n');

    // Store topic metadata in a .debaterank-meta.json file (hidden metadata)
    const metadataContent = JSON.stringify({ ...topicData, id: topicSlug }, null, 2);
    await this.writeFileToHandle(topicDirHandle, '.debaterank-meta.json', metadataContent);
  }

  private async writeFileToHandle(dirHandle: FileSystemDirectoryHandle, fileName: string, content: string): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  private async readFileFromHandle(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string> {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      throw new Error(`File not found: ${fileName}`);
    }
  }

  async getTopic(userId: string, topicId: string): Promise<TopicMetadata | null> {
    try {
      const topicPath = this.getUserTopicPath(topicId);
      const { dirHandle } = await this.navigateToPath(topicPath);
      
      const metadataContent = await this.readFileFromHandle(dirHandle, '.debaterank-meta.json');
      return JSON.parse(metadataContent) as TopicMetadata;
    } catch (error) {
      return null;
    }
  }

  async updateTopic(userId: string, topicId: string, updates: Partial<TopicMetadata>): Promise<void> {
    const existingTopic = await this.getTopic(userId, topicId);
    if (!existingTopic) {
      throw new Error('Topic not found');
    }

    const updatedTopic = { ...existingTopic, ...updates, last_modified: new Date().toISOString() };
    
    const topicPath = this.getUserTopicPath(topicId);
    const { dirHandle } = await this.navigateToPath(topicPath);
    
    const metadataContent = JSON.stringify(updatedTopic, null, 2);
    await this.writeFileToHandle(dirHandle, '.debaterank-meta.json', metadataContent);
  }

  async listTopics(userId: string): Promise<TopicMetadata[]> {
    try {
      await this.ensureInit();
      const topicsDir = await this.getOrCreateDirectory(this.currentUserDirHandle!, 'topics');
      
      const topics: TopicMetadata[] = [];
      
      // Iterate through topic directories
      for await (const [name, handle] of topicsDir.entries()) {
        if (handle.kind === 'directory') {
          try {
            const metadataContent = await this.readFileFromHandle(handle, '.debaterank-meta.json');
            const topic = JSON.parse(metadataContent) as TopicMetadata;
            topics.push(topic);
          } catch (error) {
            // Skip directories without metadata
            console.warn(`Skipping directory ${name}: no metadata found`);
          }
        }
      }
      
      return topics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      return [];
    }
  }

  async deleteTopic(userId: string, topicId: string): Promise<void> {
    try {
      const topicsDir = await this.getOrCreateDirectory(this.currentUserDirHandle!, 'topics');
      await topicsDir.removeEntry(topicId, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to delete topic: ${error}`);
    }
  }


  async deleteFile(filePath: string): Promise<void> {
    const { dirHandle, fileName } = await this.navigateToPath(filePath);
    if (!fileName) {
      throw new Error('Invalid file path');
    }
    await dirHandle.removeEntry(fileName);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.readFile(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    await this.navigateToPath(dirPath);
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const { dirHandle } = await this.navigateToPath(dirPath);
    const items: string[] = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      if (!name.startsWith('.')) { // Skip hidden files
        items.push(name);
      }
    }
    
    return items;
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    const pathParts = dirPath.split('/');
    const dirName = pathParts.pop()!;
    const parentPath = pathParts.join('/');
    
    const { dirHandle: parentHandle } = await this.navigateToPath(parentPath);
    await parentHandle.removeEntry(dirName, { recursive: true });
  }

  // Link to an existing topic folder
  async linkTopicFolder(topicId: string): Promise<void> {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      
      this.linkedFolders.set(topicId, dirHandle);
      
      // Store the linked folder handle in IndexedDB for persistence
      await this.storeFolderHandle(topicId, dirHandle);
      
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        throw new Error('Folder linking cancelled');
      }
      throw new Error(`Failed to link folder: ${error}`);
    }
  }

  // Check if topic has a linked folder
  isTopicLinked(topicId: string): boolean {
    return this.linkedFolders.has(topicId);
  }

  // Get linked folder handle for a topic
  private getLinkedFolder(topicId: string): FileSystemDirectoryHandle | null {
    return this.linkedFolders.get(topicId) || null;
  }

  // Store folder handle in IndexedDB for persistence
  private async storeFolderHandle(topicId: string, dirHandle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const db = await this.openLinkedFoldersDB();
      const transaction = db.transaction(['linkedFolders'], 'readwrite');
      const store = transaction.objectStore('linkedFolders');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ topicId, dirHandle });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to store folder handle:', error);
    }
  }

  // Load linked folder handles from IndexedDB
  private async loadLinkedFolders(): Promise<void> {
    try {
      const db = await this.openLinkedFoldersDB();
      const transaction = db.transaction(['linkedFolders'], 'readonly');
      const store = transaction.objectStore('linkedFolders');
      
      const request = store.getAll();
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const results = request.result;
          for (const result of results) {
            this.linkedFolders.set(result.topicId, result.dirHandle);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to load linked folders:', error);
    }
  }

  // Open IndexedDB for storing folder handles
  private async openLinkedFoldersDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DebateRankLinkedFolders', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('linkedFolders')) {
          db.createObjectStore('linkedFolders', { keyPath: 'topicId' });
        }
      };
    });
  }

  // Override file operations to use linked folders when available
  async writeFile(filePath: string, content: string): Promise<void> {
    const topicId = this.extractTopicIdFromPath(filePath);
    const linkedFolder = this.getLinkedFolder(topicId);
    
    if (linkedFolder) {
      await this.writeFileToLinkedFolder(linkedFolder, filePath, content);
    } else {
      // Fall back to regular file system creation
      const { dirHandle, fileName } = await this.navigateToPath(filePath);
      if (!fileName) {
        throw new Error('Invalid file path');
      }
      await this.writeFileToHandle(dirHandle, fileName, content);
    }
  }

  async readFile(filePath: string): Promise<string> {
    const topicId = this.extractTopicIdFromPath(filePath);
    const linkedFolder = this.getLinkedFolder(topicId);
    
    if (linkedFolder) {
      return await this.readFileFromLinkedFolder(linkedFolder, filePath);
    } else {
      // Fall back to regular file system reading
      const { dirHandle, fileName } = await this.navigateToPath(filePath);
      if (!fileName) {
        throw new Error('Invalid file path');
      }
      return await this.readFileFromHandle(dirHandle, fileName);
    }
  }

  // Helper to extract topic ID from file path
  private extractTopicIdFromPath(filePath: string): string {
    const match = filePath.match(/topics\/([^\/]+)\//);
    return match ? match[1] : '';
  }

  // Write file to linked folder
  private async writeFileToLinkedFolder(linkedFolder: FileSystemDirectoryHandle, filePath: string, content: string): Promise<void> {
    const topicId = this.extractTopicIdFromPath(filePath);
    const relativePath = filePath.split(`topics/${topicId}/`)[1];
    
    if (!relativePath) {
      throw new Error('Invalid file path for linked folder');
    }
    
    const pathParts = relativePath.split('/');
    const fileName = pathParts.pop()!;
    
    let currentDir = linkedFolder;
    for (const part of pathParts) {
      if (part) {
        currentDir = await this.getOrCreateDirectory(currentDir, part);
      }
    }
    
    await this.writeFileToHandle(currentDir, fileName, content);
  }

  // Read file from linked folder
  private async readFileFromLinkedFolder(linkedFolder: FileSystemDirectoryHandle, filePath: string): Promise<string> {
    const topicId = this.extractTopicIdFromPath(filePath);
    const relativePath = filePath.split(`topics/${topicId}/`)[1];
    
    if (!relativePath) {
      throw new Error('Invalid file path for linked folder');
    }
    
    const pathParts = relativePath.split('/');
    const fileName = pathParts.pop()!;
    
    let currentDir = linkedFolder;
    for (const part of pathParts) {
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }
    }
    
    return await this.readFileFromHandle(currentDir, fileName);
  }

  // Additional method to get the selected directory name for UI feedback
  getSelectedDirectoryName(): string | null {
    return this.rootDirHandle?.name || null;
  }

  // Get linked folder name for UI display
  getLinkedFolderName(topicId: string): string | null {
    const handle = this.linkedFolders.get(topicId);
    return handle?.name || null;
  }
}

export default FileSystemStorageAdapter;