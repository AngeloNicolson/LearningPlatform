/**
 * @file booking.ts
 * @author Angelo Nicolson
 * @brief Booking-related TypeScript type definitions for shared API contracts
 * @description Defines TypeScript interfaces for tutoring session bookings, booking creation requests, and API responses.
 * Shared between client and server providing Booking interface with status tracking (pending, confirmed, cancelled, completed),
 * CreateBookingRequest for session scheduling, and BookingResponse for API communication ensuring type-safe booking operations.
 */

export interface Booking {
  id: string;
  tutorId: string;
  tutorName?: string;
  studentName: string;
  studentEmail: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  duration: number; // minutes
  subject?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price?: number;
  paymentId?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  tutorId: string;
  date: string;
  time: string;
  duration: number;
  studentName: string;
  studentEmail: string;
  subject?: string;
}

export interface BookingResponse {
  message: string;
  booking?: Booking;
}