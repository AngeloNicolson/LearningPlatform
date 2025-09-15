import { useState, useEffect, useCallback } from 'react';
import { TopicMetadata } from '../types/storage';
import apiService from '../services/ApiService';

interface UseTopicsReturn {
  topics: TopicMetadata[];
  loading: boolean;
  error: string | null;
  createTopic: (browserTopic: any) => Promise<TopicMetadata>;
  updateTopic: (topicId: string, updates: Partial<TopicMetadata>) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  refreshTopics: () => Promise<void>;
  getTopic: (topicId: string) => Promise<TopicMetadata | null>;
}

export const useTopics = (): UseTopicsReturn => {
  const [topics, setTopics] = useState<TopicMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const topicList = await apiService.listTopics();
      setTopics(topicList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics');
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTopic = useCallback(async (browserTopic: any): Promise<TopicMetadata> => {
    try {
      setError(null);
      const newTopic = await apiService.createTopic(browserTopic);
      
      // Add to local state
      setTopics(prev => [newTopic, ...prev]);
      
      return newTopic;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create topic';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTopic = useCallback(async (topicId: string, updates: Partial<TopicMetadata>): Promise<void> => {
    try {
      setError(null);
      const updatedTopic = await apiService.updateTopic(topicId, updates);
      
      // Update local state
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? updatedTopic : topic
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update topic';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteTopic = useCallback(async (topicId: string): Promise<void> => {
    try {
      setError(null);
      await apiService.deleteTopic(topicId);
      
      // Remove from local state
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete topic';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getTopic = useCallback(async (topicId: string): Promise<TopicMetadata | null> => {
    try {
      setError(null);
      return await apiService.getTopic(topicId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get topic';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load topics on mount
  useEffect(() => {
    refreshTopics();
  }, [refreshTopics]);

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refreshTopics,
    getTopic
  };
};