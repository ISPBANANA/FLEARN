# Daily Experience Reset Feature

## Overview
The daily experience reset feature automatically resets a user's `daily_exp` to 0 if the user data hasn't been updated since yesterday. This ensures that daily experience points are tracked accurately and reset every day.

## Business Logic

### Reset Condition
Daily exp is reset to 0 when:
```
updated_at (last update timestamp) < today (start of day)
```

In other words:
- If `updated_at` is from yesterday or earlier → Reset `daily_exp` to 0
- If `updated_at` is from today → Keep current `daily_exp` value

### Key Differences from Streak Reset
Unlike streak reset (which requires 2+ days), daily exp resets **every day**:
- **Streak reset**: Requires 2+ days gap (resets after missing a day)
- **Daily exp reset**: Requires 1+ day gap (resets on new day)

## Database Fields

### User Table
```sql
CREATE TABLE "user" (
    ...
    daily_exp INT DEFAULT 0,        -- Daily experience points (resets daily)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Last update timestamp
    ...
);
```

## Implementation Details

### Core Functions

#### `shouldResetDailyExp(updatedAt)`
Determines if daily exp should be reset based on last update timestamp.

**Parameters:**
- `updatedAt` (Date|string): The last `updated_at` timestamp from database

**Returns:**
- `boolean`: `true` if daily exp should be reset, `false` otherwise

**Logic:**
```javascript
const shouldResetDailyExp = (updatedAt) => {
    if (!updatedAt) {
        return false; // No updated_at means daily_exp is already 0
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const lastUpdate = new Date(updatedAt);
    lastUpdate.setHours(0, 0, 0, 0); // Start of last update day
    
    // Reset if it's a different day
    return today > lastUpdate;
};
```

#### `resetDailyExpIfNeeded(pgPool, userId, updatedAt)`
Resets daily exp in the database if needed.

**Parameters:**
- `pgPool` (object): PostgreSQL connection pool
- `userId` (string): User UUID
- `updatedAt` (Date|string): Last update timestamp

**Returns:**
- `Promise<boolean>`: `true` if reset was performed, `false` otherwise

**SQL Update:**
```sql
UPDATE "user" 
SET daily_exp = 0,
    updated_at = NOW()
WHERE user_id = $1
```

#### `checkAndResetUserStreak(pgPool, userId)`
Main function that checks and resets:
1. User streak (if 2+ days old)
2. User rank (if experience changed)
3. **Daily exp (if not updated today)** ← New feature

This function is automatically called on all GET endpoints that return user data.

## Automatic Updates

Daily exp reset happens automatically when:

### 1. Getting User Profile
```javascript
// GET /users/profile
router.get('/profile', checkJwt, async (req, res) => {
    const user = await checkAndResetUserStreak(pgPool, userId);
    // user.daily_exp will be 0 if not updated today
});
```

### 2. Getting User Profile by ID
```javascript
// GET /users/profilebyid
router.get('/profilebyid', checkJwt, async (req, res) => {
    const user = await checkAndResetUserStreak(pgPool, userId);
    // user.daily_exp will be 0 if not updated today
});
```

## Usage Examples

### Example 1: Daily Reset
```javascript
// Day 1 (Oct 6, 2025 at 10:00 AM)
User completes tasks, gains 150 daily_exp
updated_at = 2025-10-06 10:00:00
daily_exp = 150

// Day 2 (Oct 7, 2025 at 9:00 AM) - User fetches profile
GET /users/profile
→ shouldResetDailyExp checks: Oct 7 > Oct 6? Yes
→ daily_exp reset to 0
→ updated_at = 2025-10-07 09:00:00
→ Returns: daily_exp = 0

// Day 2 (Oct 7, 2025 at 2:00 PM) - User gains more exp
PATCH /users/experience with daily_exp: 50
→ daily_exp = 50 (not reset because already updated today)
→ updated_at = 2025-10-07 14:00:00

// Day 2 (Oct 7, 2025 at 5:00 PM) - User fetches profile again
GET /users/profile
→ shouldResetDailyExp checks: Oct 7 > Oct 7? No
→ daily_exp stays 50 (same day, no reset)
```

### Example 2: Multiple Days Inactive
```javascript
// Day 1 (Oct 6, 2025)
daily_exp = 200
updated_at = 2025-10-06 15:00:00

// Day 5 (Oct 10, 2025) - User returns after 4 days
GET /users/profile
→ shouldResetDailyExp checks: Oct 10 > Oct 6? Yes
→ daily_exp reset to 0
→ updated_at = 2025-10-10 now
```

### Example 3: Same Day Multiple Updates
```javascript
// Oct 6, 2025 at 8:00 AM
GET /users/profile
→ daily_exp = 0 (reset from yesterday)
→ updated_at = 2025-10-06 08:00:00

// Oct 6, 2025 at 10:00 AM
PATCH /users/experience with daily_exp: 100
→ daily_exp = 100
→ updated_at = 2025-10-06 10:00:00

// Oct 6, 2025 at 2:00 PM
GET /users/profile
→ shouldResetDailyExp checks: Oct 6 > Oct 6? No
→ daily_exp stays 100 (same day)

// Oct 6, 2025 at 5:00 PM
PATCH /users/experience with daily_exp: 150
→ daily_exp = 150
→ updated_at = 2025-10-06 17:00:00

// Oct 6, 2025 at 11:59 PM
GET /users/profile
→ shouldResetDailyExp checks: Oct 6 > Oct 6? No
→ daily_exp stays 150 (still same day)
```

## Edge Cases Handled

### 1. Null/Undefined updated_at
```javascript
updated_at = null
→ shouldResetDailyExp returns false
→ daily_exp not reset (already 0 or never set)
```

### 2. Multiple Hours Same Day
```javascript
updated_at = 2025-10-06 08:00:00
current time = 2025-10-06 23:00:00
→ shouldResetDailyExp returns false (same day)
→ daily_exp not reset
```

### 3. Just After Midnight
```javascript
updated_at = 2025-10-06 23:59:59
current time = 2025-10-07 00:00:01
→ shouldResetDailyExp returns true (new day)
→ daily_exp reset to 0
```

## Testing

### Unit Tests
All daily exp reset logic is covered by 10 unit tests in `tests/streakHelper.test.js`:

```javascript
describe('Daily Exp Reset Tests', () => {
    test('should return false if updated_at is null')
    test('should return false if updated_at is undefined')
    test('should return false if updated_at is today')
    test('should return true if updated_at is yesterday')
    test('should return true if updated_at is 2 days ago')
    test('should return true if updated_at is 10 days ago')
    test('should handle string date format')
    test('should handle ISO string date format')
    test('should handle timestamp from earlier today')
    test('edge case: should return false for timestamp a few hours ago')
});
```

Run tests:
```bash
npm test -- streakHelper.test.js
```

## Integration with Other Features

### Works Alongside Streak Reset
```javascript
checkAndResetUserStreak(pgPool, userId) performs:
1. Streak reset (if 2+ days old)
2. Rank update (based on total exp)
3. Daily exp reset (if not updated today) ← This feature
```

### Leaderboard Compatibility
```javascript
// GET /users/leaderboard
// Returns top 50 users by daily_exp
// Users with outdated daily_exp will show 0 when they fetch their profile
```

## Backend Routes Affected

| Route | Method | Auto-Reset Daily Exp? |
|-------|--------|----------------------|
| `/users/profile` | GET | ✅ Yes |
| `/users/profilebyid` | GET | ✅ Yes |
| `/users/experience` | PATCH | ❌ No (updates instead) |
| `/users/leaderboard` | GET | ❌ No (just reads) |

## Performance Considerations

- **Database Impact**: Single UPDATE query only when reset is needed
- **Frequency**: At most once per user per day
- **Optimization**: Reset check happens in-memory before DB update
- **No Impact**: If `updated_at` is today, function returns immediately (no DB query)

## Migration Notes

**No database migration required!**

The `daily_exp` and `updated_at` columns already exist in the schema. This feature uses existing fields.

## Backward Compatibility

✅ **Fully backward compatible**
- Existing daily_exp values remain valid
- No schema changes required
- Old API responses unchanged
- Only adds automatic reset logic

## Summary

The daily experience reset feature ensures:
- ✅ Daily exp resets to 0 at the start of each new day
- ✅ Automatic updates on GET requests for user profiles
- ✅ No manual intervention required
- ✅ Accurate daily experience tracking
- ✅ Works seamlessly with streak and rank features
- ✅ Fully tested with 10 unit tests
- ✅ Zero downtime deployment (no migration needed)
