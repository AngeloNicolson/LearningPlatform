import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Registration endpoint
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Hash password
      const saltRounds = 12;
      // Hash password - will be used when saving to database
      await bcrypt.hash(password, saltRounds);

      // TODO: Save user to database
      // For now, return success
      return res.status(201).json({
        message: 'User registered successfully',
        user: { email, firstName, lastName }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed' });
    }
  }
);

// Login endpoint
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Mock user database with roles
      const users: any = {
        'owner@example.com': { password: 'Owner123!', role: 'owner', firstName: 'Platform', lastName: 'Owner', id: '1' },
        'admin@example.com': { password: 'Demo123!', role: 'admin', firstName: 'Admin', lastName: 'User', id: '2' },
        'teacher@example.com': { password: 'Teacher123!', role: 'teacher', firstName: 'Jane', lastName: 'Smith', id: '3' },
        'parent@example.com': { password: 'Parent123!', role: 'parent', firstName: 'John', lastName: 'Doe', id: '4' },
        'student@example.com': { password: 'Demo123!', role: 'student', firstName: 'Jimmy', lastName: 'Doe', id: '5' },
        'demo@example.com': { password: 'Demo123!', role: 'student', firstName: 'Demo', lastName: 'User', id: '6' }
      };

      const user = users[email];
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens with role
      const accessToken = jwt.sign(
        { userId: user.id, email, role: user.role },
        process.env.JWT_ACCESS_SECRET || 'access-secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, email },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      // Set secure cookies
      res.cookie('access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.json({
        message: 'Login successful',
        user: { 
          email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed' });
    }
  }
);

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies['refresh-token'];
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as any;

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_ACCESS_SECRET || 'access-secret',
      { expiresIn: '15m' }
    );

    // Set new access token cookie
    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('access-token');
  res.clearCookie('refresh-token', { path: '/api/auth/refresh' });
  return res.json({ message: 'Logged out successfully' });
});

export default router;