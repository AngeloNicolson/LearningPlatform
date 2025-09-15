import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../database';
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
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(credentials.email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(credentials.password, this.SALT_ROUNDS);
    
    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `).run(
      credentials.email.toLowerCase(),
      passwordHash,
      credentials.firstName,
      credentials.lastName
    );
    
    // Log security event
    this.logSecurityEvent(result.lastInsertRowid as number, 'USER_REGISTERED');
    
    return {
      id: result.lastInsertRowid,
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName
    };
  }
  
  static async login(credentials: UserCredentials, ipAddress?: string, userAgent?: string) {
    const user = db.prepare(`
      SELECT id, email, password_hash, first_name, last_name, 
             failed_login_attempts, account_locked_until
      FROM users 
      WHERE email = ?
    `).get(credentials.email.toLowerCase()) as any;
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      throw new Error('Account is locked. Please try again later.');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    
    if (!isValid) {
      // Increment failed attempts
      this.handleFailedLogin(user.id);
      throw new Error('Invalid credentials');
    }
    
    // Reset failed attempts on successful login
    db.prepare(`
      UPDATE users 
      SET failed_login_attempts = 0,
          last_login_at = CURRENT_TIMESTAMP,
          last_login_ip = ?,
          last_login_user_agent = ?
      WHERE id = ?
    `).run(ipAddress || null, userAgent || null, user.id);
    
    // Generate tokens
    const tokens = this.generateTokens(user);
    
    // Store refresh token
    this.storeRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent);
    
    // Log security event
    this.logSecurityEvent(user.id, 'USER_LOGIN', ipAddress, userAgent);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      tokens
    };
  }
  
  static async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = this.hashToken(refreshToken);
    
    const storedToken = db.prepare(`
      SELECT rt.*, u.id as user_id, u.email, u.first_name, u.last_name
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = ? AND rt.expires_at > datetime('now')
    `).get(tokenHash) as any;
    
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }
    
    // Check for token reuse (possible theft)
    const familyTokens = db.prepare(`
      SELECT id FROM refresh_tokens 
      WHERE family_id = ? AND id != ?
    `).all(storedToken.family_id, storedToken.id);
    
    if (familyTokens.length > 0) {
      // Token family has been reused - invalidate all tokens
      db.prepare('DELETE FROM refresh_tokens WHERE family_id = ?').run(storedToken.family_id);
      this.logSecurityEvent(storedToken.user_id, 'TOKEN_REUSE_DETECTED', ipAddress, userAgent);
      throw new Error('Token reuse detected. Please login again.');
    }
    
    // Delete old token
    db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(storedToken.id);
    
    // Generate new tokens
    const user = {
      id: storedToken.user_id,
      email: storedToken.email,
      first_name: storedToken.first_name,
      last_name: storedToken.last_name
    };
    
    const tokens = this.generateTokens(user);
    
    // Store new refresh token with same family ID
    this.storeRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent, storedToken.family_id);
    
    return tokens;
  }
  
  static logout(userId: number) {
    // Remove all refresh tokens for user
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
    
    // Log security event
    this.logSecurityEvent(userId, 'USER_LOGOUT');
  }
  
  private static generateTokens(user: any): TokenPair {
    const accessToken = jwt.sign(
      {
        sub: user.id.toString(),
        email: user.email,
        roles: ['user']
      },
      process.env.JWT_ACCESS_SECRET || 'access-secret',
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
      {
        sub: user.id.toString(),
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
    
    return { accessToken, refreshToken };
  }
  
  private static storeRefreshToken(
    userId: number, 
    token: string, 
    ipAddress?: string, 
    userAgent?: string,
    familyId?: string
  ) {
    const tokenHash = this.hashToken(token);
    const newFamilyId = familyId || crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    db.prepare(`
      INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      tokenHash,
      newFamilyId,
      expiresAt.toISOString(),
      ipAddress || null,
      userAgent || null
    );
  }
  
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  
  private static handleFailedLogin(userId: number) {
    const result = db.prepare(`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          last_failed_attempt = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING failed_login_attempts
    `).get(userId) as any;
    
    // Lock account after 5 failed attempts
    if (result.failed_login_attempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
      
      db.prepare(`
        UPDATE users 
        SET account_locked_until = ?
        WHERE id = ?
      `).run(lockUntil.toISOString(), userId);
      
      this.logSecurityEvent(userId, 'ACCOUNT_LOCKED');
    }
  }
  
  private static logSecurityEvent(
    userId: number, 
    eventType: string, 
    ipAddress?: string, 
    userAgent?: string,
    metadata?: any
  ) {
    db.prepare(`
      INSERT INTO security_audit_log (user_id, event_type, ip_address, user_agent, metadata)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId,
      eventType,
      ipAddress || null,
      userAgent || null,
      metadata ? JSON.stringify(metadata) : null
    );
  }
}

export default AuthService;