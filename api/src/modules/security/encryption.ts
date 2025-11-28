/**
 * @file encryption.ts
 * @description Encryption utilities for PII protection and compliance (GDPR, COPPA, Privacy Act)
 * @author System
 * @date 2025-11-08
 *
 * Provides AES-256-GCM encryption for Personally Identifiable Information (PII)
 * and SHA-256 hashing for lookups and anonymization.
 */

import crypto from 'crypto';

// Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const SALT_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * In production, use AWS KMS, HashiCorp Vault, or similar key management service
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Key should be 32 bytes (256 bits) hex string
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Get encryption salt from environment variable
 */
function getEncryptionSalt(): string {
  const salt = process.env.ENCRYPTION_SALT;
  if (!salt) {
    throw new Error('ENCRYPTION_SALT environment variable not set');
  }
  return salt;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  authTag: string; // Base64 encoded authentication tag
}

/**
 * Encrypt PII using AES-256-GCM
 *
 * @param plaintext - The plain text to encrypt
 * @returns Encrypted data with IV and auth tag
 *
 * @example
 * const encrypted = encryptPII('user@example.com');
 * // Store encrypted.encrypted, encrypted.iv, encrypted.authTag in database
 */
export function encryptPII(plaintext: string): EncryptedData {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

/**
 * Decrypt PII using AES-256-GCM
 *
 * @param encryptedData - The encrypted data object
 * @returns Decrypted plain text
 *
 * @example
 * const plaintext = decryptPII({
 *   encrypted: '...',
 *   iv: '...',
 *   authTag: '...'
 * });
 */
export function decryptPII(encryptedData: EncryptedData): string {
  if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
    throw new Error('Invalid encrypted data structure');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Create SHA-256 hash for lookup purposes (e.g., email_hash for finding users without decryption)
 *
 * @param value - The value to hash
 * @returns SHA-256 hash as hex string
 *
 * @example
 * const emailHash = hashForLookup('user@example.com');
 * // Store in users.email_hash column
 * // Use for WHERE email_hash = hashForLookup(loginEmail)
 */
export function hashForLookup(value: string): string {
  if (!value) {
    throw new Error('Cannot hash empty string');
  }

  const salt = getEncryptionSalt();
  return crypto
    .createHash('sha256')
    .update(value + salt)
    .digest('hex');
}

/**
 * Hash IP address for privacy (one-way hash for audit logs)
 *
 * @param ip - IP address to hash
 * @returns SHA-256 hash as hex string
 *
 * @example
 * const hashedIP = hashIP(req.ip);
 * // Store in audit_logs.ip_address_hash
 */
export function hashIP(ip: string): string {
  if (!ip) {
    return '';
  }

  // Normalize IPv6 addresses
  const normalizedIP = ip.replace(/^::ffff:/, '');

  const salt = getEncryptionSalt();
  return crypto
    .createHash('sha256')
    .update(normalizedIP + salt + 'IP')
    .digest('hex');
}

/**
 * Hash user ID for anonymized logging
 *
 * @param userId - User ID to hash
 * @returns Truncated SHA-256 hash (12 characters)
 *
 * @example
 * const anonymousId = hashUserId(123);
 * console.log(`User ${anonymousId} logged in`); // User a3b5c7d9e1f2 logged in
 */
export function hashUserId(userId: number | string): string {
  if (!userId) {
    return 'unknown';
  }

  const salt = getEncryptionSalt();
  return crypto
    .createHash('sha256')
    .update(userId.toString() + salt + 'USER')
    .digest('hex')
    .substring(0, 12);
}

/**
 * Generate a cryptographically secure random token
 * Useful for email verification tokens, password reset tokens, etc.
 *
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex string token
 *
 * @example
 * const resetToken = generateSecureToken();
 * // Returns 64-character hex string
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate encryption key (for setup/initialization only)
 * DO NOT use this in production code - generate once and store securely
 *
 * @returns 32-byte (256-bit) key as hex string
 *
 * @example
 * // Run once to generate key, then add to .env
 * console.log('ENCRYPTION_KEY=' + generateEncryptionKey());
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate encryption salt (for setup/initialization only)
 * DO NOT use this in production code - generate once and store securely
 *
 * @returns Random salt string
 *
 * @example
 * // Run once to generate salt, then add to .env
 * console.log('ENCRYPTION_SALT=' + generateEncryptionSalt());
 */
export function generateEncryptionSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * Test encryption/decryption roundtrip
 * Useful for verifying encryption configuration
 *
 * @returns true if encryption works correctly
 */
export function testEncryption(): boolean {
  try {
    const testData = 'test@example.com';
    const encrypted = encryptPII(testData);
    const decrypted = decryptPII(encrypted);
    return testData === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
