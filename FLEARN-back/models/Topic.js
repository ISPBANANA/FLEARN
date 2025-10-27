const { pgPool } = require('../config/database');

class Topic {
    
    // ============================================
    // Create a new topic
    // ============================================
    static async create(topicData) {
        const { subject_id, name, description, status, created_by } = topicData;
        
        try {
            const result = await pgPool.query(
                `INSERT INTO topic (subject_id, name, description, status, created_by)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [subject_id, name, description, status || 'public', created_by]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating topic:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get topic by ID with question count
    // ============================================
    static async getById(topic_id) {
        try {
            const result = await pgPool.query(
                `SELECT t.*, 
                        s.name as subject_name,
                        u.name as creator_name,
                        COUNT(q.question_id) as question_count
                 FROM topic t
                 JOIN subject s ON t.subject_id = s.subject_id
                 LEFT JOIN "user" u ON t.created_by = u.user_id
                 LEFT JOIN question q ON q.topic_id = t.topic_id AND q.is_active = true
                 WHERE t.topic_id = $1
                 GROUP BY t.topic_id, s.name, u.name`,
                [topic_id]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting topic by ID:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get all topics with filters
    // ============================================
    static async getAll(filters = {}) {
        const { subject_id, status, limit = 100, offset = 0 } = filters;
        
        try {
            let query = `
                SELECT t.*, 
                       s.name as subject_name,
                       u.name as creator_name,
                       COUNT(q.question_id) as question_count
                FROM topic t
                JOIN subject s ON t.subject_id = s.subject_id
                LEFT JOIN "user" u ON t.created_by = u.user_id
                LEFT JOIN question q ON q.topic_id = t.topic_id AND q.is_active = true
                WHERE 1=1
            `;
            const params = [];
            
            if (subject_id) {
                params.push(subject_id);
                query += ` AND t.subject_id = $${params.length}`;
            }
            
            if (status) {
                params.push(status);
                query += ` AND t.status = $${params.length}`;
            }
            
            query += ` GROUP BY t.topic_id, s.name, u.name`;
            query += ` ORDER BY s.name, t.name`;
            
            params.push(limit, offset);
            query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
            
            const result = await pgPool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting all topics:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get topics grouped by subject
    // ============================================
    static async getBySubject(subject_id) {
        try {
            const result = await pgPool.query(
                `SELECT t.*, 
                        COUNT(q.question_id) as question_count
                 FROM topic t
                 LEFT JOIN question q ON q.topic_id = t.topic_id AND q.is_active = true
                 WHERE t.subject_id = $1
                 GROUP BY t.topic_id
                 ORDER BY t.name`,
                [subject_id]
            );
            
            return result.rows;
        } catch (error) {
            console.error('Error getting topics by subject:', error);
            throw error;
        }
    }
    
    // ============================================
    // Update topic
    // ============================================
    static async update(topic_id, updates) {
        const { name, description, status } = updates;
        
        try {
            // Validate status if provided
            if (status && !['private', 'public'].includes(status)) {
                throw new Error('Status must be either "private" or "public"');
            }
            
            const fields = [];
            const values = [];
            let paramCount = 1;
            
            if (name !== undefined) {
                fields.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (description !== undefined) {
                fields.push(`description = $${paramCount++}`);
                values.push(description);
            }
            if (status !== undefined) {
                fields.push(`status = $${paramCount++}`);
                values.push(status);
            }
            
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }
            
            fields.push(`updated_at = NOW()`);
            values.push(topic_id);
            
            const result = await pgPool.query(
                `UPDATE topic SET ${fields.join(', ')} WHERE topic_id = $${paramCount} RETURNING *`,
                values
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating topic:', error);
            throw error;
        }
    }
    
    // ============================================
    // Delete topic
    // ============================================
    static async delete(topic_id) {
        try {
            // Check if there are questions linked to this topic
            const questionCheck = await pgPool.query(
                'SELECT COUNT(*) as count FROM question WHERE topic_id = $1 AND is_active = true',
                [topic_id]
            );
            
            if (parseInt(questionCheck.rows[0].count) > 0) {
                throw new Error('Cannot delete topic with associated questions. Please reassign or delete questions first.');
            }
            
            const result = await pgPool.query(
                'DELETE FROM topic WHERE topic_id = $1 RETURNING *',
                [topic_id]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting topic:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get topic statistics
    // ============================================
    static async getStatistics(topic_id) {
        try {
            const result = await pgPool.query(
                `SELECT 
                    COUNT(CASE WHEN q.status = 'public' THEN 1 END) as public_questions,
                    COUNT(CASE WHEN q.status = 'private' THEN 1 END) as private_questions,
                    COUNT(DISTINCT q.created_by) as contributor_count,
                    AVG(q.difficulty) as avg_difficulty
                 FROM question q
                 WHERE q.topic_id = $1 AND q.is_active = true`,
                [topic_id]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error getting topic statistics:', error);
            throw error;
        }
    }
}

module.exports = Topic;
