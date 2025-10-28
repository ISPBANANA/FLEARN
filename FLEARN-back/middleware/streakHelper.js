/**
 * Helper functions for managing streaks, ranks, and daily experience
 * - Resets streak to 0 if uptime_streak - todayDate >= 2 days
 * - Calculates and updates user rank based on total subject experience
 * - Resets daily_exp to 0 if not updated today (daily reset)
 * - Uses Thailand timezone (Asia/Bangkok, GMT+7) for all date calculations
 */

/**
 * Get current date in Thailand timezone (Asia/Bangkok)
 * @returns {Date} - Current date in Thailand timezone, set to start of day
 */
const getThailandDate = () => {
    // Get current time in Thailand (GMT+7)
    const now = new Date();
    const thailandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    thailandTime.setHours(0, 0, 0, 0);
    return thailandTime;
};

/**
 * Rank thresholds and names
 * Rank = total(subject_exp) // 8000
 */
const RANK_NAMES = [
    'Beginner',           // Level 0: 0-7999 exp
    'Primary school',     // Level 1: 8000-15999 exp
    'Secondary school',   // Level 2: 16000-23999 exp
    'University student', // Level 3: 24000-31999 exp
    'Graduated',          // Level 4: 32000-39999 exp
    'Professor'           // Level 5+: 40000+ exp
];

const RANK_EXP_DIVISOR = 8000;

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
    const rankLevel = Math.floor(totalExp / RANK_EXP_DIVISOR);
    
    // Cap at highest rank
    const cappedLevel = Math.min(rankLevel, RANK_NAMES.length - 1);
    
    return RANK_NAMES[cappedLevel];
};

/**
 * Check if a streak should be reset based on the last update date
 * Uses Thailand timezone for comparison
 * @param {Date|string} uptimeStreak - The last streak update date
 * @returns {boolean} - True if streak should be reset
 */
const shouldResetStreak = (uptimeStreak) => {
    if (!uptimeStreak) {
        return false; // No uptime_streak means streak is already 0 or never started
    }

    const today = getThailandDate();
    
    const lastUpdate = new Date(uptimeStreak);
    const lastUpdateThailand = new Date(lastUpdate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    lastUpdateThailand.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = today - lastUpdateThailand;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Reset if 2 or more days have passed
    return diffDays >= 2;
};

/**
 * Check if daily exp should be reset based on the last update timestamp
 * Uses Thailand timezone for comparison
 * @param {Date|string} updatedAt - The last updated_at timestamp
 * @returns {boolean} - True if daily exp should be reset (not updated today)
 */
const shouldResetDailyExp = (updatedAt) => {
    if (!updatedAt) {
        return false; // No updated_at means daily_exp is already 0 or never set
    }

    const today = getThailandDate();
    
    const lastUpdate = new Date(updatedAt);
    const lastUpdateThailand = new Date(lastUpdate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    lastUpdateThailand.setHours(0, 0, 0, 0);
    
    // Reset if it's a different day (1 or more days have passed)
    return today > lastUpdateThailand;
};

/**
 * Check if uptime_streak is today (Thailand timezone)
 * @param {Date|string} uptimeStreak - The last streak update date
 * @returns {boolean} - True if uptime_streak is today
 */
const isStreakToday = (uptimeStreak) => {
    if (!uptimeStreak) {
        return false;
    }

    const today = getThailandDate();
    
    const lastUpdate = new Date(uptimeStreak);
    const lastUpdateThailand = new Date(lastUpdate.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
    lastUpdateThailand.setHours(0, 0, 0, 0);
    
    return today.getTime() === lastUpdateThailand.getTime();
};

/**
 * Reset user streak if needed
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {string} userId - User ID
 * @param {Date|string} uptimeStreak - Current uptime_streak value
 * @returns {Promise<boolean>} - True if streak was reset
 */
const resetUserStreakIfNeeded = async (pgPool, userId, uptimeStreak) => {
    if (shouldResetStreak(uptimeStreak)) {
        const updateQuery = `
            UPDATE "user" 
            SET streak = 0, 
                uptime_streak = NULL,
                updated_at = NOW()
            WHERE user_id = $1
        `;
        
        await pgPool.query(updateQuery, [userId]);
        return true;
    }
    return false;
};

/**
 * Reset garden streak if needed
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {number} gardenId - Garden row_id
 * @param {Date|string} uptimeStreak - Current uptime_streak value
 * @returns {Promise<boolean>} - True if streak was reset
 */
const resetGardenStreakIfNeeded = async (pgPool, gardenId, uptimeStreak) => {
    if (shouldResetStreak(uptimeStreak)) {
        const updateQuery = `
            UPDATE garden 
            SET streak = 0, 
                uptime_streak = NULL,
                updated_at = NOW()
            WHERE row_id = $1
        `;
        
        await pgPool.query(updateQuery, [gardenId]);
        return true;
    }
    return false;
};

/**
 * Increment user streak if uptime_streak is not today
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Result object with updated status and user data
 */
const incrementUserStreakIfNeeded = async (pgPool, userId) => {
    // Get current user data
    const selectQuery = `SELECT * FROM "user" WHERE user_id = $1`;
    const result = await pgPool.query(selectQuery, [userId]);
    
    if (result.rows.length === 0) {
        return { updated: false, user: null, error: 'User not found' };
    }
    
    const user = result.rows[0];
    
    // Check if uptime_streak is today
    if (isStreakToday(user.uptime_streak)) {
        // Already updated today, no need to increment
        return { updated: false, user: user, message: 'Streak already updated today' };
    }
    
    // Uptime_streak is not today, increment streak and set uptime_streak to today
    const updateQuery = `
        UPDATE "user" 
        SET streak = streak + 1, 
            uptime_streak = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')::date,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
    `;
    
    const updateResult = await pgPool.query(updateQuery, [userId]);
    return { updated: true, user: updateResult.rows[0], message: 'Streak incremented successfully' };
};

/**
 * Increment garden streak if both users have today's uptime_streak and garden doesn't
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {number} gardenId - Garden row_id
 * @returns {Promise<object>} - Result object with updated status and garden data
 */
const incrementGardenStreakIfBothUsersActive = async (pgPool, gardenId) => {
    // Get garden and both users' data
    const query = `
        SELECT 
            g.*,
            u1.uptime_streak as user1_uptime_streak,
            u2.uptime_streak as user2_uptime_streak
        FROM garden g
        JOIN "user" u1 ON g.user1_id = u1.user_id
        JOIN "user" u2 ON g.user2_id = u2.user_id
        WHERE g.row_id = $1
    `;
    
    const result = await pgPool.query(query, [gardenId]);
    
    if (result.rows.length === 0) {
        return { updated: false, garden: null, error: 'Garden not found' };
    }
    
    const gardenData = result.rows[0];
    
    // Check if both users have today's uptime_streak
    const user1HasToday = isStreakToday(gardenData.user1_uptime_streak);
    const user2HasToday = isStreakToday(gardenData.user2_uptime_streak);
    
    if (!user1HasToday || !user2HasToday) {
        // One or both users don't have today's streak, don't update garden
        return { 
            updated: false, 
            garden: gardenData, 
            message: 'Both users must have today\'s streak to update garden streak' 
        };
    }
    
    // Check if garden already has today's uptime_streak
    if (isStreakToday(gardenData.uptime_streak)) {
        // Garden already updated today
        return { updated: false, garden: gardenData, message: 'Garden streak already updated today' };
    }
    
    // Both users have today's streak and garden doesn't, increment garden streak
    const updateQuery = `
        UPDATE garden 
        SET streak = streak + 1, 
            uptime_streak = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')::date,
            updated_at = NOW()
        WHERE row_id = $1
        RETURNING *
    `;
    
    const updateResult = await pgPool.query(updateQuery, [gardenId]);
    return { updated: true, garden: updateResult.rows[0], message: 'Garden streak incremented successfully' };
};

/**
 * Update user rank based on subject experience
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {string} userId - User ID
 * @param {object} user - User object with experience fields
 * @returns {Promise<boolean>} - True if rank was updated
 */
const updateUserRankIfNeeded = async (pgPool, userId, user) => {
    const currentRank = user.rank;
    const calculatedRank = calculateRank(
        user.math_exp,
        user.phy_exp,
        user.bio_exp,
        user.chem_exp
    );
    
    // Only update if rank has changed
    if (currentRank !== calculatedRank) {
        const updateQuery = `
            UPDATE "user" 
            SET rank = $1, 
                updated_at = NOW()
            WHERE user_id = $2
        `;
        
        await pgPool.query(updateQuery, [calculatedRank, userId]);
        return true;
    }
    
    return false;
};

/**
 * Reset daily exp if needed (if not updated today)
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {string} userId - User ID
 * @param {Date|string} updatedAt - Last updated_at timestamp
 * @returns {Promise<boolean>} - True if daily_exp was reset
 */
const resetDailyExpIfNeeded = async (pgPool, userId, updatedAt) => {
    if (shouldResetDailyExp(updatedAt)) {
        const updateQuery = `
            UPDATE "user" 
            SET daily_exp = 0,
                updated_at = NOW()
            WHERE user_id = $1
        `;
        
        await pgPool.query(updateQuery, [userId]);
        return true;
    }
    return false;
};

/**
 * Check and reset streak for a user, returning updated user data
 * Also updates rank based on experience
 * Also resets daily_exp if not updated today
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Updated user object or null if not found
 */
const checkAndResetUserStreak = async (pgPool, userId) => {
    // Get current user data
    const selectQuery = `SELECT * FROM "user" WHERE user_id = $1`;
    const result = await pgPool.query(selectQuery, [userId]);
    
    if (result.rows.length === 0) {
        return null;
    }
    
    const user = result.rows[0];
    
    // Check if streak reset is needed
    const streakWasReset = await resetUserStreakIfNeeded(pgPool, userId, user.uptime_streak);
    
    // Check if rank update is needed
    const rankWasUpdated = await updateUserRankIfNeeded(pgPool, userId, user);
    
    // Check if daily exp reset is needed
    const dailyExpWasReset = await resetDailyExpIfNeeded(pgPool, userId, user.updated_at);
    
    // If any was updated, fetch fresh data
    if (streakWasReset || rankWasUpdated || dailyExpWasReset) {
        const updatedResult = await pgPool.query(selectQuery, [userId]);
        return updatedResult.rows[0];
    }
    
    return user;
};

/**
 * Check and reset streak for a garden, returning updated garden data
 * @param {object} pgPool - PostgreSQL connection pool
 * @param {number} gardenId - Garden row_id
 * @returns {Promise<object|null>} - Updated garden object or null if not found
 */
const checkAndResetGardenStreak = async (pgPool, gardenId) => {
    // Get current garden data
    const selectQuery = `SELECT * FROM garden WHERE row_id = $1`;
    const result = await pgPool.query(selectQuery, [gardenId]);
    
    if (result.rows.length === 0) {
        return null;
    }
    
    const garden = result.rows[0];
    
    // Check if reset is needed
    const wasReset = await resetGardenStreakIfNeeded(pgPool, gardenId, garden.uptime_streak);
    
    if (wasReset) {
        // Fetch updated garden data
        const updatedResult = await pgPool.query(selectQuery, [gardenId]);
        return updatedResult.rows[0];
    }
    
    return garden;
};

module.exports = {
    getThailandDate,
    shouldResetStreak,
    shouldResetDailyExp,
    isStreakToday,
    resetUserStreakIfNeeded,
    resetGardenStreakIfNeeded,
    resetDailyExpIfNeeded,
    incrementUserStreakIfNeeded,
    incrementGardenStreakIfBothUsersActive,
    checkAndResetUserStreak,
    checkAndResetGardenStreak,
    calculateRank,
    updateUserRankIfNeeded,
    RANK_NAMES,
    RANK_EXP_DIVISOR
};
