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
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : [
                'http://localhost:3000', 
                'http://localhost:3001', 
                'http://localhost:5173',
                'http://flearn-frontend:3000',  // Docker service name
                'http://127.0.0.1:3000',
                'http://0.0.0.0:3000'
            ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
