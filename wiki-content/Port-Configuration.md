# Port Configuration Reference

The following port placeholders are used throughout the FLEARN documentation for security purposes. Replace these with your actual configured ports when setting up your environment:

- `[FRONTEND_PORT]` - Next.js frontend application (default: see docker-compose.yml)
- `[API_PORT]` - Express.js backend API (default: see docker-compose.yml)  
- `[WEBHOOK_PORT]` - Webhook service (default: see docker-compose.yml)
- `[POSTGRES_PORT]` - PostgreSQL database (default: see docker-compose.yml)
- `[MONGO_PORT]` - MongoDB database (default: see docker-compose.yml)
- `[PGADMIN_PORT]` - pgAdmin interface (default: see docker-compose.yml)
- `[MONGO_EXPRESS_PORT]` - MongoDB Express interface (default: see docker-compose.yml)
- `[TEST_PORT]` - Testing server port (configurable)
- `[DEV_PORT]` - Development server port (configurable)

> **Security Note**: Port obfuscation helps prevent automated scanning and targeted attacks. Always use non-default ports in production environments and ensure proper firewall configuration.

## Configuration Files

Actual port numbers are defined in:
- `docker-compose.yml` - Production/Docker ports
- `.env` files - Environment-specific overrides  
- `package.json` - Development server scripts
