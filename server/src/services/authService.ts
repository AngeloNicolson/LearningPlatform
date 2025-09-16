import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../database';
import crypto from 'crypto';

interface UserCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly SALT_ROUNDS = 12;
  
  static async register(credentials: UserCredentials & { firstName: string; lastName: string }) {
    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [credentials.email]);
    
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(credentials.password, this.SALT_ROUNDS);
    
    // Insert user
    const result = await query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email
    `, [
      credentials.email.toLowerCase(),
      passwordHash,
      credentials.firstName,
      credentials.lastName
    ]);
    
    const userId = result.rows[0].id;
    
    // Log security event
    this.logSecurityEvent(userId, 'USER_REGISTERED');
    
    return {
      id: userId,
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName
    };
  }
  
  static async login(credentials: UserCredentials) {
    const { email, password } = credentials;
    
    // Get user with security check
    const result = await query(`
      SELECT id, email, password_hash, first_name, last_name, role, 
             failed_login_attempts, account_locked_until
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase()]);
    
    const user = result.rows[0];
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check account lock
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      await this.handleFailedLogin(user.id);
      throw new Error('Invalid credentials');
    }
    
    // Reset failed attempts on successful login
    await query(`
      UPDATE users 
      SET failed_login_attempts = 0, 
          account_locked_until = NULL,
          last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user.id]);
    
    // Generate tokens
    const tokens = this.generateTokens(user);
    
    // Log security event
    this.logSecurityEvent(user.id, 'USER_LOGIN_SUCCESS');
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      ...tokens
    };
  }
  
  static async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret-key'
      ) as any;
      
      // Get user
      const result = await query(`
        SELECT id, email, first_name, last_name, role
        FROM users 
        WHERE id = $1
      `, [decoded.userId]);
      
      const user = result.rows[0];
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new tokens
      const tokens = this.generateTokens(user);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        ...tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Get user
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    
    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newPasswordHash, userId]);
    
    // Log security event
    this.logSecurityEvent(userId, 'PASSWORD_CHANGED');
    
    return { success: true };
  }
  
  static async requestPasswordReset(email: string) {
    // Check if user exists
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token
    await query(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE 
      SET token = $2, expires_at = $3
    `, [user.id, resetToken, resetExpiry]);
    
    // Log security event
    this.logSecurityEvent(user.id, 'PASSWORD_RESET_REQUESTED');
    
    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    return { 
      message: 'If the email exists, a reset link has been sent',
      // Only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };
  }
  
  static async resetPassword(token: string, newPassword: string) {
    // Get reset request
    const result = await query(`
      SELECT user_id 
      FROM password_resets 
      WHERE token = $1 AND expires_at > NOW()
    `, [token]);
    
    const reset = result.rows[0];
    
    if (!reset) {
      throw new Error('Invalid or expired reset token');
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    
    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [passwordHash, reset.user_id]);
    
    // Delete reset token
    await query('DELETE FROM password_resets WHERE user_id = $1', [reset.user_id]);
    
    // Log security event
    this.logSecurityEvent(reset.user_id, 'PASSWORD_RESET_COMPLETED');
    
    return { success: true };
  }
  
  private static generateTokens(user: any): TokenPair {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
    
    return { accessToken, refreshToken };
  }
  
  private static async handleFailedLogin(userId: number) {
    // Increment failed attempts
    const result = await query(`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          last_failed_attempt = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING failed_login_attempts
    `, [userId]);
    
    const attempts = result.rows[0].failed_login_attempts;
    
    // Lock account after 5 attempts
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 1800000); // 30 minutes
      await query(`
        UPDATE users 
        SET account_locked_until = $1 
        WHERE id = $2
      `, [lockUntil, userId]);
      
      this.logSecurityEvent(userId, 'ACCOUNT_LOCKED');
    } else {
      this.logSecurityEvent(userId, 'LOGIN_FAILED');
    }
  }
  
  private static async logSecurityEvent(userId: number, eventType: string, details?: any) {
    try {
      await query(`
        INSERT INTO security_logs (user_id, event_type, details)
        VALUES ($1, $2, $3)
      `, [userId, eventType, JSON.stringify(details || {})]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}