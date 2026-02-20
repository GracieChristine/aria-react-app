import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import morgan         from 'morgan';
import compression    from 'compression';
import rateLimit      from 'express-rate-limit';
import { config }     from './config/env.js';

// Routes
import authRoutes     from './routes/authRoutes.js';
import listingRoutes  from './routes/listingRoutes.js';
import bookingRoutes  from './routes/bookingRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import messageRoutes  from './routes/messageRoutes.js';

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: config.env === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173',
  credentials: true,
}));

// ── Rate limiting ──
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// ── General middleware ──
app.use(compression());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: config.env, timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/listings',  listingRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/reviews',   reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages',  messageRoutes);

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: config.env === 'development' ? err.message : 'Internal server error',
  });
});

export default app;