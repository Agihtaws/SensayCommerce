const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // Removed for hackathon
require('dotenv').config(); // Load environment variables from .env

// --- ADJUSTED REQUIRE PATHS ---
// These paths are relative to 'sensay-ecommerce-backend/api/index.js'
// Since 'config', 'routes', 'models', and 'services' folders are one level up, we use '../'
const connectDB = require('../config/database');
const authRoutes = require('../routes/auth');
const sensayBalanceRoutes = require('../routes/sensayBalance');
const sensayRoutes = require('../routes/sensay');
const productRoutes = require('../routes/products');
const cartRoutes = require('../routes/cart');
const wishlistRoutes = require('../routes/wishlist');
const orderRoutes = require('../routes/orders');
const chatRoutes = require('../routes/chat');
const sensayFilesRoutes = require('../routes/sensayFiles');
const categoryRoutes = require('../routes/categoryRoutes');
const brandRoutes = require('../routes/brandRoutes');
// --- END: ADJUSTED REQUIRE PATHS ---

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  // In production on Vercel, your frontend will have a specific domain.
  // Replace 'https://your-vercel-frontend-domain.vercel.app' with that URL in Vercel's environment variables.
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN_FRONTEND || 'https://your-vercel-frontend-domain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate Limiting - DISABLED FOR HACKATHON
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});
app.use('/api/', limiter); // Apply to all /api routes
*/
console.log('⚠️ Rate limiting disabled for hackathon demo');

// Body Parser
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Routes
// All API routes are prefixed with '/api'
app.use('/api/auth', authRoutes);
app.use('/api/sensay-balance', sensayBalanceRoutes);
app.use('/api/sensay', sensayRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sensay-files', sensayFilesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

// Health Check endpoint
// Changed from '/health' to '/api/health' for consistency with other API routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sensay E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    rateLimiting: 'disabled', // Show rate limiting status
    version: '1.0.0'
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error); // Log the error for debugging
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined // Show detailed error only in development
  });
});

// --- CONDITIONAL APP.LISTEN() FOR LOCAL TESTING ---
// This block will only execute when 'api/index.js' is run directly (e.g., `node api/index.js` or `npm run dev`).
// It will NOT execute when Vercel imports 'app' as a module for serverless functions.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Sensay E-commerce Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`⚠️  Rate limiting: DISABLED (Hackathon Mode)`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}
// --- END: CONDITIONAL APP.LISTEN() FOR LOCAL TESTING ---

// IMPORTANT: Export the Express app instance for Vercel Serverless Functions
module.exports = app;
