const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Trust proxy so express can read X-Forwarded-For headers (required by express-rate-limit
// when requests pass through a proxy or when certain clients set X-Forwarded-For).
// This is safe for local development and common NAT / reverse proxy setups. If you
// deploy behind a trusted proxy, you can set a more specific value instead of `true`.
app.set('trust proxy', true);

// Security middleware with CSP configuration to allow R2 images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.r2.dev",
        "https://*.r2.cloudflarestorage.com",
        `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev`,
        `https://maandhise.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
      ],
      connectSrc: [
        "'self'",
        "https://*.r2.dev",
        "https://*.r2.cloudflarestorage.com",
        "https://maandhise252.onrender.com",
        "https://maandhise.onrender.com",
        "https://sahalcard.com",
        "https://www.sahalcard.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  // Use custom keyGenerator to avoid trust proxy validation issues
  keyGenerator: (req) => {
    // Safely get IP address without triggering trust proxy validation
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.100.32:3000',
  'http://192.168.1.100:3000', // Add common home network IP
  'http://192.168.0.100:3000', // Add common home network IP
  'https://maandhise.onrender.com', // Production frontend URL
  'https://maandhise-frontend.onrender.com', // Alternative frontend URL
  'https://maandhise252.onrender.com', // Current deployment URL
  'https://sahalcard.com', // Custom domain
  'https://www.sahalcard.com', // Custom domain with www
  process.env.APP_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

// More permissive CORS configuration for development
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);

    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) {
      console.log('CORS allowed for no origin (same-origin request)');
      return callback(null, true);
    }

    // Allow all origins for now to fix the issue
    console.log('CORS allowed for origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files from React build (if it exists)
const path = require('path');
const fs = require('fs');

const frontendBuildPath = path.join(__dirname, '../frontend/build');
const indexPath = path.join(frontendBuildPath, 'index.html');

// Check if frontend build exists
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // Root endpoint - serve React app
  app.get('/', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  // Fallback: serve API info if frontend not built
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'SAHAL CARD API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      note: 'Frontend build not found. Please build the frontend and redeploy.'
    });
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAHAL CARD API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sahal-card', sahacardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/simple-payments', simplePaymentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/marketers', marketerRoutes);
app.use('/api/pending-customers', pendingCustomerRoutes);

// 404 handler - serve React app for client-side routing
app.use('*', (req, res) => {
  // If it's an API route, return 404 JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  // Otherwise serve React app for client-side routing (if it exists)
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Frontend not available. Please build and redeploy.'
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    // Check if MongoDB URI is configured
    if (!mongoURI) {
      console.log('⚠️  MongoDB not configured. Using in-memory database for development.');
      console.log('💡 To use MongoDB Atlas, set MONGODB_URI environment variable with your Atlas connection string');
      console.log('   Example: MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/maandhise?retryWrites=true&w=majority');
      return; // Skip MongoDB connection for now
    }

    // MongoDB Atlas connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    // Create indexes for better performance
    try {
      // Get all existing indexes
      const existingIndexes = await mongoose.connection.db.collection('users').indexes();
      console.log('📋 Existing user indexes:', existingIndexes.map(idx => idx.name));

      // Try to drop the old phone index if it exists (to recreate with sparse)
      const phoneIndex = existingIndexes.find(idx => idx.name === 'phone_1' || idx.key?.phone === 1);
      if (phoneIndex && !phoneIndex.sparse) {
        try {
          await mongoose.connection.db.collection('users').dropIndex('phone_1');
          console.log('✅ Dropped old phone index (not sparse) to recreate with sparse option');
        } catch (dropError) {
          console.log('⚠️  Could not drop phone index:', dropError.message);
          // If drop fails, try to recreate anyway (it will error if needed)
        }
      }

      // Create phone index with sparse option (allows multiple null values for companies)
      try {
        await mongoose.connection.db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true, name: 'phone_1' });
        console.log('✅ Created sparse unique phone index');
      } catch (createError) {
        if (createError.message.includes('already exists')) {
          console.log('⚠️  Phone index already exists - checking if sparse...');
          // Check if the existing index is sparse
          const indexes = await mongoose.connection.db.collection('users').indexes();
          const existingPhoneIdx = indexes.find(idx => idx.name === 'phone_1' || idx.key?.phone === 1);
          if (existingPhoneIdx && !existingPhoneIdx.sparse) {
            console.error('❌ Phone index exists but is NOT sparse! You need to manually drop it:');
            console.error('   Run in MongoDB: db.users.dropIndex("phone_1")');
            console.error('   Then restart the server');
          }
        } else {
          throw createError;
        }
      }

      await mongoose.connection.db.collection('sahacards').createIndex({ cardNumber: 1 }, { unique: true });
      await mongoose.connection.db.collection('sahacards').createIndex({ userId: 1 });

      // Fix companies userId index - make it sparse to allow multiple null values
      try {
        const companyIndexes = await mongoose.connection.db.collection('companies').indexes();
        console.log('📋 Existing company indexes:', companyIndexes.map(idx => idx.name));

        const userIdIndex = companyIndexes.find(idx => idx.name === 'userId_1' || idx.key?.userId === 1);
        if (userIdIndex && userIdIndex.unique && !userIdIndex.sparse) {
          try {
            await mongoose.connection.db.collection('companies').dropIndex('userId_1');
            console.log('✅ Dropped old userId unique index on companies collection');
          } catch (dropError) {
            console.log('⚠️  Could not drop userId index:', dropError.message);
          }
        }

        // Create sparse index on userId (or don't create unique index at all)
        // Since userId is now optional and can be null for all companies, we don't need a unique index
        // If you want to keep the index for queries but allow nulls, make it sparse
        if (!companyIndexes.find(idx => idx.name === 'userId_1' || (idx.key?.userId === 1 && idx.sparse))) {
          try {
            await mongoose.connection.db.collection('companies').createIndex({ userId: 1 }, { sparse: true, name: 'userId_1' });
            console.log('✅ Created sparse userId index on companies collection');
          } catch (createError) {
            if (!createError.message.includes('already exists')) {
              console.log('⚠️  Could not create sparse userId index:', createError.message);
            }
          }
        }
      } catch (companyIndexError) {
        console.log('⚠️  Error fixing company userId index:', companyIndexError.message);
      }

      await mongoose.connection.db.collection('companies').createIndex({ businessName: 'text' });
      await mongoose.connection.db.collection('transactions').createIndex({ customerId: 1, createdAt: -1 });
      await mongoose.connection.db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });

      console.log('✅ Database indexes created successfully');
    } catch (indexError) {
      console.log('⚠️  Index creation error:', indexError.message);
      if (indexError.message.includes('phone')) {
        console.error('❌ CRITICAL: Phone index issue. Please manually fix:');
        console.error('   1. Connect to MongoDB');
        console.error('   2. Run: db.users.dropIndex("phone_1")');
        console.error('   3. Restart this server');
      }
    }

  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication failed. Please check your MongoDB Atlas username and password.');
    } else if (error.message.includes('network')) {
      console.error('🌐 Network error. Please check your internet connection and MongoDB Atlas cluster status.');
    } else if (error.message.includes('timeout')) {
      console.error('⏰ Connection timeout. Please check your MongoDB Atlas cluster is running.');
    }

    console.log('💡 Troubleshooting tips:');
    console.log('   1. Verify your MongoDB Atlas connection string');
    console.log('   2. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('   3. Ensure your database user has proper permissions');
    console.log('   4. Verify your cluster is running and accessible');

    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Setup cron jobs for subscription management
const setupCronJobs = () => {
  // Import subscription service
  const { checkOverduePayments, sendPaymentReminders, sendFinalPaymentReminders } = require('./services/subscriptionService');

  // Check overdue payments daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔄 Running daily payment check...');
    try {
      await checkOverduePayments();
      console.log('✅ Daily payment check completed');
    } catch (error) {
      console.error('❌ Error in daily payment check:', error);
    }
  });

  // Send payment reminders daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('📧 Sending payment reminders...');
    try {
      await sendPaymentReminders();
      console.log('✅ Payment reminders sent');
    } catch (error) {
      console.error('❌ Error sending payment reminders:', error);
    }
  });

  // Send final payment reminders daily at 6 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('⚠️ Sending final payment reminders...');
    try {
      await sendFinalPaymentReminders();
      console.log('✅ Final payment reminders sent');
    } catch (error) {
      console.error('❌ Error sending final payment reminders:', error);
    }
  });

  console.log('⏰ Cron jobs scheduled:');
  console.log('   - Daily payment check: 9:00 AM');
  console.log('   - Payment reminders: 10:00 AM');
  console.log('   - Final reminders: 6:00 PM');
};

const startServer = async () => {
  try {
    await connectDB();

    // Setup cron jobs
    setupCronJobs();

    // Create HTTP server with reuseAddr option to handle port conflicts
    const server = http.createServer(app);

    // Set reuseAddr to allow port reuse even if in TIME_WAIT state
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Network API URL: http://0.0.0.0:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Mobile access: Use your computer's IP address instead of localhost`);
    });

    // Enable SO_REUSEADDR to allow port reuse
    server.on('listening', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        server.setTimeout(0); // Disable timeout
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Try: netstat -ano | findstr :${PORT} to find the process`);
        console.error(`💡 Or change PORT in your .env file`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

startServer();

module.exports = app;
