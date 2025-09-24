import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import { contentfulProxy } from './routes/contentful';
import { healthCheck } from './routes/health';

// Load environment variables
dotenv.config({ path: '.env' });

// Debug: Log environment variables (remove in production)
console.log('🔧 Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('CONTENTFUL_SPACE_ID:', process.env.CONTENTFUL_SPACE_ID ? '✅ Set' : '❌ Missing');
console.log('CONTENTFUL_ACCESS_TOKEN:', process.env.CONTENTFUL_ACCESS_TOKEN ? '✅ Set' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache configuration - 5 minutes TTL
const cache = new NodeCache({ stdTTL: 432000 }); // 5 days in seconds (5 * 24 * 60 * 60)

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.8.161:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Contentful-User-Agent',
    'X-Contentful-Content-Type',
    'X-Contentful-Space-Id',
    'X-Contentful-Environment-Id',
    'Accept',
    'Origin',
    'Referer',
    'User-Agent',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform'
  ]
}));

// Rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/api/health', healthCheck);
app.use('/api/contentful', contentfulProxy(cache));

// Also handle direct Contentful API paths (without /api/contentful prefix)
// This allows your frontend to use the same URLs as before, just pointing to your proxy
app.use('/', contentfulProxy(cache));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SoundTools Proxy Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Contentful proxy: http://localhost:${PORT}/api/contentful`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
