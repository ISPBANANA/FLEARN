/**
 * Helper functions for managing streaks, ranks, and daily experience
 * - Resets streak to 0 if uptime_streak - todayDate >= 2 days
 * - Calculates and updates user rank based on total subject experience
 * - Resets daily_exp to 0 if not updated today (daily reset)
 */

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
 * @param {Date|string} uptimeStreak - The last streak update date
 * @returns {boolean} - True if streak should be reset
 */
const shouldResetStreak = (uptimeStreak) => {
    if (!uptimeStreak) {
        return false; // No uptime_streak means streak is already 0 or never started
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const lastUpdate = new Date(uptimeStreak);
    lastUpdate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = today - lastUpdate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Reset if 2 or more days have passed
    return diffDays >= 2;
};

/**
 * Check if daily exp should be reset based on the last update timestamp
 * @param {Date|string} updatedAt - The last updated_at timestamp
 * @returns {boolean} - True if daily exp should be reset (not updated today)
 */
const shouldResetDailyExp = (updatedAt) => {
    if (!updatedAt) {
        return false; // No updated_at means daily_exp is already 0 or never set
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const lastUpdate = new Date(updatedAt);
    lastUpdate.setHours(0, 0, 0, 0);
    
    // Reset if it's a different day (1 or more days have passed)
    return today > lastUpdate;
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
    shouldResetStreak,
    shouldResetDailyExp,
    resetUserStreakIfNeeded,
    resetGardenStreakIfNeeded,
    resetDailyExpIfNeeded,
    checkAndResetUserStreak,
    checkAndResetGardenStreak,
    calculateRank,
    updateUserRankIfNeeded,
    RANK_NAMES,
    RANK_EXP_DIVISOR
};
