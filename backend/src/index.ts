import 'reflect-metadata';   
import * as dotenv from 'dotenv';
dotenv.config();             
import express   from 'express';
import cookieParser from 'cookie-parser';
import path      from 'path';
import { AppDataSource } from './data-source';
import './passport';         

// Routes
import authRoutes    from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes    from './routes/cart';     
import orderRoutes   from './routes/orders';
import profileRoutes from './routes/profile';
import adminRoutes   from './routes/admin';

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';

const app   = express();
const PORT  = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Basic Security Headers
 * Protects against MIME-sniffing, clickjacking, and basic XSS.
 */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');   
  res.setHeader('X-Frame-Options',        'DENY');      
  res.setHeader('X-XSS-Protection',       '1; mode=block');
  next();
});

/**
 * Custom CORS Middleware
 * Dynamically allows localhost:4200 (Angular default) in development mode.
 * Crucially enables 'Access-Control-Allow-Credentials' to allow JWT cookies.
 */
app.use((req, res, next) => {
  const origin  = req.headers.origin || '';
  const allowed = isDev
    ? [`http://localhost:4200`, `http://localhost:${PORT}`]
    : [`http://localhost:${PORT}`];

  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',      origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true'); 
    res.setHeader('Access-Control-Allow-Methods',     'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',     'Content-Type');
  }

  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use(express.json({ limit: '2mb' })); 
app.use(cookieParser());                 

/**
 * Static Asset Hosting
 * Serves product images and the compiled Angular production build.
 */
app.use(
  '/ProductImages',
  express.static(path.join(__dirname, '../ProductImages')),
);

const angularDist = path.join(__dirname, '../../frontend/dist/frontend/browser');
app.use(express.static(angularDist));

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);    
app.use('/api/orders',   orderRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/admin',    adminRoutes);

/**
 * Global Error Handler
 * Specifically catches 'AppError' instances to send clean, 
 * status-coded JSON to the client.
 */
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error('[Unhandled error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Database & Server Lifecycle
 * Initializes TypeORM connection before opening the network port.
 */
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () =>
      console.log(`Server running → http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });