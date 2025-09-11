const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt } = require('../middleware/auth');

const router = express.Router();

// Get user's gardens
router.get('/', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        
        // First get user_id from auth0_id
        const userQuery = `SELECT user_id FROM "user" WHERE auth0_id = $1`;
        const userResult = await pgPool.query(userQuery, [auth0Id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
        const query = `
            SELECT 
                g.row_id,
                g.status,
                g.streak,
                g.uptime_streak,
                g.created_at,
                g.updated_at,
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
            WHERE (g.user1_id = $1 OR g.user2_id = $1)
            ORDER BY g.updated_at DESC
        `;
        
        const result = await pgPool.query(query, [userId]);
        
        res.json({
            message: 'Gardens retrieved successfully',
            gardens: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching gardens:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch gardens'
        });
    }
});

// Create a new garden with a friend
router.post('/', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { partner_email } = req.body;
        
        if (!partner_email) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Partner email is required'
            });
        }
        
        // Get current user_id
        const userQuery = `SELECT user_id FROM "user" WHERE auth0_id = $1`;
        const userResult = await pgPool.query(userQuery, [auth0Id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
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
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `;
        const existingGarden = await pgPool.query(existingGardenQuery, [userId, partnerUserId]);
        
        if (existingGarden.rows.length > 0) {
            return res.status(409).json({
                error: 'Garden already exists',
                message: 'You already have a garden with this user'
            });
        }
        
        // Create garden
        const insertQuery = `
            INSERT INTO garden (user1_id, user2_id, status, streak, uptime_streak)
            VALUES ($1, $2, 'active', 0, CURRENT_DATE)
            RETURNING *
        `;
        
        const result = await pgPool.query(insertQuery, [userId, partnerUserId]);
        
        res.status(201).json({
            message: 'Garden created successfully',
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
router.patch('/:gardenId/streak', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { gardenId } = req.params;
        const { increment } = req.body; // true to increment, false to reset
        
        // Get current user_id
        const userQuery = `SELECT user_id FROM "user" WHERE auth0_id = $1`;
        const userResult = await pgPool.query(userQuery, [auth0Id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
        let updateQuery;
        let queryParams;
        
        if (increment) {
            // Increment streak and update uptime_streak
            updateQuery = `
                UPDATE garden 
                SET streak = streak + 1, 
                    uptime_streak = CURRENT_DATE,
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

// Update garden status
router.patch('/:gardenId/status', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { gardenId } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive', 'completed'].includes(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Status must be "active", "inactive", or "completed"'
            });
        }
        
        // Get current user_id
        const userQuery = `SELECT user_id FROM "user" WHERE auth0_id = $1`;
        const userResult = await pgPool.query(userQuery, [auth0Id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
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
router.delete('/:gardenId', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { gardenId } = req.params;
        
        // Get current user_id
        const userQuery = `SELECT user_id FROM "user" WHERE auth0_id = $1`;
        const userResult = await pgPool.query(userQuery, [auth0Id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete your profile setup first'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
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
