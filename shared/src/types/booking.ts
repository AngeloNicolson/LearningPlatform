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