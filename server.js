
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// ============================================
// ✅ CORS — MUST BE BEFORE ROUTES
// ============================================
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================
// MIDDLEWARE
// ============================================

// Body parser middleware - CRITICAL for JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (optional but helpful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running', 
    status: 'healthy' 
  });
});

// Auth routes - all your profile endpoints
app.use('/api/auth', authRoutes);

// ============================================
// DATABASE CONNECTION
// ============================================

const PORT = process.env.PORT || 5000;
const DATABASE_URL= process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/your-database-name';

mongoose.set("strictQuery", true);

mongoose.connect(DATABASE_URL, {
  serverSelectionTimeoutMS: 8000,  // ✅ fail fast (8 sec)
  connectTimeoutMS: 8000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API available at http://localhost:${PORT}/api/auth`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error FULL:', err);
    console.error('❌ Message:', err.message);
    process.exit(1);
  });



console.log("✅ ENV DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("✅ DATABASE_URL starts with:", (process.env.DATABASE_URL || "").slice(0, 20));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;