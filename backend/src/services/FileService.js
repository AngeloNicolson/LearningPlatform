const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

class FileService {
  static getTopicPath(userId, topicId) {
    return path.join(__dirname, '../../storage/topics', userId, topicId);
  }

  static async ensureTopicDirectory(userId, topicId) {
    const topicPath = this.getTopicPath(userId, topicId);
    await fs.ensureDir(topicPath);
    await fs.ensureDir(path.join(topicPath, 'arguments'));
    await fs.ensureDir(path.join(topicPath, 'evidence'));
    await fs.ensureDir(path.join(topicPath, 'practice'));
    await fs.ensureDir(path.join(topicPath, 'media'));
    return topicPath;
  }

  static async saveTopicFile(userId, topicId, fileName, content) {
    const topicPath = await this.ensureTopicDirectory(userId, topicId);
    const filePath = path.join(topicPath, fileName);
    
    // Ensure subdirectory exists if fileName contains path
    const fileDir = path.dirname(filePath);
    await fs.ensureDir(fileDir);
    
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }

  static async getTopicFile(userId, topicId, fileName) {
    const topicPath = this.getTopicPath(userId, topicId);
    const filePath = path.join(topicPath, fileName);
    
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${fileName}`);
    }
    
    return await fs.readFile(filePath, 'utf8');
  }

  static async listTopicFiles(userId, topicId) {
    const topicPath = this.getTopicPath(userId, topicId);
    
    if (!(await fs.pathExists(topicPath))) {
      return [];
    }
    
    const files = [];
    
    const scanDirectory = async (dirPath, relativePath = '') => {
      const entries = await fs.readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const entryRelativePath = relativePath ? `${relativePath}/${entry}` : entry;
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await scanDirectory(fullPath, entryRelativePath);
        } else {
          files.push({
            name: entry,
            path: entryRelativePath,
            size: stats.size,
            modified: stats.mtime,
            type: path.extname(entry).toLowerCase()
          });
        }
      }
    };
    
    await scanDirectory(topicPath);
    return files;
  }

  static async deleteTopicFiles(userId, topicId) {
    const topicPath = this.getTopicPath(userId, topicId);
    
    if (await fs.pathExists(topicPath)) {
      await fs.remove(topicPath);
    }
  }

  static async processUploads(userId, topicId, files) {
    const topicPath = await this.ensureTopicDirectory(userId, topicId);
    const processedFiles = [];
    
    for (const file of files) {
      const targetPath = path.join(topicPath, 'media', file.originalname);
      await fs.move(file.path, targetPath);
      
      processedFiles.push({
        originalName: file.originalname,
        size: file.size,
        path: `media/${file.originalname}`,
        type: path.extname(file.originalname).toLowerCase()
      });
    }
    
    return processedFiles;
  }

  static async exportTopicAsZip(userId, topicId) {
    return new Promise(async (resolve, reject) => {
      try {
        const topicPath = this.getTopicPath(userId, topicId);
        
        if (!(await fs.pathExists(topicPath))) {
          throw new Error('Topic files not found');
        }
        
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks = [];
        
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
        
        // Add all files from topic directory
        archive.directory(topicPath, false);
        archive.finalize();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  static async fileExists(userId, topicId, fileName) {
    const topicPath = this.getTopicPath(userId, topicId);
    const filePath = path.join(topicPath, fileName);
    return await fs.pathExists(filePath);
  }
}

module.exports = FileService;