const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const sahacardRoutes = require('./routes/sahalCard');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Create indexes for better performance
    try {
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ idNumber: 1 }, { unique: true });
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

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
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
