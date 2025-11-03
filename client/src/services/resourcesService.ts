/**
 * @file resourcesService.ts
 * @author Angelo Nicolson
 * @brief Educational resources API service
 * @description Provides API methods for fetching and managing educational resources across subjects (math, science, history). Implements topic filtering, resource downloading, and content retrieval with error handling and type safety.
 */

import { authFetch } from '../utils/authFetch';
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:3777/api';

export interface Resource {
  id: string;
  subject: string;
  topic_id: string;
  topic_name: string;
  topic_icon?: string;
  resource_type: string;
  title: string;
  description: string;
  url?: string;
  content?: string;
  era?: string;
  grade_level?: string;
  visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  icon?: string;
  grade_level?: string;
  era?: string;
}

class ResourcesService {
  // Fetch resources for a specific subject
  async getResources(
    subject: 'math' | 'science' | 'history',
    filters?: {
      topic?: string;
      type?: string;
      grade?: string;
      era?: string;
      search?: string;
    }
  ): Promise<Resource[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all') {
            params.append(key, value);
          }
        });
      }

      const queryString = params.toString();
      const url = `${API_URL}/subject-resources/${subject}/resources${queryString ? '?' + queryString : ''}`;
      
      const response = await authFetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${subject} resources:`, error);
      // Return hardcoded data as fallback for now
      return this.getHardcodedResources(subject);
    }
  }

  // Fetch topics for a specific subject
  async getTopics(subject: 'math' | 'science' | 'history'): Promise<Topic[]> {
    try {
      const response = await authFetch(`${API_URL}/subject-resources/${subject}/topics`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${subject} topics:`, error);
      // Return hardcoded topics as fallback
      return this.getHardcodedTopics(subject);
    }
  }

  // Fallback hardcoded data for Math
  private getHardcodedResources(subject: string): Resource[] {
    if (subject === 'math') {
      return [
        {
          id: 'math-1',
          subject: 'math',
          topic_id: 'arithmetic',
          topic_name: 'Arithmetic',
          topic_icon: '➕',
          resource_type: 'lessons',
          title: 'Introduction to Addition',
          description: 'Learn the fundamentals of addition with comprehensive explanations',
          grade_level: 'Elementary',
          visible: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'math-2',
          subject: 'math',
          topic_id: 'arithmetic',
          topic_name: 'Arithmetic',
          topic_icon: '➕',
          resource_type: 'worksheet',
          title: 'Addition Practice Problems',
          description: 'Practice your addition skills',
          grade_level: 'Elementary',
          visible: true,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    } else if (subject === 'science') {
      return [
        {
          id: 'sci-1',
          subject: 'science',
          topic_id: 'physics',
          topic_name: 'Physics',
          topic_icon: '⚛️',
          resource_type: 'lessons',
          title: "Understanding Newton's Laws of Motion",
          description: 'Comprehensive lesson on the three fundamental laws of motion',
          grade_level: 'High School',
          visible: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'sci-2',
          subject: 'science',
          topic_id: 'physics',
          topic_name: 'Physics',
          topic_icon: '⚛️',
          resource_type: 'simulation',
          title: "Newton's Laws Interactive Simulation",
          description: 'Explore the laws of motion through interactive experiments',
          grade_level: 'High School',
          visible: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    } else if (subject === 'history') {
      return [
        {
          id: 'hist-1',
          subject: 'history',
          topic_id: 'colonial',
          topic_name: 'Colonial America',
          topic_icon: '⛵',
          resource_type: 'lessons',
          title: 'The First Settlements',
          description: 'Jamestown, Plymouth, and early colonial life',
          era: '1607-1700',
          visible: true,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }
    return [];
  }

  // Fallback hardcoded topics
  private getHardcodedTopics(subject: string): Topic[] {
    if (subject === 'math') {
      return [
        { id: 'arithmetic', name: 'Arithmetic', icon: '➕' },
        { id: 'algebra', name: 'Algebra', icon: '𝑥' },
        { id: 'geometry', name: 'Geometry', icon: '📐' },
        { id: 'calculus', name: 'Calculus', icon: '∫' },
      ];
    } else if (subject === 'science') {
      return [
        { id: 'physics', name: 'Physics', icon: '⚛️' },
        { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
        { id: 'biology', name: 'Biology', icon: '🧬' },
        { id: 'earth-science', name: 'Earth Science', icon: '🌍' },
      ];
    } else if (subject === 'history') {
      return [
        { id: 'colonial', name: 'Colonial America', icon: '⛵', era: '1607-1770' },
        { id: 'revolution', name: 'Revolutionary War', icon: '🔔', era: '1763-1790' },
        { id: 'civil-war', name: 'Civil War', icon: '⚔️', era: '1850-1865' },
        { id: 'modern', name: 'Modern America', icon: '💻', era: '1989-present' },
      ];
    }
    return [];
  }

  // Admin functions (require authentication)
  async createResource(subject: string, resource: Partial<Resource>): Promise<Resource> {
    const response = await authFetch(`${API_URL}/subject-resources/${subject}/resources`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resource),
    });

    if (!response.ok) {
      throw new Error(`Failed to create resource: ${response.statusText}`);
    }

    const result = await response.json();
    return result.resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const response = await authFetch(`${API_URL}/subject-resources/resources/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update resource: ${response.statusText}`);
    }

    const result = await response.json();
    return result.resource;
  }

  async deleteResource(id: string): Promise<void> {
    const response = await authFetch(`${API_URL}/subject-resources/resources/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete resource: ${response.statusText}`);
    }
  }
}

export default new ResourcesService();
