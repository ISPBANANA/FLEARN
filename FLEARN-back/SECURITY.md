# Docker Compose Security Guide 🔐

This guide explains how to securely manage passwords and secrets in your Docker Compose setup.

## Current Setup

I've provided **two secure approaches** for managing secrets:

### Method 1: Docker Secrets (Production Recommended)
File: `docker-compose.yml` (current main file)

- Uses Docker's built-in secrets management
- Passwords stored in separate files in `/secrets` directory
- More secure for production environments
- Secrets are mounted as files inside containers

### Method 2: Environment Variables
File: `docker-compose.env.yml` (alternative)

- Uses a separate `.env.secrets` file
- Easier to manage for development
- Variables are injected as environment variables

## Security Features Implemented

### ✅ Secrets Directory
```
secrets/
├── postgres_password.txt
├── pgadmin_password.txt
├── mongo_password.txt
└── mongo_express_password.txt
```

### ✅ Updated .gitignore
- Excludes `secrets/` directory
- Excludes `.env.secrets` file
- Prevents accidental commits of sensitive data

### ✅ Strong Passwords
All default passwords have been replaced with secure ones:
- PostgreSQL: `flearn_secure_postgres_password_2024`
- pgAdmin: `pgadmin_secure_password_2024`
- MongoDB: `mongo_secure_password_2024`
- Mongo Express: `mongo_express_secure_password_2024`

## How to Use

### Using Docker Secrets (Default)
```bash
# Start with secrets
docker-compose up -d

# View logs
docker-compose logs -f
```

### Using Environment Variables
```bash
# Start with environment file
docker-compose -f docker-compose.env.yml up -d
```

## Access Credentials

### pgAdmin (http://localhost:8080)
- **Email**: admin@flearn.com
- **Password**: `pgadmin_secure_password_2024`

### Mongo Express (http://localhost:8081)
- **Username**: admin
- **Password**: `mongo_express_secure_password_2024`

### Database Connections

**PostgreSQL:**
- Host: localhost
- Port: 5432
- Database: flearn_db
- Username: flearn_user
- Password: `flearn_secure_postgres_password_2024`

**MongoDB:**
- Host: localhost
- Port: 27017
- Database: flearn_mongo_db
- Username: flearn_admin
- Password: `mongo_secure_password_2024`

## Security Best Practices

### 🔒 For Development
1. **Never commit secrets to git**
2. **Use strong, unique passwords**
3. **Rotate passwords regularly**
4. **Limit access to secrets files**

```bash
# Set proper permissions on secrets
chmod 600 secrets/*.txt
chmod 700 secrets/
```

### 🛡️ For Production
1. **Use Docker Swarm secrets or Kubernetes secrets**
2. **Use external secret management (HashiCorp Vault, AWS Secrets Manager)**
3. **Enable SSL/TLS for all connections**
4. **Use network isolation**
5. **Regular security audits**

## Changing Passwords

### Method 1: Docker Secrets
1. Edit the password files in `secrets/`
2. Restart containers: `docker-compose down && docker-compose up -d`

### Method 2: Environment Variables
1. Edit `.env.secrets`
2. Restart: `docker-compose -f docker-compose.env.yml down && docker-compose -f docker-compose.env.yml up -d`

## Advanced Security Options

### Using External Secrets
```yaml
secrets:
  postgres_password:
    external: true
    name: flearn_postgres_password
```

### Using Swarm Mode
```bash
# Initialize swarm
docker swarm init

# Create secrets
echo "your_secure_password" | docker secret create postgres_password -

# Deploy stack
docker stack deploy -c docker-compose.yml flearn
```

## Troubleshooting

### Secret File Not Found
```bash
# Ensure secrets directory exists
mkdir -p secrets/

# Check file permissions
ls -la secrets/
```

### Environment Variable Issues
```bash
# Check if .env.secrets exists
ls -la .env*

# Validate environment variables
docker-compose -f docker-compose.env.yml config
```

## Security Checklist

- [ ] Secrets directory is in `.gitignore`
- [ ] Default passwords changed
- [ ] Strong passwords used (20+ characters)
- [ ] File permissions set correctly (600/700)
- [ ] No hardcoded passwords in compose files
- [ ] Regular password rotation scheduled
- [ ] Backup strategy for secrets in place

Remember: **Security is a process, not a destination!** 🛡️
