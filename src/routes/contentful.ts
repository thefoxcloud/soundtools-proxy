import { Router, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';

const router = Router();

// Contentful API configuration
const CONTENTFUL_API_BASE = 'https://cdn.contentful.com';

// Function to create Contentful client
const createContentfulClient = () => {
  const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
    console.error('❌ Missing Contentful configuration. Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN environment variables.');
    return null;
  }

  return axios.create({
    baseURL: `${CONTENTFUL_API_BASE}/spaces/${CONTENTFUL_SPACE_ID}`,
    headers: {
      'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  });
};

// Cache key generator
const generateCacheKey = (path: string, query: any): string => {
  const queryString = new URLSearchParams(query).toString();
  return `contentful:${path}:${queryString}`;
};

// URL transformation function to replace Contentful media URLs
const transformContentfulUrls = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Replace images.ctfassets.net with images.soundtools.com
    return data.replace(/images\.ctfassets\.net/g, 'images.soundtools.com');
  }

  if (Array.isArray(data)) {
    return data.map(item => transformContentfulUrls(item));
  }

  if (typeof data === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformContentfulUrls(value);
    }
    return transformed;
  }

  return data;
};

// Contentful proxy middleware
export const contentfulProxy = (cache: NodeCache) => {
  // Handle full Contentful API paths like /spaces/{spaceId}/environments/{environment}/entries
  router.get('/spaces/:spaceId/environments/:environment/entries', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { spaceId, environment } = req.params;
      const cacheKey = generateCacheKey(`spaces/${spaceId}/environments/${environment}/entries`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for entries');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching entries from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/entries', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached entries response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching entries:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entries',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Handle specific entry by ID with full path
  router.get('/spaces/:spaceId/environments/:environment/entries/:entryId', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { spaceId, environment, entryId } = req.params;
      const cacheKey = generateCacheKey(`spaces/${spaceId}/environments/${environment}/entries/${entryId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for entry ${entryId}`);
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log(`🌐 Fetching entry ${entryId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/entries/${entryId}`, {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log(`💾 Cached entry ${entryId} response`);

      return res.json(transformedData);
    } catch (error: any) {
      console.error(`❌ Error fetching entry ${req.params.entryId}:`, error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entry',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Handle assets with full path
  router.get('/spaces/:spaceId/environments/:environment/assets', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { spaceId, environment } = req.params;
      const cacheKey = generateCacheKey(`spaces/${spaceId}/environments/${environment}/assets`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for assets');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching assets from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/assets', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached assets response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching assets:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch assets',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Handle specific asset by ID with full path
  router.get('/spaces/:spaceId/environments/:environment/assets/:assetId', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { spaceId, environment, assetId } = req.params;
      const cacheKey = generateCacheKey(`spaces/${spaceId}/environments/${environment}/assets/${assetId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for asset ${assetId}`);
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log(`🌐 Fetching asset ${assetId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/assets/${assetId}`, {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log(`💾 Cached asset ${assetId} response`);

      return res.json(transformedData);
    } catch (error: any) {
      console.error(`❌ Error fetching asset ${req.params.assetId}:`, error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch asset',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Handle content types with full path
  router.get('/spaces/:spaceId/environments/:environment/content_types', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { spaceId, environment } = req.params;
      const cacheKey = generateCacheKey(`spaces/${spaceId}/environments/${environment}/content_types`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for content types');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching content types from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/content_types', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached content types response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching content types:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch content types',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Keep the simplified endpoints for backward compatibility
  // Get all entries (your main data endpoint)
  router.get('/entries', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const cacheKey = generateCacheKey('entries', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for entries');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching entries from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/entries', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached entries response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching entries:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entries',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get specific entry by ID
  router.get('/entries/:entryId', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { entryId } = req.params;
      const cacheKey = generateCacheKey(`entries/${entryId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for entry ${entryId}`);
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log(`🌐 Fetching entry ${entryId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/entries/${entryId}`, {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log(`💾 Cached entry ${entryId} response`);

      return res.json(transformedData);
    } catch (error: any) {
      console.error(`❌ Error fetching entry ${req.params.entryId}:`, error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch entry',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get assets
  router.get('/assets', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const cacheKey = generateCacheKey('assets', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for assets');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching assets from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/assets', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached assets response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching assets:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch assets',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get specific asset by ID
  router.get('/assets/:assetId', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const { assetId } = req.params;
      const cacheKey = generateCacheKey(`assets/${assetId}`, req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for asset ${assetId}`);
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log(`🌐 Fetching asset ${assetId} from Contentful`);
      const response: AxiosResponse = await contentfulClient.get(`/assets/${assetId}`, {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log(`💾 Cached asset ${assetId} response`);

      return res.json(transformedData);
    } catch (error: any) {
      console.error(`❌ Error fetching asset ${req.params.assetId}:`, error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch asset',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Get content types
  router.get('/content_types', async (req: Request, res: Response) => {
    try {
      const contentfulClient = createContentfulClient();
      if (!contentfulClient) {
        return res.status(500).json({
          error: 'Server Configuration Error',
          message: 'Contentful client not configured'
        });
      }

      const cacheKey = generateCacheKey('content_types', req.query);
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        console.log('📦 Cache hit for content types');
        return res.json(transformContentfulUrls(cachedData));
      }

      console.log('🌐 Fetching content types from Contentful');
      const response: AxiosResponse = await contentfulClient.get('/content_types', {
        params: req.query
      });

      // Transform URLs in the response data
      const transformedData = transformContentfulUrls(response.data);
      
      // Cache the transformed response
      cache.set(cacheKey, transformedData);
      console.log('💾 Cached content types response');

      return res.json(transformedData);
    } catch (error: any) {
      console.error('❌ Error fetching content types:', error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          error: 'Contentful API Error',
          message: error.response.data?.message || 'Failed to fetch content types',
          status: error.response.status
        });
      } else {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to connect to Contentful API'
        });
      }
    }
  });

  // Clear cache endpoint (for development/admin use)
  router.get('/cache/clear', (req: Request, res: Response) => {
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