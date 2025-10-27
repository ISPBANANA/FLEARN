# Models Quick Reference

## 📋 Overview

FLEARN Backend uses three main data models:
- **Backlog** - Track user's question attempts (PostgreSQL)
- **Question** - Store questions with hybrid storage (PostgreSQL + MongoDB)
- **Topic** - Organize questions by subject categories (PostgreSQL)

---

## 🗂️ Backlog Model

### Purpose
Track user attempts on questions to monitor progress and performance.

### Location
`models/Backlog.js`

### Database
PostgreSQL (`backlog` table)

### Schema
```sql
CREATE TABLE backlog (
    row_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "user"(user_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    topic_id INTEGER REFERENCES topic(topic_id),
    correctness BOOLEAN NOT NULL,
    do_date TIMESTAMP DEFAULT NOW()
);
```

### Methods

#### create(backlogData)
Create a new backlog entry
```javascript
const Backlog = require('./models/Backlog');

const entry = await Backlog.create({
    user_id: 'uuid-here',
    subject_id: 1,
    topic_id: 5,
    correctness: true
});
```

#### getByUserId(user_id, filters)
Get backlog entries for a user with optional filters
```javascript
const entries = await Backlog.getByUserId(userId, {
    subject_id: 1,
    topic_id: 5,
    correctness: true,
    limit: 50,
    offset: 0
});
```

#### getById(row_id)
Get single backlog entry by ID
```javascript
const entry = await Backlog.getById(rowId);
```

#### getStatsByUserId(user_id, filters)
Get overall statistics for a user
```javascript
const stats = await Backlog.getStatsByUserId(userId);
// Returns: { total_attempts, correct_count, incorrect_count, accuracy_percentage }
```

#### getStatsBySubject(user_id)
Get statistics grouped by subject
```javascript
const statsBySubject = await Backlog.getStatsBySubject(userId);
// Returns array with stats for each subject
```

#### getStatsByTopic(user_id, subject_id)
Get statistics grouped by topic for a subject
```javascript
const statsByTopic = await Backlog.getStatsByTopic(userId, subjectId);
// Returns array with stats for each topic
```

#### delete(row_id)
Delete a single backlog entry
```javascript
await Backlog.delete(rowId);
```

#### deleteByUserId(user_id)
Delete all backlog entries for a user
```javascript
const deletedCount = await Backlog.deleteByUserId(userId);
```

---

## ❓ Question Model

### Purpose
Store and manage questions with hybrid storage (metadata in PostgreSQL, content in MongoDB).

### Location
`models/Question.js`

### Database
- **PostgreSQL** - Metadata (`question` table)
- **MongoDB** - Content (`question_contents` collection)

### PostgreSQL Schema
```sql
CREATE TABLE question (
    question_id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subject(subject_id),
    topic_id INTEGER REFERENCES topic(topic_id),
    mongo_content_id VARCHAR(24), -- MongoDB ObjectId
    type_id INTEGER REFERENCES question_type(type_id),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    points INTEGER DEFAULT 10,
    time_limit INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'private',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB Schema
```javascript
{
    _id: ObjectId("..."),
    question_type: "multiple_choice", // or other types
    question_text: "What is 2+2?",
    options: {
        a: "3",
        b: "4",
        c: "5",
        d: "6"
    },
    correct_answer: "b", // or array for multi_select
    explanation: "Basic addition",
    created_at: Date,
    updated_at: Date
}
```

### Question Types

| Type | Description | Answer Format |
|------|-------------|---------------|
| `multiple_choice` | Single correct option | String: "a", "b", "c"... |
| `true_false` | Binary choice | String: "true" or "false" |
| `multi_select` | Multiple correct options | Array: ["a", "c", "e"] |
| `fill_blank` | Text input | String or Array of strings |
| `essay` | Long text response | String |
| `matching` | Match pairs | Object: {"1": "a", "2": "b"} |

### Methods

#### create(questionData)
Create a new question
```javascript
const Question = require('./models/Question');

const question = await Question.create({
    subject_id: 1,
    topic_id: 5,
    type_name: 'multiple_choice',
    difficulty: 2,
    points: 10,
    time_limit: 60,
    status: 'public',
    content: {
        question_text: "What is 2+2?",
        options: { a: "3", b: "4", c: "5", d: "6" },
        correct_answer: "b",
        explanation: "Basic addition"
    },
    created_by: userId
});
```

#### getById(question_id)
Get question by ID with content (answers removed if not authenticated)
```javascript
const question = await Question.getById(questionId);
```

#### getAll(filters)
Get questions with filters
```javascript
const questions = await Question.getAll({
    subject_id: 1,
    topic_id: 5,
    type: 'multiple_choice',
    difficulty: 2,
    status: 'public',
    limit: 10,
    offset: 0
});
```

#### update(question_id, updates)
Update a question
```javascript
await Question.update(questionId, {
    difficulty: 3,
    points: 15,
    content: {
        question_text: "Updated question?",
        // ... other content fields
    }
});
```

#### delete(question_id)
Soft delete a question (sets is_active to false)
```javascript
await Question.delete(questionId);
```

#### validateAnswer(question_id, userAnswer, timeTaken)
Validate user's answer with scoring
```javascript
const result = await Question.validateAnswer(questionId, "b", 30);
// Returns: { is_correct, score, feedback, correct_answer }
```

**Scoring System:**
- Base score: `points` value from question
- Time bonus:
  - +50% if time_taken < 50% of time_limit
  - +25% if time_taken < 75% of time_limit
- Partial credit for `multi_select` and `matching` types

---

## 📚 Topic Model

### Purpose
Organize questions into topics within subjects.

### Location
`models/Topic.js`

### Database
PostgreSQL (`topic` table)

### Schema
```sql
CREATE TABLE topic (
    topic_id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subject(subject_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'public',
    created_by UUID REFERENCES "user"(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Methods

#### create(topicData)
Create a new topic
```javascript
const Topic = require('./models/Topic');

const topic = await Topic.create({
    subject_id: 1,
    name: "Algebra",
    description: "Basic algebraic concepts",
    status: 'public',
    created_by: userId
});
```

#### getById(topic_id)
Get topic by ID with question count
```javascript
const topic = await Topic.getById(topicId);
// Includes: subject_name, creator_name, question_count
```

#### getAll(filters)
Get all topics with filters
```javascript
const topics = await Topic.getAll({
    subject_id: 1,
    status: 'public',
    limit: 100,
    offset: 0
});
```

#### getBySubject(subject_id)
Get topics grouped by subject
```javascript
const topics = await Topic.getBySubject(subjectId);
```

#### update(topic_id, updates)
Update a topic
```javascript
await Topic.update(topicId, {
    name: "Advanced Algebra",
    description: "Updated description",
    status: 'public'
});
```

#### delete(topic_id)
Delete a topic (cascade deletes associated questions)
```javascript
await Topic.delete(topicId);
```

#### getStatistics(topic_id)
Get statistics for a topic
```javascript
const stats = await Topic.getStatistics(topicId);
// Returns: question_count, avg_difficulty, total_attempts, avg_success_rate
```

---

## 🔄 Model Relationships

```
Subject (PostgreSQL)
    ↓ 1:N
Topic (PostgreSQL)
    ↓ 1:N
Question (PostgreSQL Metadata + MongoDB Content)
    ↓ N:M (via attempts)
Backlog (PostgreSQL)
    ↓ N:1
User (PostgreSQL)
```

---

## 💡 Usage Examples

### Creating a Complete Question Flow
```javascript
// 1. Create topic
const topic = await Topic.create({
    subject_id: 1,
    name: "Calculus Basics",
    description: "Introduction to calculus",
    status: 'public',
    created_by: userId
});

// 2. Create question
const question = await Question.create({
    subject_id: 1,
    topic_id: topic.topic_id,
    type_name: 'multiple_choice',
    difficulty: 3,
    points: 15,
    time_limit: 90,
    status: 'public',
    content: {
        question_text: "What is the derivative of x²?",
        options: { a: "x", b: "2x", c: "x²", d: "2" },
        correct_answer: "b",
        explanation: "Using power rule: d/dx(x²) = 2x"
    },
    created_by: userId
});

// 3. User answers question
const result = await Question.validateAnswer(
    question.question_id, 
    "b", 
    45
);

// 4. Record in backlog
if (result.is_correct !== undefined) {
    await Backlog.create({
        user_id: userId,
        subject_id: 1,
        topic_id: topic.topic_id,
        correctness: result.is_correct
    });
}

// 5. Get user statistics
const stats = await Backlog.getStatsBySubject(userId);
```

### Querying User Progress
```javascript
// Get all user's attempts for Math
const mathAttempts = await Backlog.getByUserId(userId, {
    subject_id: 1,
    limit: 100
});

// Get accuracy by subject
const subjectStats = await Backlog.getStatsBySubject(userId);
console.log(subjectStats);
/* Output:
[
  {
    subject_id: 1,
    subject_name: "Math",
    total: 150,
    correct: 120,
    incorrect: 30,
    accuracy: 80.00
  },
  ...
]
*/

// Get topic-level stats
const topicStats = await Backlog.getStatsByTopic(userId, 1);
```

---

## 🔍 Advanced Queries

### Get Questions with Full Details
```javascript
const questions = await Question.getAll({
    subject_id: 1,
    difficulty: 3,
    status: 'public',
    limit: 20
});

// Each question includes:
// - question_id, difficulty, points, time_limit
// - type_name (multiple_choice, etc.)
// - subject_name, topic_name
// - created_at
```

### Get Topic with Statistics
```javascript
const topic = await Topic.getById(topicId);
console.log(topic);
/* Output:
{
  topic_id: 5,
  name: "Algebra",
  subject_name: "Math",
  creator_name: "John Doe",
  question_count: 45,
  ...
}
*/
```

---

## 🛡️ Error Handling

All model methods throw errors that should be caught in route handlers:

```javascript
try {
    const question = await Question.create(questionData);
    res.json({ success: true, data: question });
} catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
        success: false, 
        error: error.message 
    });
}
```

---

## 📚 Related Documentation

- API Endpoints: `API_ENDPOINTS.md`
- Database Schema: `DATABASE.md`
- Questions API Details: `../QUESTIONS_QUICK_REFERENCE.md`
