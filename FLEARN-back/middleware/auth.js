const { OAuth2Client } = require('google-auth-library');
require('dotenv').config({ path: '../../.env' });

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// In development, we'll create mock middleware if Google Cloud is not configured
const isGoogleConfigured = GOOGLE_CLIENT_ID && 
    GOOGLE_CLIENT_ID !== 'your-google-client-id';

console.log('🔍 Google Cloud Authentication Configuration Debug:');
console.log('  GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
console.log('  isGoogleConfigured:', isGoogleConfigured);

// Initialize Google Auth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Mock middleware for development when Google Cloud is not configured
const mockAuth = (req, res, next) => {
    console.log('⚠️  Using mock authentication middleware - Google Cloud not configured');
    // Mock user object for development
    req.user = {
        id: 'google|mock-user-id',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        picture: 'https://via.placeholder.com/150'
    };
    next();
};

// Debug middleware to check authenticated users
const debugAuth = (req, res, next) => {
    console.log('✅ User authenticated:', req.user?.email);
    next();
};

// Verify Google ID Token
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        return {
            id: `google|${payload.sub}`,
            email: payload.email,
            email_verified: payload.email_verified,
            name: payload.name,
            picture: payload.picture,
            sub: `google|${payload.sub}` // For compatibility with existing code
        };
    } catch (error) {
        throw new Error('Invalid Google token');
    }
};

// Google ID Token verification middleware
const googleAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const user = await verifyGoogleToken(token);
        req.user = user;
        debugAuth(req, res, next);
    } catch (error) {
        console.log('❌ Google Auth Error:', error.message);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
    }
};

const checkJwt = isGoogleConfigured ? googleAuthMiddleware : mockAuth;

// Optional Google auth middleware (doesn't fail if no token)
const optionalGoogleAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            return next();
        }

        const token = authHeader.split(' ')[1];
        const user = await verifyGoogleToken(token);
        req.user = user;
        debugAuth(req, res, next);
    } catch (error) {
        // Token is invalid, but continue without authentication
        console.log('⚠️  Optional Google Auth Warning:', error.message);
        next();
    }
};

const optionalJwt = isGoogleConfigured ? optionalGoogleAuth : mockAuth;

// Error handler for authentication middleware
const handleAuthError = (err, req, res, next) => {
    if (err.message === 'Invalid Google token' || err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token or no token provided'
        });
    }
    next(err);
};

module.exports = {
    checkJwt,
    optionalJwt,
    handleAuthError
};
