import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Check for token in cookies (matching what auth.ts sets)
    const token = req.cookies?.['access-token'];
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token;
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
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