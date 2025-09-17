const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt } = require('../middleware/auth');

const router = express.Router();

// Get user's friends
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
                f.row_id,
                f.status,
                f.created_at,
                f.updated_at,
                CASE 
                    WHEN f.user1_id = $1 THEN u2.name
                    ELSE u1.name
                END as friend_name,
                CASE 
                    WHEN f.user1_id = $1 THEN u2.email
                    ELSE u1.email
                END as friend_email,
                CASE 
                    WHEN f.user1_id = $1 THEN u2.profile_pic
                    ELSE u1.profile_pic
                END as friend_profile_pic,
                CASE 
                    WHEN f.user1_id = $1 THEN f.user2_id
                    ELSE f.user1_id
                END as friend_user_id
            FROM friend f
            JOIN "user" u1 ON f.user1_id = u1.user_id
            JOIN "user" u2 ON f.user2_id = u2.user_id
            WHERE (f.user1_id = $1 OR f.user2_id = $1)
            ORDER BY f.updated_at DESC
        `;
        
        const result = await pgPool.query(query, [userId]);
        
        res.json({
            message: 'Friends retrieved successfully',
            friends: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch friends'
        });
    }
});

// Send friend request
router.post('/request', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { friend_email } = req.body;
        
        if (!friend_email) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Friend email is required'
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
        
        // Get friend user_id
        const friendQuery = `SELECT user_id FROM "user" WHERE email = $1`;
        const friendResult = await pgPool.query(friendQuery, [friend_email]);
        
        if (friendResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Friend not found',
                message: 'User with this email does not exist'
            });
        }
        
        const friendUserId = friendResult.rows[0].user_id;
        
        // Check if they're trying to add themselves
        if (userId === friendUserId) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'You cannot add yourself as a friend'
            });
        }
        
        // Check if friendship already exists
        const existingFriendQuery = `
            SELECT * FROM friend 
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `;
        const existingFriend = await pgPool.query(existingFriendQuery, [userId, friendUserId]);
        
        if (existingFriend.rows.length > 0) {
            return res.status(409).json({
                error: 'Friendship already exists',
                message: 'You are already friends or have a pending request'
            });
        }
        
        // Create friend request
        const insertQuery = `
            INSERT INTO friend (user1_id, user2_id, status)
            VALUES ($1, $2, 'pending')
            RETURNING *
        `;
        
        const result = await pgPool.query(insertQuery, [userId, friendUserId]);
        
        res.status(201).json({
            message: 'Friend request sent successfully',
            friendRequest: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to send friend request'
        });
    }
});

// Accept/reject friend request
router.patch('/:friendshipId/status', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { friendshipId } = req.params;
        const { status } = req.body;
        
        if (!status || !['accepted', 'blocked'].includes(status)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Status must be either "accepted" or "blocked"'
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
        
        // Update friendship status (only if the current user is user2 - the recipient)
        const updateQuery = `
            UPDATE friend 
            SET status = $1, updated_at = NOW()
            WHERE row_id = $2 AND user2_id = $3 AND status = 'pending'
            RETURNING *
        `;
        
        const result = await pgPool.query(updateQuery, [status, friendshipId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Friend request not found',
                message: 'Friend request not found or you are not authorized to update it'
            });
        }
        
        res.json({
            message: `Friend request ${status} successfully`,
            friendship: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating friend request status:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update friend request status'
        });
    }
});

// Remove friend
router.delete('/:friendshipId', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { friendshipId } = req.params;
        
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
        
        // Delete friendship (only if the current user is involved)
        const deleteQuery = `
            DELETE FROM friend 
            WHERE row_id = $1 AND (user1_id = $2 OR user2_id = $2)
            RETURNING *
        `;
        
        const result = await pgPool.query(deleteQuery, [friendshipId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Friendship not found',
                message: 'Friendship not found or you are not authorized to delete it'
            });
        }
        
        res.json({
            message: 'Friendship removed successfully',
            deletedFriendship: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error removing friendship:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to remove friendship'
        });
    }
});

module.exports = router;
