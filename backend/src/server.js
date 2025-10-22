const express = require('express');
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

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
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
  process.env.APP_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Serve static files from React build
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Root endpoint - serve React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Maandhise Corporate API is running',
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

// 404 handler - serve React app for client-side routing
app.use('*', (req, res) => {
  // If it's an API route, return 404 JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  // Otherwise serve React app for client-side routing
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
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
      await mongoose.connection.db.collection('users').createIndex({ phone: 1 }, { unique: true });
      await mongoose.connection.db.collection('sahacards').createIndex({ cardNumber: 1 }, { unique: true });
      await mongoose.connection.db.collection('sahacards').createIndex({ userId: 1 });
      await mongoose.connection.db.collection('companies').createIndex({ businessName: 'text' });
      await mongoose.connection.db.collection('transactions').createIndex({ customerId: 1, createdAt: -1 });
      await mongoose.connection.db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (indexError) {
      console.log('⚠️  Some indexes may already exist:', indexError.message);
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
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Network API URL: http://0.0.0.0:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Mobile access: Use your computer's IP address instead of localhost`);
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
