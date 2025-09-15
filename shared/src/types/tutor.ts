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