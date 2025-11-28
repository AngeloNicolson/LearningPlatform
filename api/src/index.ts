/**
 * @file index.ts
 * @author Angelo Nicolson
 * @brief Express API server entry point with HTTPS support and security middleware
 * @description Main entry point for the tutoring platform API server. Configures Express with security middleware (Helmet, CORS),
 * rate limiting, cookie parsing, and mounts all application routes. Supports both HTTP and HTTPS modes with automatic certificate
 * detection for local development and containerized deployments. Includes comprehensive error handling and health check endpoints.
 */

import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import tutorRoutes from './routes/tutors';
import bookingRoutes from './routes/bookings';
import bookingsSecureRoutes from './routes/bookings-secure';
import paymentsRoutes from './routes/payments';
import teacherRoutes from './routes/teachers';
import userRoutes from './routes/users';
import subjectResourcesRoutes from './routes/subjectResources';
import subjectsRoutes from './routes/subjects';
import adminSubjectsRoutes from './routes/admin/subjects';
import topicsRoutes from './routes/topics';
import uploadsRoutes from './routes/uploads';
import downloadsRoutes from './routes/downloads';
import siteDataRoutes from './routes/siteData';
import reviewsRoutes from './routes/reviews';
import sessionTypesRoutes from './routes/sessionTypes';
import availabilityRoutes from './routes/availability';
import { securityHeaders, securityLogger } from './middleware/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3777;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://localhost:*", "http://localhost:*"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - supports both HTTP and HTTPS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5777',
      'https://localhost:5777',
      'http://127.0.0.1:5777',
      'https://127.0.0.1:5777'
    ];

    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Stripe webhook needs raw body - must come before json parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security middleware
app.use(securityHeaders);
app.use(securityLogger);

// Global rate limiter - more permissive in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 in dev, 100 in prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes); // Legacy booking routes (deprecated)
app.use('/api/bookings-secure', bookingsSecureRoutes); // New secure booking system
app.use('/api/payments', paymentsRoutes); // Stripe payment processing
app.use('/api/teachers', teacherRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectsRoutes); // Subjects and subject levels
app.use('/api/admin/subjects', adminSubjectsRoutes); // Admin CRUD for subjects, levels, topics
app.use('/api/resources', subjectResourcesRoutes); // Use new subject resources router
app.use('/api/topics', topicsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/site-data', siteDataRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/session-types', sessionTypesRoutes);
app.use('/api/availability', availabilityRoutes); // Tutor availability and slot management

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server with HTTPS support in production-like mode
if (USE_HTTPS) {
  // Check for certificates - configurable via environment variables
  // Defaults to Docker path (/app/certs/), but can be overridden for local dev
  const keyPath = process.env.CERT_KEY_PATH || '/app/certs/localhost-key.pem';
  const certPath = process.env.CERT_PATH || '/app/certs/localhost.pem';

  console.log(`🔍 Checking for HTTPS certificates...`);
  console.log(`   Key:  ${keyPath}`);
  console.log(`   Cert: ${certPath}`);

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🔒 API server running on https://localhost:${PORT} (HTTPS)`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   ✅ Using certificates from ${certPath}`);
    });
  } else {
    console.warn('⚠️  HTTPS certificates not found at specified paths');
    console.warn(`   Missing: ${!fs.existsSync(keyPath) ? keyPath : ''} ${!fs.existsSync(certPath) ? certPath : ''}`);
    console.warn('⚠️  Falling back to HTTP');
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT} (HTTP)`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
} else {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT} (HTTP)`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}