/**
 * @file ApiService.ts
 * @author Angelo Nicolson
 * @brief Centralized API client service
 * @description Provides centralized API client for backend communication with methods for fetching topics, resources, tutors, and managing bookings. Implements error handling, request/response transformation, and base URL configuration.
 */

import { TopicMetadata } from '../types/storage';
import { authFetch } from '../utils/authFetch';

class ApiService {
  private baseUrl: string;
  private currentUserId: string = 'default-user';

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:3777/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await authFetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string {
    return this.currentUserId;
  }

  // Topic management
  async createTopic(topicData: any): Promise<TopicMetadata> {
    const response = await this.request<{ topic: TopicMetadata }>(
      `/topics?userId=${this.currentUserId}`,
      {
        method: 'POST',
        body: JSON.stringify(topicData),
      }
    );
    return response.topic;
  }

  async getTopic(topicId: string): Promise<TopicMetadata | null> {
    try {
      const response = await this.request<{ topic: TopicMetadata }>(
        `/topics/${topicId}?userId=${this.currentUserId}`
      );
      return response.topic;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async listTopics(): Promise<TopicMetadata[]> {
    const response = await this.request<{ topics: TopicMetadata[] }>(
      `/topics?userId=${this.currentUserId}`
    );
    return response.topics;
  }

  async updateTopic(topicId: string, updates: Partial<TopicMetadata>): Promise<TopicMetadata> {
    const response = await this.request<{ topic: TopicMetadata }>(
      `/topics/${topicId}?userId=${this.currentUserId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return response.topic;
  }

  async deleteTopic(topicId: string): Promise<void> {
    await this.request(
      `/topics/${topicId}?userId=${this.currentUserId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // File management
  async getTopicOverview(topicId: string): Promise<string> {
    const response = await this.request<{ content: string }>(
      `/topics/${topicId}/overview?userId=${this.currentUserId}`
    );
    return response.content;
  }

  async updateTopicOverview(topicId: string, content: string): Promise<void> {
    await this.request(
      `/topics/${topicId}/overview?userId=${this.currentUserId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }
    );
  }

  async getTopicPosition(topicId: string): Promise<string> {
    const response = await this.request<{ content: string }>(
      `/topics/${topicId}/position?userId=${this.currentUserId}`
    );
    return response.content;
  }

  async updateTopicPosition(topicId: string, content: string): Promise<void> {
    await this.request(
      `/topics/${topicId}/position?userId=${this.currentUserId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }
    );
  }

  // File operations
  async uploadFiles(topicId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    formData.append('topicId', topicId);
    formData.append('userId', this.currentUserId);

    for (const file of files) {
      formData.append('files', file);
    }

    const response = await authFetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Upload failed');
    }

    return await response.json();
  }

  async exportTopic(topicId: string): Promise<Blob> {
    const response = await authFetch(
      `${this.baseUrl}/files/${this.currentUserId}/${topicId}/export`
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return await response.blob();
  }

  async listTopicFiles(topicId: string): Promise<any[]> {
    const response = await this.request<{ files: any[] }>(
      `/files/${this.currentUserId}/${topicId}/list`
    );
    return response.files;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export default new ApiService();
