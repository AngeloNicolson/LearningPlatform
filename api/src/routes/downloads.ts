/**
 * @file downloads.ts
 * @author Angelo Nicolson
 * @brief Download history and analytics endpoints
 * @description Provides endpoints for tracking download events, retrieving user download history, and fetching popular downloads.
 * Implements analytics tracking for worksheet downloads, user-specific download history with pagination, and trending resources
 * based on download counts. Supports filtering popular downloads by time period and subject.
 */

import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { query } from '../database/connection';

const router = Router();

// Helper function to get client IP address
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Track a download event (supports both authenticated and anonymous users)
 * POST /api/downloads/track
 */
router.post('/track', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { resourceId, fileSize, downloadDurationMs } = req.body;
    const user = (req as any).user;
    const ipAddress = getClientIp(req);

    // Track with user_id if authenticated, otherwise with IP address
    if (user?.userId) {
      await query(
        `INSERT INTO user_downloads (user_id, resource_id, file_size, download_duration_ms, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.userId, resourceId, fileSize || null, downloadDurationMs || null, ipAddress]
      );
    } else {
      await query(
        `INSERT INTO user_downloads (ip_address, resource_id, file_size, download_duration_ms)
         VALUES ($1, $2, $3, $4)`,
        [ipAddress, resourceId, fileSize || null, downloadDurationMs || null]
      );
    }

    return res.json({ success: true, message: 'Download tracked' });
  } catch (error) {
    console.error('Error tracking download:', error);
    return res.status(500).json({ error: 'Failed to track download' });
  }
});

/**
 * Get user's download history
 * GET /api/downloads/history?limit=50&offset=0
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT
        ud.id,
        ud.resource_id,
        ud.downloaded_at,
        ud.file_size,
        sr.title,
        sr.description,
        sr.subject,
        sr.topic_name,
        sr.topic_icon,
        sr.resource_type,
        sr.grade_level
      FROM user_downloads ud
      LEFT JOIN subject_resources sr ON ud.resource_id = sr.id
      WHERE ud.user_id = $1
      ORDER BY ud.downloaded_at DESC
      LIMIT $2 OFFSET $3`,
      [user.userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM user_downloads WHERE user_id = $1',
      [user.userId]
    );

    return res.json({
      downloads: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching download history:', error);
    return res.status(500).json({ error: 'Failed to fetch download history' });
  }
});

/**
 * Get popular downloads (all time or recent)
 * GET /api/downloads/popular?limit=10&period=week&subject=math
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = req.query.period as string || 'all'; // 'all', 'week', 'month'
    const subject = req.query.subject as string;

    let queryStr: string;
    const params: any[] = [];

    if (period === 'week') {
      queryStr = `
        SELECT
          sr.id,
          sr.subject,
          sr.title,
          sr.description,
          sr.topic_name,
          sr.topic_icon,
          sr.resource_type,
          sr.grade_level,
          COUNT(ud.id) as download_count,
          COUNT(DISTINCT ud.user_id) as unique_users
        FROM subject_resources sr
        LEFT JOIN user_downloads ud ON sr.id = ud.resource_id
        WHERE sr.visible = true
          AND ud.downloaded_at > NOW() - INTERVAL '7 days'
      `;
    } else if (period === 'month') {
      queryStr = `
        SELECT
          sr.id,
          sr.subject,
          sr.title,
          sr.description,
          sr.topic_name,
          sr.topic_icon,
          sr.resource_type,
          sr.grade_level,
          COUNT(ud.id) as download_count,
          COUNT(DISTINCT ud.user_id) as unique_users
        FROM subject_resources sr
        LEFT JOIN user_downloads ud ON sr.id = ud.resource_id
        WHERE sr.visible = true
          AND ud.downloaded_at > NOW() - INTERVAL '30 days'
      `;
    } else {
      // All time
      queryStr = `
        SELECT * FROM popular_downloads
        WHERE 1=1
      `;
    }

    // Add subject filter if specified
    if (subject) {
      queryStr += ` AND sr.subject = $1`;
      params.push(subject);
    }

    // Add grouping for week/month queries
    if (period === 'week' || period === 'month') {
      queryStr += `
        GROUP BY sr.id, sr.subject, sr.title, sr.description, sr.topic_name, sr.topic_icon, sr.resource_type, sr.grade_level
        HAVING COUNT(ud.id) > 0
      `;
    }

    queryStr += ` ORDER BY download_count DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(queryStr, params);

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular downloads:', error);
    return res.status(500).json({ error: 'Failed to fetch popular downloads' });
  }
});

/**
 * Get download statistics for a specific resource
 * GET /api/downloads/stats/:resourceId
 */
router.get('/stats/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;

    const result = await query(
      `SELECT
        COUNT(*) as total_downloads,
        COUNT(DISTINCT user_id) as unique_users,
        MIN(downloaded_at) as first_download,
        MAX(downloaded_at) as last_download,
        AVG(download_duration_ms) as avg_duration_ms
      FROM user_downloads
      WHERE resource_id = $1`,
      [resourceId]
    );

    // Get downloads per day for the last 30 days
    const dailyStats = await query(
      `SELECT
        DATE(downloaded_at) as date,
        COUNT(*) as downloads
      FROM user_downloads
      WHERE resource_id = $1
        AND downloaded_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(downloaded_at)
      ORDER BY date ASC`,
      [resourceId]
    );

    return res.json({
      stats: result.rows[0],
      dailyStats: dailyStats.rows
    });
  } catch (error) {
    console.error('Error fetching download stats:', error);
    return res.status(500).json({ error: 'Failed to fetch download stats' });
  }
});

export default router;
