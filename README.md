# FLEARN - Interactive Learning Platform

FLEARN is an interactive learning platform designed to make education engaging and fun. Built with modern web technologies, it features gamification elements, progress tracking, and social learning components.

## 🌟 Features

### Core Learning Features
- **Interactive Problem Solving**: Multi-subject questions (Mathematics, Physics, Biology, Chemistry)
- **Progress Tracking**: Visual progress indicators with daily experience points
- **Streak System**: Automatic streak tracking with 1-day tolerance (resets after 2+ days inactive)
- **Rank System**: Dynamic ranking based on total experience across all subjects (6 rank levels: Beginner → Professor)
- **Daily Experience Reset**: Automatic daily exp reset to encourage consistent learning

### Social Features
- **Friend System**: Send/accept friend requests, view friends' profiles
- **Gardens**: Collaborative learning spaces with shared progress tracking
- **Leaderboards**: Compare rankings with friends and the community
- **Profile Customization**: Personal dashboards with statistics and achievements

### Content Management
- **Admin Dashboard**: Comprehensive question and topic management
- **Topic Organization**: Structured learning paths across multiple subjects
- **Backlog System**: Save questions for later review
- **Search Functionality**: Find users, topics, and content easily

### Gamification Elements
- **Experience Points**: Earn points by solving problems correctly
- **Subject-Specific Progress**: Track progress in Math, Physics, Biology, and Chemistry independently
- **Visual Feedback**: Character animations and garden growth based on progress
- **Achievement Tracking**: Monitor streaks, ranks, and milestones

### Technical Features
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Real-time Updates**: Automatic profile updates with streak, rank, and daily exp calculations
- **Mathematical Rendering**: LaTeX/KaTeX support for complex mathematical expressions
- **Secure Authentication**: Google OAuth integration for secure user authentication
- **Multi-database Architecture**: Optimized data storage with PostgreSQL and MongoDB

## 🎯 Project Links

- **🌐 Website Link (On Dev)**: [http://hongrocker49.thddns.net:2725/](http://hongrocker49.thddns.net:2725/)
- **🎬 Presentation video for each iteration**: [Watch on YouTube](https://www.youtube.com/playlist?list=PL5A1xxzpREhzRC439F8eBfSmphkWZ_mvW)
- **📋 Project Proposal and Sprint update**: [Google Docs](https://docs.google.com/document/d/1RPuF_MChizx3Fs8yoE2WUcgqADlSC1DL95WdcP_SXaw/edit?usp=sharing)
- **📊 Project Management**: [Jira Board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog)
- **🎨 UI/UX Design**: [Figma](https://www.figma.com/design/aNtaPV5XsyTG1ETtTOuYwJ/FLEARN?t=uRrKrAPrcLgo4Q3D-1)
- **📚 GitHub Repository**: [ISPBANANA/FLEARN](https://github.com/ISPBANANA/FLEARN)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.0 with PostCSS
- **UI Libraries**: Lucide React (icons), GSAP (animations), Recharts (data visualization)
- **Content Rendering**: React Markdown with KaTeX for mathematical expressions
- **Authentication**: Google OAuth via NextAuth
- **Development**: Turbopack for fast compilation
- **Linting**: ESLint with Next.js configuration

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript
- **Databases**: 
  - PostgreSQL 15 (User data, questions, topics, relationships)
  - MongoDB 7.0 (Backlog and supplementary data)
- **Database Clients**: pg, pg-pool for PostgreSQL; Mongoose for MongoDB
- **Authentication**: Google Auth Library for token verification
- **Content Processing**: KaTeX for mathematical rendering
- **Development**: Nodemon for auto-restart
- **Testing**: Jest with Supertest (35+ unit tests)

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose (6 services)
- **Auto-Deployment**: Custom webhook service with GitHub integration
- **Database Management**: 
  - pgAdmin for PostgreSQL administration
  - Mongo Express for MongoDB administration
- **Environment**: Multi-environment support (.env configuration)
- **Logging**: Centralized logging system
- **Monitoring**: Health checks and deployment tracking

### Design & Collaboration
- **UI/UX**: Figma
- **Project Management**: Jira (Agile/Scrum)
- **Version Control**: Git with GitHub
- **Communication**: Discord with GitHub webhooks
- **Documentation**: GitHub Wiki with comprehensive guides

## 📚 Documentation

Comprehensive documentation is available in our [GitHub Wiki](../../wiki):

### 📖 Getting Started
- **[🏠 Home](../../wiki/Home)** - Main documentation hub and overview
- **[🚀 Getting Started](../../wiki/Getting-Started)** - Complete setup and installation guide
- **[🔧 API Setup](../../wiki/API-Setup-Guide)** - Backend API configuration and endpoints

### 🏗️ Architecture & Deployment
- **[🏗️ Architecture](../../wiki/Architecture)** - System design, components, and data flow
- **[🐳 Docker Deployment](../../wiki/Docker-Deployment)** - Container setup, deployment procedures
- **[🔒 Port Configuration](../../wiki/Port-Configuration)** - Port reference and network security

### 🔐 Security & Authentication
- **[🔑 Authentication Guide](../../wiki/Authentication-Auth0)** - Google OAuth integration setup
- **[🛡️ Security Guidelines](../../wiki/Security-Guidelines)** - Best practices and security measures

### 📁 Backend Documentation (in `FLEARN-back/`)
- **Quick References**: API endpoints, models, database schema, auto-update features
- **Feature Docs**: Streak system, rank calculation, daily exp reset, leaderboards
- **Testing**: Comprehensive test suites with 35+ unit tests

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** (recommended for easiest setup)
- **Node.js** v18 or higher (for local development)
- **Git** for version control
- **Google Cloud Account** (for OAuth credentials)

### Get Started in 3 Steps

```bash
# 1. Clone the repository
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN

# 2. Configure environment variables
# Copy the sample .env and fill in your credentials (see Sample .env section below)
cp .env.example .env
# Edit .env with your database passwords and Google OAuth credentials

# 3. Start all services with Docker
docker compose up -d

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8099
# pgAdmin: http://localhost:5050
# Mongo Express: http://localhost:8081
```

### 🎯 What Gets Started?
The `docker compose up -d` command launches 6 services:
- **Frontend** (Next.js) - Port 3000
- **Backend** (Express API) - Port 8099
- **PostgreSQL** - Port 5432 (with automatic schema initialization)
- **MongoDB** - Port 27017
- **pgAdmin** - Port 5050 (PostgreSQL web interface)
- **Mongo Express** - Port 8081 (MongoDB web interface)
- **Webhook Service** - Port 3001 (auto-deployment)

> **📖 For detailed setup instructions**, including environment configuration, webhook deployment, manual development setup, and troubleshooting, see our **[Getting Started Guide](../../wiki/Getting-Started)**.

## 🎮 Key Features Explained

### Automatic Profile Updates
FLEARN automatically updates user profiles with three intelligent systems:

1. **Streak System** - Tracks consecutive days of learning
   - ✅ 1-day tolerance: Missing one day won't reset your streak
   - ❌ Resets after 2+ days of inactivity
   - Encourages consistent learning habits

2. **Rank System** - Dynamic ranking based on total experience
   - 6 Ranks: Beginner → Primary school → Secondary school → University student → Graduated → Professor
   - Automatically recalculates when you earn experience
   - Progression: 8,000 exp per rank level

3. **Daily Experience** - Fresh start every day
   - Resets at midnight (00:00 Bangkok time)
   - Tracks daily learning progress
   - Encourages balanced daily study

### API Highlights

The backend provides RESTful APIs for:
- **Users** (`/api/users`) - Profile management, experience tracking, rankings
- **Questions** (`/api/questions`) - Problem database with multi-subject support
- **Topics** (`/api/topics`) - Organized learning paths
- **Friends** (`/api/friends`) - Social connections and requests
- **Gardens** (`/api/gardens`) - Collaborative learning spaces
- **Backlog** (`/api/backlog`) - Save questions for later

All endpoints require Google OAuth authentication via JWT tokens.

## 📱 Sample .env
```env
# ========================================
# FLEARN Environment Configuration
# ========================================

# --- Server Configuration ---
PORT=8099
NODE_ENV=development

# --- Frontend Configuration ---
FRONT_PORT=3000

# --- Webhook Service Configuration ---
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your_webhook_secret_for_github_integration

# --- Database Configuration ---
# MongoDB (for Docker Compose)
MONGO_URL=mongodb://admin:your_mongo_password@localhost:27017/flearn_db?authSource=admin
# MongoDB (local development - uncomment if not using Docker)
# MONGO_URL=mongodb://localhost:27017/flearn-db

# --- PostgreSQL Configuration ---
POSTGRES_DB=flearn_test
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# --- MongoDB Configuration for Docker ---
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password
MONGO_INITDB_DATABASE=flearn_db
MONGO_PORT=27017

# --- pgAdmin Configuration ---
PGADMIN_DEFAULT_EMAIL=admin@flearn.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password
PGADMIN_PORT=8088

# --- MongoDB Express Configuration ---
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=your_mongo_express_password
MONGO_EXPRESS_PORT=8087
MONGO_EXPRESS_INTERNAL_PORT=8099

# --- JWT Configuration ---
JWT_SECRET=your_jwt_secret_key_here

# --- CORS Configuration ---
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:8099,http://localhost:3001,http://localhost:5173,http://localhost:3000

# --- API Configuration ---
API_VERSION=v1

# --- Logging ---
LOG_LEVEL=debug

# --- Google OAuth Configuration (NextAuth) ---
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Google OAuth Credentials (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# --- Public API URL ---
NEXT_PUBLIC_API_BASE_URL=http://localhost:8099
```

### 🔑 How to Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your .env file
## 🛠️ Development

### Quick Commands

```bash
# === Docker Management ===
docker compose up -d              # Start all services in background
docker compose down               # Stop all services
docker compose down -v            # Stop and remove volumes (⚠️ deletes data)
docker compose logs -f            # View real-time logs from all services
docker compose logs -f flearn_backend   # View specific service logs
docker compose restart            # Restart all services
docker compose build              # Rebuild all containers

# === Frontend Development ===
cd FLEARN-front
npm install                       # Install dependencies
npm run dev                       # Start dev server (http://localhost:3000)
npm run build                     # Build for production
npm run lint                      # Run ESLint

# === Backend Development ===
cd FLEARN-back
npm install                       # Install dependencies
npm run dev                       # Start with nodemon (auto-reload)
npm test                          # Run all tests
npm run test:watch                # Run tests in watch mode
npm run test:coverage             # Generate coverage report

# === Root Level Commands (both front + back) ===
npm run dev                       # Start Docker services
npm run dev:frontend              # Start frontend only (local)
npm run dev:backend               # Start backend only (local)
npm run install:all               # Install deps for both front and back
npm run test                      # Run backend tests
```

### 📂 Project Structure
```
FLEARN/
├── FLEARN-front/          # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages (Next.js 13+)
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configs
│   └── public/            # Static assets (images, icons)
│
├── FLEARN-back/           # Express.js backend API
│   ├── routes/            # API route handlers (users, questions, etc.)
│   ├── middleware/        # Auth, streak helper, etc.
│   ├── models/            # Mongoose models for MongoDB
│   ├── config/            # Database configurations
│   ├── tests/             # Jest unit and integration tests
│   ├── init-scripts/      # PostgreSQL initialization
│   └── docs/              # Feature documentation
│
├── webhook-service/       # Auto-deployment service
├── wiki-content/          # GitHub Wiki markdown files
├── scripts/               # Utility scripts (deployment, testing)
├── docker-compose.yml     # Multi-container orchestration
└── .env                   # Environment configuration
```

### 🧪 Testing

```bash
# Backend tests (35+ unit tests)
cd FLEARN-back
npm test                   # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage report

# Integration tests
cd tests
./integration-test.sh      # Test API endpoints
./unit-test.sh             # Run all unit tests
```

### 🔧 Utility Scripts

Located in `scripts/` directory:

- **`setup-webhook.sh`** - Configure GitHub webhook for auto-deployment
- **`update.sh`** - Manual deployment script (pulls, rebuilds, restarts)
- **`run-tests.sh`** - Execute test suites
- **`test-webhook.sh`** - Test webhook functionality

> **📖 For complete development guides**, including database access, API testing, debugging procedures, and deployment workflows, see our **[Docker Deployment Guide](../../wiki/Docker-Deployment)**.

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>🔴 Docker containers won't start</b></summary>

```bash
# Check if ports are already in use
docker ps -a

# Stop and clean everything
docker compose down -v

# Rebuild and restart
docker compose build --no-cache
docker compose up -d
```
</details>

<details>
<summary><b>🔴 Authentication not working</b></summary>

1. Verify Google OAuth credentials in `.env`
2. Ensure redirect URI matches: `http://localhost:3000/api/auth/callback/google`
3. Check NEXTAUTH_URL and NEXTAUTH_SECRET are set
4. Clear browser cookies and try again
</details>

<details>
<summary><b>🔴 Database connection errors</b></summary>

```bash
# Check if databases are running
docker compose ps

# View database logs
docker compose logs -f postgres
docker compose logs -f mongodb

# Restart database services
docker compose restart postgres mongodb
```
</details>

<details>
<summary><b>🔴 Frontend can't connect to backend</b></summary>

1. Verify `NEXT_PUBLIC_API_BASE_URL=http://localhost:8099` in `.env`
2. Check backend is running: `docker compose logs -f flearn_backend`
3. Test backend directly: `curl http://localhost:8099/api/health`
4. Check CORS settings in backend configuration
</details>

### Need Help?
- **📚 Documentation**: Check our [GitHub Wiki](../../wiki) first
- **🎯 Known Issues**: [Jira Board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog)
- **🐞 Bug Reports**: [Create an issue on GitHub](../../issues)
- **💬 Support**: Contact the development team

### Useful Commands for Debugging

```bash
# Check service status
docker compose ps

# View logs for specific service
docker compose logs -f flearn_backend
docker compose logs -f flearn_frontend

# Enter container shell
docker exec -it flearn_backend sh
docker exec -it flearn_frontend sh

# Check database connections
docker exec -it flearn_postgres psql -U postgres -d flearn_db
docker exec -it flearn_mongodb mongosh

# Restart specific service
docker compose restart flearn_backend
```

## 📄 License

This project is part of an educational initiative developed by students at Kasetsart University. Please refer to the [LICENSE.md](LICENSE.md) file for detailed terms.

## 👥 Team

**ISPBANANA Development Team** - Software and Knowledge Engineering Students, Kasetsart University

| Student ID | Name | Role |
|------------|------|------|
| 6710545610 | Techaphatr Indhavivadhana | Full-stack Developer, Project Manager |
| 6710545504 | Chachalit Khanarat | Full-stack Developer, Infrastructure |
| 6710545938 | Sethtatad Kijkanjanarat | Front-end Developer |
| 6710545733 | Phruek Chantarasittiphon | Full-stack Developer, UX-UI, Dev-Op |

### 🎓 Academic Project
This project is developed as part of the **Individual Software Process (ISP)** course at Kasetsart University. It demonstrates modern web development practices, agile methodologies, and collaborative software engineering.

## 🙏 Acknowledgments

- **Next.js** for the excellent React framework
- **Express.js** community for the robust backend framework
- **PostgreSQL** and **MongoDB** teams for reliable database systems
- **Docker** for simplifying deployment and development
- **Google Cloud** for OAuth services
- **Kasetsart University** for educational support and resources

---

**Built with ❤️ by the ISPBANANA team**  
*Making learning interactive, engaging, and fun!*
