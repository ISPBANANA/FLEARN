# Auto-Update Features Quick Reference

## 🚀 Overview

Three automatic features run when users fetch their profile:
1. **Streak Reset** - Resets to 0 if inactive for 2+ days
2. **Rank Calculation** - Updates rank based on total experience
3. **Daily Exp Reset** - Resets daily_exp at start of each new day

---

## 🔄 How It Works

### Trigger Points
```javascript
// User profile endpoint
GET /api/users/profile → Auto-updates all three features

// User profile by ID
GET /api/users/profilebyid?id=<USER_ID> → Auto-updates all three features

// Gardens endpoint
GET /api/gardens → Auto-updates garden streaks

// Experience update
PATCH /api/users/experience → Auto-recalculates rank
```

---

## 🔥 Streak Reset

### Logic
```javascript
IF (uptime_streak - today) >= 2 days THEN
    streak = 0
    uptime_streak = NULL
END IF
```

### Examples
| Last Update | Today | Days Difference | Result |
|------------|-------|----------------|--------|
| Oct 5 | Oct 7 | 2 days | ✅ RESET (streak → 0) |
| Oct 5 | Oct 8 | 3 days | ✅ RESET (streak → 0) |
| Oct 6 | Oct 7 | 1 day | ❌ NO RESET (streak preserved) |
| Oct 7 | Oct 7 | 0 days | ❌ NO RESET (same day) |

### Implementation
```javascript
const { checkAndResetUserStreak, checkAndResetGardenStreak } = require('./middleware/streakHelper');

// For users
const user = await checkAndResetUserStreak(pgPool, userId);

// For gardens
const garden = await checkAndResetGardenStreak(pgPool, gardenRowId);
```

### Function Details
```javascript
/**
 * Check and reset user streak if needed
 * @param {Pool} pgPool - PostgreSQL connection pool
 * @param {string} userId - User UUID
 * @returns {Object} - Updated user object
 */
const checkAndResetUserStreak = async (pgPool, userId) => {
    const result = await pgPool.query(
        'SELECT * FROM "user" WHERE user_id = $1',
        [userId]
    );
    
    const user = result.rows[0];
    
    if (shouldResetStreak(user.uptime_streak)) {
        await pgPool.query(
            `UPDATE "user" 
             SET streak = 0, uptime_streak = NULL 
             WHERE user_id = $1`,
            [userId]
        );
        user.streak = 0;
        user.uptime_streak = null;
    }
    
    return user;
};
```

---

## 🏆 Rank Calculation

### Logic
```javascript
total_exp = math_exp + phy_exp + bio_exp + chem_exp
rank_level = floor(total_exp / 8000)
rank = RANK_NAMES[rank_level]
```

### Rank Thresholds

| Level | Total Exp Range | Rank Name |
|-------|----------------|-----------|
| 0 | 0 - 7,999 | Beginner |
| 1 | 8,000 - 15,999 | Primary school |
| 2 | 16,000 - 23,999 | Secondary school |
| 3 | 24,000 - 31,999 | University student |
| 4 | 32,000 - 39,999 | Graduated |
| 5+ | 40,000+ | Professor |

### Examples

**Example 1:**
```
math_exp: 5,000
phy_exp: 3,000
bio_exp: 2,000
chem_exp: 1,500

total_exp = 11,500
rank_level = 11,500 / 8,000 = 1.4375 → floor = 1
rank = "Primary school"
```

**Example 2:**
```
math_exp: 10,000
phy_exp: 10,000
bio_exp: 8,000
chem_exp: 6,000

total_exp = 34,000
rank_level = 34,000 / 8,000 = 4.25 → floor = 4
rank = "Graduated"
```

### Implementation
```javascript
const { calculateRank } = require('./middleware/streakHelper');

const newRank = calculateRank(
    user.math_exp,
    user.phy_exp,
    user.bio_exp,
    user.chem_exp
);

await pgPool.query(
    'UPDATE "user" SET rank = $1 WHERE user_id = $2',
    [newRank, userId]
);
```

### Function Details
```javascript
/**
 * Calculate rank based on total subject experience
 * @param {number} mathExp - Math experience points
 * @param {number} phyExp - Physics experience points
 * @param {number} bioExp - Biology experience points
 * @param {number} chemExp - Chemistry experience points
 * @returns {string} - Rank name
 */
const calculateRank = (mathExp, phyExp, bioExp, chemExp) => {
    const totalExp = (mathExp || 0) + (phyExp || 0) + (bioExp || 0) + (chemExp || 0);
    const rankLevel = Math.floor(totalExp / 8000);
    const cappedLevel = Math.min(rankLevel, RANK_NAMES.length - 1);
    
    return RANK_NAMES[cappedLevel];
};
```

---

## 📅 Daily Exp Reset

### Logic
```javascript
IF updated_at < today THEN
    daily_exp = 0
END IF
```

### Examples

| Last Update | Today | Same Day? | Result |
|------------|-------|-----------|--------|
| Oct 6 23:59 | Oct 7 00:01 | No | ✅ RESET (daily_exp → 0) |
| Oct 7 08:00 | Oct 7 17:00 | Yes | ❌ NO RESET (daily_exp preserved) |
| Oct 5 | Oct 7 | No | ✅ RESET (daily_exp → 0) |

### Implementation
The daily exp reset is automatically handled in `checkAndResetUserStreak`:

```javascript
const checkAndResetUserStreak = async (pgPool, userId) => {
    // ... streak reset logic ...
    
    // Check if daily_exp should be reset
    const today = new Date().toDateString();
    const lastUpdate = new Date(user.updated_at).toDateString();
    
    if (lastUpdate !== today) {
        await pgPool.query(
            `UPDATE "user" 
             SET daily_exp = 0, updated_at = NOW() 
             WHERE user_id = $1`,
            [userId]
        );
        user.daily_exp = 0;
    }
    
    return user;
};
```

---

## 🎯 Usage Examples

### User Profile Fetch
```javascript
// routes/users.js
router.get('/profile', checkJwt, async (req, res) => {
    const googleId = req.user.sub;
    
    const result = await pgPool.query(
        'SELECT * FROM "user" WHERE google_id = $1',
        [googleId]
    );
    
    // ✨ Auto-updates: Streak, Rank, Daily Exp
    const user = await checkAndResetUserStreak(pgPool, result.rows[0].user_id);
    
    res.json({ user });
});
```

### Experience Update
```javascript
// routes/users.js
router.patch('/experience', checkJwt, async (req, res) => {
    const { math_exp, phy_exp, bio_exp, chem_exp } = req.body;
    
    // ✨ Auto-calculates rank
    const newRank = calculateRank(math_exp, phy_exp, bio_exp, chem_exp);
    
    await pgPool.query(
        `UPDATE "user" 
         SET math_exp = $1, phy_exp = $2, bio_exp = $3, chem_exp = $4, rank = $5
         WHERE user_id = $6`,
        [math_exp, phy_exp, bio_exp, chem_exp, newRank, userId]
    );
    
    res.json({ message: 'Experience updated', rank: newRank });
});
```

### Garden Fetch
```javascript
// routes/gardens.js
router.get('/', checkJwt, async (req, res) => {
    const gardens = await pgPool.query(
        'SELECT * FROM garden WHERE user1_id = $1 OR user2_id = $1',
        [userId]
    );
    
    // ✨ Auto-updates each garden's streak
    const updatedGardens = await Promise.all(
        gardens.rows.map(garden => 
            checkAndResetGardenStreak(pgPool, garden.row_id)
        )
    );
    
    res.json({ gardens: updatedGardens });
});
```

---

## 🔧 Helper Functions

### shouldResetStreak
```javascript
/**
 * Check if a streak should be reset based on the last update date
 * @param {Date|string} uptimeStreak - The last streak update date
 * @returns {boolean} - True if streak should be reset
 */
const shouldResetStreak = (uptimeStreak) => {
    if (!uptimeStreak) {
        return false; // Already reset or never started
    }
    
    const today = new Date();
    const lastUpdate = new Date(uptimeStreak);
    
    // Calculate days difference
    const daysDiff = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 2; // Reset if 2+ days
};
```

### checkAndResetGardenStreak
```javascript
/**
 * Check and reset garden streak if needed
 * @param {Pool} pgPool - PostgreSQL connection pool
 * @param {string} gardenRowId - Garden row UUID
 * @returns {Object} - Updated garden object
 */
const checkAndResetGardenStreak = async (pgPool, gardenRowId) => {
    const result = await pgPool.query(
        'SELECT * FROM garden WHERE row_id = $1',
        [gardenRowId]
    );
    
    const garden = result.rows[0];
    
    if (shouldResetStreak(garden.uptime_streak)) {
        await pgPool.query(
            `UPDATE garden 
             SET streak = 0, uptime_streak = NULL 
             WHERE row_id = $1`,
            [gardenRowId]
        );
        garden.streak = 0;
        garden.uptime_streak = null;
    }
    
    return garden;
};
```

---

## 📊 Complete Flow Diagram

```
User Request
    ↓
GET /api/users/profile
    ↓
Fetch user from DB
    ↓
checkAndResetUserStreak()
    ├─→ Check streak (uptime_streak - today >= 2?)
    │   ├─→ YES: Reset to 0
    │   └─→ NO: Keep current
    ├─→ Check daily_exp (updated_at < today?)
    │   ├─→ YES: Reset to 0
    │   └─→ NO: Keep current
    └─→ Calculate rank (total_exp / 8000)
        └─→ Update if changed
    ↓
Return updated user
```

---

## 🧪 Testing

### Test Streak Reset
```javascript
// Set uptime_streak to 3 days ago
await pgPool.query(
    `UPDATE "user" 
     SET uptime_streak = NOW() - INTERVAL '3 days' 
     WHERE user_id = $1`,
    [userId]
);

// Fetch profile - should reset streak to 0
const user = await checkAndResetUserStreak(pgPool, userId);
console.log(user.streak); // 0
```

### Test Rank Calculation
```javascript
// Set experience values
const rank = calculateRank(8000, 0, 0, 0);
console.log(rank); // "Primary school"

const rank2 = calculateRank(10000, 10000, 10000, 10000);
console.log(rank2); // "Professor"
```

### Test Daily Exp Reset
```javascript
// Set updated_at to yesterday
await pgPool.query(
    `UPDATE "user" 
     SET updated_at = NOW() - INTERVAL '1 day', daily_exp = 100 
     WHERE user_id = $1`,
    [userId]
);

// Fetch profile - should reset daily_exp to 0
const user = await checkAndResetUserStreak(pgPool, userId);
console.log(user.daily_exp); // 0
```

---

## 📚 Related Documentation

- API Endpoints: `API_ENDPOINTS.md`
- Database Schema: `DATABASE.md`
- Detailed Visual Guides:
  - `docs/STREAK_RESET.md`
  - `docs/RANK_CALCULATION.md`
  - `docs/DAILY_EXP_RESET.md`
