# 🚀 Getting Started with FLEARN

This comprehensive guide will walk you through setting up FLEARN on your local machine, from prerequisites to running your first instance.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **[Docker](https://www.docker.com/)** & **Docker Compose** (v2.0+)
- **[Node.js](https://nodejs.org/)** (v18 or higher)
- **[Git](https://git-scm.com/)** (latest version)

### Optional but Recommended
- **[Visual Studio Code](https://code.visualstudio.com/)** - IDE with excellent Docker support
- **[Postman](https://www.postman.com/)** - API testing
- **[pgAdmin](https://www.pgadmin.org/)** - PostgreSQL management (if not using Docker)

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 5GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

## ⚡ Quick Start (Docker - Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:
```env
# Application Ports
FRONTEND_PORT=3000
API_PORT=8099
WEBHOOK_PORT=3001

# PostgreSQL Configuration
POSTGRES_DB=flearn_db
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# MongoDB Configuration  
MONGO_INITDB_DATABASE=flearn_mongo_db
MONGO_INITDB_ROOT_USERNAME=flearn_admin
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password_here
MONGO_PORT=27017

# pgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@flearn.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password_here
PGADMIN_PORT=8088

# Mongo Express Configuration
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=your_express_password_here
MONGO_EXPRESS_PORT=8087

# Webhook Configuration (for auto-deployment)
WEBHOOK_SECRET=your_github_webhook_secret_here
```

### 3. Start All Services
```bash
# Start in detached mode
docker compose up -d

# View startup logs
docker compose logs -f
```

### 4. Verify Installation
Check that all services are running:
```bash
docker compose ps
```

Expected output:
```
NAME                    IMAGE                COMMAND                  SERVICE             STATUS
flearn-backend         flearn_backend       "npm start"              backend             Up
flearn-frontend        flearn_frontend      "npm start"              frontend            Up
flearn-postgres        postgres:15          "docker-entrypoint.s…"   postgres            Up
flearn-mongodb         mongo:7.0            "docker-entrypoint.s…"    mongodb             Up
flearn-pgadmin         dpage/pgadmin4       "/entrypoint.sh"         pgadmin             Up
flearn-mongo-express   mongo-express        "tini -- /docker-ent…"   mongo-express       Up
flearn-webhook         flearn_webhook       "npm start"              webhook-service     Up
```

### 5. Access the Application
| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8099 | - |
| **pgAdmin** | http://localhost:8088 | admin@flearn.com / [your_password] |
| **Mongo Express** | http://localhost:8087 | admin / [your_password] |
| **Webhook Health** | http://localhost:3001/health | - |

## 🛠️ Manual Development Setup

If you prefer to run services individually (not recommended for beginners):

### Backend Setup
```bash
cd FLEARN-back

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd FLEARN-front

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
You'll need to manually install and configure:
- PostgreSQL (v15+)
- MongoDB (v7.0+)

See [Database Guide](Database-Guide) for detailed instructions.

## 🔧 Development Configuration

### Environment Variables Explained

#### Application Settings
- `NODE_ENV`: Set to `development` for local development
- `PORT`: Backend API server port
- `FRONTEND_PORT`: Next.js development server port

#### Database Configuration
- `POSTGRES_*`: PostgreSQL connection settings
- `MONGO_*`: MongoDB connection settings

#### Auth0 Configuration (Optional for basic setup)
- `AUTH0_DOMAIN`: Your Auth0 tenant domain
- `AUTH0_AUDIENCE`: API identifier from Auth0
- `AUTH0_CLIENT_ID`: Application client ID
- `AUTH0_CLIENT_SECRET`: Application client secret

For detailed Auth0 setup, see [Authentication & Auth0](Authentication-Auth0).

### Development Workflow

1. **Start databases**: `docker compose up -d postgres mongodb`
2. **Start backend**: `cd FLEARN-back && npm run dev`
3. **Start frontend**: `cd FLEARN-front && npm run dev`
4. **Make changes** and see live reloading
5. **Stop databases**: `docker compose down`

## 🧪 Testing Your Setup

### 1. Health Checks
```bash
# Test backend health
curl http://localhost:8099/health

# Test webhook service
curl http://localhost:3001/health

# Test frontend (should return HTML)
curl http://localhost:3000
```

### 2. Database Connections
```bash
# Test PostgreSQL
docker compose exec postgres psql -U flearn_user -d flearn_db -c "SELECT version();"

# Test MongoDB
docker compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

### 3. Run Test Suite
```bash
# Quick validation
./scripts/run-tests.sh --quick

# Full integration tests
./scripts/run-tests.sh --integration
```

## 🚦 Next Steps

Once your environment is running:

1. **Explore the API**: Visit [API Reference](API-Reference) for endpoint documentation
2. **Set up Auth0**: Follow [Authentication & Auth0](Authentication-Auth0) for user authentication
3. **Configure webhooks**: See [Docker & Deployment](Docker-Deployment) for auto-deployment
4. **Start developing**: Check [Contributing Guidelines](Contributing-Guidelines) for development practices

## ⚠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using your ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8099

# Kill processes if needed
sudo kill -9 <pid>
```

#### Docker Issues
```bash
# Reset everything
docker compose down -v
docker system prune -f
docker compose up -d --build
```

#### Environment Variables Not Loading
1. Ensure `.env` file exists in project root
2. Check file permissions: `chmod 644 .env`
3. Restart Docker containers: `docker compose restart`

#### Database Connection Errors
1. Verify PostgreSQL is running: `docker compose ps postgres`
2. Check logs: `docker compose logs postgres`
3. Test connection manually (see health checks above)

### Getting Help

- 📋 **Known Issues**: Check our [Jira board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1)
- 💬 **Team Discord**: Join for real-time support
- 🐛 **Bug Reports**: Create GitHub issues
- 📖 **More Help**: Visit [Troubleshooting](Troubleshooting)

## 📈 Performance Tips

### For Development
- **Use Docker**: Faster and more consistent than manual setup
- **Enable caching**: Docker builds use layer caching
- **Resource limits**: Adjust Docker memory if needed
- **Hot reloading**: Both frontend and backend support live reloading

### For Production
- **Environment**: Use production `.env` values
- **Optimization**: Run `npm run build` for optimized builds
- **Monitoring**: Enable logging and health checks
- **Security**: Use proper secrets and HTTPS

---

🎉 **Congratulations!** You now have FLEARN running locally. Happy coding!

*Need more detailed setup for specific components? Check the specialized guides in the sidebar.*