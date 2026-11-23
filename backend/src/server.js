import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import db from './db/database.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Disable server fingerprinting
app.disable('x-powered-by');

// CORS configuration (allow local dev frontend and env configured domains)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Dev fallback
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API rate limiting
app.use('/api', apiLimiter);

// Static uploads directory with security headers
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Force download or isolate sandbox for any non-image content
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      if (['.svg', '.xml', '.html'].includes(ext)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    }
  }
}));

// Attach Socket.io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Auto-seed if database has no users
if (!db.data.users || db.data.users.length === 0) {
  console.log('Database empty on startup. Auto-seeding initial student marketplace data...');
  seedDatabase();
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Public Dynamic Site Settings (Header, Hero, Cards, Footer)
app.get('/api/site-settings', (req, res) => {
  try {
    const settings = db.getSiteSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load site settings' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Student Freelance Marketplace API',
    timestamp: new Date().toISOString(),
    stats: {
      users: (db.data.users || []).length,
      services: (db.data.services || []).length,
      projects: (db.data.projects || []).length
    }
  });
});

// Real-Time Socket.io Connection Management
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins their personal room for direct notifications
  socket.on('join_user', (userId) => {
    if (userId) {
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined personal room ${room}`);
    }
  });

  // User joins a specific project chat room
  socket.on('join_project', (projectId) => {
    if (projectId) {
      const room = `project_${projectId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined project room ${room}`);
    }
  });

  // Real-time message dispatch
  socket.on('send_message', (data) => {
    if (data && data.project_id) {
      const projectRoom = `project_${data.project_id}`;
      // Broadcast to everyone in project room (including sender or excluding)
      io.to(projectRoom).emit('new_message', data);
      
      // Also notify receiver personal room
      if (data.receiver_id) {
        io.to(`user_${data.receiver_id}`).emit('notification_ping', {
          type: 'NEW_MESSAGE',
          title: 'New message',
          message: data.content,
          project_id: data.project_id
        });
      }
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    if (data && data.project_id) {
      socket.to(`project_${data.project_id}`).emit('user_typing', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Serve frontend static files in production
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log(`Serving frontend static build from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Student Freelance Marketplace Server running on http://localhost:${PORT}`);
});
