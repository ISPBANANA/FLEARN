# Questions API - Quick Reference Card

## 🚀 Start Services
```bash
docker-compose down -v && docker-compose up -d
```

## 📋 Public Endpoints (No Auth)

```bash
# Get subjects (Math, Physics, Biology, Chemistry)
GET /api/questions/subjects

# Get question types (multiple_choice, true_false, etc.)
GET /api/questions/types

# Get all questions
GET /api/questions

# Filter questions
GET /api/questions?subject_id=1&type=multiple_choice&difficulty=2&limit=10

# Get single question (answers removed for security)
GET /api/questions/:id

# Validate answer (real-time, no DB save)
POST /api/questions/:id/validate
Body: { "answer": "b", "time_taken": 30 }
```

## 🔒 Protected Endpoints (Auth Required)

```bash
# Create question
POST /api/questions
Headers: Authorization: Bearer <JWT>

# Update question
PUT /api/questions/:id
Headers: Authorization: Bearer <JWT>

# Delete question (soft delete)
DELETE /api/questions/:id
Headers: Authorization: Bearer <JWT>
```

## 📝 Question Types (6 Total)

| Type | Options | Features |
|------|---------|----------|
| `multiple_choice` | 2-10+ | Single correct |
| `true_false` | 2 | Binary |
| `multi_select` | 2+ | Partial credit |
| `fill_blank` | - | Multiple acceptable |
| `essay` | - | Manual grading |
| `matching` | 2+ pairs | Partial credit |

## 💯 Scoring

- **Base**: Points per question (default: 10)
- **Time Bonus**: +50% if < 50% time, +25% if < 75% time
- **Partial**: Multi-select & matching get partial credit

## 🧪 Quick Tests

```powershell
# Get subjects
curl http://localhost:8099/api/questions/subjects

# Validate answer (PowerShell)
$body = @{ answer = "b"; time_taken = 30 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8099/api/questions/YOUR_ID/validate" `
  -Method Post -Body $body -ContentType "application/json"
```

## 📚 Docs

- **API Ref**: `docs/QUESTIONS_API.md`
- **Tests**: `tests/MANUAL_TEST_GUIDE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## ✅ Usage Examples in Code

All routes in `routes/questions.js` include usage examples like `users.js`:

```javascript
// ============================================
// POST /api/questions/:id/validate
// Usage Examples:
// 
// Multiple Choice:
// Body: { "answer": "b", "time_taken": 30 }
// 
// Multi-Select:
// Body: { "answer": ["a", "c", "e"], "time_taken": 45 }
// ============================================
```
