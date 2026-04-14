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
  express.static(path.join(__dirname, '..', 'ProductImages')),
);

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

import fs from 'fs';

const angularDistRoot = path.join(__dirname, "../../kivi-frontend/dist/kivi-frontend");
const angularBrowserPath = path.join(angularDistRoot, "browser");

const angularDistPath = fs.existsSync(angularBrowserPath) 
    ? angularBrowserPath 
    : angularDistRoot;

console.log("Checking Angular path:", angularDistPath);
if (!fs.existsSync(angularDistPath)) {
    console.error("ERROR: Angular build folder not found at the calculated path!");
}

app.use(express.static(angularDistPath));

app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path.join(angularDistPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("index.html not found. Check your FRONT_END path logic.");
    }
});

/**
 * Database & Server Lifecycle
 * Initializes TypeORM connection before opening the network port.
 */
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const server = app.listen(PORT, () => {
      console.log(`Server active at: http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill the other process or change the PORT in .env`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
};

startServer();