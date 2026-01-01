import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || '{SERVICE_NAME}';
const VERSION = process.env.npm_package_version || '1.0.0';

app.use(express.json());

// ============================================
// Health Endpoint (PFLICHT für alle MOJO Apps)
// ============================================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: SERVICE_NAME,
    version: VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Root Endpoint
// ============================================
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: SERVICE_NAME,
    version: VERSION,
    message: 'Willkommen im MOJO-Ökosystem!',
    docs: `https://github.com/gkeferstein/${SERVICE_NAME}`,
  });
});

// ============================================
// API Endpoints
// ============================================
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: VERSION,
      endpoints: [
        'GET /health',
        'GET /api',
      ],
    },
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} v${VERSION} gestartet`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

