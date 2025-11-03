/**
 * @file wasm.ts
 * @author Angelo Nicolson
 * @brief TypeScript type definitions for WebAssembly debate core
 * @description Defines TypeScript interfaces for WebAssembly debate core integration including Topic, Argument, Position types, and debate-related data structures.
 */

// TypeScript definitions for our WASM module

export interface Topic {
  id: number;
  title: string;
  description: string;
  complexity_level: number;
  category: string;
}

export interface Note {
  id: number;
  content: string;
  topic_tag: string;
  note_type: 'claim' | 'evidence' | 'rebuttal' | 'general';
}

export interface UserBelief {
  topic_id: number;
  conviction_level: number; // 1-10
  position: 'for' | 'against' | 'neutral';
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  stroke_width: number;
  color: string;
}

export interface Drawing {
  id: number;
  canvas_width: number;
  canvas_height: number;
  associated_note_id: string;
  strokes: DrawingStroke[];
}

// WASM Module interface
export interface DebatePlatformModule {
  init_core(): void;
  
  // Topic functions
  create_topic(title: string, description: string, complexity: number, category: string): number;
  get_topics_by_complexity(min_level: number, max_level: number): Topic[];
  search_topics(query: string): Topic[];
  
  // Note functions
  create_note(content: string, topic_tag: string, type: string): number;
  link_notes(note1_id: number, note2_id: number): void;
  get_linked_notes(note_id: number): Note[];
  search_notes(query: string): Note[];
  
  // Belief functions
  record_belief(topic_id: number, conviction: number, position: string): void;
  get_user_belief(topic_id: number): UserBelief;
  
  // Drawing functions
  create_drawing(width: number, height: number, note_id?: string): number;
  add_stroke_to_drawing(drawing_id: number, points: DrawingPoint[], width: number, color: string): void;
  get_drawing(drawing_id: number): Drawing;
}

// Global module declaration
declare global {
  interface Window {
    Module: DebatePlatformModule;
  }
}

export {};
