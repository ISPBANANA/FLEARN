const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { checkJwt } = require('../middleware/auth');
const { pgPool } = require('../config/database');
// ============================================
// GET /api/topics - Get all topics (with filters)
// Usage Example:
// GET /api/topics
// GET /api/topics?subject_id=1
// GET /api/topics?status=public
// GET /api/topics?subject_id=1&status=public&limit=10&offset=0
// ============================================

// ---------- helpers -------------------------------------------------

async function getUserIdFromReq(req) {
    const googleId = req.user?.sub || req.user?.id;

    if (!googleId) {
        // caller decides how to respond (usually 401)
        return null;
    }

    const userQuery = 'SELECT user_id FROM "user" WHERE google_id = $1';
    const { rows } = await pgPool.query(userQuery, [googleId]);
    return rows[0]?.user_id || null;
}

async function ensureUserFromReq(req, res) {
    // if checkJwt didn’t attach user correctly, fail early
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized: missing authentication data'
        });
        return null;
    }

    const userId = await getUserIdFromReq(req);

    if (!userId) {
        res.status(404).json({
            success: false,
            error: 'User not found'
        });
        return null;
    }

    return userId;
}

router.get('/', async (req, res) => {
    try {
        const topics = await Topic.getAll(req.query);
        
        res.json({
            success: true,
            data: topics,
            count: topics.length
        });
        
    } catch (error) {
        console.error('Error getting topics:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/topics/subject/:subject_id - Get topics by subject
// Usage Example:
// GET /api/topics/subject/1
// ============================================


// ---------- routes --------------------------------------------------

// GET /api/topics - Get all topics (with filters)
router.get('/', async (req, res) => {
    try {
        const topics = await Topic.getAll(req.query);

        res.json({
            success: true,
            data: topics,
            count: topics.length
        });

    } catch (error) {
        console.error('Error getting topics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/topics/subject/:subject_id - Get topics by subject
router.get('/subject/:subject_id', async (req, res) => {
    try {
                const { subject_id } = req.params;
        const topics = await Topic.getBySubject(subject_id);
        
        res.json({
            success: true,
            data: topics,
            count: topics.length
        });
        
    } catch (error) {
        console.error('Error getting topics by subject:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/topics/:id - Get single topic
// Usage Example:
// GET /api/topics/1
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const topic = await Topic.getById(req.params.id);
        
        if (!topic) {
            return res.status(404).json({ 
                success: false, 
                error: 'Topic not found' 
            });
        }
        
        res.json({
            success: true,
            data: topic
        });
        
    } catch (error) {
        console.error('Error getting topic:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/topics/:id/statistics - Get topic statistics
// Usage Example:
// GET /api/topics/1/statistics
// ============================================
router.get('/:id/statistics', async (req, res) => {
    try {
        const stats = await Topic.getStatistics(req.params.id);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error getting topic statistics:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// POST /api/topics - Create new topic
// Usage Example:
// POST /api/topics
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "subject_id": 1,
//   "name": "Calculus - Lopital",
//   "description": "L'Hôpital's rule and applications",
//   "status": "public"
// }
// ============================================
router.post('/', checkJwt, async (req, res) => {
    try {
        const { subject_id, name, description, status } = req.body;
        
        // Basic validation
        if (!subject_id || !name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: subject_id, name'
            });
        }
        
        // Validate status if provided
        if (status && !['private', 'public'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either "private" or "public"'
            });
        }
        
        // Get user_id from google_id
        const googleId = req.user.sub || req.user.id;
        const { pgPool } = require('../config/database');
        const userQuery = 'SELECT user_id FROM "user" WHERE google_id = $1';
        const userResult = await pgPool.query(userQuery, [googleId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        
        const topic = await Topic.create({
            subject_id,
            name,
            description,
            status,
            created_by: userId
        });
        
        res.status(201).json({
            success: true,
            data: topic,
            message: 'Topic created successfully'
        });
        
    } catch (error) {
        console.error('Error creating topic:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                error: 'A topic with this name already exists for this subject' 
            });
        }
        
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// PUT /api/topics/:id - Update topic
// Usage Example:
// PUT /api/topics/1
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "name": "Updated Topic Name",
//   "description": "Updated description",
//   "status": "private"
// }
// ============================================
router.put('/:id', checkJwt, async (req, res) => {
    try {
        const updated = await Topic.update(req.params.id, req.body);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }
        
        res.json({
            success: true,
            data: updated,
            message: 'Topic updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating topic:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                error: 'A topic with this name already exists for this subject' 
            });
        }
        
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// DELETE /api/topics/:id - Delete topic
// Usage Example:
// DELETE /api/topics/1
// Headers: Authorization: Bearer <JWT_TOKEN>
// Note: Will fail if there are questions linked to this topic
// ============================================
router.delete('/:id', checkJwt, async (req, res) => {
    try {
        const deleted = await Topic.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Topic deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
