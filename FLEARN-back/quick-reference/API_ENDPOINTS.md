# API Endpoints Quick Reference

## 📋 Table of Contents
- [Users API](#users-api)
- [Friends API](#friends-api)
- [Gardens API](#gardens-api)
- [Questions API](#questions-api)
- [Topics API](#topics-api)
- [Backlog API](#backlog-api)

---

## 🔐 Authentication
All protected routes require:
```
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## Users API

### GET /api/users/profile
Get current user's profile (auto-updates streak, rank, daily exp)
```bash
GET /api/users/profile
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```
**Response:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "user_id": "uuid",
    "google_id": "google|123",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_pic": "url",
    "streak": 5,
    "uptime_streak": "2025-10-27",
    "rank": "Secondary school",
    "math_exp": 5000,
    "phy_exp": 3000,
    "bio_exp": 2000,
    "chem_exp": 1500,
    "daily_exp": 150,
    "updated_at": "2025-10-27"
  }
}
```

### GET /api/users/profilebyid
Get user profile by ID
```bash
GET /api/users/profilebyid?id=<USER_ID>
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### GET /api/users/all
Get all users with pagination
```bash
GET /api/users/all?limit=50&offset=0
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### GET /api/users/search
Search users by name or email
```bash
GET /api/users/search?query=john&limit=20&offset=0
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### POST /api/users/profile
Create or update user profile
```bash
POST /api/users/profile
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "profile_pic": "base64_or_url"
}
```

### PATCH /api/users/experience
Update user experience points
```bash
PATCH /api/users/experience
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "math_exp": 100,
  "phy_exp": 50,
  "bio_exp": 75,
  "chem_exp": 25
}
```
**Note:** Automatically recalculates rank based on total experience.

### PATCH /api/users/profile-basic
Update basic profile information
```bash
PATCH /api/users/profile-basic
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "name": "New Name",
  "profile_pic": "new_url_or_base64"
}
```

### GET /api/users/preferences
Get user preferences
```bash
GET /api/users/preferences
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### POST /api/users/preferences
Update user preferences
```bash
POST /api/users/preferences
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "theme": "dark",
  "notifications_enabled": true
}
```

### GET /api/users/preferred-subjects
Get user's preferred subjects
```bash
GET /api/users/preferred-subjects
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### POST /api/users/preferred-subjects
Add preferred subject
```bash
POST /api/users/preferred-subjects
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "subject_id": 1
}
```

### DELETE /api/users/preferred-subjects/:preferenceId
Remove preferred subject
```bash
DELETE /api/users/preferred-subjects/123
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### PUT /api/users/preferred-subjects
Update all preferred subjects
```bash
PUT /api/users/preferred-subjects
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "subject_ids": [1, 2, 3]
}
```

---

## Friends API

### GET /api/friends
Get current user's friends
```bash
GET /api/friends
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```
**Response:**
```json
{
  "message": "Friends retrieved successfully",
  "friends": [
    {
      "row_id": "uuid",
      "status": "accepted",
      "friend_name": "Jane Doe",
      "friend_email": "jane@example.com",
      "friend_profile_pic": "url",
      "friend_user_id": "uuid",
      "created_at": "2025-10-01",
      "updated_at": "2025-10-01"
    }
  ]
}
```

### GET /api/friends/user/:userId
Get friends for specific user
```bash
GET /api/friends/user/12345678-1234-1234-1234-123456789012
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### POST /api/friends/request
Send friend request
```bash
POST /api/friends/request
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "friend_user_id": "uuid"
}
```

### PATCH /api/friends/accept/:rowId
Accept friend request
```bash
PATCH /api/friends/accept/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### DELETE /api/friends/:rowId
Remove friend or cancel request
```bash
DELETE /api/friends/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## Gardens API

### GET /api/gardens
Get current user's gardens (auto-updates garden streaks)
```bash
GET /api/gardens
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```
**Response:**
```json
{
  "message": "Gardens retrieved successfully",
  "gardens": [
    {
      "row_id": "uuid",
      "status": "active",
      "streak": 10,
      "uptime_streak": "2025-10-27",
      "partner_name": "Partner Name",
      "partner_email": "partner@example.com",
      "partner_profile_pic": "url",
      "partner_user_id": "uuid"
    }
  ]
}
```

### GET /api/gardens/user/:userId
Get gardens for specific user
```bash
GET /api/gardens/user/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### POST /api/gardens/create
Create new garden
```bash
POST /api/gardens/create
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "partner_user_id": "uuid"
}
```

### PATCH /api/gardens/update/:rowId
Update garden streak
```bash
PATCH /api/gardens/update/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "increment_streak": true
}
```

### DELETE /api/gardens/:rowId
Delete garden
```bash
DELETE /api/gardens/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## Questions API

### 📖 Public Endpoints (No Auth Required)

#### GET /api/questions/subjects
Get all subjects
```bash
GET /api/questions/subjects
```
**Response:**
```json
[
  { "subject_id": 1, "subject_name": "Math" },
  { "subject_id": 2, "subject_name": "Physics" },
  { "subject_id": 3, "subject_name": "Biology" },
  { "subject_id": 4, "subject_name": "Chemistry" }
]
```

#### GET /api/questions/types
Get question types
```bash
GET /api/questions/types
```
**Response:**
```json
[
  "multiple_choice",
  "true_false",
  "multi_select",
  "fill_blank",
  "essay",
  "matching"
]
```

#### GET /api/questions
Get all questions (with filters)
```bash
GET /api/questions?subject_id=1&type=multiple_choice&difficulty=2&limit=10&offset=0
```

#### GET /api/questions/:id
Get single question (answers removed for security)
```bash
GET /api/questions/507f1f77bcf86cd799439011
```

#### POST /api/questions/:id/validate
Validate answer (real-time, no DB save)
```bash
POST /api/questions/507f1f77bcf86cd799439011/validate
Body: {
  "answer": "b",
  "time_taken": 30
}
```
**Response:**
```json
{
  "is_correct": true,
  "score": 15,
  "feedback": "Correct! Time bonus: +50%",
  "correct_answer": "b"
}
```

### 🔒 Protected Endpoints (Auth Required)

#### POST /api/questions
Create question
```bash
POST /api/questions
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "subject_id": 1,
  "topic_id": 5,
  "question_text": "What is 2+2?",
  "type": "multiple_choice",
  "options": {
    "a": "3",
    "b": "4",
    "c": "5",
    "d": "6"
  },
  "correct_answer": "b",
  "difficulty": 1,
  "points": 10,
  "time_limit": 60,
  "explanation": "Basic addition"
}
```

#### PUT /api/questions/:id
Update question
```bash
PUT /api/questions/507f1f77bcf86cd799439011
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: { ... }
```

#### DELETE /api/questions/:id
Delete question (soft delete)
```bash
DELETE /api/questions/507f1f77bcf86cd799439011
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## Topics API

### GET /api/topics
Get all topics
```bash
GET /api/topics?subject_id=1&status=public&limit=10&offset=0
```

### GET /api/topics/subject/:subject_id
Get topics by subject
```bash
GET /api/topics/subject/1
```

### GET /api/topics/:id
Get single topic
```bash
GET /api/topics/1
```

### GET /api/topics/:id/statistics
Get topic statistics
```bash
GET /api/topics/1/statistics
```

### POST /api/topics
Create topic (Auth required)
```bash
POST /api/topics
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "name": "Algebra",
  "subject_id": 1,
  "description": "Basic algebra concepts",
  "status": "public"
}
```

### PUT /api/topics/:id
Update topic (Auth required)
```bash
PUT /api/topics/1
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: { ... }
```

### DELETE /api/topics/:id
Delete topic (Auth required)
```bash
DELETE /api/topics/1
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## Backlog API

### POST /api/backlog
Create backlog entry
```bash
POST /api/backlog
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
Body: {
  "user_id": "uuid",
  "subject_id": 1,
  "topic_id": 5,
  "correctness": true
}
```

### GET /api/backlog/user/:user_id
Get user's backlog entries
```bash
GET /api/backlog/user/uuid?subject_id=1&topic_id=5&correctness=true&limit=100&offset=0
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### GET /api/backlog/:row_id
Get single backlog entry
```bash
GET /api/backlog/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### GET /api/backlog/stats/:user_id
Get overall backlog statistics
```bash
GET /api/backlog/stats/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```
**Response:**
```json
{
  "total_entries": 150,
  "correct_count": 120,
  "incorrect_count": 30,
  "accuracy_percentage": 80.0
}
```

### GET /api/backlog/stats/subject/:user_id
Get backlog stats by subject
```bash
GET /api/backlog/stats/subject/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### GET /api/backlog/stats/topic/:user_id
Get backlog stats by topic
```bash
GET /api/backlog/stats/topic/uuid?subject_id=1
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### DELETE /api/backlog/:row_id
Delete single backlog entry
```bash
DELETE /api/backlog/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### DELETE /api/backlog/user/:user_id
Delete all backlog entries for user
```bash
DELETE /api/backlog/user/uuid
Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
```

---

## 🌐 Base URLs

- **Development:** `http://localhost:8099`
- **Production:** Set via environment variable

## 📝 Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
