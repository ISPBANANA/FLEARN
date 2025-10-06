# FLEARN Backend - Auto-Update Features Quick Reference

## 🚀 Quick Start

All three auto-update features work automatically when users fetch their profile:

```javascript
GET /users/profile
→ Checks and updates: Streak, Rank, Daily Exp
→ Returns fresh, accurate user data
```

---

## 📊 Feature Overview

| Feature | What It Does | When It Triggers |
|---------|--------------|------------------|
| **Streak Reset** | Resets streak to 0 | When 2+ days inactive |
| **Rank Calculation** | Updates rank level | When total exp changes |
| **Daily Exp Reset** | Resets daily exp to 0 | At start of each new day |

---

## 🔧 Implementation

### Import
```javascript
const {
    checkAndResetUserStreak,      // Main function for users
    checkAndResetGardenStreak,    // For gardens
    calculateRank                 // Manual rank calc
} = require('./middleware/streakHelper');
```

### Usage in Routes
```javascript
// User profile
router.get('/profile', checkJwt, async (req, res) => {
    const user = await checkAndResetUserStreak(pgPool, userId);
    res.json({ user });
});

// Update experience
router.patch('/experience', checkJwt, async (req, res) => {
    const newRank = calculateRank(mathExp, phyExp, bioExp, chemExp);
    // Update database with newRank
});
```

---

## 📋 Reset Conditions

### Streak Reset
```
IF uptime_streak - today >= 2 days THEN
    streak = 0
    uptime_streak = NULL
END IF
```

**Examples:**
- ✅ Last update: Oct 5 → Today: Oct 7 → **RESET** (2 days)
- ❌ Last update: Oct 6 → Today: Oct 7 → **NO RESET** (1 day)

### Daily Exp Reset
```
IF updated_at < today THEN
    daily_exp = 0
END IF
```

**Examples:**
- ✅ Last update: Oct 6 → Today: Oct 7 → **RESET** (new day)
- ❌ Last update: Oct 7 8am → Today: Oct 7 5pm → **NO RESET** (same day)

### Rank Calculation
```
total_exp = math_exp + phy_exp + bio_exp + chem_exp
rank_level = floor(total_exp / 8000)
rank = RANK_NAMES[rank_level]
```

**Examples:**
- Total: 5,000 → Level 0 → **Beginner**
- Total: 12,000 → Level 1 → **Primary school**
- Total: 34,000 → Level 4 → **Graduated**

---

## 🎯 Rank Levels

| Level | Total Exp | Rank Name |
|-------|-----------|-----------|
| 0 | 0 - 7,999 | Beginner |
| 1 | 8,000 - 15,999 | Primary school |
| 2 | 16,000 - 23,999 | Secondary school |
| 3 | 24,000 - 31,999 | University student |
| 4 | 32,000 - 39,999 | Graduated |
| 5+ | 40,000+ | Professor |

---

## 🗂️ Database Fields

### User Table
```sql
-- Streak fields
streak INT DEFAULT 0
uptime_streak DATE

-- Rank field
rank TEXT DEFAULT 'Beginner'

-- Experience fields
daily_exp INT DEFAULT 0
math_exp INT DEFAULT 0
phy_exp INT DEFAULT 0
bio_exp INT DEFAULT 0
chem_exp INT DEFAULT 0

-- Timestamp
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

---

## 🔄 API Routes

### Automatic Updates (on GET)
| Route | Streak Reset | Rank Update | Daily Exp Reset |
|-------|-------------|-------------|-----------------|
| `GET /users/profile` | ✅ | ✅ | ✅ |
| `GET /users/profilebyid` | ✅ | ✅ | ✅ |
| `GET /gardens` | ✅ (garden) | ❌ | ❌ |
| `GET /gardens/user/:userId` | ✅ (garden) | ❌ | ❌ |

### Manual Updates (on PATCH)
| Route | Action |
|-------|--------|
| `PATCH /users/experience` | Calculates and updates rank |

---

## 🧪 Testing

### Run Tests
```bash
npm test -- streakHelper.test.js
```

### Test Coverage
- ✅ 10 tests: Streak reset logic
- ✅ 15 tests: Rank calculation
- ✅ 10 tests: Daily exp reset
- ✅ **Total: 35 tests, all passing**

---

## 📝 Code Examples

### Example 1: Fetch Profile
```javascript
// User hasn't logged in for 3 days
GET /users/profile

// Auto-updates applied:
// 1. Streak reset: 5 → 0 (3 days >= 2 days)
// 2. Rank updated: Recalculated from total exp
// 3. Daily exp reset: 150 → 0 (new day)

Response:
{
    "streak": 0,           // ← Reset
    "daily_exp": 0,        // ← Reset
    "rank": "Primary school",
    "math_exp": 8000,
    "uptime_streak": null
}
```

### Example 2: Update Experience
```javascript
PATCH /users/experience
Body: {
    "daily_exp": 75,
    "math_exp": 8100
}

// Rank recalculated:
// total = 8100 + 5000 + 4000 + 1000 = 18100
// level = floor(18100 / 8000) = 2
// rank = RANK_NAMES[2] = "Secondary school"

Response:
{
    "daily_exp": 75,
    "math_exp": 8100,
    "rank": "Secondary school"  // ← Updated!
}
```

### Example 3: Same Day Multiple Fetches
```javascript
// Oct 7, 2025 at 9:00 AM
GET /users/profile
→ daily_exp reset to 0 (new day)

// Oct 7, 2025 at 11:00 AM
PATCH /users/experience { daily_exp: 50 }
→ daily_exp = 50

// Oct 7, 2025 at 3:00 PM
GET /users/profile
→ daily_exp = 50 (same day, no reset)
```

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| Check time (in-memory) | < 1 ms |
| Database UPDATE | ~5-10 ms |
| Frequency | Max once per user per day |
| Database queries | 0-1 UPDATE per check |

---

## 🛠️ Constants

```javascript
// From middleware/streakHelper.js

const RANK_EXP_DIVISOR = 8000;

const RANK_NAMES = [
    'Beginner',
    'Primary school',
    'Secondary school',
    'University student',
    'Graduated',
    'Professor'
];
```

---

## 📖 Full Documentation

1. **Streak Reset**
   - [STREAK_RESET.md](docs/STREAK_RESET.md)
   - [STREAK_RESET_FLOW.md](docs/STREAK_RESET_FLOW.md)

2. **Rank Calculation**
   - [RANK_CALCULATION.md](docs/RANK_CALCULATION.md)
   - [RANK_VISUAL_GUIDE.md](docs/RANK_VISUAL_GUIDE.md)

3. **Daily Exp Reset**
   - [DAILY_EXP_RESET.md](docs/DAILY_EXP_RESET.md)
   - [DAILY_EXP_VISUAL_GUIDE.md](docs/DAILY_EXP_VISUAL_GUIDE.md)

4. **Summary**
   - [AUTO_UPDATE_FEATURES_SUMMARY.md](AUTO_UPDATE_FEATURES_SUMMARY.md)

---

## ✅ Checklist for Adding to New Route

When adding these features to a new route:

- [ ] Import `checkAndResetUserStreak` from `middleware/streakHelper.js`
- [ ] Call it before returning user data: `const user = await checkAndResetUserStreak(pgPool, userId)`
- [ ] For gardens: Use `checkAndResetGardenStreak(pgPool, gardenId)`
- [ ] For manual rank calc: Use `calculateRank(math, phy, bio, chem)`

---

## 🚨 Common Pitfalls

❌ **DON'T** call database directly for resets
```javascript
// Wrong
await pgPool.query('UPDATE user SET streak = 0');
```

✅ **DO** use helper functions
```javascript
// Correct
const user = await checkAndResetUserStreak(pgPool, userId);
```

❌ **DON'T** forget to await
```javascript
// Wrong
const user = checkAndResetUserStreak(pgPool, userId);
```

✅ **DO** await the promise
```javascript
// Correct
const user = await checkAndResetUserStreak(pgPool, userId);
```

---

## 🎓 Key Takeaways

1. **All features run automatically** on GET profile requests
2. **No manual intervention** needed for resets
3. **Streak resets** after 2+ days (tolerance for missing one day)
4. **Daily exp resets** every new day (strict daily tracking)
5. **Rank updates** whenever total experience changes
6. **35 unit tests** ensure reliability
7. **No migration needed** - uses existing fields
8. **Backward compatible** - won't break existing code

---

## 📞 Support

For questions or issues:
1. Check the full documentation (links above)
2. Review unit tests for examples: `tests/streakHelper.test.js`
3. Verify database schema: `init-scripts/02-schema.sql`
