# Daily Exp Reset - Visual Flow Guide

## Feature Overview
```
┌─────────────────────────────────────────────────────────────┐
│          DAILY EXPERIENCE RESET SYSTEM                      │
│  Automatically resets daily_exp to 0 if not updated today   │
└─────────────────────────────────────────────────────────────┘
```

## Flow Diagram: Daily Exp Reset Logic

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER REQUESTS PROFILE DATA                            │
│                    (GET /users/profile)                                  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              checkAndResetUserStreak(pgPool, userId)                     │
│              Fetches user data from database                             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Get user.updated_at  │
                    └──────────┬────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │ shouldResetDailyExp(updated_at) │
              │                                 │
              │  Compare last update vs today   │
              └────────────┬───────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌──────────────┐              ┌──────────────┐
    │  updated_at   │              │  updated_at   │
    │  is TODAY     │              │ is YESTERDAY  │
    │               │              │   or older    │
    └──────┬────────┘              └──────┬────────┘
           │                               │
           ▼                               ▼
    ┌──────────────┐              ┌──────────────────┐
    │  Return       │              │  Return TRUE     │
    │  FALSE        │              │  (needs reset)   │
    └──────┬────────┘              └──────┬───────────┘
           │                               │
           ▼                               ▼
    ┌──────────────┐              ┌──────────────────────────┐
    │  Keep current │              │  Execute UPDATE query:   │
    │  daily_exp    │              │  SET daily_exp = 0       │
    │  value        │              │  SET updated_at = NOW()  │
    └──────┬────────┘              └──────┬───────────────────┘
           │                               │
           │                               ▼
           │                    ┌──────────────────────┐
           │                    │  Fetch updated user  │
           │                    │  data from database  │
           │                    └──────┬───────────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
           ┌──────────────────────┐
           │  Return user object  │
           │  with current        │
           │  daily_exp value     │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Send response       │
           │  to client           │
           └──────────────────────┘
```

## Timeline Example: Daily Exp Reset Over 3 Days

```
DAY 1 (Monday, Oct 6)
═══════════════════════════════════════════════════════════════

09:00 AM  ┌─────────────────────────────────┐
          │ GET /users/profile               │
          │ daily_exp: 0 (reset from Sunday) │
          │ updated_at: 2025-10-06 09:00:00  │
          └─────────────────────────────────┘

10:30 AM  ┌──────────────────────────────────┐
          │ PATCH /users/experience          │
          │ Body: { daily_exp: 50 }          │
          │ daily_exp: 50                    │
          │ updated_at: 2025-10-06 10:30:00  │
          └──────────────────────────────────┘

02:00 PM  ┌──────────────────────────────────┐
          │ GET /users/profile               │
          │ Check: Oct 6 > Oct 6? NO         │
          │ daily_exp: 50 (no reset)         │
          │ updated_at: 2025-10-06 02:00:00  │
          └──────────────────────────────────┘

05:00 PM  ┌──────────────────────────────────┐
          │ PATCH /users/experience          │
          │ Body: { daily_exp: 125 }         │
          │ daily_exp: 125                   │
          │ updated_at: 2025-10-06 17:00:00  │
          └──────────────────────────────────┘


DAY 2 (Tuesday, Oct 7)
═══════════════════════════════════════════════════════════════

08:00 AM  ┌──────────────────────────────────┐
          │ GET /users/profile               │
          │ Check: Oct 7 > Oct 6? YES ✓      │
          │ RESET: daily_exp = 0             │
          │ updated_at: 2025-10-07 08:00:00  │
          └──────────────────────────────────┘
                     │
                     └──> Monday's 125 exp cleared!

11:00 AM  ┌──────────────────────────────────┐
          │ PATCH /users/experience          │
          │ Body: { daily_exp: 75 }          │
          │ daily_exp: 75                    │
          │ updated_at: 2025-10-07 11:00:00  │
          └──────────────────────────────────┘


DAY 3 (Wednesday, Oct 8)
═══════════════════════════════════════════════════════════════

09:30 AM  ┌──────────────────────────────────┐
          │ GET /users/profile               │
          │ Check: Oct 8 > Oct 7? YES ✓      │
          │ RESET: daily_exp = 0             │
          │ updated_at: 2025-10-08 09:30:00  │
          └──────────────────────────────────┘
                     │
                     └──> Tuesday's 75 exp cleared!
```

## Comparison: Streak vs Daily Exp Reset

```
┌──────────────────┬─────────────────────┬─────────────────────┐
│   FEATURE        │   STREAK RESET      │  DAILY EXP RESET    │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Reset Condition  │ 2+ days gap         │ 1+ day gap          │
│                  │ (missed a day)      │ (new day)           │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Field Reset      │ streak = 0          │ daily_exp = 0       │
│                  │ uptime_streak = NULL│                     │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Trigger Date     │ uptime_streak       │ updated_at          │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Example          │ Last update: Oct 5  │ Last update: Oct 6  │
│                  │ Today: Oct 7        │ Today: Oct 7        │
│                  │ Gap: 2 days → RESET │ Gap: 1 day → RESET  │
├──────────────────┼─────────────────────┼─────────────────────┤
│ Purpose          │ Track consistency   │ Track daily effort  │
│                  │ (consecutive days)  │ (today's progress)  │
└──────────────────┴─────────────────────┴─────────────────────┘
```

## State Transition Diagram

```
SAME DAY - No Reset
══════════════════════════════════════════════════════

Time: 08:00       Time: 14:00       Time: 20:00
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ daily_exp: 0 │   │ daily_exp:50│   │ daily_exp:75│
│ date: Oct 6  │   │ date: Oct 6 │   │ date: Oct 6 │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
              Same day → No reset


NEW DAY - Reset Triggered
══════════════════════════════════════════════════════

Time: Oct 6 20:00         Time: Oct 7 09:00
┌──────────────────┐      ┌──────────────────┐
│ daily_exp: 75    │      │ daily_exp: 0     │
│ date: Oct 6      │      │ date: Oct 7      │
│ updated_at:      │      │ updated_at:      │
│   Oct 6 20:00    │      │   Oct 7 09:00    │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         └─────────────┬───────────┘
                       │
                       ▼
              ┌────────────────┐
              │  New day       │
              │  detected!     │
              │  RESET = 0     │
              └────────────────┘
```

## Code Flow: Integration with Other Features

```
┌─────────────────────────────────────────────────────────────┐
│        checkAndResetUserStreak(pgPool, userId)              │
│        Main function that handles all auto-updates          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Fetch user from database     │
        └──────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ Check 3 conditions in parallel:      │
    ├──────────────────────────────────────┤
    │ 1. Streak reset needed?              │
    │    (uptime_streak >= 2 days old)     │
    │                                      │
    │ 2. Rank update needed?               │
    │    (total_exp changed)               │
    │                                      │
    │ 3. Daily exp reset needed? ← NEW!   │
    │    (updated_at is yesterday/older)   │
    └──────────┬───────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Execute necessary updates │
    └──────────┬─────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Fetch fresh user data    │
    │ if any update occurred   │
    └──────────┬─────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Return updated user      │
    └──────────────────────────┘
```

## API Response Examples

### Scenario 1: Same Day (No Reset)
```json
// Request: GET /users/profile
// Last update: Oct 6 10:00 AM
// Current time: Oct 6 3:00 PM

{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "daily_exp": 150,  ← Keeps value (same day)
  "math_exp": 5000,
  "streak": 5,
  "rank": "Secondary school",
  "updated_at": "2025-10-06T15:00:00.000Z"
}
```

### Scenario 2: New Day (Reset Triggered)
```json
// Request: GET /users/profile
// Last update: Oct 6 10:00 PM
// Current time: Oct 7 9:00 AM

{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "daily_exp": 0,  ← RESET! (new day)
  "math_exp": 5000,
  "streak": 5,
  "rank": "Secondary school",
  "updated_at": "2025-10-07T09:00:00.000Z"  ← Updated to now
}
```

### Scenario 3: Multiple Days Inactive
```json
// Request: GET /users/profile
// Last update: Oct 3 2:00 PM
// Current time: Oct 7 9:00 AM

{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "daily_exp": 0,  ← RESET! (4 days old)
  "math_exp": 5000,
  "streak": 0,     ← Also reset! (2+ days = streak reset)
  "rank": "Secondary school",
  "updated_at": "2025-10-07T09:00:00.000Z"
}
```

## Performance Metrics

```
┌─────────────────────────────────────────────────────────┐
│              PERFORMANCE CHARACTERISTICS                │
├─────────────────────────────────────────────────────────┤
│ Check Time (in-memory):        < 1 ms                   │
│ Database UPDATE (if needed):   ~5-10 ms                 │
│ Total overhead:                Minimal                  │
├─────────────────────────────────────────────────────────┤
│ Frequency:                     Max once per user/day    │
│ Database queries:              0-1 UPDATE per check     │
│ Network impact:                None (server-side only)  │
└─────────────────────────────────────────────────────────┘
```

## Summary

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           DAILY EXP RESET - KEY POINTS                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                       ┃
┃  ✓ Resets daily_exp to 0 at start of each new day    ┃
┃  ✓ Triggered automatically on GET profile requests   ┃
┃  ✓ Uses updated_at timestamp for comparison          ┃
┃  ✓ No manual intervention required                   ┃
┃  ✓ Works alongside streak and rank features          ┃
┃  ✓ 10 comprehensive unit tests                       ┃
┃  ✓ No database migration needed                      ┃
┃  ✓ Backward compatible                               ┃
┃                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
