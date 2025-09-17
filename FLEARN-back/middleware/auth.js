const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// In development, we'll create mock middleware if Auth0 is not configured
const isAuth0Configured = AUTH0_DOMAIN && AUTH0_AUDIENCE && 
    AUTH0_DOMAIN !== 'your-tenant.auth0.com' && 
    AUTH0_AUDIENCE !== 'your-auth0-api-identifier';

console.log('🔍 Auth0 Configuration Debug:');
console.log('  AUTH0_DOMAIN:', AUTH0_DOMAIN);
console.log('  AUTH0_AUDIENCE:', AUTH0_AUDIENCE);
console.log('  isAuth0Configured:', isAuth0Configured);

// Mock middleware for development when Auth0 is not configured
const mockJwt = (req, res, next) => {
    console.log('⚠️  Using mock JWT middleware - Auth0 not configured');
    // Mock user object for development
    req.user = {
        sub: 'auth0|mock-user-id',
        email: 'test@example.com',
        email_verified: true
    };
    next();
};

// Debug middleware to check incoming tokens (simplified for production)
const debugJwt = (req, res, next) => {
    console.log('✅ JWT validated for user:', req.user?.sub);
    next();
};

// Auth0 JWT verification middleware
const jwtMiddleware = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    requestProperty: 'user' // This forces express-jwt v7 to use req.user instead of req.auth
});

const checkJwt = isAuth0Configured ? (req, res, next) => {
    jwtMiddleware(req, res, (err) => {
        if (err) {
            console.log('❌ JWT Error:', err.message);
            next(err);
        } else {
            debugJwt(req, res, next);
        }
    });
} : mockJwt;

// Optional JWT middleware (doesn't fail if no token)
const optionalJwt = isAuth0Configured ? jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    credentialsRequired: false,
    requestProperty: 'user' // This forces express-jwt v7 to use req.user instead of req.auth
}) : mockJwt;

// Error handler for JWT middleware
const handleJwtError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
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
    handleJwtError
};
