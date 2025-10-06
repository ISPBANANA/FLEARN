# Streak Auto-Reset Functionality

## Overview

This feature automatically resets user and garden streaks to 0 when the `uptime_streak` date is 2 or more days old compared to the current date. The reset happens automatically when data is retrieved via GET endpoints.

## Implementation Details

### Files Modified/Created

1. **`middleware/streakHelper.js`** (NEW)
   - Contains helper functions for checking and resetting streaks
   - Functions:
     - `shouldResetStreak(uptimeStreak)` - Checks if streak should be reset
     - `resetUserStreakIfNeeded(pgPool, userId, uptimeStreak)` - Resets user streak if needed
     - `resetGardenStreakIfNeeded(pgPool, gardenId, uptimeStreak)` - Resets garden streak if needed
     - `checkAndResetUserStreak(pgPool, userId)` - Checks and resets user streak, returns updated user data
     - `checkAndResetGardenStreak(pgPool, gardenId)` - Checks and resets garden streak, returns updated garden data

2. **`routes/users.js`** (MODIFIED)
   - Updated `GET /api/users/profile` to check and reset streak on retrieval
   - Updated `GET /api/users/profilebyid` to check and reset streak on retrieval

3. **`routes/gardens.js`** (MODIFIED)
   - Updated `GET /api/gardens` to check and reset streaks for all gardens on retrieval
   - Updated `GET /api/gardens/user/:userId` to check and reset streaks for user's gardens on retrieval

4. **`tests/streakHelper.test.js`** (NEW)
   - Unit tests for streak reset logic

### Logic

The streak reset logic follows these rules:

1. **No Reset**: If `uptime_streak` is `NULL` or `undefined` → No reset (streak already 0 or never started)
2. **No Reset**: If `uptime_streak` is today (0 days difference) → No reset
3. **No Reset**: If `uptime_streak` is yesterday (1 day difference) → No reset
4. **RESET**: If `uptime_streak` is 2+ days ago (≥2 days difference) → Reset streak to 0 and set `uptime_streak` to `NULL`

### Reset Behavior

When a streak is reset:
- `streak` field is set to `0`
- `uptime_streak` field is set to `NULL`
- `updated_at` timestamp is updated to current time

## API Behavior

### User Profile Endpoints

#### GET /api/users/profile
**Before**: Returns user profile as-is from database
**After**: Checks if streak needs reset before returning, automatically resets if condition is met

#### GET /api/users/profilebyid?id={userId}
**Before**: Returns user profile as-is from database
**After**: Checks if streak needs reset before returning, automatically resets if condition is met

### Garden Endpoints

#### GET /api/gardens
**Before**: Returns all user's gardens as-is from database
**After**: Checks each garden's streak and resets if needed before returning

#### GET /api/gardens/user/{userId}
**Before**: Returns user's active gardens as-is from database
**After**: Checks each garden's streak and resets if needed before returning

## Examples

### Example 1: User Profile Streak Reset

**Scenario**: User's `uptime_streak` is 3 days old

**Request**:
```http
GET /api/users/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "streak": 0,          // Reset from previous value
    "uptime_streak": null, // Reset from old date
    ...
  }
}
```

### Example 2: Garden Streak Reset

**Scenario**: Garden's `uptime_streak` is 5 days old

**Request**:
```http
GET /api/gardens
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "message": "Gardens retrieved successfully",
  "gardens": [
    {
      "row_id": 1,
      "streak": 0,          // Reset from previous value
      "uptime_streak": null, // Reset from old date
      "partner_name": "Jane Doe",
      ...
    }
  ]
}
```

### Example 3: No Reset Needed

**Scenario**: User's `uptime_streak` was updated yesterday

**Request**:
```http
GET /api/users/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "streak": 5,                    // Unchanged
    "uptime_streak": "2025-10-05",  // Yesterday - no reset
    ...
  }
}
```

## Testing

Run the unit tests for the streak helper:

```bash
cd FLEARN-back
npm test tests/streakHelper.test.js
```

### Test Coverage

The tests cover:
- ✅ Null/undefined uptime_streak values
- ✅ Today's date (0 days difference)
- ✅ Yesterday's date (1 day difference)
- ✅ 2 days ago (should reset)
- ✅ 3+ days ago (should reset)
- ✅ String date formats
- ✅ ISO string formats
- ✅ Edge cases

## Database Schema

### User Table
```sql
CREATE TABLE "user" (
    ...
    streak INT DEFAULT 0,
    uptime_streak DATE,
    ...
);
```

### Garden Table
```sql
CREATE TABLE garden (
    ...
    streak INT DEFAULT 0,
    uptime_streak DATE,
    ...
);
```

## Performance Considerations

1. **Automatic Updates**: Streak resets happen automatically on GET requests, so no additional API calls are needed
2. **Database Queries**: Each reset requires one additional UPDATE query per entity
3. **Optimization**: For endpoints returning multiple gardens, updates are performed in parallel using `Promise.all()`

## Future Enhancements

Potential improvements:
1. Add a scheduled job (cron) to reset streaks in bulk at midnight
2. Add analytics/logging for streak resets
3. Send notifications to users when their streak is reset
4. Add a grace period configuration option

## Migration

No database migration is required as this feature uses existing `streak` and `uptime_streak` columns.

## Backward Compatibility

✅ **Fully Backward Compatible**
- No API contract changes
- No database schema changes
- Existing clients will receive updated data transparently
- No breaking changes to response formats
