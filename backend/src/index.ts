import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

import productRoutes from './routes/product.routes';
import masterDataRoutes from './routes/masterData.routes';
import transactionRoutes from './routes/transaction.routes';

// API Routes (v1)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', transactionRoutes);
app.use('/api/v1', masterDataRoutes);

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
