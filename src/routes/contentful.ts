import { Router, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';

const router = Router();

// Contentful API configuration
const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_API_BASE = 'https://cdn.contentful.com';

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('❌ Missing Contentful configuration. Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN environment variables.');
}

// Create axios instance for Contentful API
const contentfulClient = axios.create({
  baseURL: `${CONTENTFUL_API_BASE}/spaces/${CONTENTFUL_SPACE_ID}`,
  headers: {
    'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Cache key generator
const generateCacheKey = (path: string, query: any): string => {
  const queryString = new URLSearchParams(query).toString();
  return `contentful:${path}:${queryString}`;
};

// Contentful proxy middleware
export const contentfulProxy = (cache: NodeCache) => {
  // Get all entries (your main data endpoint)
  router.get('/entries', async (req: Request, res: Response) => {
    try {
      const cacheKey = generateCacheKey('entries', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for entries');
        return res.json(cachedData);
      }

      console.log('🌐 Fetching entries from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/entries', {
        params: req.query
      });

      // Cache the response
      cache.set(cacheKey, response.data);
      console.log('💾 Cached entries response');

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching entries:', error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entries',
          status: error.response.status
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get specific entry by ID
  router.get('/entries/:entryId', async (req: Request, res: Response) => {
    try {
      const { entryId } = req.params;
      const cacheKey = generateCacheKey(`entries/${entryId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for entry ${entryId}`);
        return res.json(cachedData);
      }

      console.log(`🌐 Fetching entry ${entryId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/entries/${entryId}`, {
        params: req.query
      });

      // Cache the response
      cache.set(cacheKey, response.data);
      console.log(`💾 Cached entry ${entryId} response`);

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error fetching entry ${req.params.entryId}:`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entry',
          status: error.response.status
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get assets
  router.get('/assets', async (req: Request, res: Response) => {
    try {
      const cacheKey = generateCacheKey('assets', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for assets');
        return res.json(cachedData);
      }

      console.log('🌐 Fetching assets from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/assets', {
        params: req.query
      });

      // Cache the response
      cache.set(cacheKey, response.data);
      console.log('💾 Cached assets response');

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching assets:', error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch assets',
          status: error.response.status
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get specific asset by ID
  router.get('/assets/:assetId', async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const cacheKey = generateCacheKey(`assets/${assetId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for asset ${assetId}`);
        return res.json(cachedData);
      }

      console.log(`🌐 Fetching asset ${assetId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/assets/${assetId}`, {
        params: req.query
      });

      // Cache the response
      cache.set(cacheKey, response.data);
      console.log(`💾 Cached asset ${assetId} response`);

      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Error fetching asset ${req.params.assetId}:`, error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch asset',
          status: error.response.status
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get content types
  router.get('/content_types', async (req: Request, res: Response) => {
    try {
      const cacheKey = generateCacheKey('content_types', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for content types');
        return res.json(cachedData);
      }

      console.log('🌐 Fetching content types from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/content_types', {
        params: req.query
      });

      // Cache the response
      cache.set(cacheKey, response.data);
      console.log('💾 Cached content types response');

      res.json(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching content types:', error.message);
      
      if (error.response) {
        res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch content types',
          status: error.response.status
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Clear cache endpoint (for development/admin use)
  router.delete('/cache', (req: Request, res: Response) => {
    try {
      cache.flushAll();
      console.log('🗑️ Cache cleared');
      res.json({
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error clearing cache:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to clear cache'
      });
    }
  });

  // Cache stats endpoint
  router.get('/cache/stats', (req: Request, res: Response) => {
    try {
      const stats = cache.getStats();
      res.json({
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error getting cache stats:', error.message);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get cache stats'
      });
    }
  });

  return router;
};
