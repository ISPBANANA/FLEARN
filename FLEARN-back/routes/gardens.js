const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt } = require('../middleware/auth');
const { checkAndResetGardenStreak, incrementGardenStreakIfBothUsersActive } = require('../middleware/streakHelper');

const router = express.Router();

// Get user's gardens
// Usage Example:
// GET /api/gardens
// Headers: Authorization: Bearer <JWT_TOKEN>

async function getUserIdFromReq(req) {
    const googleId = req.user?.sub || req.user?.id;

    if (!googleId) {
        // caller will handle 401
        return null;
    }

    const userQuery = `SELECT user_id FROM "user" WHERE google_id = $1`;
    const { rows } = await pgPool.query(userQuery, [googleId]);
    return rows[0]?.user_id || null;
}

async function ensureUserFromReq(req, res) {
    if (!req.user) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid authentication data'
        });
        return null;
    }

    const userId = await getUserIdFromReq(req);

    if (!userId) {
        res.status(404).json({
            error: 'User not found',
            message: 'Please complete your profile setup first'
        });
        return null;
    }

    return userId;
}

const GARDEN_SELECT = `
    SELECT 
        g.row_id,
        g.status,
        g.streak,
        g.uptime_streak,
        g.created_at,
        g.updated_at,
        g.user1_id,
        g.user2_id,
        CASE 
            WHEN g.user1_id = $1 THEN u2.name
            ELSE u1.name
        END as partner_name,
        CASE 
            WHEN g.user1_id = $1 THEN u2.email
            ELSE u1.email
        END as partner_email,
        CASE 
            WHEN g.user1_id = $1 THEN u2.profile_pic
            ELSE u1.profile_pic
        END as partner_profile_pic,
        CASE 
            WHEN g.user1_id = $1 THEN g.user2_id
            ELSE g.user1_id
        END as partner_user_id
    FROM garden g
    JOIN "user" u1 ON g.user1_id = u1.user_id
    JOIN "user" u2 ON g.user2_id = u2.user_id
`;

// Get user's gardens
// GET /api/gardens
router.get('/', checkJwt, async (req, res) => {
    try {
        const userId = await ensureUserFromReq(req, res);
        if (!userId) return;

        const query = `
            ${GARDEN_SELECT}
            WHERE (g.user1_id = $1 OR g.user2_id = $1)
            ORDER BY g.updated_at DESC
        `;

        const result = await pgPool.query(query, [userId]);

        // Check/reset streak, then maybe increment if both users active
        const updatedGardens = await Promise.all(
            result.rows.map(async (garden) => {
                const resetGarden = await checkAndResetGardenStreak(pgPool, garden.row_id);
                const incrementResult = await incrementGardenStreakIfBothUsersActive(pgPool, garden.row_id);
                const finalGarden = incrementResult.garden || resetGarden;

                return {
                    ...finalGarden,
                    partner_name: garden.partner_name,
                    partner_email: garden.partner_email,
                    partner_profile_pic: garden.partner_profile_pic,
                    partner_user_id: garden.partner_user_id
                };
            })
        );

        res.json({
            message: 'Gardens retrieved successfully',
            gardens: updatedGardens
        });

    } catch (error) {
        console.error('Error fetching gardens:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch gardens'
        });
    }
});

// Get gardens for a specific user by user_id
// Usage Example:
// GET /api/gardens/user/12345678-1234-1234-1234-123456789012
// Headers: Authorization: Bearer <JWT_TOKEN>
router.get('/user/:userId', checkJwt, async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'User ID is required'
            });
        }

        // Verify that the user exists
        const userExistsQuery = `SELECT user_id FROM "user" WHERE user_id = $1`;
        const userExistsResult = await pgPool.query(userExistsQuery, [userId]);

        if (userExistsResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User with this ID does not exist'
            });
        }

        const query = `
            ${GARDEN_SELECT}
            WHERE (g.user1_id = $1 OR g.user2_id = $1)
              AND g.status = 'active'
            ORDER BY g.updated_at DESC
        `;

        const result = await pgPool.query(query, [userId]);

        const updatedGardens = await Promise.all(
            result.rows.map(async (garden) => {
                const resetGarden = await checkAndResetGardenStreak(pgPool, garden.row_id);
                const incrementResult = await incrementGardenStreakIfBothUsersActive(pgPool, garden.row_id);
                const finalGarden = incrementResult.garden || resetGarden;

                return {
                    ...finalGarden,
                    partner_name: garden.partner_name,
                    partner_email: garden.partner_email,
                    partner_profile_pic: garden.partner_profile_pic,
                    partner_user_id: garden.partner_user_id
                };
            })
        );

        res.json({
            message: 'Gardens retrieved successfully',
            gardens: updatedGardens
        });

    } catch (error) {
        console.error('Error fetching gardens for user:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch gardens'
        });
    }
});

// Create a new garden with a friend
// Usage Example:
// POST /api/gardens
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "partner_email": "friend@example.com"
// }

router.post('/', checkJwt, async (req, res) => {
    try {
        const { partner_email } = req.body;

        if (!partner_email) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Partner email is required'
            });
        }

        const userId = await ensureUserFromReq(req, res);
        if (!userId) return;

        // Get partner user_id
        const partnerQuery = `SELECT user_id FROM "user" WHERE email = $1`;
        const partnerResult = await pgPool.query(partnerQuery, [partner_email]);

        if (partnerResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Partner not found',
                message: 'User with this email does not exist'
            });
        }

        const partnerUserId = partnerResult.rows[0].user_id;

        // Check if they're trying to create a garden with themselves
        if (userId === partnerUserId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'You cannot create a garden with yourself'
            });
        }

        // Check if they are friends first
        const friendshipQuery = `
            SELECT * FROM friend
            WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
              AND status = 'accepted'
        `;
        const friendshipResult = await pgPool.query(friendshipQuery, [userId, partnerUserId]);

        if (friendshipResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Not friends',
                message: 'You must be friends with this user to create a garden together'
            });
        }

        // Check if garden already exists
        const existingGardenQuery = `
            SELECT * FROM garden
            WHERE (user1_id = $1 AND user2_id = $2)
               OR (user1_id = $2 AND user2_id = $1)
        `;
        const existingGarden = await pgPool.query(existingGardenQuery, [userId, partnerUserId]);

        if (existingGarden.rows.length > 0) {
            return res.status(409).json({
                error: 'Garden already exists',
                message: 'You already have a garden with this user'
            });
        }

        // Create garden invitation
        // user1_id = receiver (partnerUserId), user2_id = sender (userId)
        const insertQuery = `
            INSERT INTO garden (user1_id, user2_id, status, streak, uptime_streak)
            VALUES ($1, $2, 'pending', 0, NULL)
            RETURNING *
        `;

        const result = await pgPool.query(insertQuery, [partnerUserId, userId]);

        res.status(201).json({
            message: 'Garden invitation sent successfully',
            garden: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating garden:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create garden'
        });
    }
});

// Update garden streak
// Usage Example:
// PATCH /api/gardens/123/streak
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "increment": true
// }
router.patch('/:gardenId/streak', checkJwt, async (req, res) => {
    try {
        const userId = await ensureUserFromReq(req, res);
        if (!userId) return;

        const { gardenId } = req.params;
        const { increment } = req.body; // true to increment, false to reset

        let updateQuery;
        let queryParams;

        if (increment) {
            // Increment streak and update uptime_streak (Thailand timezone)
            updateQuery = `
                UPDATE garden
                SET streak = streak + 1,
                    uptime_streak = (CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')::date,
                    updated_at = NOW()
                WHERE row_id = $1 AND (user1_id = $2 OR user2_id = $2)
                RETURNING *
            `;
            queryParams = [gardenId, userId];
        } else {
            // Reset streak
            updateQuery = `
                UPDATE garden 
                SET streak = 0,
                    updated_at = NOW()
                WHERE row_id = $1 AND (user1_id = $2 OR user2_id = $2)
                RETURNING *
            `;
            queryParams = [gardenId, userId];
        }

        const result = await pgPool.query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Garden not found',
                message: 'Garden not found or you are not authorized to update it'
            });
        }

        res.json({
            message: `Garden streak ${increment ? 'incremented' : 'reset'} successfully`,
            garden: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating garden streak:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update garden streak'
        });
    }
});

// Accept/reject garden invitation
// Usage Example:
// PATCH /api/gardens/456/invitation
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "status": "accepted"
// }
router.patch('/:gardenId/invitation', checkJwt, async (req, res) => {
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
        const { gardenId } = req.params;
        const { status } = req.body;
        
        if (!status || !['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Status must be either "accepted" or "rejected"'
            });
        }
        
        // Handle different status actions
        let result;
        let message;
        
        if (status === 'rejected') {
            // Delete the row completely when rejected
            const deleteQuery = `
                DELETE FROM garden 
                WHERE row_id = $1 AND user1_id = $2 AND status = 'pending'
                RETURNING *
            `;
            
            result = await pgPool.query(deleteQuery, [gardenId, userId]);
            message = 'Garden invitation rejected and removed successfully';
        } else {
            // Update status to active
            const updateQuery = `
                UPDATE garden 
                SET status = 'active', updated_at = NOW()
                WHERE row_id = $1 AND user1_id = $2 AND status = 'pending'
                RETURNING *
            `;
            
            result = await pgPool.query(updateQuery, [gardenId, userId]);
            message = 'Garden invitation accepted successfully';
        }
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Garden invitation not found',
                message: 'Garden invitation not found or you are not authorized to update it'
            });
        }
        
        res.json({
            message: message,
            garden: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating garden invitation status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update garden invitation status'
        });
    }
});

// Update garden status
// Usage Example:
// PATCH /api/gardens/123/status
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "status": "active"
// }
router.patch('/:gardenId/status', checkJwt, async (req, res) => {
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
        const { gardenId } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive', 'completed'].includes(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Status must be "active", "inactive", or "completed"'
            });
        }
        
        // Update garden status
        const updateQuery = `
            UPDATE garden 
            SET status = $1, updated_at = NOW()
            WHERE row_id = $2 AND (user1_id = $3 OR user2_id = $3)
            RETURNING *
        `;
        
        const result = await pgPool.query(updateQuery, [status, gardenId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Garden not found',
                message: 'Garden not found or you are not authorized to update it'
            });
        }
        
        res.json({
            message: 'Garden status updated successfully',
            garden: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating garden status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update garden status'
        });
    }
});

// Delete garden
// Usage Example:
// DELETE /api/gardens/123
// Headers: Authorization: Bearer <JWT_TOKEN>
router.delete('/:gardenId', checkJwt, async (req, res) => {
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
        const { gardenId } = req.params;
        
        // Delete garden (only if the current user is involved)
        const deleteQuery = `
            DELETE FROM garden 
            WHERE row_id = $1 AND (user1_id = $2 OR user2_id = $2)
            RETURNING *
        `;
        
        const result = await pgPool.query(deleteQuery, [gardenId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Garden not found',
                message: 'Garden not found or you are not authorized to delete it'
            });
        }
        
        res.json({
            message: 'Garden deleted successfully',
            deletedGarden: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error deleting garden:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete garden'
        });
    }
});

module.exports = router;
