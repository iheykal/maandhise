const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors'); // This line is added
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const sahacardRoutes = require('./routes/sahalCard');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/payment');
const simplePaymentRoutes = require('./routes/simplePayment');
const companyRoutes = require('./routes/company');
const marketerRoutes = require('./routes/marketer');
const pendingCustomerRoutes = require('./routes/pendingCustomer');

const app = express();

app.set('trust proxy', 1); // Trust first proxy

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  keyGenerator: (req) => req.ip
});
app.use(limiter);

// CORS configuration for production
const corsOptions = {
  origin: 'https://sahalcard.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// API routes are prefixed with /api
app.use('/api/auth', authRoutes);
app.use('/api/sahal-card', sahacardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/simple-payments', simplePaymentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/marketers', marketerRoutes);
app.use('/api/pending-customers', pendingCustomerRoutes);

// Serve static files from React build for all non-API routes
const path = require('path');
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  // Fallback for root if frontend is not built
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'SAHAL CARD API is running. Frontend not found.'
    });
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5001; // Render uses PORT env var

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not set. Server will not start.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas connected successfully');

    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
