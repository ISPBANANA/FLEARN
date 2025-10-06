/**
 * Unit tests for streak helper functions and rank calculation
 */

const { shouldResetStreak, calculateRank, RANK_NAMES, RANK_EXP_DIVISOR } = require('../middleware/streakHelper');

describe('Streak Helper Tests', () => {
    describe('shouldResetStreak', () => {
        test('should return false if uptime_streak is null', () => {
            expect(shouldResetStreak(null)).toBe(false);
        });

        test('should return false if uptime_streak is undefined', () => {
            expect(shouldResetStreak(undefined)).toBe(false);
        });

        test('should return false if uptime_streak is today', () => {
            const today = new Date();
            expect(shouldResetStreak(today)).toBe(false);
        });

        test('should return false if uptime_streak is yesterday (1 day ago)', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(shouldResetStreak(yesterday)).toBe(false);
        });

        test('should return true if uptime_streak is 2 days ago', () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            expect(shouldResetStreak(twoDaysAgo)).toBe(true);
        });

        test('should return true if uptime_streak is 3 days ago', () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            expect(shouldResetStreak(threeDaysAgo)).toBe(true);
        });

        test('should return true if uptime_streak is 10 days ago', () => {
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
            expect(shouldResetStreak(tenDaysAgo)).toBe(true);
        });

        test('should handle string date format', () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const dateString = twoDaysAgo.toISOString().split('T')[0];
            expect(shouldResetStreak(dateString)).toBe(true);
        });

        test('should handle ISO string date format', () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const isoString = twoDaysAgo.toISOString();
            expect(shouldResetStreak(isoString)).toBe(true);
        });

        test('edge case: should return false for date exactly 1.5 days ago', () => {
            const oneDayHalfAgo = new Date();
            oneDayHalfAgo.setDate(oneDayHalfAgo.getDate() - 1);
            oneDayHalfAgo.setHours(oneDayHalfAgo.getHours() - 12);
            // Note: This should still be false because the calculation uses floor,
            // so 1.5 days = floor(1.5) = 1 day
            expect(shouldResetStreak(oneDayHalfAgo)).toBe(false);
        });
    });

    describe('Rank Calculation', () => {
        describe('calculateRank', () => {
            test('should return "Beginner" for 0 total exp', () => {
                expect(calculateRank(0, 0, 0, 0)).toBe('Beginner');
            });

            test('should return "Beginner" for exp < 8000', () => {
                expect(calculateRank(2000, 1000, 1500, 3000)).toBe('Beginner'); // 7500 total
                expect(calculateRank(1999, 1999, 1999, 1999)).toBe('Beginner'); // 7996 total
            });

            test('should return "Primary school" for exp 8000-15999', () => {
                expect(calculateRank(8000, 0, 0, 0)).toBe('Primary school'); // 8000 total
                expect(calculateRank(2000, 2000, 2000, 2000)).toBe('Primary school'); // 8000 total
                expect(calculateRank(5000, 5000, 5000, 0)).toBe('Primary school'); // 15000 total
            });

            test('should return "Secondary school" for exp 16000-23999', () => {
                expect(calculateRank(16000, 0, 0, 0)).toBe('Secondary school'); // 16000 total
                expect(calculateRank(4000, 4000, 4000, 4000)).toBe('Secondary school'); // 16000 total
                expect(calculateRank(10000, 6000, 4000, 3000)).toBe('Secondary school'); // 23000 total
            });

            test('should return "University student" for exp 24000-31999', () => {
                expect(calculateRank(24000, 0, 0, 0)).toBe('University student'); // 24000 total
                expect(calculateRank(6000, 6000, 6000, 6000)).toBe('University student'); // 24000 total
                expect(calculateRank(10000, 10000, 10000, 1000)).toBe('University student'); // 31000 total
            });

            test('should return "Graduated" for exp 32000-39999', () => {
                expect(calculateRank(32000, 0, 0, 0)).toBe('Graduated'); // 32000 total
                expect(calculateRank(8000, 8000, 8000, 8000)).toBe('Graduated'); // 32000 total
                expect(calculateRank(15000, 12000, 10000, 2000)).toBe('Graduated'); // 39000 total
            });

            test('should return "Professor" for exp >= 40000', () => {
                expect(calculateRank(40000, 0, 0, 0)).toBe('Professor'); // 40000 total
                expect(calculateRank(10000, 10000, 10000, 10000)).toBe('Professor'); // 40000 total
                expect(calculateRank(50000, 25000, 15000, 10000)).toBe('Professor'); // 100000 total
                expect(calculateRank(100000, 100000, 100000, 100000)).toBe('Professor'); // 400000 total
            });

            test('should handle null/undefined values as 0', () => {
                expect(calculateRank(null, null, null, null)).toBe('Beginner');
                expect(calculateRank(undefined, undefined, undefined, undefined)).toBe('Beginner');
                expect(calculateRank(8000, null, undefined, 0)).toBe('Primary school'); // 8000 total
            });

            test('edge case: exactly at rank boundaries', () => {
                expect(calculateRank(7999, 0, 0, 0)).toBe('Beginner'); // Just below 8000
                expect(calculateRank(8000, 0, 0, 0)).toBe('Primary school'); // Exactly 8000
                expect(calculateRank(15999, 0, 0, 0)).toBe('Primary school'); // Just below 16000
                expect(calculateRank(16000, 0, 0, 0)).toBe('Secondary school'); // Exactly 16000
                expect(calculateRank(23999, 0, 0, 0)).toBe('Secondary school'); // Just below 24000
                expect(calculateRank(24000, 0, 0, 0)).toBe('University student'); // Exactly 24000
                expect(calculateRank(31999, 0, 0, 0)).toBe('University student'); // Just below 32000
                expect(calculateRank(32000, 0, 0, 0)).toBe('Graduated'); // Exactly 32000
                expect(calculateRank(39999, 0, 0, 0)).toBe('Graduated'); // Just below 40000
                expect(calculateRank(40000, 0, 0, 0)).toBe('Professor'); // Exactly 40000
            });

            test('should use correct divisor (8000)', () => {
                expect(RANK_EXP_DIVISOR).toBe(8000);
                expect(calculateRank(RANK_EXP_DIVISOR * 0, 0, 0, 0)).toBe(RANK_NAMES[0]);
                expect(calculateRank(RANK_EXP_DIVISOR * 1, 0, 0, 0)).toBe(RANK_NAMES[1]);
                expect(calculateRank(RANK_EXP_DIVISOR * 2, 0, 0, 0)).toBe(RANK_NAMES[2]);
                expect(calculateRank(RANK_EXP_DIVISOR * 3, 0, 0, 0)).toBe(RANK_NAMES[3]);
                expect(calculateRank(RANK_EXP_DIVISOR * 4, 0, 0, 0)).toBe(RANK_NAMES[4]);
                expect(calculateRank(RANK_EXP_DIVISOR * 5, 0, 0, 0)).toBe(RANK_NAMES[5]);
            });

            test('should have correct rank names', () => {
                expect(RANK_NAMES).toEqual([
                    'Beginner',
                    'Primary school',
                    'Secondary school',
                    'University student',
                    'Graduated',
                    'Professor'
                ]);
            });
        });

        describe('Real-world scenarios', () => {
            test('balanced learner scenario', () => {
                // Student with balanced learning across subjects
                expect(calculateRank(5000, 5000, 5000, 5000)).toBe('Secondary school'); // 20000 total
            });

            test('math specialist scenario', () => {
                // Student focusing on math
                expect(calculateRank(15000, 3000, 2000, 1000)).toBe('Secondary school'); // 21000 total
            });

            test('advanced student scenario', () => {
                // Advanced student who has graduated
                expect(calculateRank(10000, 9000, 8000, 7000)).toBe('Graduated'); // 34000 total
            });

            test('professor level scenario', () => {
                // Expert with extensive knowledge
                expect(calculateRank(12000, 11000, 10000, 9000)).toBe('Professor'); // 42000 total
            });
        });
    });
});
