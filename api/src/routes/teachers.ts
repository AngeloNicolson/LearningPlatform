/**
 * @file teachers.ts
 * @author Angelo Nicolson
 * @brief Teacher profile management endpoints
 * @description Provides endpoints for teachers to manage their professional profiles including bio, specializations,
 * hourly rates, and weekly availability schedules. Implements role-based access control restricting access to teacher,
 * admin, and owner roles. Uses in-memory storage for profile data with mock data for development purposes.
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Mock teacher profiles
const teacherProfiles: any = {
  '3': {
    bio: 'Experienced mathematics teacher with 10+ years of teaching experience.',
    specializations: ['Algebra', 'Calculus', 'Geometry'],
    hourlyRate: 35,
    availability: {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-15:00'
    },
    rating: 4.8,
    totalReviews: 127,
    totalSessions: 523
  }
};

// Get teacher profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = teacherProfiles[user.id] || {
      bio: '',
      specializations: [],
      hourlyRate: 50,
      availability: {},
      rating: 0,
      totalReviews: 0,
      totalSessions: 0
    };

    return res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update teacher profile
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { bio, specializations, hourlyRate, availability } = req.body;

    // Update or create profile
    teacherProfiles[user.id] = {
      ...teacherProfiles[user.id],
      bio,
      specializations,
      hourlyRate,
      availability,
      updatedAt: new Date().toISOString()
    };

    return res.json({ 
      success: true, 
      profile: teacherProfiles[user.id]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;