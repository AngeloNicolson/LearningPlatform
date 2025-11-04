/**
 * @file siteData.ts
 * @author Angelo Nicolson
 * @brief Site-wide statistics API endpoints
 * @description Provides public endpoints for retrieving cached site statistics including resource counts,
 * tutor counts, download statistics, and user counts. Data is cached in the site_data table and updated
 * incrementally when resources/tutors/users change.
 */

import { Router, Request, Response } from 'express';
import { getAllSiteData } from '../utils/siteData';

const router = Router();

// Get all site statistics (public endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await getAllSiteData();

    res.json({
      success: true,
      data: {
        totalResources: data.total_resources || 0,
        totalTutors: data.total_tutors || 0,
        totalDownloads: data.total_downloads || 0,
        totalUsers: data.total_users || 0
      }
    });
  } catch (error) {
    console.error('Error fetching site data:', error);
    res.status(500).json({ error: 'Failed to fetch site statistics' });
  }
});

export default router;
