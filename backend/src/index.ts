import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Parsing Middlewares
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS Setup
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// Health Check Endpoint (For Cloud Run Liveness/Readiness probes)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Ping PostgreSQL DB
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      service: 'MatchStock API',
      database: 'Connected (PostgreSQL/Supabase)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      service: 'MatchStock API',
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});

// Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to MatchStock Multi-Tenant WMS API Engine',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 MatchStock Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
