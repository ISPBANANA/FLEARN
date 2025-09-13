# FLEARN - Interactive Learning Platform

![FLEARN Logo](https- **[🏠 Home](../../wiki/Home)** - Main documentation hub
- **[🚀 - Testing requirements

## 🛠️ Development

### Quick Commandsng Started](../../wiki/Getting-Started)** - Setup and installation guide
- **[🏗️ Architecture](../../wiki/Architecture)** - System design and components
- **[🔧 API Setup](../../wiki/API-Setup-Guide)** - Backend configuration
- **[🔐 Authentication](../../wiki/Authentication-Auth0)** - Auth0 integration guide
- **[🐳 Docker Deployment](../../wiki/Docker-Deployment)** - Container setup and deployment
- **[🔒 Port Configuration](../../wiki/Port-Configuration)** - Port reference and securityshields.io/badge/FLEARN-Learning%20Platform-blue)
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

- **🌐 Website Link (On Dev)**: [http://hongrocker49.thddns.net:2725/](http://hongrocker49.thddns.net:2725/)
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
- **Auto-Deployment**: GitHub Webhooks with instant deployment
- **Database Management**: 
  - pgAdmin for PostgreSQL
  - Mongo Express for MongoDB
- **Environment**: Multi-environment support (.env configuration)
- **Monitoring**: Deployment logging and health checks

### Design & Collaboration
- **UI/UX**: Figma
- **Project Management**: Jira
- **Version Control**: Git with GitHub
- **Communication**: Discord with GitHub webhooks

## 📚 Documentation

Comprehensive documentation is available in our [GitHub Wiki](../../wiki):

- **[🏠 Home](../../wiki/Home)** - Main documentation hub
- **[� Getting Started](../../wiki/Getting-Started)** - Setup and installation guide
- **[🏗️ Architecture](../../wiki/Architecture)** - System design and components
- **[🔧 API Setup](../../wiki/API-Setup-Guide)** - Backend configuration
- **[� Authentication](../../wiki/Authentication-Auth0)** - Auth0 integration guide
- **[🐳 Docker Deployment](../../wiki/Docker-Deployment)** - Container setup and deployment
- **[🔒 Port Configuration](../../wiki/Port-Configuration)** - Port reference and security

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (v18 or higher)  
- Git

### Get Started in 3 Steps
```bash
# 1. Clone the repository
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN

# 2. Start all services with Docker
docker compose up -d

# 3. Access the application
# Frontend: http://localhost:[FRONTEND_PORT]
# Backend: http://localhost:[API_PORT]
```

> **📖 For detailed setup instructions**, including environment configuration, webhook deployment, and manual development setup, see our **[Getting Started Guide](../../wiki/Getting-Started)**.

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

We welcome contributions! Please see our **[Contributing Guidelines](../../wiki/Contributing-Guidelines)** for:
- Development workflow and standards
- Branch naming conventions  
- Code review process
- Testing requirements

## �️ Development

### Quick Commands
```bash
# Docker commands
docker compose up -d     # Start all services
docker compose down      # Stop all services  
docker compose logs -f   # View logs

# Development
cd FLEARN-front && npm run dev  # Frontend development
cd FLEARN-back && npm run dev   # Backend development
```

### Utility Scripts
- **Deployment**: `scripts/setup-webhook.sh`, `scripts/update.sh`
- **Testing**: `scripts/run-tests.sh` 
- **Full documentation**: [`scripts/README.md`](scripts/README.md)

> **📖 For complete development guides**, including database access, API testing, and deployment procedures, see our **[Docker Deployment Guide](../../wiki/Docker-Deployment)**.

## 🐛 Troubleshooting

### Need Help?
- **📚 Documentation**: Check our [GitHub Wiki](../../wiki) first
- **🎯 Issues**: [Jira Board](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog) for known issues
- **🐞 Bugs**: Create an issue on GitHub for bug reports
- **💬 Support**: Join our Discord server for real-time help

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