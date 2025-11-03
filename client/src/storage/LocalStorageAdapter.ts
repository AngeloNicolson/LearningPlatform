/**
 * @file LocalStorageAdapter.ts
 * @author Angelo Nicolson
 * @brief LocalStorage-based storage adapter implementation
 * @description Implements storage adapter using browser's localStorage API. Provides methods for reading, writing, and listing topics with JSON serialization and error handling for browser storage limitations.
 */

import { StorageAdapter, TopicMetadata, TOPIC_TEMPLATES } from '../types/storage';

// Browser-based file system using IndexedDB for local storage
class LocalStorageAdapter implements StorageAdapter {
  private dbName = 'DebateRankFS';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'path' });
          fileStore.createIndex('userId', 'userId', { unique: false });
          fileStore.createIndex('topicId', 'topicId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('userId', 'userId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('directories')) {
          db.createObjectStore('directories', { keyPath: 'path' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  private getUserTopicPath(userId: string, topicId: string): string {
    return `users/${userId}/topics/${topicId}`;
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
    const db = await this.ensureDB();
    const topicSlug = this.slugify(topicData.title);
    const topicPath = this.getUserTopicPath(userId, topicSlug);
    
    // Store topic metadata
    const topicWithSlug = { ...topicData, id: topicSlug };
    
    const transaction = db.transaction(['topics', 'directories', 'files'], 'readwrite');
    
    // Store topic metadata
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore('topics').add({ ...topicWithSlug, userId });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Create directory structure
    const directories = [
      `${topicPath}`,
      `${topicPath}/arguments`,
      `${topicPath}/evidence`,
      `${topicPath}/practice`,
      `${topicPath}/media`
    ];
    
    for (const dir of directories) {
      await this.createDirectory(dir);
    }
    
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
    await this.writeFile(`${topicPath}/overview.md`, overviewContent);
    
    // Create my-position.md
    const positionContent = this.renderTemplate(TOPIC_TEMPLATES.position.content, templateVars);
    await this.writeFile(`${topicPath}/my-position.md`, positionContent);
    
    // Create README files in subdirectories
    await this.writeFile(`${topicPath}/arguments/README.md`, '# Arguments\n\nStore your structured debate arguments here.\n');
    await this.writeFile(`${topicPath}/evidence/README.md`, '# Evidence\n\nCollect research, studies, quotes, and supporting evidence here.\n');
    await this.writeFile(`${topicPath}/practice/README.md`, '# Practice Notes\n\nTrack your practice sessions and feedback here.\n');
    await this.writeFile(`${topicPath}/media/README.md`, '# Media\n\nStore diagrams, charts, and visual aids here.\n');
  }

  async getTopic(userId: string, topicId: string): Promise<TopicMetadata | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['topics'], 'readonly');
      const request = transaction.objectStore('topics').get(topicId);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.userId === userId) {
          const { userId: _, ...topicData } = result;
          resolve(topicData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateTopic(userId: string, topicId: string, updates: Partial<TopicMetadata>): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['topics'], 'readwrite');
      const store = transaction.objectStore('topics');
      
      const getRequest = store.get(topicId);
      getRequest.onsuccess = () => {
        const topic = getRequest.result;
        if (!topic || topic.userId !== userId) {
          reject(new Error('Topic not found'));
          return;
        }
        
        const updatedTopic = { ...topic, ...updates, last_modified: new Date().toISOString() };
        
        const putRequest = store.put(updatedTopic);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async listTopics(userId: string): Promise<TopicMetadata[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['topics'], 'readonly');
      const store = transaction.objectStore('topics');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const topics = request.result.map((topic: any) => {
          const { userId: _, ...topicData } = topic;
          return topicData;
        });
        resolve(topics);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTopic(userId: string, topicId: string): Promise<void> {
    const db = await this.ensureDB();
    const topicPath = this.getUserTopicPath(userId, topicId);
    
    const transaction = db.transaction(['topics', 'files', 'directories'], 'readwrite');
    
    // Delete topic metadata
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore('topics').delete(topicId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Delete all files in the topic directory
    await this.deleteDirectory(topicPath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const fileData = {
        path: filePath,
        content,
        lastModified: new Date().toISOString(),
        size: content.length
      };
      
      const request = store.put(fileData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async readFile(filePath: string): Promise<string> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const request = transaction.objectStore('files').get(filePath);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.content);
        } else {
          reject(new Error(`File not found: ${filePath}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const request = transaction.objectStore('files').delete(filePath);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async fileExists(filePath: string): Promise<boolean> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const request = transaction.objectStore('files').get(filePath);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createDirectory(dirPath: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['directories'], 'readwrite');
      const store = transaction.objectStore('directories');
      
      const dirData = {
        path: dirPath,
        created: new Date().toISOString()
      };
      
      const request = store.put(dirData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const files = request.result
          .filter((file: any) => file.path.startsWith(dirPath + '/'))
          .map((file: any) => file.path.replace(dirPath + '/', '').split('/')[0])
          .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index);
        
        resolve(files);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    const db = await this.ensureDB();
    
    const transaction = db.transaction(['files', 'directories'], 'readwrite');
    
    // Delete all files in the directory
    const fileStore = transaction.objectStore('files');
    const fileRequest = fileStore.getAll();
    
    await new Promise<void>((resolve, reject) => {
      fileRequest.onsuccess = () => {
        const filesToDelete = fileRequest.result.filter((file: any) => 
          file.path.startsWith(dirPath + '/')
        );
        
        let deleteCount = 0;
        if (filesToDelete.length === 0) {
          resolve();
          return;
        }
        
        filesToDelete.forEach((file: any) => {
          const deleteRequest = fileStore.delete(file.path);
          deleteRequest.onsuccess = () => {
            deleteCount++;
            if (deleteCount === filesToDelete.length) {
              resolve();
            }
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };
      fileRequest.onerror = () => reject(fileRequest.error);
    });
    
    // Delete directory entry
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore('directories').delete(dirPath);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default LocalStorageAdapter;
