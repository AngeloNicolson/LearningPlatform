import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { query } from '../database/connection';

const router = Router();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';

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
    body('lastName').trim().notEmpty(),
    body('role').isIn(['personal', 'parent', 'tutor']).optional()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, role = 'personal' } = req.body;
      
      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user with appropriate role and status
      const userRole = role === 'tutor' ? 'tutor' : role;
      const accountStatus = role === 'tutor' ? 'pending' : 'active';
      const result = await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, account_status, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [email, passwordHash, firstName, lastName, userRole, accountStatus, false]);
      
      const userId = result.rows[0].id;
      
      // If tutor, create pending tutor profile
      if (role === 'tutor') {
        await query(`
          INSERT INTO tutors (user_id, display_name, bio, subjects, grades, hourly_rate, approval_status)
          VALUES ($1, $2, '', '[]'::jsonb, '{}', 0, 'pending')
        `, [userId, `${firstName} ${lastName}`]);
        
        // Auto-login tutor to complete profile
        const accessToken = jwt.sign(
          { userId, email, role: 'tutor' },
          JWT_ACCESS_SECRET,
          { expiresIn: '15m' }
        );
        
        res.cookie('access-token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000
        });
        
        return res.status(201).json({
          message: 'Tutor account created. Please complete your profile.',
          user: { 
            id: userId,
            email, 
            firstName, 
            lastName, 
            role: 'tutor',
            needsOnboarding: true 
          }
        });
      }
      
      // For students/parents, just return success
      return res.status(201).json({
        message: 'Account created successfully. Please login.',
        user: { email, firstName, lastName, role }
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

      // Get user from database
      const result = await query(`
        SELECT id, email, password_hash, first_name, last_name, role, account_status
        FROM users
        WHERE email = $1
      `, [email]);

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check account status - only block suspended accounts
      if (user.account_status === 'suspended') {
        return res.status(403).json({ 
          message: 'Account is suspended. Please contact support for assistance.' 
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens with role and account status
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, accountStatus: user.account_status },
        process.env.JWT_ACCESS_SECRET || 'access-secret',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      // Set cookies with tokens
      res.cookie('access-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return user data with role and status info
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          accountStatus: user.account_status
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Login failed' });
    }
  }
);

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('access-token');
  res.clearCookie('refresh-token');
  return res.json({ message: 'Logged out successfully' });
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies['refresh-token'];
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;
    
    // Get updated user info
    const result = await query(`
      SELECT id, email, role, account_status 
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, accountStatus: user.account_status },
      process.env.JWT_ACCESS_SECRET || 'access-secret',
      { expiresIn: '15m' }
    );

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    return res.json({ 
      message: 'Token refreshed',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.account_status
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;