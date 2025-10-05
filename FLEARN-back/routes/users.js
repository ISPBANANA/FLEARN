const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt, optionalJwt } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get user profile (protected route)
// Usage Example:
// GET /api/users/profile
// Headers: Authorization: Bearer <GOOGLE_ID_TOKEN>
router.get('/profile', checkJwt, async (req, res) => {
    try {
        const googleId = req.user.sub || req.user.id;
        
        const query = `
            SELECT * FROM "user" 
            WHERE google_id = $1
        `;
        
        const result = await pgPool.query(query, [googleId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup'
            });
        }
        
        const user = result.rows[0];
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
        
        const user = result.rows[0];
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
        const googleId = req.user.sub || req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        // Validate pagination parameters
        if (limit > 100) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Limit cannot exceed 100'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const currentUserId = userResult.rows[0].user_id;
        
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
        const googleId = req.user.sub || req.user.id;
        const searchTerm = req.query.q;
        
        // Validate that search term is provided
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 1) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Search query cannot be empty'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const currentUserId = userResult.rows[0].user_id;
        const searchPattern = `%${searchTerm.toLowerCase()}%`;
        
        // Check if search term is a valid UUID format
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
        
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
        
        const queryParams = isValidUUID ? [currentUserId, searchPattern, searchTerm] : [currentUserId, searchPattern];
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
        const googleId = req.user.sub || req.user.id;
        const email = req.body.email || req.user.email;
        const name = req.body.name || req.user.name;
        const profile_pic = req.body.profile_pic || req.user.picture;
        
        const {
            birthdate,
            edu_level
        } = req.body;
        
        // Check if user already exists
        const existingUserQuery = `
            SELECT user_id FROM "user" 
            WHERE google_id = $1
        `;
        const existingUser = await pgPool.query(existingUserQuery, [googleId]);
        
        if (existingUser.rows.length > 0) {
            // Update existing user
            const updateQuery = `
                UPDATE "user" 
                SET profile_pic = $1, name = $2, email = $3, birthdate = $4, edu_level = $5,
                    updated_at = NOW()
                WHERE google_id = $6
                RETURNING *
            `;
            
            const result = await pgPool.query(updateQuery, [
                profile_pic, name, email, birthdate, edu_level, googleId
            ]);
            
            res.json({
                message: 'User profile updated successfully',
                user: result.rows[0]
            });
        } else {
            // Create new user
            const userId = uuidv4();
            const insertQuery = `
                INSERT INTO "user" (
                    user_id, google_id, profile_pic, name, email, birthdate, edu_level,
                    rank, streak, completed_task, daily_exp, math_exp, phy_exp, bio_exp, chem_exp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Beginner', 0, 0, 0, 0, 0, 0, 0)
                RETURNING *
            `;
            
            const result = await pgPool.query(insertQuery, [
                userId, googleId, profile_pic, name, email, birthdate, edu_level
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
        const googleId = req.user.sub || req.user.id;
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
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
        const googleId = req.user.sub || req.user.id;
        const { subject } = req.body;
        
        if (!subject) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subject is required'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
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
router.patch('/experience', checkJwt, async (req, res) => {
    try {
        const googleId = req.user.sub || req.user.id;
        const { daily_exp, math_exp, phy_exp, bio_exp, chem_exp } = req.body;
        
        const updateQuery = `
            UPDATE "user" 
            SET daily_exp = COALESCE($1, daily_exp),
                math_exp = COALESCE($2, math_exp),
                phy_exp = COALESCE($3, phy_exp),
                bio_exp = COALESCE($4, bio_exp),
                chem_exp = COALESCE($5, chem_exp),
                updated_at = NOW()
            WHERE google_id = $6
            RETURNING *
        `;
        
        const result = await pgPool.query(updateQuery, [
            daily_exp, math_exp, phy_exp, bio_exp, chem_exp, googleId
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        res.json({
            message: 'Experience points updated successfully',
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

// Get user's preferred subjects (multiple)
// Usage Example:
// GET /api/users/preferred-subjects
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/preferred-subjects', checkJwt, async (req, res) => {
    try {
        const googleId = req.user.sub || req.user.id;
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id, name FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        const userName = userResult.rows[0].name;
        
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
        const googleId = req.user.sub || req.user.id;
        const { subject } = req.body;
        
        if (!subject || subject.trim() === '') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subject is required and cannot be empty'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id, name FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        const userName = userResult.rows[0].name;
        
        const insertQuery = `
            INSERT INTO prefered (user_id, subject)
            VALUES ($1, $2)
            RETURNING *
        `;
        
        const result = await pgPool.query(insertQuery, [userId, subject.trim().toLowerCase()]);
        
        res.status(201).json({
            message: 'Preferred subject added successfully',
            user_name: userName,
            preference: result.rows[0]
        });
        
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Duplicate preference',
                message: 'This subject is already in your preferred subjects list'
            });
        }
        
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
        const googleId = req.user.sub || req.user.id;
        const { preferenceId } = req.params;
        
        if (!preferenceId || isNaN(preferenceId)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Valid preference ID is required'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id, name FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        const userName = userResult.rows[0].name;
        
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
router.put('/preferred-subjects', checkJwt, async (req, res) => {
    try {
        const googleId = req.user.sub || req.user.id;
        const { subjects } = req.body;
        
        if (!Array.isArray(subjects)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subjects must be provided as an array'
            });
        }
        
        // Validate and clean subjects
        const cleanSubjects = subjects
            .map(s => s?.toString().trim().toLowerCase())
            .filter(s => s && s.length > 0);
        
        if (cleanSubjects.length !== subjects.length) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'All subjects must be non-empty strings'
            });
        }
        
        // Check for duplicates
        const uniqueSubjects = [...new Set(cleanSubjects)];
        if (uniqueSubjects.length !== cleanSubjects.length) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Duplicate subjects are not allowed'
            });
        }
        
        // First get user_id from google_id
        const userQuery = `SELECT user_id, name FROM "user" WHERE google_id = $1`;
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        const userName = userResult.rows[0].name;
        
        // Use transaction to ensure consistency
        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');
            
            // Remove all existing preferences
            await client.query('DELETE FROM prefered WHERE user_id = $1', [userId]);
            
            // Add new preferences
            const insertedPreferences = [];
            for (const subject of uniqueSubjects) {
                const result = await client.query(
                    'INSERT INTO prefered (user_id, subject) VALUES ($1, $2) RETURNING *',
                    [userId, subject]
                );
                insertedPreferences.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            
            res.json({
                message: 'Preferred subjects updated successfully',
                user_name: userName,
                preferred_subjects: insertedPreferences,
                total_count: insertedPreferences.length
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Error updating preferred subjects:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update preferred subjects'
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
        const googleId = req.user.sub || req.user.id;
        const { profile_pic, name } = req.body;
        
        // Validate that at least one field is provided
        if (!profile_pic && !name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'At least one field (profile_pic or name) is required'
            });
        }
        
        // Check if user exists
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
        
        // Build dynamic update query based on provided fields
        let updateFields = [];
        let values = [];
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
        
        // Always update the updated_at timestamp
        updateFields.push('updated_at = NOW()');
        
        // Add google_id for WHERE clause
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
router.get('/leaderboard', async (req, res) => {
    try {
        const query = `
            SELECT name, daily_exp 
            FROM "user" 
            WHERE name IS NOT NULL 
            ORDER BY daily_exp DESC 
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

module.exports = router;
