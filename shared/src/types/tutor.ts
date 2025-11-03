/**
 * @file tutor.ts
 * @author Angelo Nicolson
 * @brief Tutor-related TypeScript type definitions for shared API contracts
 * @description Defines TypeScript interfaces for tutor profiles, availability scheduling, and time slot management.
 * Shared between client and server providing Tutor interface with grade levels, subjects, ratings, and TutorAvailability
 * with timezone-aware TimeSlot definitions for consistent tutor management across the full stack.
 */

export interface Tutor {
  id: string;
  name: string;
  grade: 'Elementary' | 'Middle School' | 'High School' | 'College';
  subjects: string[];
  rating: number;
  reviews: number;
  price: number;
  avatar: string;
  description: string;
}

export interface TutorAvailability {
  tutorId: string;
  timezone: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  date: string; // ISO date string
  times: string[]; // Array of time strings (HH:MM)
}