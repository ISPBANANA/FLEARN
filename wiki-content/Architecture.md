# 🏗️ FLEARN Architecture Documentation

This document provides a comprehensive overview of FLEARN's system architecture, technology stack, and design decisions.

## 🎯 Architecture Overview

FLEARN follows a **microservices architecture** with containerized services, designed for scalability, maintainability, and development efficiency.

```mermaid
graph TB
    subgraph "Client Layer"
        U[User Browser]
        M[Mobile App - Future]
    end
    
    subgraph "Frontend Layer"
        F[Next.js Frontend<br/>TypeScript + Tailwind<br/>Port: 3000]
    end
    
    subgraph "API Layer"
        B[Express.js Backend<br/>Node.js + Auth0<br/>Port: 8099]
        W[Webhook Service<br/>GitHub Integration<br/>Port: 3001]
    end
    
    subgraph "Database Layer"
        P[(PostgreSQL<br/>Relational Data<br/>Port: 5432)]
        Mo[(MongoDB<br/>Document Store<br/>Port: 27017)]
    end
    
    subgraph "Management Layer"
        PA[pgAdmin<br/>PostgreSQL Admin<br/>Port: 8088]
        ME[Mongo Express<br/>MongoDB Admin<br/>Port: 8087]
    end
    
    subgraph "External Services"
        A0[Auth0<br/>Authentication]
        GH[GitHub<br/>Version Control]
        DO[Docker Registry]
    end
    
    U --> F
    M --> F
    F <--> B
    B --> P
    B --> Mo
    B <--> A0
    W <--> GH
    W --> B
    PA --> P
    ME --> Mo
    
    style F fill:#61dafb,stroke:#000,color:#000
    style B fill:#68a063,stroke:#000,color:#fff
    style P fill:#336791,stroke:#000,color:#fff
    style Mo fill:#4db33d,stroke:#000,color:#fff
```

## 🏛️ System Components

### Frontend Service (`flearn-frontend`)
**Technology**: Next.js 15.5.2 with React 19 and TypeScript 5
- **Purpose**: User interface and experience
- **Features**: 
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - App Router architecture (Next.js 13+)
  - Responsive design with Tailwind CSS 4.0
  - TypeScript 5 for type safety
  - Turbopack for fast development builds
  - GSAP for smooth animations
  - KaTeX for mathematical rendering

**Key Features**:
```typescript
// Example component structure
interface UserProfile {
  userId: string;
  name: string;
  experiencePoints: ExperiencePoints;
  achievements: Achievement[];
}

interface ExperiencePoints {
  daily: number;
  math: number;
  physics: number;
  biology: number;
  chemistry: number;
}
```

### Backend API Service (`flearn-backend`)
**Technology**: Express.js with Node.js
- **Purpose**: Business logic and data management
- **Authentication**: Google OAuth via NextAuth with JWT tokens
- **Database**: Dual database strategy (PostgreSQL 15 + MongoDB 7.0)
- **Automatic Features**: Streak reset, rank calculation, daily exp reset

**API Structure**:
```javascript
// Route organization
/api/
  ├── users/          # User management
  │   ├── profile     # GET, POST user profiles
  │   ├── profilebyid # GET user by ID
  │   ├── experience  # PATCH experience points
  │   ├── streak      # PATCH update streak
  │   ├── search      # GET search users
  │   └── leaderboard # GET leaderboard
  ├── friends/        # Social features
  │   ├── /           # GET friends list
  │   ├── request     # POST friend requests
  │   ├── /:id/accept # PATCH accept request
  │   └── /:id/reject # PATCH reject request
  ├── gardens/        # Learning progress
  │   ├── /           # GET, POST gardens
  │   ├── user/:id    # GET user's gardens
  │   ├── /:id/streak # PATCH update streaks
  │   └── /:id/status # PATCH garden status
  ├── questions/      # Question bank
  │   ├── /           # GET, POST questions
  │   ├── /:id        # GET, PUT, DELETE question
  │   ├── random      # GET random questions
  │   └── topic/:id   # GET by topic
  ├── topics/         # Topic organization
  │   ├── /           # GET, POST topics
  │   └── /:id        # GET, PUT, DELETE topic
  └── backlog/        # Saved questions
      ├── /           # GET, POST backlog
      └── /:id        # DELETE from backlog
```

### Webhook Service (`flearn-webhook`)
**Technology**: Express.js microservice
- **Purpose**: Automated deployment and CI/CD
- **Security**: HMAC SHA-256 signature verification
- **Features**:
  - Instant deployment on GitHub pushes
  - Container orchestration
  - Deployment logging and monitoring
  - Health check endpoints

### Database Architecture

#### PostgreSQL (Primary Relational Database)
**Purpose**: Structured data and relationships
```sql
-- Core schema structure
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY,
    auth0_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    profile_pic TEXT,
    rank VARCHAR(50) DEFAULT 'Beginner',
    streak INTEGER DEFAULT 0,
    daily_exp INTEGER DEFAULT 0,
    math_exp INTEGER DEFAULT 0,
    phy_exp INTEGER DEFAULT 0,
    bio_exp INTEGER DEFAULT 0,
    chem_exp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "garden" (
    garden_id UUID PRIMARY KEY,
    user_id UUID REFERENCES "user"(user_id),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    streak INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "friend" (
    friend_id UUID PRIMARY KEY,
    user_id UUID REFERENCES "user"(user_id),
    friend_user_id UUID REFERENCES "user"(user_id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### MongoDB (Document Database)
**Purpose**: Flexible data structures and user-generated content
```javascript
// Example document structures
{
  // Learning sessions
  _id: ObjectId,
  userId: "uuid",
  sessionType: "practice|quiz|lesson",
  subject: "math|physics|biology|chemistry",
  content: {
    questions: [...],
    answers: [...],
    metadata: {...}
  },
  timestamp: Date,
  performance: {
    score: Number,
    timeSpent: Number,
    hintsUsed: Number
  }
}
```

## 🔧 Technology Stack Deep Dive

### Frontend Technologies
```json
{
  "framework": "Next.js 15.5.2",
  "react_version": "19.1.0",
  "language": "TypeScript 5.9",
  "styling": "Tailwind CSS 4.0",
  "bundler": "Turbopack",
  "linting": "ESLint",
  "package_manager": "npm",
  "animations": "GSAP 3.13",
  "math_rendering": "KaTeX 0.16"
}
```

**Key Libraries**:
- `next`: 15.5.2 - React framework
- `react`: 19.1.0 - UI library
- `react-dom`: 19.1.0 - React DOM renderer
- `lucide-react`: Icon library
- `@gsap/react`: Animation library
- `gsap`: 3.13.0 - Professional animations
- `react-markdown`: Markdown rendering
- `rehype-katex` & `remark-math`: Math expression support
- `katex`: 0.16.25 - Mathematical notation
- `recharts`: Data visualization
- `html2canvas` & `jspdf`: PDF generation

### Backend Technologies
```json
{
  "runtime": "Node.js",
  "framework": "Express.js 4.18",
  "language": "JavaScript (ES6+)",
  "authentication": "Google OAuth + NextAuth",
  "google_auth": "google-auth-library 9.0",
  "testing": "Jest 29.7 + Supertest 6.3"
}
```

**Key Dependencies**:
- `express`: 4.18.2 - Web framework
- `google-auth-library`: 9.0.0 - Google OAuth verification
- `pg`: 8.11.3 - PostgreSQL client
- `pg-pool`: 3.6.1 - Connection pooling
- `mongoose`: 7.0.3 - MongoDB ODM
- `cors`: 2.8.5 - Cross-origin resource sharing
- `dotenv`: 17.2.1 - Environment variables
- `uuid`: 9.0.1 - UUID generation
- `katex`: 0.16.25 - Server-side math rendering
- `nodemon`: 3.1.10 - Development auto-reload

### DevOps & Infrastructure
```yaml
containerization:
  platform: "Docker & Docker Compose"
  orchestration: "Docker Swarm (future: Kubernetes)"
  
deployment:
  strategy: "Webhook-based auto-deployment"
  ci_cd: "GitHub Actions"
  monitoring: "Custom logging + health checks"
  
databases:
  postgresql:
    version: "15"
    management: "pgAdmin 4"
  mongodb:
    version: "7.0"
    management: "Mongo Express"
```

## 🔄 Data Flow Architecture

### User Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant G as Google OAuth
    participant N as NextAuth
    participant B as Backend
    participant DB as PostgreSQL
    
    U->>F: Login Request
    F->>N: Trigger Google Sign-In
    N->>G: Redirect to Google
    G->>U: Google Login Form
    U->>G: Enter Credentials
    G->>N: Return ID Token
    N->>F: Set Session Cookie
    F->>B: API Request + Token
    B->>G: Verify Token
    G->>B: Token Valid
    B->>DB: Query User Data
    DB->>B: User Information
    B->>F: Response Data
    F->>U: Authenticated UI
```

### Learning Progress Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant PG as PostgreSQL
    participant MG as MongoDB
    
    U->>F: Complete Learning Activity
    F->>B: Submit Progress Data
    B->>PG: Update Experience Points
    B->>MG: Store Session Details
    B->>PG: Update Garden Streak
    PG->>B: Confirm Updates
    MG->>B: Confirm Storage
    B->>F: Success Response
    F->>U: Updated UI with Progress
```

## 🏗️ Design Patterns & Principles

### Backend Architecture Patterns

#### 1. Repository Pattern
```javascript
// Database abstraction layer
class UserRepository {
    async findByAuth0Id(auth0Id) {
        const query = 'SELECT * FROM "user" WHERE auth0_id = $1';
        return await pgPool.query(query, [auth0Id]);
    }
    
    async updateExperience(userId, expData) {
        // Implementation
    }
}
```

#### 2. Middleware Pattern
```javascript
// Authentication middleware
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});
```

#### 3. Service Layer Pattern
```javascript
// Business logic separation
class ExperienceService {
    static calculateLevelFromExp(experience) {
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    }
    
    static getRequiredExpForLevel(level) {
        return Math.pow(level - 1, 2) * 100;
    }
}
```

### Frontend Architecture Patterns

#### 1. Component-Based Architecture
```typescript
// Reusable component structure
interface ComponentProps {
  user: User;
  onUpdate: (data: UpdateData) => void;
}

export const UserProfile: React.FC<ComponentProps> = ({ user, onUpdate }) => {
  // Component implementation
};
```

#### 2. Custom Hooks Pattern
```typescript
// Reusable state logic
export const useAuth = () => {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  
  const login = () => router.push('/api/auth/login');
  const logout = () => router.push('/api/auth/logout');
  
  return { user, error, isLoading, login, logout };
};
```

## 🔒 Security Architecture

### Authentication & Authorization
- **Google OAuth Integration**: Industry-standard OAuth 2.0 / OpenID Connect
- **NextAuth**: Session management and authentication provider
- **JWT Tokens**: Stateless authentication with Google ID tokens
- **Token Verification**: google-auth-library for server-side validation
- **CORS**: Configured for specific origins only (localhost:3000, 8099, etc.)

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API endpoint protection

### Infrastructure Security
- **Container Isolation**: Docker container security
- **Secrets Management**: Environment variables, no hardcoded secrets
- **HTTPS Enforcement**: TLS/SSL in production
- **Webhook Security**: HMAC signature verification

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: No server-side session storage
- **Database Sharding**: Future MongoDB sharding strategy
- **Load Balancing**: Ready for multiple container instances
- **CDN Integration**: Static asset distribution

### Performance Optimization
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Strategy**: Redis implementation planned
- **Image Optimization**: Next.js automatic image optimization

## 🔮 Future Architecture Plans

### Phase 2 Enhancements
- **Microservices Split**: Separate services for different domains
- **Event-Driven Architecture**: Message queues for async processing
- **Kubernetes Deployment**: Container orchestration upgrade
- **API Gateway**: Centralized API management

### Phase 3 Scalability
- **Multi-Region Deployment**: Global content distribution
- **Real-time Features**: WebSocket integration for live updates
- **ML/AI Integration**: Personalized learning recommendations
- **Mobile API**: Dedicated endpoints for mobile apps

---

This architecture is designed to be maintainable, scalable, and developer-friendly while following modern best practices for web application development.