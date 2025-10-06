# Rank System Visual Guide

## Rank Progression Flow

```
           User Gains Experience
                    ↓
    ┌───────────────────────────────┐
    │   Total XP Calculated         │
    │   math + phy + bio + chem     │
    └───────────────┬───────────────┘
                    ↓
    ┌───────────────────────────────┐
    │   Rank Level = Total XP / 8000│
    │   (Using integer division)    │
    └───────────────┬───────────────┘
                    ↓
    ┌───────────────────────────────┐
    │   Map Level to Rank Name      │
    └───────────────┬───────────────┘
                    ↓
            Update Database
```

## Rank Ladder

```
                    🎓 Professor
                    ┃ Level 5+
                    ┃ 40,000+ XP
                    ┃
                    ┃
        ════════════╬════════════  40,000 XP
                    ┃
                    🎓 Graduated
                    ┃ Level 4
                    ┃ 32,000-39,999 XP
                    ┃
        ════════════╬════════════  32,000 XP
                    ┃
                    🎓 University student
                    ┃ Level 3
                    ┃ 24,000-31,999 XP
                    ┃
        ════════════╬════════════  24,000 XP
                    ┃
                    🎓 Secondary school
                    ┃ Level 2
                    ┃ 16,000-23,999 XP
                    ┃
        ════════════╬════════════  16,000 XP
                    ┃
                    🎓 Primary school
                    ┃ Level 1
                    ┃ 8,000-15,999 XP
                    ┃
        ════════════╬════════════  8,000 XP
                    ┃
                    🎓 Beginner
                    ┃ Level 0
                    ┃ 0-7,999 XP
                    ┃
        ════════════╩════════════  0 XP
```

## Experience Distribution Examples

### Example 1: Balanced Learner
```
Math:    █████ 5,000 XP
Physics: █████ 5,000 XP
Biology: █████ 5,000 XP
Chemistry:█████ 5,000 XP
────────────────────────
Total:   20,000 XP
Rank:    Secondary school (Level 2)
```

### Example 2: Math Specialist
```
Math:    ████████████████ 15,000 XP
Physics: ██ 2,000 XP
Biology: █ 1,000 XP
Chemistry:██ 2,000 XP
────────────────────────
Total:   20,000 XP
Rank:    Secondary school (Level 2)
```

### Example 3: University Student
```
Math:    ████████ 8,000 XP
Physics: ███████ 7,000 XP
Biology: ███████ 7,000 XP
Chemistry:████████ 8,000 XP
────────────────────────
Total:   30,000 XP
Rank:    University student (Level 3)
```

### Example 4: Professor
```
Math:    ████████████ 12,000 XP
Physics: ███████████ 11,000 XP
Biology: ██████████ 10,000 XP
Chemistry:█████████ 9,000 XP
────────────────────────
Total:   42,000 XP
Rank:    Professor (Level 5)
```

## Rank Up Scenarios

### Scenario A: Gradual Progress
```
Day 1:  5,000 XP  → Beginner
Day 10: 8,500 XP  → Primary school ⬆️
Day 20: 16,200 XP → Secondary school ⬆️
Day 30: 24,100 XP → University student ⬆️
Day 40: 32,500 XP → Graduated ⬆️
Day 50: 40,800 XP → Professor ⬆️
```

### Scenario B: Fast Learner
```
Week 1: 0 XP      → Beginner
Week 2: 15,000 XP → Primary school ⬆️
Week 3: 25,000 XP → University student ⬆️⬆️ (skipped Secondary)
Week 4: 41,000 XP → Professor ⬆️⬆️ (skipped Graduated)
```

## XP Required for Each Rank

| From Beginner    | To Next Rank          | XP Needed |
|------------------|-----------------------|-----------|
| Beginner         | → Primary school      | 8,000     |
| Primary school   | → Secondary school    | 8,000     |
| Secondary school | → University student  | 8,000     |
| University student| → Graduated          | 8,000     |
| Graduated        | → Professor           | 8,000     |
| Professor        | → (Max Rank)          | -         |

**Total to reach Professor**: 40,000 XP

## API Response Examples

### Low Level
```json
{
  "math_exp": 2000,
  "phy_exp": 1500,
  "bio_exp": 1000,
  "chem_exp": 2500,
  "rank": "Beginner"
}
```

### Mid Level
```json
{
  "math_exp": 5000,
  "phy_exp": 5000,
  "bio_exp": 5000,
  "chem_exp": 5000,
  "rank": "Secondary school"
}
```

### High Level
```json
{
  "math_exp": 12000,
  "phy_exp": 11000,
  "bio_exp": 10000,
  "chem_exp": 9000,
  "rank": "Professor"
}
```

## Calculation Reference Table

| Total XP | ÷ 8000 | Level | Rank Name          |
|----------|--------|-------|--------------------|
| 0        | 0.00   | 0     | Beginner           |
| 4,000    | 0.50   | 0     | Beginner           |
| 7,999    | 0.99   | 0     | Beginner           |
| 8,000    | 1.00   | 1     | Primary school     |
| 12,000   | 1.50   | 1     | Primary school     |
| 15,999   | 1.99   | 1     | Primary school     |
| 16,000   | 2.00   | 2     | Secondary school   |
| 20,000   | 2.50   | 2     | Secondary school   |
| 23,999   | 2.99   | 2     | Secondary school   |
| 24,000   | 3.00   | 3     | University student |
| 28,000   | 3.50   | 3     | University student |
| 31,999   | 3.99   | 3     | University student |
| 32,000   | 4.00   | 4     | Graduated          |
| 36,000   | 4.50   | 4     | Graduated          |
| 39,999   | 4.99   | 4     | Graduated          |
| 40,000   | 5.00   | 5     | Professor          |
| 50,000   | 6.25   | 6     | Professor          |
| 100,000  | 12.50  | 12    | Professor          |

Note: Level is calculated using `floor()` function (integer division)

## Progress Tracking

### XP to Next Rank Formula
```javascript
currentXP = math_exp + phy_exp + bio_exp + chem_exp
currentLevel = Math.floor(currentXP / 8000)
nextLevelXP = (currentLevel + 1) * 8000
xpNeeded = nextLevelXP - currentXP
progressPercent = ((currentXP % 8000) / 8000) * 100
```

### Example Calculation
```
Current XP: 22,500
Current Level: floor(22,500 / 8000) = 2 (Secondary school)
Next Level XP: 3 * 8000 = 24,000
XP Needed: 24,000 - 22,500 = 1,500
Progress: (22,500 % 8000) / 8000 = 6,500 / 8000 = 81.25%
```

Progress bar:
```
█████████████████████░░░ 81.25% to University student
1,500 XP remaining
```
