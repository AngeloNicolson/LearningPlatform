import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import tutorRoutes from './routes/tutors';
import bookingRoutes from './routes/bookings';
import teacherRoutes from './routes/teachers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - supports both HTTP and HTTPS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://127.0.0.1:5173',
      'https://127.0.0.1:5173'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/resources', require('./routes/resources').default);

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
  // Check for certificates
  const keyPath = path.resolve('/app/certs/localhost-key.pem');
  const certPath = path.resolve('/app/certs/localhost.pem');
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🔒 API server running on https://localhost:${PORT} (HTTPS)`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } else {
    console.warn('⚠️  HTTPS certificates not found, falling back to HTTP');
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