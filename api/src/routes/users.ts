/**
 * @file users.ts
 * @author Angelo Nicolson
 * @brief User management and parent-child account endpoints
 * @description Handles user profile management and parent-child account relationships. Provides endpoints for creating child accounts
 * (parent-only), managing user profiles, password updates, viewing parent information, and managing parent-child relationships.
 * Implements role-based access control ensuring parents can only manage their own children's accounts and includes comprehensive
 * validation for all user operations.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { query } from '../database/connection';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Create child account (parent only)
router.post('/create-child',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('grade').trim().optional(),
    body('birthdate').isISO8601().optional()
  ],
  async (req: AuthRequest, res: Response) => {
    // Check if user is a parent
    if (req.user?.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can create child accounts' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, grade } = req.body;
      const parentId = req.user.userId;

      // Check if email already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create child account
      const result = await query(`
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          role,
          account_status,
          email_verified
        ) VALUES ($1, $2, $3, $4, 'personal', 'active', false)
        RETURNING id, email, first_name, last_name
      `, [email, passwordHash, firstName, lastName]);

      const childId = result.rows[0].id;

      // Create parent-child relationship
      await query(`
        INSERT INTO user_relationships (parent_user_id, child_user_id, relationship_type)
        VALUES ($1, $2, 'parent')
      `, [parentId, childId]);

      return res.json({
        message: 'Child account created successfully',
        child: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          grade,
          parentId
        }
      });
    } catch (error) {
      console.error('Error creating child account:', error);
      return res.status(500).json({ message: 'Failed to create child account' });
    }
  }
);

// Get all children for a parent
router.get('/children', async (req: AuthRequest, res: Response) => {
  // Check if user is a parent
  if (req.user?.role !== 'parent') {
    return res.status(403).json({ error: 'Only parents can view child accounts' });
  }

  try {
    const result = await query(`
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at,
        u.last_login_at
      FROM users u
      INNER JOIN user_relationships ur ON u.id = ur.child_user_id
      WHERE ur.parent_user_id = $1
      ORDER BY u.created_at DESC
    `, [req.user.userId]);

    return res.json(result.rows.map(child => ({
      id: child.id,
      email: child.email,
      firstName: child.first_name,
      lastName: child.last_name,
      createdAt: child.created_at,
      lastLoginAt: child.last_login_at
    })));
  } catch (error) {
    console.error('Error fetching children:', error);
    return res.status(500).json({ message: 'Failed to fetch children' });
  }
});

// Get user profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        email_verified,
        last_login_at
      FROM users
      WHERE id = $1
    `, [req.user?.userId]);

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile',
  [
    body('firstName').trim().optional(),
    body('lastName').trim().optional(),
    body('currentPassword').optional(),
    body('newPassword').isLength({ min: 8 }).optional()
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      // If changing password, verify current password
      if (currentPassword && newPassword) {
        const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        
        await query(
          'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [passwordHash, userId]
        );
      }

      // Update profile fields
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (firstName) {
        updates.push(`first_name = $${paramIndex++}`);
        params.push(firstName);
      }
      if (lastName) {
        updates.push(`last_name = $${paramIndex++}`);
        params.push(lastName);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);
        
        await query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
          params
        );
      }

      return res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  }
);

// Reset child account password (parent only)
router.post('/children/:childId/reset-password', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'parent') {
    return res.status(403).json({ error: 'Only parents can reset child passwords' });
  }

  try {
    const { childId } = req.params;
    const { password } = req.body;
    const parentId = req.user.userId;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Verify the child belongs to this parent
    const result = await query(`
      SELECT u.id
      FROM users u
      INNER JOIN user_relationships ur ON u.id = ur.child_user_id
      WHERE u.id = $1 AND ur.parent_user_id = $2
    `, [childId, parentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child account not found' });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, childId]
    );

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting child password:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Delete child account (parent only)
router.delete('/children/:childId', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'parent') {
    return res.status(403).json({ error: 'Only parents can delete child accounts' });
  }

  try {
    const { childId } = req.params;
    const parentId = req.user.userId;

    // Verify the child belongs to this parent
    const result = await query(`
      SELECT u.id
      FROM users u
      INNER JOIN user_relationships ur ON u.id = ur.child_user_id
      WHERE u.id = $1 AND ur.parent_user_id = $2
    `, [childId, parentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child account not found' });
    }

    // Delete the child account
    await query('DELETE FROM users WHERE id = $1', [childId]);

    return res.json({ message: 'Child account deleted successfully' });
  } catch (error) {
    console.error('Error deleting child account:', error);
    return res.status(500).json({ message: 'Failed to delete child account' });
  }
});

// Get parent information (for children)
router.get('/parent', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'personal') {
    return res.status(403).json({ error: 'Only child accounts can view parent information' });
  }

  try {
    // Get parent from user_relationships
    const relationshipResult = await query(`
      SELECT parent_user_id
      FROM user_relationships
      WHERE child_user_id = $1
      LIMIT 1
    `, [req.user.userId]);

    if (relationshipResult.rows.length === 0) {
      return res.status(404).json({ message: 'No parent account linked' });
    }

    const parentId = relationshipResult.rows[0].parent_user_id;

    // Get parent information
    const parentResult = await query(`
      SELECT 
        id,
        email,
        first_name,
        last_name
      FROM users
      WHERE id = $1
    `, [parentId]);

    const parent = parentResult.rows[0];
    if (!parent) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    return res.json({
      id: parent.id,
      email: parent.email,
      firstName: parent.first_name,
      lastName: parent.last_name
    });
  } catch (error) {
    console.error('Error fetching parent:', error);
    return res.status(500).json({ message: 'Failed to fetch parent information' });
  }
});

export default router;