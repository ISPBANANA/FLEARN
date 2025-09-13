# 🌟 FLEARN - Interactive Learning Platform Wiki

![FLEARN Logo](https://img.shields.io/badge/FLEARN-Learning%20Platform-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)

Welcome to the comprehensive documentation for **FLEARN**, an interactive learning platform designed to make education engaging and fun through gamification, progress tracking, and social learning components.

## 🚀 Quick Navigation

### 🎯 **Getting Started**
- **[Getting Started Guide](Getting-Started)** - Complete setup instructions
- **[API Setup Guide](API-Setup-Guide)** - Backend configuration
- **[Docker & Deployment](Docker-Deployment)** - Containerized deployment

### 🏗️ **Technical Documentation**
- **[Architecture Overview](Architecture)** - System design and components
- **[Authentication & Auth0](Authentication-Auth0)** - Security implementation
- **[API Reference](API-Reference)** - Endpoint documentation
- **[Database Guide](Database-Guide)** - Schema and management

### 🧪 **Development & Testing**
- **[Testing Guide](Testing-Guide)** - Comprehensive testing documentation
- **[Scripts & Utilities](Scripts-Utilities)** - Development tools
- **[Contributing Guidelines](Contributing-Guidelines)** - How to contribute
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions

### 🔒 **Security & Best Practices**
- **[Security Guidelines](Security-Guidelines)** - **REQUIRED READING** - Critical security practices
- **[Environment Setup](Getting-Started#environment-configuration)** - Secure configuration guide

## 📋 Project Overview

FLEARN is built with a modern tech stack and follows microservices architecture:

### ✨ Key Features
- **Interactive Learning**: Engaging educational content with gamification
- **Progress Tracking**: Visual progress indicators and achievement streaks
- **Social Learning**: Friend system, leaderboards, and collaborative features
- **Responsive Design**: Seamless experience across all devices
- **Admin Dashboard**: Comprehensive content and user management
- **Multi-database Support**: MongoDB and PostgreSQL integration

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
               │Port: 5432│              │Port:27017│
               └──────────┘              └──────────┘
```

### 🔧 Core Services
- **Frontend Service**: Next.js application with TypeScript
- **Backend API**: Express.js server with Auth0 integration  
- **Webhook Service**: Automated deployment system
- **PostgreSQL**: Relational data storage
- **MongoDB**: Document-based user data
- **Management Interfaces**: pgAdmin & Mongo Express

## 🚦 Current Status

### ✅ Completed Features
- [x] Containerized development environment
- [x] Webhook-based auto-deployment
- [x] Auth0 authentication system
- [x] Database setup (PostgreSQL + MongoDB)
- [x] Backend API structure
- [x] Frontend foundation with TypeScript
- [x] Comprehensive testing suite
- [x] CI/CD pipeline with GitHub Actions

### 🚧 In Development (Sprint 2)
- [ ] User registration and profile management
- [ ] Experience points and gamification system
- [ ] Friends and social features
- [ ] Learning content structure
- [ ] Interactive learning modules
- [ ] Progress tracking dashboard

## 🛠️ Quick Start Commands

```bash
# Clone and start the complete environment
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN
docker compose up -d

# Access services
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:8099
# pgAdmin:      http://localhost:8088
# Mongo Express: http://localhost:8087
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

*Last updated: September 2025*  
*Built with ❤️ by the ISPBANANA team*