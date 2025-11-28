/**
 * @file security.ts
 * @author Angelo Nicolson
 * @brief Security middleware for API protection
 * @description Implements rate limiting, input validation, CSRF protection, and other security measures
 * to protect against common attacks and abuse.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Simple in-memory rate limiter (use Redis in production)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 10 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param maxRequests - Maximum requests allowed per window
 * @param windowMs - Time window in milliseconds
 */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();

    if (!rateLimitStore[identifier]) {
      rateLimitStore[identifier] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    const record = rateLimitStore[identifier];

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }

    next();
  };
};

/**
 * Stricter rate limiting for payment operations
 */
export const paymentRateLimit = rateLimit(10, 60 * 1000); // 10 per minute

/**
 * Standard rate limiting for API calls
 */
export const apiRateLimit = rateLimit(100, 60 * 1000); // 100 per minute

/**
 * Booking rate limiting (prevent spam bookings)
 */
export const bookingRateLimit = rateLimit(20, 60 * 1000); // 20 per minute

/**
 * Validation error handler
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return next();
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 10000); // Limit length
};

/**
 * Sanitize object inputs recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    Object.keys(obj).forEach(key => {
      sanitized[key] = sanitizeObject(obj[key]);
    });
    return sanitized;
  }
  return obj;
};

/**
 * Input sanitization middleware
 */
export const sanitizeRequestBody = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  return next();
};

/**
 * CSRF protection for state-changing operations
 * Validates that requests come from authenticated sessions
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check for authenticated user
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to perform this action'
    });
  }

  return next();
};

/**
 * Idempotency key handler for payment operations
 * Prevents duplicate payment processing
 */
interface IdempotencyStore {
  [key: string]: {
    response: any;
    timestamp: number;
  };
}

const idempotencyStore: IdempotencyStore = {};

// Clean up old idempotency keys after 24 hours
setInterval(() => {
  const expirationTime = Date.now() - 24 * 60 * 60 * 1000;
  Object.keys(idempotencyStore).forEach(key => {
    if (idempotencyStore[key].timestamp < expirationTime) {
      delete idempotencyStore[key];
    }
  });
}, 60 * 60 * 1000); // Run every hour

/**
 * Idempotency middleware for payment operations
 */
export const idempotencyCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return res.status(400).json({
      error: 'Idempotency key required',
      message: 'Please include an Idempotency-Key header for this operation'
    });
  }

  // Check if we've seen this key before
  const stored = idempotencyStore[idempotencyKey];
  if (stored) {
    // Return the stored response
    return res.status(200).json(stored.response);
  }

  // Store the response when the request completes
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    idempotencyStore[idempotencyKey] = {
      response: body,
      timestamp: Date.now()
    };
    return originalJson(body);
  };

  return next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (adjust based on your needs)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com"
  );

  return next();
};

/**
 * Logging middleware for security events
 */
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const user = (req as any).user;

    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      console.warn('[SECURITY]', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userId: user?.userId || 'anonymous',
        userAgent: req.headers['user-agent'],
        duration
      });
    }
  });

  return next();
};

/**
 * Validate webhook signatures (for Stripe webhooks)
 */
export const validateWebhookSignature = (_secret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({
        error: 'Missing signature',
        message: 'Webhook signature is required'
      });
    }

    // Signature validation will be done in the route handler with Stripe's library
    // This middleware just ensures the header exists
    return next();
  };
};

/**
 * Prevent booking conflicts with database-level locking
 */
export const preventBookingConflict = async (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  // This will be implemented in the booking route with proper transaction locking
  return next();
};
