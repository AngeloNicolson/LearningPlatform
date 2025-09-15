import { useState, useEffect, useCallback } from 'react';
import { DebatePlatformModule, Topic, Note, UserBelief, Drawing, DrawingPoint } from '../types/wasm';

export const useDebateCore = () => {
  const [isReady, setIsReady] = useState(false);
  const [module, setModule] = useState<DebatePlatformModule | null>(null);

  useEffect(() => {
    // Wait for WASM module to load
    const checkModule = () => {
      if (window.Module && typeof window.Module.init_core === 'function') {
        window.Module.init_core();
        setModule(window.Module);
        setIsReady(true);
      } else {
        // Keep checking every 100ms
        setTimeout(checkModule, 100);
      }
    };

    checkModule();
  }, []);

  // Topic functions
  const createTopic = useCallback((
    title: string,
    description: string,
    complexity: number,
    category: string
  ): number | null => {
    if (!module) return null;
    return module.create_topic(title, description, complexity, category);
  }, [module]);

  const getTopicsByComplexity = useCallback((
    minLevel: number,
    maxLevel: number
  ): Topic[] => {
    if (!module) return [];
    return module.get_topics_by_complexity(minLevel, maxLevel);
  }, [module]);

  const searchTopics = useCallback((query: string): Topic[] => {
    if (!module) return [];
    return module.search_topics(query);
  }, [module]);

  // Note functions
  const createNote = useCallback((
    content: string,
    topicTag: string,
    type: string = 'general'
  ): number | null => {
    if (!module) return null;
    return module.create_note(content, topicTag, type);
  }, [module]);

  const linkNotes = useCallback((note1Id: number, note2Id: number): void => {
    if (!module) return;
    module.link_notes(note1Id, note2Id);
  }, [module]);

  const getLinkedNotes = useCallback((noteId: number): Note[] => {
    if (!module) return [];
    return module.get_linked_notes(noteId);
  }, [module]);

  const searchNotes = useCallback((query: string): Note[] => {
    if (!module) return [];
    return module.search_notes(query);
  }, [module]);

  // Belief functions
  const recordBelief = useCallback((
    topicId: number,
    conviction: number,
    position: 'for' | 'against' | 'neutral'
  ): void => {
    if (!module) return;
    module.record_belief(topicId, conviction, position);
  }, [module]);

  const getUserBelief = useCallback((topicId: number): UserBelief | null => {
    if (!module) return null;
    return module.get_user_belief(topicId);
  }, [module]);

  // Drawing functions
  const createDrawing = useCallback((
    width: number,
    height: number,
    noteId?: string
  ): number | null => {
    if (!module) return null;
    return module.create_drawing(width, height, noteId);
  }, [module]);

  const addStrokeToDrawing = useCallback((
    drawingId: number,
    points: DrawingPoint[],
    width: number,
    color: string
  ): void => {
    if (!module) return;
    module.add_stroke_to_drawing(drawingId, points, width, color);
  }, [module]);

  const getDrawing = useCallback((drawingId: number): Drawing | null => {
    if (!module) return null;
    const drawing = module.get_drawing(drawingId);
    return drawing.id === -1 ? null : drawing;
  }, [module]);

  return {
    isReady,
    // Topic functions
    createTopic,
    getTopicsByComplexity,
    searchTopics,
    // Note functions
    createNote,
    linkNotes,
    getLinkedNotes,
    searchNotes,
    // Belief functions
    recordBelief,
    getUserBelief,
    // Drawing functions
    createDrawing,
    addStrokeToDrawing,
    getDrawing,
  };
};