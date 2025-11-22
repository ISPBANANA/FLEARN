# 🌟 FLEARN - Interactive Learning Platform Wiki

![FLEARN Logo](https://img.shields.io/badge/FLEARN-Learning%20Platform-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

Welcome to the comprehensive documentation for **FLEARN**, an interactive learning platform designed to make education engaging and fun through gamification, progress tracking, and social learning components.

## 🚀 Quick Navigation

### 🎯 **Getting Started**
- **[Getting Started Guide](Getting-Started)** - Complete setup instructions
- **[API Setup Guide](API-Setup-Guide)** - Backend configuration
- **[Docker & Deployment](Docker-Deployment)** - Containerized deployment

### 🏗️ **Technical Documentation**
- **[Architecture Overview](Architecture)** - System design and components
- **[Authentication Guide](Authentication-Auth0)** - Google OAuth integration
- **[API Setup Guide](API-Setup-Guide)** - Backend configuration and endpoints
- **[Docker & Deployment](Docker-Deployment)** - Containerized deployment

### 🧪 **Development & Testing**
- **[Port Configuration](Port-Configuration)** - Port reference and security
- **[Security Guidelines](Security-Guidelines)** - Critical security practices

### 🔒 **Security & Best Practices**
- **[Security Guidelines](Security-Guidelines)** - **REQUIRED READING** - Critical security practices
- **[Environment Setup](Getting-Started#environment-configuration)** - Secure configuration guide

## 📋 Project Overview

FLEARN is built with a modern tech stack and follows microservices architecture:

### ✨ Key Features
- **Interactive Learning**: Multi-subject questions (Math, Physics, Biology, Chemistry) with KaTeX support
- **Progress Tracking**: Daily experience points, streaks with 1-day tolerance, and visual progress indicators
- **Rank System**: Dynamic ranking with 6 levels (Beginner → Professor) based on total experience
- **Social Features**: Friend system, gardens for collaborative learning, and leaderboards
- **Automatic Updates**: Streak reset, rank calculation, and daily exp reset happen automatically
- **Admin Dashboard**: Comprehensive question and topic management
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Secure Authentication**: Google OAuth integration with NextAuth
- **Multi-database Architecture**: PostgreSQL for structured data, MongoDB for flexible content

### 🎯 **Important Links**
- **🌐 Live Demo**: [http://hongrocker49.thddns.net:2725/](http://hongrocker49.thddns.net:2725/)
- **🎬 Pitching Video**: [Watch on YouTube](https://youtu.be/YiV91YK47vU)
- **📋 Project Proposal**: [Google Docs](https://docs.google.com/document/d/1RPuF_MChizx3Fs8yoE2WUcgqADlSC1DL95WdcP_SXaw/edit?usp=sharing)
- **📊 Jira Board**: [Project Management](https://isp-banana.atlassian.net/jira/software/projects/FLEARN/boards/1/backlog)
- **🎨 Figma Design**: [UI/UX Mockups](https://www.figma.com/design/aNtaPV5XsyTG1ETtTOuYwJ/FLEARN?t=uRrKrAPrcLgo4Q3D-1)
- **📚 GitHub Repository**: [ISPBANANA/FLEARN](https://github.com/ISPBANANA/FLEARN)

## 🏛️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Webhook       │
│   (Next.js)     │───▶│   (Express.js)  │    │   Service       │
│   Port: 3000    │    │   Port: 8099    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Static  │             │Database │             │ GitHub  │
    │ Assets  │             │Services │             │Webhooks │
    └─────────┘             └─────────┘             └─────────┘
                                 │
                    ┌────────────▼────────────┐
                    │                         │
               ┌────▼─────┐              ┌────▼─────┐
               │PostgreSQL│              │ MongoDB  │
               │Port: [DB]│              │Port: [DB]│
               └──────────┘              └──────────┘
```

### 🔧 Core Services
- **Frontend Service**: Next.js 15.5.2 with React 19, TypeScript, and Tailwind CSS 4.0
- **Backend API**: Express.js server with Google OAuth authentication via NextAuth
- **Webhook Service**: GitHub integration for automated deployment (Port 3001)
- **PostgreSQL 15**: User data, questions, topics, and relationships with pgAdmin interface
- **MongoDB 7.0**: Backlog and supplementary data with Mongo Express interface
- **Database Management**: pgAdmin (Port 8088) & Mongo Express (Port 8087)

## 🚦 Current Status

### ✅ Completed Features
- [x] Containerized development environment with Docker Compose (6 services)
- [x] Webhook-based auto-deployment with GitHub integration
- [x] Google OAuth authentication system via NextAuth
- [x] Database setup (PostgreSQL 15 + MongoDB 7.0)
- [x] Complete backend API with RESTful endpoints
- [x] Frontend with Next.js 15.5.2, React 19, TypeScript, and Tailwind CSS 4.0
- [x] Comprehensive testing suite (35+ unit tests)
- [x] User profile management with automatic updates
- [x] Experience points and gamification (daily exp, subject exp, ranks)
- [x] Streak system with 1-day tolerance and automatic reset
- [x] Rank system with 6 levels (Beginner → Professor)
- [x] Friends system with requests and status management
- [x] Gardens for collaborative learning
- [x] Question and topic management with admin capabilities
- [x] Backlog system for saved questions
- [x] Mathematical expression rendering with KaTeX
- [x] Search functionality for users and content
- [x] Leaderboard system
- [x] Automatic daily exp reset at midnight (Bangkok timezone)

### 🚧 Current Sprint Features
- [ ] Enhanced UI/UX with GSAP animations
- [ ] Profile customization and character systems
- [ ] Advanced analytics and insights
- [ ] Performance optimizations
- [ ] Mobile app development

## 🛠️ Quick Start Commands

```bash
# Clone and start the complete environment
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN

# Configure environment (copy and edit .env file)
cp .env.example .env
# Edit .env with your Google OAuth credentials and passwords

# Start all services
docker compose up -d

# Access services
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:8099
# pgAdmin:      http://localhost:8088
# Mongo Express: http://localhost:8087
# Webhook:      http://localhost:3001
```

## 👥 Team & Collaboration

**ISPBANANA Development Team**
- **Project Management**: Jira-based sprints with weekly meetings
- **Communication**: Discord with GitHub webhook integration  
- **Version Control**: Feature branch workflow with PR reviews
- **Development**: Collaborative coding with pair programming sessions

### 📅 Development Workflow
- **Sprint Planning**: Every Wednesday evening
- **Code Reviews**: Required for all main branch merges
- **Testing**: Comprehensive CI/CD with automated testing
- **Deployment**: Instant webhook-based deployments

---

## 📖 How to Use This Wiki

> 🔒 **SECURITY FIRST**: Read [Security Guidelines](Security-Guidelines) before setting up or contributing to FLEARN!

1. **🚨 FIRST**: Read [Security Guidelines](Security-Guidelines) - **MANDATORY**
2. **New to the project?** Start with [Getting Started Guide](Getting-Started)
3. **Setting up development?** Follow [API Setup Guide](API-Setup-Guide)
4. **Need to deploy?** Check [Docker & Deployment](Docker-Deployment)
5. **Contributing code?** Read [Contributing Guidelines](Contributing-Guidelines)
6. **Having issues?** Visit [Troubleshooting](Troubleshooting)

**💡 Pro Tip**: Use the wiki sidebar for quick navigation between sections!

---

*Last updated: November 2025*  
*Built with ❤️ by the ISPBANANA team*