const express = require('express');
const { pgPool } = require('../config/database');
const { checkJwt, optionalJwt } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get user profile (protected route)
router.get('/profile', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        
        const query = `
            SELECT * FROM "user" 
            WHERE auth0_id = $1
        `;
        
        const result = await pgPool.query(query, [auth0Id]);
        
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

// Create or update user profile
router.post('/profile', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const email = req.user.email || req.body.email;
        
        const {
            profile_pic,
            name,
            birthdate,
            edu_level
        } = req.body;
        
        // Check if user already exists
        const existingUserQuery = `
            SELECT user_id FROM "user" 
            WHERE auth0_id = $1
        `;
        const existingUser = await pgPool.query(existingUserQuery, [auth0Id]);
        
        if (existingUser.rows.length > 0) {
            // Update existing user
            const updateQuery = `
                UPDATE "user" 
                SET profile_pic = $1, name = $2, email = $3, birthdate = $4, edu_level = $5,
                    updated_at = NOW()
                WHERE auth0_id = $6
                RETURNING *
            `;
            
            const result = await pgPool.query(updateQuery, [
                profile_pic, name, email, birthdate, edu_level, auth0Id
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
                    user_id, auth0_id, profile_pic, name, email, birthdate, edu_level,
                    rank, streak, completed_task, daily_exp, math_exp, phy_exp, bio_exp, chem_exp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Beginner', 0, 0, 0, 0, 0, 0, 0)
                RETURNING *
            `;
            
            const result = await pgPool.query(insertQuery, [
                userId, auth0Id, profile_pic, name, email, birthdate, edu_level
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
router.get('/preferences', checkJwt, async (req, res) => {
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
router.post('/preferences', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { subject } = req.body;
        
        if (!subject) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Subject is required'
            });
        }
        
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
router.patch('/experience', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.user.sub;
        const { daily_exp, math_exp, phy_exp, bio_exp, chem_exp } = req.body;
        
        const updateQuery = `
            UPDATE "user" 
            SET daily_exp = COALESCE($1, daily_exp),
                math_exp = COALESCE($2, math_exp),
                phy_exp = COALESCE($3, phy_exp),
                bio_exp = COALESCE($4, bio_exp),
                chem_exp = COALESCE($5, chem_exp),
                updated_at = NOW()
            WHERE auth0_id = $6
            RETURNING *
        `;
        
        const result = await pgPool.query(updateQuery, [
            daily_exp, math_exp, phy_exp, bio_exp, chem_exp, auth0Id
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

module.exports = router;
