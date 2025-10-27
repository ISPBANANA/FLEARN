# Streak Reset Logic Flow

## Decision Tree

```
┌─────────────────────────────────────┐
│  User/Garden GET Request Received   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Fetch data from database          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Check uptime_streak value         │
└─────────────┬───────────────────────┘
              │
              ▼
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌──────────┐    ┌──────────────┐
│ NULL or  │    │  Has Date    │
│Undefined │    │   Value      │
└────┬─────┘    └──────┬───────┘
     │                 │
     │                 ▼
     │         ┌────────────────────┐
     │         │ Calculate days     │
     │         │ difference from    │
     │         │ today              │
     │         └────────┬───────────┘
     │                  │
     │          ┌───────┴────────┐
     │          │                │
     │          ▼                ▼
     │    ┌──────────┐    ┌──────────┐
     │    │ 0-1 Days │    │ 2+ Days  │
     │    └────┬─────┘    └────┬─────┘
     │         │               │
     ▼         ▼               ▼
┌─────────────────────┐  ┌──────────────────┐
│  No Reset Needed    │  │  Reset Streak    │
│  Return data as-is  │  │  - streak = 0    │
│                     │  │  - uptime = NULL │
└─────────┬───────────┘  └────────┬─────────┘
          │                       │
          │                       ▼
          │              ┌──────────────────┐
          │              │ UPDATE database  │
          │              └────────┬─────────┘
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
              ┌──────────────────┐
              │ Return updated   │
              │ data to client   │
              └──────────────────┘
```

## Timeline Examples

### Example 1: No Reset (1 Day)
```
Today: Oct 6, 2025
uptime_streak: Oct 5, 2025 (1 day ago)
Result: ✅ NO RESET (streak maintained)
```

### Example 2: Reset (2 Days)
```
Today: Oct 6, 2025
uptime_streak: Oct 4, 2025 (2 days ago)
Result: ⚠️ RESET (streak = 0, uptime_streak = NULL)
```

### Example 3: Reset (Many Days)
```
Today: Oct 6, 2025
uptime_streak: Sep 20, 2025 (16 days ago)
Result: ⚠️ RESET (streak = 0, uptime_streak = NULL)
```

## Code Flow

### User Profile Request
```javascript
GET /api/users/profile
    ↓
Fetch user from DB
    ↓
checkAndResetUserStreak(pgPool, userId)
    ↓
shouldResetStreak(uptime_streak)?
    ├─ YES → UPDATE user SET streak=0, uptime_streak=NULL
    └─ NO  → Return data as-is
    ↓
Return user data to client
```

### Garden List Request
```javascript
GET /api/gardens
    ↓
Fetch gardens from DB (with JOIN)
    ↓
For each garden:
    checkAndResetGardenStreak(pgPool, garden.row_id)
        ↓
    shouldResetStreak(uptime_streak)?
        ├─ YES → UPDATE garden SET streak=0, uptime_streak=NULL
        └─ NO  → Return data as-is
    ↓
Return all gardens to client
```

## Database Impact

### Before Reset
```sql
SELECT streak, uptime_streak FROM "user" WHERE user_id = '...';
```
| streak | uptime_streak |
|--------|---------------|
| 5      | 2025-10-03    |

### After Reset (Automatic)
```sql
SELECT streak, uptime_streak FROM "user" WHERE user_id = '...';
```
| streak | uptime_streak |
|--------|---------------|
| 0      | NULL          |

## Performance Notes

- **Single User**: 1 SELECT + 0-1 UPDATE queries
- **Multiple Gardens**: 1 SELECT (JOIN) + N parallel UPDATE queries (if needed)
- **Optimization**: Updates only happen when reset condition is met
- **Caching**: Consider implementing caching to reduce database calls
