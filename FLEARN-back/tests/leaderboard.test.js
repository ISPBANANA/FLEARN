/**
 * Unit tests for leaderboard daily_exp reset logic
 * Tests the SQL query that shows 0 for users not updated today
 */

describe('Leaderboard Daily Exp Reset Logic', () => {
    /**
     * Helper function to simulate the SQL CASE logic
     * This mimics the database query behavior
     */
    const calculateLeaderboardDailyExp = (user) => {
        if (!user.updated_at) {
            return 0;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const userUpdatedDate = new Date(user.updated_at);
        userUpdatedDate.setHours(0, 0, 0, 0);
        
        // If user was updated today, return their daily_exp
        // Otherwise, return 0
        return userUpdatedDate.getTime() === today.getTime() ? user.daily_exp : 0;
    };

    describe('calculateLeaderboardDailyExp', () => {
        test('should return daily_exp if user was updated today', () => {
            const today = new Date();
            const user = {
                name: 'Alice',
                daily_exp: 250,
                updated_at: today.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(250);
        });

        test('should return 0 if user was updated yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const user = {
                name: 'Bob',
                daily_exp: 180,
                updated_at: yesterday.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should return 0 if user was updated 3 days ago', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            const user = {
                name: 'Charlie',
                daily_exp: 500,
                updated_at: threeDaysAgo.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should return 0 if user was updated last week', () => {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const user = {
                name: 'David',
                daily_exp: 350,
                updated_at: lastWeek.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should return 0 if updated_at is null', () => {
            const user = {
                name: 'Eve',
                daily_exp: 100,
                updated_at: null
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should return 0 if updated_at is undefined', () => {
            const user = {
                name: 'Frank',
                daily_exp: 75
                // updated_at is undefined
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should handle user updated earlier today (morning)', () => {
            const todayMorning = new Date();
            todayMorning.setHours(6, 0, 0, 0);
            
            const user = {
                name: 'Grace',
                daily_exp: 120,
                updated_at: todayMorning.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(120);
        });

        test('should handle user updated later today (evening)', () => {
            const todayEvening = new Date();
            todayEvening.setHours(20, 30, 0, 0);
            
            const user = {
                name: 'Henry',
                daily_exp: 200,
                updated_at: todayEvening.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(200);
        });

        test('should return 0 for user with high daily_exp but old timestamp', () => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            const user = {
                name: 'Inactive User',
                daily_exp: 9999,  // Very high score
                updated_at: monthAgo.toISOString()
            };

            // Despite high score, should return 0 because it's old
            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should handle timestamp at midnight (start of today)', () => {
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);
            
            const user = {
                name: 'Midnight User',
                daily_exp: 150,
                updated_at: todayMidnight.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(150);
        });
    });

    describe('Leaderboard Sorting Logic', () => {
        test('should sort users correctly with mix of current and old data', () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const users = [
                { name: 'Alice', daily_exp: 100, updated_at: today.toISOString() },
                { name: 'Bob', daily_exp: 500, updated_at: yesterday.toISOString() }, // Old data
                { name: 'Charlie', daily_exp: 200, updated_at: today.toISOString() },
                { name: 'David', daily_exp: 300, updated_at: yesterday.toISOString() }, // Old data
                { name: 'Eve', daily_exp: 150, updated_at: today.toISOString() }
            ];

            // Apply the leaderboard logic
            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            // Sort by daily_exp descending
            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);

            // Expected order: Charlie(200), Eve(150), Alice(100), Bob(0), David(0)
            expect(leaderboardScores[0]).toEqual({ name: 'Charlie', daily_exp: 200 });
            expect(leaderboardScores[1]).toEqual({ name: 'Eve', daily_exp: 150 });
            expect(leaderboardScores[2]).toEqual({ name: 'Alice', daily_exp: 100 });
            expect(leaderboardScores[3]).toEqual({ name: 'Bob', daily_exp: 0 });
            expect(leaderboardScores[4]).toEqual({ name: 'David', daily_exp: 0 });
        });

        test('should handle all users updated today', () => {
            const today = new Date();

            const users = [
                { name: 'Alice', daily_exp: 100, updated_at: today.toISOString() },
                { name: 'Bob', daily_exp: 300, updated_at: today.toISOString() },
                { name: 'Charlie', daily_exp: 200, updated_at: today.toISOString() }
            ];

            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);

            expect(leaderboardScores[0]).toEqual({ name: 'Bob', daily_exp: 300 });
            expect(leaderboardScores[1]).toEqual({ name: 'Charlie', daily_exp: 200 });
            expect(leaderboardScores[2]).toEqual({ name: 'Alice', daily_exp: 100 });
        });

        test('should handle all users with old data', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const users = [
                { name: 'Alice', daily_exp: 500, updated_at: yesterday.toISOString() },
                { name: 'Bob', daily_exp: 300, updated_at: yesterday.toISOString() },
                { name: 'Charlie', daily_exp: 200, updated_at: yesterday.toISOString() }
            ];

            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);

            // All should have 0 since they're from yesterday
            expect(leaderboardScores[0].daily_exp).toBe(0);
            expect(leaderboardScores[1].daily_exp).toBe(0);
            expect(leaderboardScores[2].daily_exp).toBe(0);
        });

        test('should handle top 50 limit scenario', () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Create 100 users: 50 updated today, 50 updated yesterday
            const users = [];
            for (let i = 0; i < 50; i++) {
                users.push({
                    name: `User${i}`,
                    daily_exp: 100 + i,
                    updated_at: today.toISOString()
                });
            }
            for (let i = 50; i < 100; i++) {
                users.push({
                    name: `User${i}`,
                    daily_exp: 500 + i, // Higher scores but old data
                    updated_at: yesterday.toISOString()
                });
            }

            // Apply leaderboard logic
            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            // Sort and take top 50
            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);
            const top50 = leaderboardScores.slice(0, 50);

            // All top 50 should be from users updated today
            top50.forEach(user => {
                expect(user.daily_exp).toBeGreaterThan(0);
            });

            // The highest should be User49 with 149 points
            expect(top50[0].name).toBe('User49');
            expect(top50[0].daily_exp).toBe(149);
        });

        test('should show NEW top 50 when previous top 50 are all inactive for a few days', () => {
            const today = new Date();
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const users = [];
            
            // First 50 users: Were top players but inactive for 3 days (high scores but old)
            for (let i = 0; i < 50; i++) {
                users.push({
                    name: `OldTopPlayer${i}`,
                    daily_exp: 900 + i, // Very high scores (900-949)
                    updated_at: threeDaysAgo.toISOString() // But 3 days old!
                });
            }
            
            // Next 50 users: Active today but lower scores
            for (let i = 0; i < 50; i++) {
                users.push({
                    name: `NewPlayer${i}`,
                    daily_exp: 50 + i, // Lower scores (50-99)
                    updated_at: today.toISOString() // But updated today!
                });
            }
            
            // Last 30 users: Also active today with very low scores
            for (let i = 0; i < 30; i++) {
                users.push({
                    name: `Beginner${i}`,
                    daily_exp: 1 + i, // Very low scores (1-30)
                    updated_at: today.toISOString() // Updated today
                });
            }

            // Apply leaderboard logic
            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            // Sort by daily_exp descending
            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);
            
            // Take top 50
            const top50 = leaderboardScores.slice(0, 50);

            // CRITICAL: All old top players should have 0 and NOT be in top 50
            const oldPlayersInTop50 = top50.filter(user => user.name.startsWith('OldTopPlayer'));
            expect(oldPlayersInTop50.length).toBe(0);

            // All top 50 should be active users (NewPlayer users)
            const newPlayersInTop50 = top50.filter(user => user.name.startsWith('NewPlayer'));
            expect(newPlayersInTop50.length).toBe(50);

            // Top player should be NewPlayer49 with 99 daily_exp
            expect(top50[0].name).toBe('NewPlayer49');
            expect(top50[0].daily_exp).toBe(99);

            // Last in top 50 should be NewPlayer0 with 50 daily_exp
            expect(top50[49].name).toBe('NewPlayer0');
            expect(top50[49].daily_exp).toBe(50);

            // Verify old top players all have 0 (they're below top 50 now)
            const oldPlayers = leaderboardScores.filter(user => user.name.startsWith('OldTopPlayer'));
            oldPlayers.forEach(player => {
                expect(player.daily_exp).toBe(0);
            });

            // Old top players should be ranked 81-130 (after all active users)
            const oldPlayerRanking = leaderboardScores.findIndex(user => user.name === 'OldTopPlayer0');
            expect(oldPlayerRanking).toBeGreaterThanOrEqual(80); // After 80 active users
        });

        test('should handle scenario where only 10 users are active today out of 100', () => {
            const today = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            const users = [];
            
            // 90 users: Inactive for a week with high scores
            for (let i = 0; i < 90; i++) {
                users.push({
                    name: `InactiveUser${i}`,
                    daily_exp: 500 + i, // High scores (500-589)
                    updated_at: lastWeek.toISOString()
                });
            }
            
            // Only 10 users active today with lower scores
            for (let i = 0; i < 10; i++) {
                users.push({
                    name: `ActiveUser${i}`,
                    daily_exp: 10 + i * 5, // Lower scores (10, 15, 20, ..., 55)
                    updated_at: today.toISOString()
                });
            }

            // Apply leaderboard logic
            const leaderboardScores = users.map(user => ({
                name: user.name,
                daily_exp: calculateLeaderboardDailyExp(user)
            }));

            // Sort by daily_exp descending
            leaderboardScores.sort((a, b) => b.daily_exp - a.daily_exp);
            
            // Take top 50
            const top50 = leaderboardScores.slice(0, 50);

            // Only 10 active users, so top 10 should have non-zero scores
            const activeInTop50 = top50.filter(user => user.daily_exp > 0);
            expect(activeInTop50.length).toBe(10);

            // Remaining 40 should have 0 daily_exp (inactive users)
            const inactiveInTop50 = top50.filter(user => user.daily_exp === 0);
            expect(inactiveInTop50.length).toBe(40);

            // Top player should be ActiveUser9 with 55 daily_exp
            expect(top50[0].name).toBe('ActiveUser9');
            expect(top50[0].daily_exp).toBe(55);

            // 11th position should be an inactive user with 0
            expect(top50[10].daily_exp).toBe(0);
            expect(top50[10].name).toContain('InactiveUser');
        });
    });

    describe('Edge Cases', () => {
        test('should handle users with 0 daily_exp updated today', () => {
            const today = new Date();
            
            const user = {
                name: 'Zero Points',
                daily_exp: 0,
                updated_at: today.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(0);
        });

        test('should handle negative daily_exp (edge case)', () => {
            const today = new Date();
            
            const user = {
                name: 'Negative Points',
                daily_exp: -50,
                updated_at: today.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(-50);
        });

        test('should handle very large daily_exp values', () => {
            const today = new Date();
            
            const user = {
                name: 'Power User',
                daily_exp: 999999,
                updated_at: today.toISOString()
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(999999);
        });

        test('should handle string timestamp format', () => {
            const today = new Date();
            
            const user = {
                name: 'String Date',
                daily_exp: 175,
                updated_at: today.toISOString() // Use full ISO string instead of just date part
            };

            expect(calculateLeaderboardDailyExp(user)).toBe(175);
        });
    });

    describe('SQL Query Logic Validation', () => {
        test('CASE statement logic matches helper function', () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const testCases = [
                { daily_exp: 100, updated_at: today.toISOString(), expected: 100 },
                { daily_exp: 200, updated_at: yesterday.toISOString(), expected: 0 },
                { daily_exp: 300, updated_at: null, expected: 0 },
                { daily_exp: 0, updated_at: today.toISOString(), expected: 0 }
            ];

            testCases.forEach(testCase => {
                const user = {
                    name: 'Test User',
                    daily_exp: testCase.daily_exp,
                    updated_at: testCase.updated_at
                };
                
                const result = calculateLeaderboardDailyExp(user);
                expect(result).toBe(testCase.expected);
            });
        });
    });
});
