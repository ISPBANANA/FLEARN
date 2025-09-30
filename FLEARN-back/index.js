require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeDatabases, closeDatabases } = require('./config/database');
const { handleAuthError } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8099;
const NODE_ENV = process.env.NODE_ENV || 'development';
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/flearn-db';

const corsOptions = {
    origin: function (origin, callback) {
        // In production, check environment variable for allowed origins
        if (process.env.ALLOWED_ORIGINS) {
            const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
            if (!origin) return callback(null, true); // Allow requests with no origin
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // Development/deployment mode - more flexible CORS
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            // Allow localhost and any IP addresses on common ports for development
            const allowedPatterns = [
                /^http:\/\/localhost:\d+$/,                    // localhost with any port
                /^http:\/\/127\.0\.0\.1:\d+$/,                // 127.0.0.1 with any port
                /^http:\/\/0\.0\.0\.0:\d+$/,                  // 0.0.0.0 with any port
                /^http:\/\/flearn-frontend:\d+$/,             // Docker service name
                /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,         // Any IP address with port
                /^https:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,        // Any IP address with port (HTTPS)
                /^http:\/\/\d+\.\d+\.\d+\.\d+$/,             // Any IP address without port
                /^https:\/\/\d+\.\d+\.\d+\.\d+$/             // Any IP address without port (HTTPS)
            ];
            
            const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
            
            if (isAllowed) {
                console.log('CORS allowed origin:', origin);
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                console.log('Available patterns:', allowedPatterns.map(p => p.toString()));
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false // Pass control to the next handler
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Additional CORS headers middleware for extra compatibility
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Only set headers if origin is allowed by our CORS policy
    if (!process.env.ALLOWED_ORIGINS && origin) {
        const allowedPatterns = [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            /^http:\/\/0\.0\.0\.0:\d+$/,
            /^http:\/\/flearn-frontend:\d+$/,
            /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,
            /^https:\/\/\d+\.\d+\.\d+\.\d+:\d+$/,
            /^http:\/\/\d+\.\d+\.\d+\.\d+$/,
            /^https:\/\/\d+\.\d+\.\d+\.\d+$/
        ];
        
        const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
        
        if (isAllowed) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    }
    
    next();
});

// Increase body size limits for image uploads (base64 images can be large)
app.use(express.json({ limit: '10mb', parameterLimit: 1000000 }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000000 }));

// Error handler for body size limits
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 413) {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request body exceeds the maximum allowed size (10MB). Please reduce image size or use a smaller image.'
        });
    }
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'Request body exceeds the maximum allowed size (10MB). Please reduce image size or use a smaller image.'
        });
    }
    next(error);
});

// Import routes
const userRoutes = require('./routes/users');
const friendRoutes = require('./routes/friends');
const gardenRoutes = require('./routes/gardens');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/gardens', gardenRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'FLEARN Backend API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Initialize databases (MongoDB and PostgreSQL)
initializeDatabases().catch((error) => {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
});

// JWT error handler (must be before global error handler)
app.use(handleAuthError);

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabases();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await closeDatabases();
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log('\n🚀 FLEARN Backend Server Started!');
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔑 Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('====================================\n');
});
