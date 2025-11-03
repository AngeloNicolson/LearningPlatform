/**
 * @file auth.ts
 * @author Angelo Nicolson
 * @brief JWT-based authentication and authorization middleware
 * @description Provides authentication and authorization middleware for protecting API routes. Implements JWT token
 * verification with blacklist checking for revoked tokens, optional authentication for public endpoints, and role-based
 * access control. Extends Express Request with user information from decoded JWT tokens for downstream route handlers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for token in cookies (matching what auth.ts sets)
    const token = req.cookies?.['access-token'];

    console.log('Auth check - Cookies:', req.cookies);
    console.log('Auth check - Token present:', !!token);

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if token is blacklisted
    if (decoded.jti) {
      const blacklistCheck = await query(
        'SELECT 1 FROM token_blacklist WHERE token_jti = $1 LIMIT 1',
        [decoded.jti]
      );

      if (blacklistCheck.rows.length > 0) {
        res.status(401).json({ error: 'Token has been revoked' });
        return;
      }
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Fix: Use same cookie name as requireAuth
    const token = req.cookies?.['access-token'];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Check if token is blacklisted
      if (decoded.jti) {
        const blacklistCheck = await query(
          'SELECT 1 FROM token_blacklist WHERE token_jti = $1 LIMIT 1',
          [decoded.jti]
        );

        if (blacklistCheck.rows.length === 0) {
          // Only set user if token is not blacklisted
          req.user = decoded;
        }
      } else {
        // Old token without JTI, allow it for backward compatibility
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Token is invalid but we continue anyway since auth is optional
    next();
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};