const express = require('express');
const Backlog = require('../models/Backlog');
const { checkJwt } = require('../middleware/auth');
const { pgPool } = require('../config/database');

const router = express.Router();

// ============================================
// Create a new backlog entry
// ============================================
// POST /api/backlog
// Body: { user_id, subject_id, topic_id (optional), correctness }
router.post('/', checkJwt, async (req, res) => {
    try {
        const { user_id, subject_id, topic_id, correctness } = req.body;
        
        // Validate required fields
        if (!user_id || !subject_id || correctness === undefined) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'user_id, subject_id, and correctness are required'
            });
        }
        
        // Validate correctness is boolean
        if (typeof correctness !== 'boolean') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'correctness must be a boolean value'
            });
        }
        
        const backlogEntry = await Backlog.create({
            user_id,
            subject_id,
            topic_id,
            correctness
        });
        
        res.status(201).json({
            message: 'Backlog entry created successfully',
            data: backlogEntry
        });
        
    } catch (error) {
        console.error('Error creating backlog entry:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create backlog entry'
        });
    }
});

// ============================================
// Get backlog entries for a user
// ============================================
// GET /api/backlog/user/:user_id?subject_id=&topic_id=&correctness=&limit=&offset=
router.get('/user/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        const { subject_id, topic_id, correctness, limit, offset } = req.query;
        
        const filters = {
            subject_id: subject_id ? parseInt(subject_id) : undefined,
            topic_id: topic_id ? parseInt(topic_id) : undefined,
            correctness: correctness !== undefined ? correctness === 'true' : undefined,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0
        };
        
        const entries = await Backlog.getByUserId(user_id, filters);
        
        res.json({
            message: 'Backlog entries retrieved successfully',
            count: entries.length,
            data: entries
        });
        
    } catch (error) {
        console.error('Error retrieving backlog entries:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve backlog entries'
        });
    }
});

// ============================================
// Get a single backlog entry by ID
// ============================================
// GET /api/backlog/:row_id
router.get('/:row_id', checkJwt, async (req, res) => {
    try {
        const { row_id } = req.params;
        
        const entry = await Backlog.getById(row_id);
        
        if (!entry) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Backlog entry not found'
            });
        }
        
        res.json({
            message: 'Backlog entry retrieved successfully',
            data: entry
        });
        
    } catch (error) {
        console.error('Error retrieving backlog entry:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve backlog entry'
        });
    }
});

// ============================================
// Get statistics for a user
// ============================================
// GET /api/backlog/stats/:user_id?subject_id=&topic_id=&start_date=&end_date=
router.get('/stats/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        const { subject_id, topic_id, start_date, end_date } = req.query;
        
        const filters = {
            subject_id: subject_id ? parseInt(subject_id) : undefined,
            topic_id: topic_id ? parseInt(topic_id) : undefined,
            start_date: start_date || undefined,
            end_date: end_date || undefined
        };
        
        const stats = await Backlog.getStatsByUserId(user_id, filters);
        
        res.json({
            message: 'Statistics retrieved successfully',
            data: stats
        });
        
    } catch (error) {
        console.error('Error retrieving backlog statistics:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve statistics'
        });
    }
});

// ============================================
// Get statistics by subject for a user
// ============================================
// GET /api/backlog/stats/subject/:user_id
router.get('/stats/subject/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const stats = await Backlog.getStatsBySubject(user_id);
        
        res.json({
            message: 'Subject statistics retrieved successfully',
            count: stats.length,
            data: stats
        });
        
    } catch (error) {
        console.error('Error retrieving subject statistics:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve subject statistics'
        });
    }
});

// ============================================
// Get statistics by topic for a user
// ============================================
// GET /api/backlog/stats/topic/:user_id?subject_id=
router.get('/stats/topic/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        const { subject_id } = req.query;
        
        const stats = await Backlog.getStatsByTopic(
            user_id, 
            subject_id ? parseInt(subject_id) : null
        );
        
        res.json({
            message: 'Topic statistics retrieved successfully',
            count: stats.length,
            data: stats
        });
        
    } catch (error) {
        console.error('Error retrieving topic statistics:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve topic statistics'
        });
    }
});

// ============================================
// Get analytics data for a user
// ============================================
// GET /api/backlog/analytics/:user_id?start_date=&end_date=
router.get('/analytics/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        const { start_date, end_date } = req.query;
        
        const analytics = await Backlog.getAnalytics(user_id, start_date, end_date);
        
        res.json({
            message: 'Analytics data retrieved successfully',
            data: analytics
        });
        
    } catch (error) {
        console.error('Error retrieving analytics:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve analytics'
        });
    }
});

// ============================================
// Delete a backlog entry
// ============================================
// DELETE /api/backlog/:row_id
router.delete('/:row_id', checkJwt, async (req, res) => {
    try {
        const { row_id } = req.params;
        
        const deleted = await Backlog.delete(row_id);
        
        if (!deleted) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Backlog entry not found'
            });
        }
        
        res.json({
            message: 'Backlog entry deleted successfully',
            data: deleted
        });
        
    } catch (error) {
        console.error('Error deleting backlog entry:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete backlog entry'
        });
    }
});

// ============================================
// Delete all backlog entries for a user
// ============================================
// DELETE /api/backlog/user/:user_id
router.delete('/user/:user_id', checkJwt, async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const deletedCount = await Backlog.deleteByUserId(user_id);
        
        res.json({
            message: `Successfully deleted ${deletedCount} backlog entries`,
            deletedCount
        });
        
    } catch (error) {
        console.error('Error deleting backlog entries:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete backlog entries'
        });
    }
});

module.exports = router;
