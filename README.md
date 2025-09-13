# SoundTools Contentful Proxy Server

A lightweight Node.js TypeScript proxy server that protects your Contentful API from scraping and provides caching, rate limiting, and security features.

## 🚀 Features

- **Contentful API Proxy**: Secure proxy for all Contentful API endpoints
- **Response Caching**: 5-minute TTL cache to reduce API calls and improve performance
- **Rate Limiting**: 100 requests per 15 minutes per IP to prevent abuse
- **CORS Protection**: Configurable CORS settings for your frontend domains
- **Security Headers**: Helmet.js for security best practices
- **Health Monitoring**: Health check endpoints for monitoring
- **TypeScript**: Full TypeScript support with type safety
- **Hot Reload**: Development mode with automatic reloading
- **Heroku Ready**: Optimized for Heroku deployment

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Contentful account with Space ID and Access Token

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   cd soundtools-proxy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Contentful credentials:
   ```env
   CONTENTFUL_SPACE_ID=your_space_id_here
   CONTENTFUL_ACCESS_TOKEN=your_access_token_here
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```

## 🏃‍♂️ Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in your environment).

## 📡 API Endpoints

### Contentful Proxy Endpoints

All endpoints mirror the Contentful API structure:

- `GET /api/contentful/entries` - Get all entries
- `GET /api/contentful/entries/:id` - Get specific entry
- `GET /api/contentful/assets` - Get all assets  
- `GET /api/contentful/assets/:id` - Get specific asset
- `GET /api/contentful/content_types` - Get content types

### Utility Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system health
- `GET /api/contentful/cache/stats` - Cache statistics
- `DELETE /api/contentful/cache` - Clear cache (admin use)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CONTENTFUL_SPACE_ID` | Contentful Space ID | Required |
| `CONTENTFUL_ACCESS_TOKEN` | Contentful Access Token | Required |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000,http://localhost:3001` |

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Includes retry-after information

### Caching

- **TTL**: 5 minutes (300 seconds)
- **Storage**: In-memory with NodeCache
- **Cache Keys**: Based on endpoint path and query parameters

## 🚀 Heroku Deployment

1. **Create a Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set CONTENTFUL_SPACE_ID=your_space_id
   heroku config:set CONTENTFUL_ACCESS_TOKEN=your_access_token
   heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
   heroku config:set NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

4. **Check deployment:**
   ```bash
   heroku logs --tail
   heroku open
   ```

## 🔄 Frontend Integration

Update your frontend to use the proxy instead of direct Contentful calls:

### Before (Direct Contentful):
```typescript
const client = contentful.createClient({
  space: process.env.REACT_APP_CONTENT_SPACE,
  accessToken: process.env.REACT_APP_CONTENT_API,
});
```

### After (Using Proxy):
```typescript
// Replace Contentful client with axios calls to your proxy
const fetchContentfulData = async () => {
  const response = await axios.get('https://your-proxy.herokuapp.com/api/contentful/entries');
  return response.data;
};
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Only allows requests from specified origins
- **Security Headers**: Helmet.js provides security headers
- **Request Logging**: All requests are logged with IP addresses
- **Error Handling**: Proper error responses without exposing internals

## 📊 Monitoring

### Health Check
```bash
curl https://your-proxy.herokuapp.com/api/health
```

### Cache Statistics
```bash
curl https://your-proxy.herokuapp.com/api/contentful/cache/stats
```

## 🔧 Development

### Project Structure
```
src/
├── index.ts              # Main server file
├── routes/
│   ├── contentful.ts     # Contentful proxy routes
│   └── health.ts         # Health check routes
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run dev:watch` - Alternative development command

### Adding New Endpoints

To add new Contentful endpoints, extend the `contentfulProxy` function in `src/routes/contentful.ts`:

```typescript
router.get('/new-endpoint', async (req: Request, res: Response) => {
  // Your proxy logic here
});
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Contentful configuration"**
   - Ensure `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` are set

2. **CORS errors**
   - Add your frontend domain to `ALLOWED_ORIGINS`

3. **Rate limit exceeded**
   - Increase rate limit or implement client-side caching

4. **Cache not working**
   - Check cache statistics endpoint for debugging

### Logs

The server logs all requests and errors. Check the console output or Heroku logs for debugging information.

## 📝 License

MIT License - feel free to use this in your projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Need help?** Check the health endpoint or create an issue in the repository.
