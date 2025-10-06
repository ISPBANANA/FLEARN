# User Rank Auto-Calculation Feature

## Overview

This feature automatically calculates and updates user ranks based on their total subject experience (math, physics, biology, chemistry). The rank is calculated using the formula: `Rank Level = total(subject_exp) // 8000` and is updated automatically when user data is retrieved or experience is updated.

## Rank System

### Rank Formula

```
Total Experience = math_exp + phy_exp + bio_exp + chem_exp
Rank Level = floor(Total Experience / 8000)
```

### Rank Names and Thresholds

| Rank Level | Total Experience | Rank Name           |
|------------|------------------|---------------------|
| 0          | 0 - 7,999        | Beginner            |
| 1          | 8,000 - 15,999   | Primary school      |
| 2          | 16,000 - 23,999  | Secondary school    |
| 3          | 24,000 - 31,999  | University student  |
| 4          | 32,000 - 39,999  | Graduated           |
| 5+         | 40,000+          | Professor           |

**Note**: Professor is the highest rank and applies to all experience totals of 40,000 or above.

## Implementation Details

### Files Modified/Created

1. **`middleware/streakHelper.js`** (MODIFIED)
   - Added `calculateRank()` function
   - Added `updateUserRankIfNeeded()` function
   - Updated `checkAndResetUserStreak()` to also update rank
   - Exported `RANK_NAMES` and `RANK_EXP_DIVISOR` constants

2. **`routes/users.js`** (MODIFIED)
   - Updated `PATCH /api/users/experience` to calculate and update rank when experience changes
   - `GET /api/users/profile` now also updates rank (via `checkAndResetUserStreak`)
   - `GET /api/users/profilebyid` now also updates rank (via `checkAndResetUserStreak`)

3. **`tests/streakHelper.test.js`** (MODIFIED)
   - Added comprehensive tests for `calculateRank()` function
   - Tests cover all rank boundaries and edge cases

### When Rank is Updated

The rank is automatically recalculated and updated in two scenarios:

1. **On Experience Update**: When `PATCH /api/users/experience` is called
2. **On Profile Get**: When `GET /api/users/profile` or `GET /api/users/profilebyid` is called

## API Behavior

### Experience Update Endpoint

#### PATCH /api/users/experience

**Before**: Updated experience values only  
**After**: Updates experience values AND automatically calculates and updates rank

**Request**:
```http
PATCH /api/users/experience
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "math_exp": 10000,
  "phy_exp": 8000,
  "bio_exp": 6000,
  "chem_exp": 4000
}
```

**Response**:
```json
{
  "message": "Experience points and rank updated successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "math_exp": 10000,
    "phy_exp": 8000,
    "bio_exp": 6000,
    "chem_exp": 4000,
    "rank": "University student",  // Auto-calculated (28000 / 8000 = level 3)
    ...
  }
}
```

### Profile Get Endpoints

#### GET /api/users/profile
#### GET /api/users/profilebyid?id={userId}

**Before**: Returns user profile as-is  
**After**: Checks and updates rank if needed before returning

If the rank doesn't match the calculated rank based on current experience, it will be automatically updated before the response is sent.

## Examples

### Example 1: New User (Beginner)

**User Stats**:
- math_exp: 1000
- phy_exp: 1500
- bio_exp: 2000
- chem_exp: 1000
- **Total**: 5,500

**Calculated Rank**: `floor(5500 / 8000) = 0` → **"Beginner"**

### Example 2: Primary School Student

**User Stats**:
- math_exp: 3000
- phy_exp: 3000
- bio_exp: 3000
- chem_exp: 3000
- **Total**: 12,000

**Calculated Rank**: `floor(12000 / 8000) = 1` → **"Primary school"**

### Example 3: Secondary School Student

**User Stats**:
- math_exp: 6000
- phy_exp: 5000
- bio_exp: 4000
- chem_exp: 5000
- **Total**: 20,000

**Calculated Rank**: `floor(20000 / 8000) = 2` → **"Secondary school"**

### Example 4: University Student

**User Stats**:
- math_exp: 8000
- phy_exp: 7000
- bio_exp: 6000
- chem_exp: 9000
- **Total**: 30,000

**Calculated Rank**: `floor(30000 / 8000) = 3` → **"University student"**

### Example 5: Graduated

**User Stats**:
- math_exp: 10000
- phy_exp: 9000
- bio_exp: 8000
- chem_exp: 8000
- **Total**: 35,000

**Calculated Rank**: `floor(35000 / 8000) = 4` → **"Graduated"**

### Example 6: Professor

**User Stats**:
- math_exp: 12000
- phy_exp: 11000
- bio_exp: 10000
- chem_exp: 9000
- **Total**: 42,000

**Calculated Rank**: `floor(42000 / 8000) = 5` → **"Professor"**

### Example 7: Experience Update Triggers Rank Change

**Before Update**:
```json
{
  "math_exp": 5000,
  "phy_exp": 2000,
  "bio_exp": 0,
  "chem_exp": 0,
  "rank": "Beginner"  // Total: 7000
}
```

**Request**:
```http
PATCH /api/users/experience
{
  "chem_exp": 2000
}
```

**After Update**:
```json
{
  "math_exp": 5000,
  "phy_exp": 2000,
  "bio_exp": 0,
  "chem_exp": 2000,
  "rank": "Primary school"  // Total: 9000, auto-upgraded!
}
```

## Rank Progression Chart

```
Experience          Rank
    0 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Beginner
 8000 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Primary school
16000 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Secondary school
24000 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| University student
32000 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Graduated
40000 |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Professor (max)
  +∞  |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━| Professor
```

## Testing

### Run Unit Tests

```bash
cd FLEARN-back
npm test tests/streakHelper.test.js
```

### Test Coverage

The tests cover:
- ✅ All rank boundaries (0, 8000, 16000, 24000, 32000, 40000)
- ✅ Edge cases (just below/at rank boundaries)
- ✅ Null/undefined experience values
- ✅ Very high experience values
- ✅ Balanced vs specialized learning scenarios
- ✅ Correct divisor (8000) usage
- ✅ Correct rank name array

### Manual Testing Scenarios

#### Test 1: Rank Upgrade on Experience Gain
1. Create a user with 7500 total experience (Beginner)
2. Add 1000 to any subject experience
3. Verify rank upgrades to "Primary school"

#### Test 2: Profile GET Updates Stale Rank
1. Manually set a user's rank to "Beginner" in DB
2. Set their subject experiences to total 20000
3. Call `GET /api/users/profile`
4. Verify rank is auto-updated to "Secondary school"

#### Test 3: Multiple Rank Jumps
1. User has 5000 total experience (Beginner)
2. Update experience to 25000 total
3. Verify rank jumps directly to "University student"

## Database Schema

No changes required! Uses existing columns:

```sql
CREATE TABLE "user" (
    ...
    rank TEXT DEFAULT 'Beginner',
    math_exp INT DEFAULT 0,
    phy_exp INT DEFAULT 0,
    bio_exp INT DEFAULT 0,
    chem_exp INT DEFAULT 0,
    ...
);
```

## Performance Considerations

1. **Automatic Updates**: Rank calculation happens in-memory (very fast)
2. **Conditional Updates**: Database is only updated if rank actually changes
3. **Single Query**: Rank update happens in same transaction as experience update
4. **No Additional API Calls**: Transparent to frontend

## Future Enhancements

Potential improvements:
1. Add rank-up notifications/achievements
2. Track rank history (when user reached each rank)
3. Add rank-based rewards or unlockables
4. Show progress to next rank (e.g., "2000 XP to next rank")
5. Add rank-specific badges or icons
6. Leaderboard by rank
7. Rank decay/maintenance requirements

## Backward Compatibility

✅ **Fully Backward Compatible**
- No API contract changes
- No database schema changes
- Existing rank values will be auto-corrected on next GET/PATCH
- No breaking changes to response formats

## Migration Strategy

No migration needed, but optionally you can run a one-time script to update all existing user ranks:

```sql
-- Optional: Update all user ranks to match their current experience
UPDATE "user"
SET rank = CASE
    WHEN (math_exp + phy_exp + bio_exp + chem_exp) < 8000 THEN 'Beginner'
    WHEN (math_exp + phy_exp + bio_exp + chem_exp) < 16000 THEN 'Primary school'
    WHEN (math_exp + phy_exp + bio_exp + chem_exp) < 24000 THEN 'Secondary school'
    WHEN (math_exp + phy_exp + bio_exp + chem_exp) < 32000 THEN 'University student'
    WHEN (math_exp + phy_exp + bio_exp + chem_exp) < 40000 THEN 'Graduated'
    ELSE 'Professor'
END;
```

This is optional because ranks will auto-update on the next profile retrieval or experience update.
