const mongoose = require('mongoose');
const { Pool } = require('pg');
require('dotenv').config();

// MongoDB connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// PostgreSQL connection pool
const pgPool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection
const connectPostgreSQL = async () => {
    try {
        const client = await pgPool.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
    }
};

// Initialize both database connections
const initializeDatabases = async () => {
    console.log('🔄 Initializing database connections...');
    await connectMongoDB();
    await connectPostgreSQL();
    console.log('🎉 All databases initialized');
};

// Graceful shutdown
const closeDatabases = async () => {
    console.log('🔄 Closing database connections...');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    // Close PostgreSQL pool
    await pgPool.end();
    console.log('✅ PostgreSQL pool closed');
};

module.exports = {
    initializeDatabases,
    closeDatabases,
    pgPool,
    mongoose
};
