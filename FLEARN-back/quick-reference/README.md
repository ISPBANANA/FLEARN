# FLEARN Backend - Quick Reference Index

> **Comprehensive documentation for FLEARN Backend API organized by topic**

## 📚 Documentation Structure

This quick reference library provides organized documentation for all aspects of the FLEARN Backend. Each document is focused on a specific topic for easy navigation and reference.

---

## 🗂️ Quick Reference Guides

### 🔌 [API Endpoints](./API_ENDPOINTS.md)
Complete reference for all REST API endpoints organized by resource:
- **Users API** - Profile management, experience tracking, preferences
- **Friends API** - Friend requests, management, relationships
- **Gardens API** - Shared learning gardens, streaks
- **Questions API** - Question CRUD, validation, types
- **Topics API** - Topic organization, statistics
- **Backlog API** - Answer tracking, statistics, progress

**Use this when:** You need to know what endpoints are available, their request/response formats, or how to interact with the API.

---

### 🔐 [Authentication](./AUTHENTICATION.md)
Google OAuth 2.0 authentication system:
- Google ID token verification
- Middleware usage (`checkJwt`, `optionalJwt`)
- Request format and headers
- User object structure
- Frontend integration
- Security best practices

**Use this when:** Implementing authentication, troubleshooting auth issues, or integrating with the frontend.

---

### 🗄️ [Database](./DATABASE.md)
Hybrid database architecture (PostgreSQL + MongoDB):
- Connection setup and configuration
- PostgreSQL schema and queries
- MongoDB collections and operations
- Database initialization
- Common queries and patterns
- Transaction handling
- Debugging tips

**Use this when:** Working with data storage, writing queries, or understanding the database schema.

---

### 🔄 [Auto-Update Features](./AUTO_UPDATE_FEATURES.md)
Automatic user data maintenance:
- **Streak Reset** - Automatic reset after 2+ days inactivity
- **Rank Calculation** - Dynamic rank based on total experience
- **Daily Exp Reset** - Reset daily experience at day start
- Implementation details and examples
- Testing strategies

**Use this when:** Understanding how streaks, ranks, or daily experience work, or debugging auto-update issues.

---

### 📦 [Models](./MODELS.md)
Data models and ORM patterns:
- **Backlog Model** - Question attempt tracking
- **Question Model** - Hybrid storage (PostgreSQL + MongoDB)
- **Topic Model** - Question organization
- CRUD operations for each model
- Relationships and joins
- Advanced queries

**Use this when:** Working with data models, creating queries, or understanding data relationships.

---

### 🚀 [Setup & Configuration](./SETUP.md)
Getting started and deployment:
- Quick start guide
- Docker setup and commands
- Environment variables
- Database initialization
- Google OAuth setup
- Testing and debugging
- Common issues and solutions

**Use this when:** Setting up the project, deploying, or troubleshooting environment issues.

---

## 🎯 Quick Navigation

### By Task

**I want to...**

- **Create a new endpoint** → [API Endpoints](./API_ENDPOINTS.md)
- **Add authentication to a route** → [Authentication](./AUTHENTICATION.md)
- **Query the database** → [Database](./DATABASE.md)
- **Understand streak logic** → [Auto-Update Features](./AUTO_UPDATE_FEATURES.md)
- **Work with questions** → [Models](./MODELS.md) → Question Model
- **Set up the project** → [Setup & Configuration](./SETUP.md)
- **Test the API** → [Setup](./SETUP.md) → Testing section

### By Component

**Users & Authentication**
- [Authentication](./AUTHENTICATION.md) - Google OAuth
- [API Endpoints](./API_ENDPOINTS.md) - Users API
- [Database](./DATABASE.md) - User table schema
- [Auto-Update Features](./AUTO_UPDATE_FEATURES.md) - Streak & rank

**Questions & Learning**
- [Models](./MODELS.md) - Question, Topic, Backlog
- [API Endpoints](./API_ENDPOINTS.md) - Questions, Topics APIs
- [Database](./DATABASE.md) - Hybrid storage

**Social Features**
- [API Endpoints](./API_ENDPOINTS.md) - Friends, Gardens APIs
- [Database](./DATABASE.md) - Friend, Garden tables
- [Auto-Update Features](./AUTO_UPDATE_FEATURES.md) - Garden streaks

---

## 🔧 Additional Documentation

### In FLEARN-back Directory

- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - Legacy quick reference (consolidated here)
- **[QUESTIONS_QUICK_REFERENCE.md](../QUESTIONS_QUICK_REFERENCE.md)** - Questions API quick card
- **[AUTO_UPDATE_FEATURES_SUMMARY.md](../AUTO_UPDATE_FEATURES_SUMMARY.md)** - Auto-update summary

### Detailed Guides (docs/)

- **[STREAK_RESET.md](../docs/STREAK_RESET.md)** - Detailed streak reset flow
- **[RANK_CALCULATION.md](../docs/RANK_CALCULATION.md)** - Rank calculation details
- **[DAILY_EXP_RESET.md](../docs/DAILY_EXP_RESET.md)** - Daily experience reset
- **[LEADERBOARD_VISUAL_GUIDE.md](../docs/LEADERBOARD_VISUAL_GUIDE.md)** - Leaderboard implementation

### Wiki Content (../wiki-content/)

- **[Architecture.md](../../wiki-content/Architecture.md)** - System architecture
- **[Docker-Deployment.md](../../wiki-content/Docker-Deployment.md)** - Docker deployment guide
- **[Authentication-Auth0.md](../../wiki-content/Authentication-Auth0.md)** - Auth details
- **[API-Setup-Guide.md](../../wiki-content/API-Setup-Guide.md)** - API setup
- **[Getting-Started.md](../../wiki-content/Getting-Started.md)** - Getting started guide

---

## 📋 Cheat Sheets

### Start the Backend
```bash
# Docker (recommended)
docker-compose up -d flearn-backend

# Local development
cd FLEARN-back && npm run dev
```

### Make an Authenticated Request
```bash
curl -H "Authorization: Bearer <GOOGLE_ID_TOKEN>" \
  http://localhost:8099/api/users/profile
```

### Common Database Operations
```javascript
// PostgreSQL
const result = await pgPool.query('SELECT * FROM "user" WHERE user_id = $1', [userId]);

// MongoDB
const question = await Question.findById(questionId);
```

### Import Helpers
```javascript
// Authentication
const { checkJwt } = require('../middleware/auth');

// Database
const { pgPool, mongoose } = require('../config/database');

// Auto-update features
const { checkAndResetUserStreak, calculateRank } = require('../middleware/streakHelper');

// Models
const Backlog = require('../models/Backlog');
const Question = require('../models/Question');
const Topic = require('../models/Topic');
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FLEARN Backend                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Express.js API (index.js)                                   │
│  ├── Routes/                                                 │
│  │   ├── users.js      (User management, profiles)          │
│  │   ├── friends.js    (Social connections)                 │
│  │   ├── gardens.js    (Shared learning)                    │
│  │   ├── questions.js  (Question management)                │
│  │   ├── topics.js     (Topic organization)                 │
│  │   └── backlog.js    (Progress tracking)                  │
│  │                                                           │
│  ├── Middleware/                                             │
│  │   ├── auth.js       (Google OAuth)                       │
│  │   └── streakHelper.js (Auto-updates)                     │
│  │                                                           │
│  ├── Models/                                                 │
│  │   ├── Backlog.js    (PostgreSQL)                         │
│  │   ├── Question.js   (Hybrid: PG + Mongo)                 │
│  │   └── Topic.js      (PostgreSQL)                         │
│  │                                                           │
│  └── Config/                                                 │
│      └── database.js   (PostgreSQL + MongoDB)               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                        Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PostgreSQL                    MongoDB                       │
│  ├── user                      └── question_contents         │
│  ├── friend                                                  │
│  ├── garden                                                  │
│  ├── subject                                                 │
│  ├── topic                                                   │
│  ├── backlog                                                 │
│  └── question (metadata)                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🆘 Getting Help

### Troubleshooting Steps

1. **Check Setup** → [Setup & Configuration](./SETUP.md)
2. **Verify Environment** → [Setup](./SETUP.md) → Environment Variables
3. **Review Logs** → `docker-compose logs -f flearn-backend`
4. **Test Health** → `curl http://localhost:8099/health`
5. **Check Database** → [Database](./DATABASE.md) → Debugging section

### Common Issues

| Issue | Solution |
|-------|----------|
| Auth errors | [Authentication](./AUTHENTICATION.md) → Error Handling |
| Database connection | [Setup](./SETUP.md) → Common Issues |
| Port conflicts | [Setup](./SETUP.md) → Network Configuration |
| CORS errors | [Setup](./SETUP.md) → Common Issues → CORS |

---

## 📖 Reading Order for New Developers

1. **[Setup & Configuration](./SETUP.md)** - Get the project running
2. **[Database](./DATABASE.md)** - Understand data structure
3. **[Authentication](./AUTHENTICATION.md)** - Learn auth flow
4. **[API Endpoints](./API_ENDPOINTS.md)** - Explore available endpoints
5. **[Models](./MODELS.md)** - Understand data models
6. **[Auto-Update Features](./AUTO_UPDATE_FEATURES.md)** - Learn automatic features

---

## 🔄 Last Updated

**Date:** October 27, 2025  
**Version:** 1.0.0  
**Maintainer:** FLEARN Development Team

---

## 📄 License

This documentation is part of the FLEARN project.

---

<div align="center">

**Happy Coding! 🚀**

[Report Issue](../../issues) • [Request Feature](../../issues) • [Contribute](../../pulls)

</div>
