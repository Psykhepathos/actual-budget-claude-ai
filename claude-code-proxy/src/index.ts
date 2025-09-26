import cors from 'cors';
import express from 'express';

import { ApiHandlers } from './api-handlers';
import { ClaudeCodeSessionManager } from './session-manager';

const app = express();
const port = process.env.PORT || 11434;

// Initialize session manager and API handlers
const sessionManager = new ClaudeCodeSessionManager();
const apiHandlers = new ApiHandlers(sessionManager);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Core Ollama API endpoints
app.post('/api/generate', (req, res) => apiHandlers.generateHandler(req, res));
app.post('/api/chat', (req, res) => apiHandlers.chatHandler(req, res));
app.get('/api/tags', (req, res) => apiHandlers.tagsHandler(req, res));
app.get('/api/version', (req, res) => apiHandlers.versionHandler(req, res));
app.post('/api/pull', (req, res) => apiHandlers.pullHandler(req, res));

// Anthropic API endpoint
app.post('/v1/messages', (req, res) => apiHandlers.anthropicHandler(req, res));

// Health check endpoint
app.get('/health', (req, res) => apiHandlers.healthHandler(req, res));
app.get('/', (req, res) => {
  res.json({
    service: 'Claude Code Proxy',
    version: '1.0.0',
    description: 'Ollama-compatible proxy for Claude Code',
    endpoints: [
      'POST /api/generate - Generate text completions',
      'POST /api/chat - Chat completions (messages format)',
      'GET /api/tags - List available models',
      'GET /api/version - Get version information',
      'POST /api/pull - Pull/download models (mock)',
      'GET /health - Health check',
    ],
  });
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  },
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sessionManager.closeAllSessions();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await sessionManager.closeAllSessions();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Claude Code Proxy server started on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API endpoint: http://localhost:${port}/api/generate`);
  console.log('🎯 Ready to proxy Claude Code requests!');
});

export default app;
