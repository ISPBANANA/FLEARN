const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt, optionalJwt } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { checkAndResetUserStreak, calculateRank, incrementUserStreakIfNeeded, incrementGardenStreakIfBothUsersActive } = require('../middleware/streakHelper');

const router = express.Router();

// Get user profile (protected route)
// Usage Example:
// GET /api/users/profile
// Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>

// ---------- helpers -------------------------------------------------

function getGoogleId(req) {
    return req.user?.sub || req.user?.id || null;
}

async function getUserFromReq(req) {
    const googleId = getGoogleId(req);
    if (!googleId) return null;

    const query = 'SELECT * FROM "user" WHERE google_id = $1';
    const { rows } = await pgPool.query(query, [googleId]);
    return rows[0] || null;
}

/**
 * For routes that REQUIRE an authenticated user row.
 * Sends 404 if not found and returns null.
 * (checkJwt should already ensure req.user exists.)
 */
async function ensureUserFromReq(req, res, notFoundMessage = 'Please complete your profile setup first') {
    const user = await getUserFromReq(req);

    if (!user) {
        res.status(404).json({
            error: 'User not found',
            message: notFoundMessage
        });
        return null;
    }

    return user;
}

const parseLimit = (value, fallback) => {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
};

// ---------- routes --------------------------------------------------

// Get user profile (protected route)
// GET /api/users/profile
router.get('/profile', checkJwt, async (req, res) => {
    try {
        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup');
        if (!userRow) return;

        const userId = userRow.user_id;

        // Reset streak/daily exp if needed BEFORE any updates
        const user = await checkAndResetUserStreak(pgPool, userId);

        // Count completed tasks from backlog
        const countQuery = `
            SELECT COUNT(*) as completed_count
            FROM backlog
            WHERE user_id = $1
        `;
        const countResult = await pgPool.query(countQuery, [userId]);
        const completedCount = parseInt(countResult.rows[0].completed_count, 10);

        // Update completed_task (no updated_at change)
        const updateQuery = `
            UPDATE "user"
            SET completed_task = $1
            WHERE user_id = $2
        `;
        await pgPool.query(updateQuery, [completedCount, userId]);

        res.json({
            message: 'User profile retrieved successfully',
            user: user
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch user profile'
        });
    }
});

router.get('/profilebyid', checkJwt, async (req, res) => {
    try {
        const userId = req.query.id;

        // Validate that userId is provided
        if (!userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'User ID parameter is required'
            });
        }

        const query = `
            SELECT * FROM "user" 
            WHERE user_id = $1
        `;
        
        const result = await pgPool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User with the specified ID does not exist'
            });
        }
        
        // Check and reset streak/daily exp if needed FIRST (before updating anything)
        // This must be done before updating updated_at timestamp
        const user = await checkAndResetUserStreak(pgPool, userId);
        
        // Count completed tasks from backlog
        const countQuery = `
            SELECT COUNT(*) as completed_count
            FROM backlog
            WHERE user_id = $1
        `;
        const countResult = await pgPool.query(countQuery, [userId]);
        const completedCount = parseInt(countResult.rows[0].completed_count, 10);
        
        // Update the completed_task column (without updating updated_at to preserve exp tracking)
        const updateQuery = `
            UPDATE "user"
            SET completed_task = $1
            WHERE user_id = $2
        `;
        await pgPool.query(updateQuery, [completedCount, userId]);
        
        res.json({
            message: 'User profile retrieved successfully',
            user: user
        });
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch user profile'
        });
    }
});

// Get all users with pagination
// Usage Example:
// GET /api/users/all?limit=50&offset=0
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/all', checkJwt, async (req, res) => {
    try {
        const currentUser = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!currentUser) return;

        const limit = parseLimit(req.query.limit, 50);
        const offset = parseLimit(req.query.offset, 0);

        if (limit > 100) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Limit cannot exceed 100'
            });
        }

        const currentUserId = currentUser.user_id;

        const query = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.profile_pic,
                u.created_at,
                CASE 
                    WHEN f.status IS NOT NULL THEN f.status
                    ELSE 'none'
                END as friendship_status,
                f.row_id as friendship_id
            FROM "user" u
            LEFT JOIN friend f ON (
                (f.user1_id = $1 AND f.user2_id = u.user_id) OR 
                (f.user2_id = $1 AND f.user1_id = u.user_id)
            )
            WHERE u.user_id != $1
            ORDER BY u.name, u.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await pgPool.query(query, [currentUserId, limit, offset]);

        res.json({
            message: 'All users retrieved successfully',
            users: result.rows,
            count: result.rows.length,
            limit: limit,
            offset: offset
        });

    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch users'
        });
    }
});

// Search users by name or email
// Usage Example:
// GET /api/users/search?q=john
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/search', checkJwt, async (req, res) => {
    try {
        const searchTerm = req.query.q;

        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 1) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Search query cannot be empty'
            });
        }

        const currentUser = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!currentUser) return;

        const currentUserId = currentUser.user_id;
        const searchPattern = `%${searchTerm.toLowerCase()}%`;

        const isValidUUID =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);

        const query = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.profile_pic,
                u.created_at,
                CASE 
                    WHEN f.status IS NOT NULL THEN f.status
                    ELSE 'none'
                END as friendship_status,
                f.row_id as friendship_id
            FROM "user" u
            LEFT JOIN friend f ON (
                (f.user1_id = $1 AND f.user2_id = u.user_id) OR 
                (f.user2_id = $1 AND f.user1_id = u.user_id)
            )
            WHERE u.user_id != $1
            AND (
                LOWER(u.name) LIKE $2 OR 
                LOWER(u.email) LIKE $2 
                ${isValidUUID ? 'OR u.user_id = $3' : ''}
            )
            ORDER BY 
                CASE 
                    ${isValidUUID ? 'WHEN u.user_id = $3 THEN 0' : ''}
                    WHEN LOWER(u.name) LIKE $2 THEN 1
                    WHEN LOWER(u.email) LIKE $2 THEN 2
                    ELSE 3
                END,
                u.name
            LIMIT 20
        `;

        const queryParams = isValidUUID
            ? [currentUserId, searchPattern, searchTerm]
            : [currentUserId, searchPattern];

        const result = await pgPool.query(query, queryParams);

        res.json({
            message: 'User search completed successfully',
            users: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to search users'
        });
    }
});

// Create or update user profile
// Usage Example:
// POST /api/users/profile
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "profile_pic": "https://example.com/pic.jpg",
//   "name": "John Doe",
//   "birthdate": "1990-01-01",
//   "edu_level": "Bachelor"
// }
router.post('/profile', checkJwt, async (req, res) => {
    try {
        const googleId = getGoogleId(req);
        const email = req.body.email || req.user.email;
        const name = req.body.name || req.user.name;
        const profile_pic = req.body.profile_pic || req.user.picture;

        const { birthdate, edu_level } = req.body;

        const existingUserQuery = `
            SELECT user_id FROM "user" 
            WHERE google_id = $1
        `;
        const existingUser = await pgPool.query(existingUserQuery, [googleId]);

        if (existingUser.rows.length > 0) {
            const updateQuery = `
                UPDATE "user" 
                SET profile_pic = $1, name = $2, email = $3, birthdate = $4, edu_level = $5,
                    updated_at = NOW()
                WHERE google_id = $6
                RETURNING *
            `;

            const result = await pgPool.query(updateQuery, [
                profile_pic,
                name,
                email,
                birthdate,
                edu_level,
                googleId
            ]);

            res.json({
                message: 'User profile updated successfully',
                user: result.rows[0]
            });
        } else {
            const userId = uuidv4();
            const insertQuery = `
                INSERT INTO "user" (
                    user_id, google_id, profile_pic, name, email, birthdate, edu_level,
                    rank, streak, completed_task, daily_exp, math_exp, phy_exp, bio_exp, chem_exp, role
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    'Beginner', 0, 0, 0, 0, 0, 0, 0, 'user'
                )
                RETURNING *
            `;

            const result = await pgPool.query(insertQuery, [
                userId,
                googleId,
                profile_pic,
                name,
                email,
                birthdate,
                edu_level
            ]);

            res.status(201).json({
                message: 'User profile created successfully',
                user: result.rows[0]
            });
        }

    } catch (error) {
        console.error('Error creating/updating user profile:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create/update user profile'
        });
    }
});

// Get user preferences
// Usage Example:
// GET /api/users/preferences
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/preferences', checkJwt, async (req, res) => {
    try {
        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;

        const query = `
            SELECT * FROM prefered 
            WHERE user_id = $1
        `;
        const result = await pgPool.query(query, [userId]);

        res.json({
            message: 'User preferences retrieved successfully',
            preferences: result.rows
        });

    } catch (error) {
        console.error('Error fetching user preferences:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch user preferences'
        });
    }
});
// Add user preference
// Usage Example:
// POST /api/users/preferences
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "subject": "mathematics"
// }

router.post('/preferences', checkJwt, async (req, res) => {
    try {
        const { subject } = req.body;

        if (!subject) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subject is required'
            });
        }

        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;

        const insertQuery = `
            INSERT INTO prefered (user_id, subject)
            VALUES ($1, $2)
            RETURNING *
        `;

        const result = await pgPool.query(insertQuery, [userId, subject]);

        res.status(201).json({
            message: 'Preference added successfully',
            preference: result.rows[0]
        });

    } catch (error) {
        console.error('Error adding user preference:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to add user preference'
        });
    }
});

// Update user experience points
// Usage Example:
// PATCH /api/users/experience
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "daily_exp": 50,
//   "math_exp": 100,
//   "phy_exp": 75,
//   "bio_exp": 60,
//   "chem_exp": 80
// }
// Note: Values sent will be SET as absolute values (not incremented)
// The frontend should calculate: current_value + increment_value before sending
router.patch('/experience', checkJwt, async (req, res) => {
    try {
        const googleId = req.user.sub || req.user.id;
        const { daily_exp, math_exp, phy_exp, bio_exp, chem_exp } = req.body;
        
        // First, get current user data
        const getUserQuery = `SELECT * FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(getUserQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const currentUser = userResult.rows[0];
        
        // IMPORTANT: Check and reset daily exp if not updated today (before updating)
        // This ensures daily_exp is 0 if it's a new day
        const resetUser = await checkAndResetUserStreak(pgPool, currentUser.user_id);
        
        // Use the reset user data if available, otherwise use current user
        const userToUpdate = resetUser || currentUser;
        
        // Calculate new experience values
        const newMathExp = math_exp !== undefined ? math_exp : userToUpdate.math_exp;
        const newPhyExp = phy_exp !== undefined ? phy_exp : userToUpdate.phy_exp;
        const newBioExp = bio_exp !== undefined ? bio_exp : userToUpdate.bio_exp;
        const newChemExp = chem_exp !== undefined ? chem_exp : userToUpdate.chem_exp;
        
        // Calculate new rank based on total subject experience
        const newRank = calculateRank(newMathExp, newPhyExp, newBioExp, newChemExp);
        
        const updateQuery = `
            UPDATE "user" 
            SET daily_exp = COALESCE($1, daily_exp),
                math_exp = COALESCE($2, math_exp),
                phy_exp = COALESCE($3, phy_exp),
                bio_exp = COALESCE($4, bio_exp),
                chem_exp = COALESCE($5, chem_exp),
                rank = $6,
                updated_at = NOW()
            WHERE google_id = $7
            RETURNING *
        `;
        
        const result = await pgPool.query(updateQuery, [
            daily_exp, math_exp, phy_exp, bio_exp, chem_exp, newRank, googleId
        ]);
        
        res.json({
            message: 'Experience points and rank updated successfully',
            user: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating experience points:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update experience points'
        });
    }
});

// Update user streak after completing a level
// Usage Example:
// PATCH /api/users/streak
// Headers: Authorization: Bearer <JWT_TOKEN>
router.patch('/streak', checkJwt, async (req, res) => {
    try {
        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;

        const result = await incrementUserStreakIfNeeded(pgPool, userId);

        if (result.error) {
            return res.status(404).json({
                error: 'User not found',
                message: result.error
            });
        }

        const gardensQuery = `
            SELECT row_id FROM garden 
            WHERE (user1_id = $1 OR user2_id = $1) AND status = 'active'
        `;
        const gardensResult = await pgPool.query(gardensQuery, [userId]);

        const gardenUpdates = [];
        for (const garden of gardensResult.rows) {
            const gardenResult = await incrementGardenStreakIfBothUsersActive(pgPool, garden.row_id);
            if (gardenResult.updated) {
                gardenUpdates.push({
                    garden_id: garden.row_id,
                    updated: true,
                    message: gardenResult.message
                });
            }
        }

        res.json({
            message: result.message,
            updated: result.updated,
            user: result.user,
            gardens_updated: gardenUpdates.length,
            garden_updates: gardenUpdates
        });

    } catch (error) {
        console.error('Error updating user streak:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update user streak'
        });
    }
});

// Get user's preferred subjects (multiple)
// Usage Example:
// GET /api/users/preferred-subjects
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/preferred-subjects', checkJwt, async (req, res) => {
    try {
        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;
        const userName = userRow.name;

        const query = `
            SELECT row_id, subject, created_at FROM prefered 
            WHERE user_id = $1
            ORDER BY created_at ASC
        `;
        const result = await pgPool.query(query, [userId]);

        res.json({
            message: 'Preferred subjects retrieved successfully',
            user_name: userName,
            preferred_subjects: result.rows,
            total_count: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching preferred subjects:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch preferred subjects'
        });
    }
});

// Add a preferred subject
// Usage Example:
// POST /api/users/preferred-subjects
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "subject": "physics"
// }
router.post('/preferred-subjects', checkJwt, async (req, res) => {
    try {
        const { subject } = req.body;

        if (!subject || subject.trim() === '') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subject is required and cannot be empty'
            });
        }

        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;
        const userName = userRow.name;

        const insertQuery = `
            INSERT INTO prefered (user_id, subject)
            VALUES ($1, $2)
            RETURNING *
        `;

        try {
            const result = await pgPool.query(insertQuery, [
                userId,
                subject.trim().toLowerCase()
            ]);

            res.status(201).json({
                message: 'Preferred subject added successfully',
                user_name: userName,
                preference: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    error: 'Duplicate preference',
                    message: 'This subject is already in your preferred subjects list'
                });
            }
            throw error;
        }

    } catch (error) {
        console.error('Error adding preferred subject:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to add preferred subject'
        });
    }
});

// Remove a preferred subject
// Usage Example:
// DELETE /api/users/preferred-subjects/123
// Headers: Authorization: Bearer <JWT_TOKEN>
router.delete('/preferred-subjects/:preferenceId', checkJwt, async (req, res) => {
    try {
        const { preferenceId } = req.params;

        if (!preferenceId || isNaN(preferenceId)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Valid preference ID is required'
            });
        }

        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;
        const userName = userRow.name;

        const deleteQuery = `
            DELETE FROM prefered 
            WHERE row_id = $1 AND user_id = $2
            RETURNING *
        `;

        const result = await pgPool.query(deleteQuery, [preferenceId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Preference not found',
                message: 'The specified preference was not found or does not belong to you'
            });
        }

        res.json({
            message: 'Preferred subject removed successfully',
            user_name: userName,
            removed_preference: result.rows[0]
        });

    } catch (error) {
        console.error('Error removing preferred subject:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to remove preferred subject'
        });
    }
});


// Update/replace all preferred subjects at once
// Usage Example:
// PUT /api/users/preferred-subjects
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "subjects": ["mathematics", "physics", "chemistry"]
// }
router.delete('/preferred-subjects/:preferenceId', checkJwt, async (req, res) => {
    try {
        const { preferenceId } = req.params;

        if (!preferenceId || isNaN(preferenceId)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Valid preference ID is required'
            });
        }

        const userRow = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!userRow) return;

        const userId = userRow.user_id;
        const userName = userRow.name;

        const deleteQuery = `
            DELETE FROM prefered 
            WHERE row_id = $1 AND user_id = $2
            RETURNING *
        `;

        const result = await pgPool.query(deleteQuery, [preferenceId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Preference not found',
                message: 'The specified preference was not found or does not belong to you'
            });
        }

        res.json({
            message: 'Preferred subject removed successfully',
            user_name: userName,
            removed_preference: result.rows[0]
        });

    } catch (error) {
        console.error('Error removing preferred subject:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to remove preferred subject'
        });
    }
});


// Update only profile picture and name (protected route)
// Usage Example:
// PATCH /api/users/profile-basic
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "profile_pic": "data:image/jpeg;base64,/9j/4AAQ...",
//   "name": "John Doe"
// }
router.patch('/profile-basic', checkJwt, async (req, res) => {
    try {
        const googleId = getGoogleId(req);
        const { profile_pic, name } = req.body;

        if (!profile_pic && !name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'At least one field (profile_pic or name) is required'
            });
        }

        const existingUserQuery = `
            SELECT user_id FROM "user" 
            WHERE google_id = $1
        `;
        const existingUser = await pgPool.query(existingUserQuery, [googleId]);

        if (existingUser.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (profile_pic !== undefined) {
            updateFields.push(`profile_pic = $${paramCount}`);
            values.push(profile_pic);
            paramCount++;
        }

        if (name !== undefined && name.trim() !== '') {
            updateFields.push(`name = $${paramCount}`);
            values.push(name.trim());
            paramCount++;
        }

        updateFields.push('updated_at = NOW()');

        values.push(googleId);

        const updateQuery = `
            UPDATE "user" 
            SET ${updateFields.join(', ')}
            WHERE google_id = $${paramCount}
            RETURNING *
        `;

        const result = await pgPool.query(updateQuery, values);

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating profile basic info:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update profile'
        });
    }
});


// Get username by user ID (public endpoint)
// Usage Example:
// GET /api/users/username/12345678-1234-1234-1234-123456789012
router.get('/username/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'User ID is required'
            });
        }
        
        const query = `
            SELECT name FROM "user" 
            WHERE user_id = $1
        `;
        
        const result = await pgPool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with the provided ID'
            });
        }
        
        const username = result.rows[0].name;
        
        res.json({
            message: 'Username retrieved successfully',
            userId: userId,
            username: username
        });
        
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch username'
        });
    }
});

// Get top 50 users with highest daily_exp (public route)
// Usage Example:
// GET /api/users/leaderboard
// Note: Automatically shows 0 for daily_exp if user hasn't completed a level today
// Uses uptime_streak instead of updated_at to properly detect daily activity
router.get('/leaderboard', async (req, res) => {
    try {
        const query = `
            SELECT 
                name,
                CASE 
                    WHEN uptime_streak = CURRENT_DATE THEN daily_exp
                    ELSE 0
                END as daily_exp
            FROM "user" 
            WHERE name IS NOT NULL 
            ORDER BY 
                CASE 
                    WHEN uptime_streak = CURRENT_DATE THEN daily_exp
                    ELSE 0
                END DESC
            LIMIT 50
        `;
        
        const result = await pgPool.query(query);
        
        res.json({
            message: 'Top users retrieved successfully',
            users: result.rows,
            count: result.rows.length
        });
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch leaderboard'
        });
    }
});

// Get all users for admin dashboard
// Usage Example:
// GET /api/users/admin/all?limit=50&offset=0
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/admin/all', checkJwt, async (req, res) => {
    try {
        const currentUser = await ensureUserFromReq(req, res, 'Please complete your profile setup first');
        if (!currentUser) return;

        const limit = parseLimit(req.query.limit, 50);
        const offset = parseLimit(req.query.offset, 0);

        if (limit > 100) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Limit cannot exceed 100'
            });
        }

        if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied. Admin or teacher role required.'
            });
        }

        const query = `
            SELECT 
                u.user_id,
                u.name,
                u.email,
                u.role,
                u.created_at,
                u.profile_pic,
                u.birthdate,
                u.edu_level,
                u.rank,
                u.streak,
                u.daily_exp,
                u.math_exp,
                u.phy_exp,
                u.bio_exp,
                u.chem_exp,
                u.completed_task
            FROM "user" u
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await pgPool.query(query, [limit, offset]);

        const countQuery = `SELECT COUNT(*) as total FROM "user"`;
        const countResult = await pgPool.query(countQuery);
        const totalUsers = parseInt(countResult.rows[0].total, 10);

        res.json({
            message: 'All users retrieved successfully',
            users: result.rows,
            count: result.rows.length,
            total: totalUsers,
            limit: limit,
            offset: offset
        });

    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch users'
        });
    }
});


// Usage Example:
// PATCH /api/users/admin/update/:userId
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: { name?: string, role?: string, profile_pic?: string }
// Admin update user account
// PATCH /api/users/admin/update/:userId
router.patch('/admin/update/:userId', checkJwt, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, role, profile_pic } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'User ID is required'
            });
        }

        const requestingUser = await ensureUserFromReq(req, res, 'Requesting user not found');
        if (!requestingUser) return;

        if (requestingUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins can update user accounts'
            });
        }

        const userToUpdateQuery = `SELECT * FROM "user" WHERE user_id = $1`;
        const userToUpdateResult = await pgPool.query(userToUpdateQuery, [userId]);

        if (userToUpdateResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User to update does not exist'
            });
        }

        const currentUser = userToUpdateResult.rows[0];

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex}`);
            values.push(name);
            paramIndex++;
        }

        if (role !== undefined) {
            const validRoles = ['admin', 'teacher', 'user'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Invalid role. Must be one of: admin, teacher, user'
                });
            }
            updates.push(`role = $${paramIndex}`);
            values.push(role);
            paramIndex++;
        }

        if (profile_pic !== undefined) {
            updates.push(`profile_pic = $${paramIndex}`);
            values.push(profile_pic);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.json({
                message: 'No changes made',
                user: currentUser
            });
        }

        values.push(userId);

        const updateQuery = `
            UPDATE "user" 
            SET ${updates.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING *
        `;

        const updateResult = await pgPool.query(updateQuery, values);

        res.json({
            message: 'User updated successfully',
            user: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error updating user account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update user account'
        });
    }
});

// Admin delete user
// DELETE /api/users/admin/delete/:userId
router.delete('/admin/delete/:userId', checkJwt, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'User ID is required'
            });
        }

        const requestingUser = await ensureUserFromReq(req, res, 'Requesting user not found');
        if (!requestingUser) return;

        if (requestingUser.role !== 'admin') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only admins can delete user accounts'
            });
        }

        const userToDeleteQuery = `SELECT user_id, name, email FROM "user" WHERE user_id = $1`;
        const userToDeleteResult = await pgPool.query(userToDeleteQuery, [userId]);

        if (userToDeleteResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User to delete does not exist'
            });
        }

        const userToDelete = userToDeleteResult.rows[0];

        if (requestingUser.user_id === userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'You cannot delete your own account'
            });
        }

        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');

            const deleteQuery = `DELETE FROM "user" WHERE user_id = $1`;
            const deleteResult = await client.query(deleteQuery, [userId]);

            if (deleteResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User could not be deleted'
                });
            }

            await client.query('COMMIT');

            res.json({
                message: 'User account deleted successfully',
                deletedUser: {
                    user_id: userToDelete.user_id,
                    name: userToDelete.name,
                    email: userToDelete.email
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete user account'
        });
    }
});

module.exports = router;