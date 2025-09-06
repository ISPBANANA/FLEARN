# FLEARN - Interactive Learning Platform

![FLEARN Logo](https://img.shields.io/badge/FLEARN-Learning%20Platform-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)

FLEARN is an interactive learning platform designed to make education engaging and fun. Built with modern web technologies, it features gamification elements, progress tracking, and social learning components.

## 🌟 Features

- **Interactive Learning**: Engaging educational content with gamification
- **Progress Tracking**: Visual progress indicators and streaks
- **Social Learning**: Friend system and leaderboards
- **Responsive Design**: Works seamlessly across devices
- **Admin Dashboard**: Comprehensive content and user management
- **Multi-database Support**: MongoDB and PostgreSQL integration

## 🎯 Project Links

- **🎬 Pitching Video**: [Watch on YouTube](https://youtu.be/YiV91YK47vU)
- **📋 Project Proposal**: [Google Docs](https://docs.google.com/document/d/1RPuF_MChizx3Fs8yoE2WUcgqADlSC1DL95WdcP_SXaw/edit?usp=sharing)
- **📊 Project Management**: [Jira Board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog)
- **🎨 UI/UX Design**: [Figma](https://www.figma.com/design/aNtaPV5XsyTG1ETtTOuYwJ/FLEARN?t=uRrKrAPrcLgo4Q3D-1)
- **📚 GitHub Repository**: [ISPBANANA/FLEARN](https://github.com/ISPBANANA/FLEARN)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **Development**: Turbopack for fast compilation
- **Linting**: ESLint with Next.js configuration

### Backend
- **Runtime**: Node.js with Express.js
- **Databases**: 
  - MongoDB 7.0 (Primary data storage)
  - PostgreSQL 15 (Relational data)
- **ODM/ORM**: Mongoose for MongoDB
- **Development**: Nodemon for auto-restart

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Database Management**: 
  - pgAdmin for PostgreSQL
  - Mongo Express for MongoDB
- **Environment**: Multi-environment support (.env configuration)

### Design & Collaboration
- **UI/UX**: Figma
- **Project Management**: Jira
- **Version Control**: Git with GitHub
- **Communication**: Discord with GitHub webhooks

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (v18 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Application
NODE_ENV=development
PORT=your_api_port

# PostgreSQL Database
POSTGRES_DB=your_database_name
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_secure_postgres_password
POSTGRES_PORT=your_postgres_port

# pgAdmin
PGADMIN_DEFAULT_EMAIL=your_admin_email
PGADMIN_DEFAULT_PASSWORD=your_secure_pgadmin_password
PGADMIN_PORT=your_pgadmin_port

# MongoDB
MONGO_INITDB_ROOT_USERNAME=your_mongo_user
MONGO_INITDB_ROOT_PASSWORD=your_secure_mongo_password
MONGO_INITDB_DATABASE=your_mongo_database
MONGO_PORT=your_mongo_port

# Mongo Express
MONGO_EXPRESS_USERNAME=your_express_admin
MONGO_EXPRESS_PASSWORD=your_secure_express_password
MONGO_EXPRESS_PORT=your_express_port
MONGO_EXPRESS_INTERNAL_PORT=your_express_internal_port
```

### 3. Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Manual Development Setup

#### Backend Setup
```bash
cd FLEARN-back
npm install
npm run dev
```

#### Frontend Setup
```bash
cd FLEARN-front
npm install
npm run dev
```

## 📁 Project Structure

```
FLEARN/
├── docker-compose.yml          # Multi-service Docker setup
├── README.md                   # Project documentation
├── FLEARN-back/                # Backend API
│   ├── index.js               # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── Dockerfile            # Backend container setup
│   ├── config/
│   │   └── database.js       # Database configurations
│   ├── init-scripts/         # PostgreSQL initialization
│   │   └── 01-init.sql
│   └── mongo-init/           # MongoDB initialization
│       └── 01-init.js
└── FLEARN-front/               # Frontend application
    ├── package.json           # Frontend dependencies
    ├── Dockerfile            # Frontend container setup
    ├── next.config.ts        # Next.js configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── src/
    │   └── app/              # Next.js app directory
    │       ├── layout.tsx    # Root layout
    │       ├── page.tsx      # Home page
    │       └── globals.css   # Global styles
    └── public/               # Static assets
```

## 🔧 Development Workflow

### Branch Naming Convention
- **Features**: `feat/front/feature-name` or `feat/back/feature-name`
- **Hotfixes**: `hotfix/front/fix-name` or `hotfix/back/fix-name`
- **Main Branch**: `main`

### Commit Guidelines
- Every commit must have a meaningful message
- Follow conventional commit format when possible
- Link commits to Jira tickets when applicable

### Team Collaboration
- **Meetings**: Every Wednesday evening
- **Project Tracking**: Jira for task management and workload distribution
- **Communication**: Discord with GitHub webhook integration
- **Code Review**: Required before merging to main branch

## 🗄️ Database Access

### PostgreSQL (Development)
- **URL**: `localhost:[POSTGRES_PORT]`
- **Database**: `[POSTGRES_DB]`
- **pgAdmin**: `http://localhost:[PGADMIN_PORT]`

### MongoDB (Development)
- **URL**: `localhost:[MONGO_PORT]`
- **Database**: `[MONGO_DB]`
- **Mongo Express**: `http://localhost:[MONGO_EXPRESS_PORT]`

## 🌐 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:[FRONTEND_PORT] | Next.js application |
| Backend API | http://localhost:[API_PORT] | Express.js API |
| pgAdmin | http://localhost:[PGADMIN_PORT] | PostgreSQL management |
| Mongo Express | http://localhost:[MONGO_EXPRESS_PORT] | MongoDB management |

> **Note**: Replace the bracketed placeholders with your actual port numbers from your `.env` configuration.

## 📱 Planned Features

### Sprint 2 Development Goals

#### Frontend Development
- [ ] Navigation component
- [ ] Footer component
- [ ] Landing page with animations
- [ ] About Us page
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] 404 and error pages
- [ ] User registration form
- [ ] Cookie-based session management
- [ ] User profile pages (owner & visitor views)

#### Backend Development
- [ ] User database schema
- [ ] User authentication API
- [ ] User profile management API
- [ ] Experience points system
- [ ] Leaderboard functionality
- [ ] Google Login integration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** following our naming convention
3. **Make your changes** with meaningful commits
4. **Test your changes** thoroughly
5. **Create a pull request** with detailed description
6. **Link to relevant Jira tickets**

## 📋 Available Scripts

### Root Directory
```bash
# Start all services with Docker
docker-compose up -d

# Stop all services
docker-compose down

# View service logs
docker-compose logs -f [service-name]

# Reset databases
docker-compose down -v && docker-compose up -d
```

### Frontend (FLEARN-front/)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend (FLEARN-back/)
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run tests (when implemented)
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure your configured ports in `.env` are available and not in use
2. **Docker issues**: Run `docker-compose down -v` to reset volumes if needed
3. **Environment variables**: Double-check your `.env` file configuration
4. **Database connections**: Verify database services are running before starting the API

### Getting Help

- Check our [Jira board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog) for known issues
- Join our Discord server for real-time support
- Create an issue on GitHub for bug reports

## 📄 License

This project is part of an educational initiative. Please refer to the license file for detailed terms.

## 👥 Team

**ISPBANANA Development Team**
- Project management via Jira
- Weekly sprint meetings
- Collaborative development workflow
- Discord integration for team communication

---

**Built with ❤️ by the ISPBANANA team**