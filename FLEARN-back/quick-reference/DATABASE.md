# Database Quick Reference

## 🗄️ Overview

FLEARN Backend uses:
- **PostgreSQL** - Primary database (users, friends, gardens, backlog, subjects, topics)
- **MongoDB** - Secondary database (questions)

---

## 🔧 Configuration

### Environment Variables
```env
# PostgreSQL
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=flearn_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# MongoDB
MONGO_URL=mongodb://localhost:27017/flearn-db
```

### Connection Setup
```javascript
const { pgPool, mongoose, getMongoDb } = require('./config/database');
```

---

## 📊 PostgreSQL

### Connection Pool
```javascript
const { Pool } = require('pg');

const pgPool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

### Basic Query
```javascript
// SELECT query
const result = await pgPool.query('SELECT * FROM "user" WHERE user_id = $1', [userId]);
const user = result.rows[0];

// INSERT query
const insertResult = await pgPool.query(
    'INSERT INTO "user" (user_id, google_id, email, name) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, googleId, email, name]
);

// UPDATE query
await pgPool.query(
    'UPDATE "user" SET streak = $1, updated_at = NOW() WHERE user_id = $2',
    [newStreak, userId]
);

// DELETE query
await pgPool.query('DELETE FROM friend WHERE row_id = $1', [rowId]);
```

### Transactions
```javascript
const client = await pgPool.connect();
try {
    await client.query('BEGIN');
    
    await client.query('UPDATE "user" SET streak = streak + 1 WHERE user_id = $1', [userId]);
    await client.query('INSERT INTO backlog (...) VALUES (...)', [...]);
    
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

---

## 📋 PostgreSQL Schema

### User Table
```sql
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_pic TEXT,
    streak INTEGER DEFAULT 0,
    uptime_streak DATE,
    rank VARCHAR(50) DEFAULT 'Beginner',
    math_exp INTEGER DEFAULT 0,
    phy_exp INTEGER DEFAULT 0,
    bio_exp INTEGER DEFAULT 0,
    chem_exp INTEGER DEFAULT 0,
    daily_exp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Friend Table
```sql
CREATE TABLE friend (
    row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES "user"(user_id),
    user2_id UUID REFERENCES "user"(user_id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Garden Table
```sql
CREATE TABLE garden (
    row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES "user"(user_id),
    user2_id UUID REFERENCES "user"(user_id),
    status VARCHAR(20) DEFAULT 'active',
    streak INTEGER DEFAULT 0,
    uptime_streak DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subject Table
```sql
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL
);

-- Initial data
INSERT INTO subject (subject_name) VALUES 
    ('Math'),
    ('Physics'),
    ('Biology'),
    ('Chemistry');
```

### Topic Table
```sql
CREATE TABLE topic (
    topic_id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    subject_id INTEGER REFERENCES subject(subject_id),
    description TEXT,
    status VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Backlog Table
```sql
CREATE TABLE backlog (
    row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "user"(user_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    topic_id INTEGER REFERENCES topic(topic_id),
    correctness BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🍃 MongoDB

### Connection
```javascript
const mongoose = require('mongoose');

await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const mongoDb = mongoose.connection.db;
```

### Schema Definition
```javascript
const questionSchema = new mongoose.Schema({
    subject_id: {
        type: Number,
        required: true
    },
    topic_id: Number,
    question_text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'multi_select', 'fill_blank', 'essay', 'matching'],
        required: true
    },
    options: {
        type: mongoose.Schema.Types.Mixed
    },
    correct_answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    points: {
        type: Number,
        default: 10
    },
    time_limit: {
        type: Number,
        default: 60
    },
    explanation: String,
    created_by: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
```

### CRUD Operations
```javascript
// Create
const question = await Question.create({
    subject_id: 1,
    question_text: "What is 2+2?",
    type: "multiple_choice",
    options: { a: "3", b: "4", c: "5" },
    correct_answer: "b",
    difficulty: 1
});

// Read
const questions = await Question.find({ subject_id: 1 });
const question = await Question.findById(questionId);

// Update
await Question.findByIdAndUpdate(questionId, {
    difficulty: 2,
    points: 15
});

// Delete (soft delete)
await Question.findByIdAndUpdate(questionId, { status: 'deleted' });

// Delete (hard delete)
await Question.findByIdAndDelete(questionId);
```

### Advanced Queries
```javascript
// Filter with multiple conditions
const questions = await Question.find({
    subject_id: 1,
    difficulty: { $gte: 2, $lte: 4 },
    status: 'active'
}).limit(10).skip(0);

// Aggregation
const stats = await Question.aggregate([
    { $match: { subject_id: 1 } },
    { $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        avgPoints: { $avg: '$points' }
    }}
]);
```

---

## 🔄 Database Initialization

### Initialize Both Databases
```javascript
const { initializeDatabases, closeDatabases } = require('./config/database');

// On startup
initializeDatabases().catch((error) => {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
});

// On shutdown
process.on('SIGINT', async () => {
    await closeDatabases();
    process.exit(0);
});
```

---

## 🐳 Docker Setup

### PostgreSQL Container
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: flearn_user
    POSTGRES_PASSWORD: your_password
    POSTGRES_DB: flearn_db
  ports:
    - "5432:5432"
  volumes:
    - ./init-scripts:/docker-entrypoint-initdb.d
```

### MongoDB Container
```yaml
mongodb:
  image: mongo:7
  environment:
    MONGO_INITDB_DATABASE: flearn-db
  ports:
    - "27017:27017"
  volumes:
    - ./mongo-init:/docker-entrypoint-initdb.d
```

---

## 📝 Common Queries

### Get User with All Data
```javascript
const query = `
    SELECT 
        u.*,
        COUNT(DISTINCT f.row_id) as friend_count,
        COUNT(DISTINCT g.row_id) as garden_count
    FROM "user" u
    LEFT JOIN friend f ON (f.user1_id = u.user_id OR f.user2_id = u.user_id) AND f.status = 'accepted'
    LEFT JOIN garden g ON (g.user1_id = u.user_id OR g.user2_id = u.user_id) AND g.status = 'active'
    WHERE u.user_id = $1
    GROUP BY u.user_id
`;
const result = await pgPool.query(query, [userId]);
```

### Get Backlog Statistics
```javascript
const query = `
    SELECT 
        subject_id,
        COUNT(*) as total,
        SUM(CASE WHEN correctness = true THEN 1 ELSE 0 END) as correct,
        SUM(CASE WHEN correctness = false THEN 1 ELSE 0 END) as incorrect,
        ROUND(AVG(CASE WHEN correctness = true THEN 100.0 ELSE 0 END), 2) as accuracy
    FROM backlog
    WHERE user_id = $1
    GROUP BY subject_id
`;
const result = await pgPool.query(query, [userId]);
```

### Search Questions
```javascript
const questions = await Question.find({
    $or: [
        { question_text: { $regex: searchTerm, $options: 'i' } },
        { explanation: { $regex: searchTerm, $options: 'i' } }
    ],
    status: 'active'
});
```

---

## 🛠️ Debugging

### Enable Query Logging (PostgreSQL)
```javascript
pgPool.on('error', (err) => {
    console.error('PostgreSQL Pool Error:', err);
});

// Log all queries
const originalQuery = pgPool.query.bind(pgPool);
pgPool.query = function(...args) {
    console.log('Query:', args[0]);
    console.log('Params:', args[1]);
    return originalQuery(...args);
};
```

### Enable Query Logging (MongoDB)
```javascript
mongoose.set('debug', true);
```

---

## 📚 Best Practices

1. **Always use parameterized queries** - Prevent SQL injection
2. **Use connection pooling** - Reuse database connections
3. **Close connections on shutdown** - Graceful cleanup
4. **Handle errors properly** - Don't expose database errors to users
5. **Use transactions for related operations** - Ensure data consistency
6. **Create indexes for frequent queries** - Improve performance
7. **Validate data before database operations** - Ensure data integrity

---

## 🔗 Related Documentation

- Setup & Configuration: `SETUP.md`
- API Endpoints: `API_ENDPOINTS.md`
- Models: `MODELS.md`
