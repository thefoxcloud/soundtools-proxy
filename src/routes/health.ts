import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Basic health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Test Contentful connection if credentials are available
    if (process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN) {
      try {
        const contentfulTest = await axios.get(
          `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/entries?limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`
            },
            timeout: 5000
          }
        );
        
        healthData['contentful'] = {
          status: 'connected',
          responseTime: Date.now() - startTime,
          spaceId: process.env.CONTENTFUL_SPACE_ID
        };
      } catch (error: any) {
        healthData['contentful'] = {
          status: 'error',
          error: error.message,
          responseTime: Date.now() - startTime
        };
      }
    } else {
      healthData['contentful'] = {
        status: 'not_configured',
        message: 'Contentful credentials not set'
      };
    }

    res.json(healthData);
  } catch (error: any) {
    console.error('❌ Health check error:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with more system information
router.get('/detailed', (req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        hasContentfulSpaceId: !!process.env.CONTENTFUL_SPACE_ID,
        hasContentfulAccessToken: !!process.env.CONTENTFUL_ACCESS_TOKEN
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(healthData);
  } catch (error: any) {
    console.error('❌ Detailed health check error:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthCheck };
