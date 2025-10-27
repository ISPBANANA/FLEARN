const { pgPool } = require('../config/database');

class Backlog {
    
    // ============================================
    // Create a new backlog entry
    // ============================================
    static async create(backlogData) {
        const { user_id, subject_id, topic_id, correctness } = backlogData;
        
        try {
            const result = await pgPool.query(
                `INSERT INTO backlog (user_id, subject_id, topic_id, correctness, do_date)
                 VALUES ($1, $2, $3, $4, NOW())
                 RETURNING *`,
                [user_id, subject_id || null, topic_id || null, correctness]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating backlog entry:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get backlog entries by user ID
    // ============================================
    static async getByUserId(user_id, filters = {}) {
        const { subject_id, topic_id, correctness, limit = 100, offset = 0 } = filters;
        
        try {
            let query = `
                SELECT b.*, 
                       s.name as subject_name,
                       t.name as topic_name
                FROM backlog b
                LEFT JOIN subject s ON b.subject_id = s.subject_id
                LEFT JOIN topic t ON b.topic_id = t.topic_id
                WHERE b.user_id = $1
            `;
            const params = [user_id];
            let paramCount = 1;
            
            if (subject_id) {
                paramCount++;
                query += ` AND b.subject_id = $${paramCount}`;
                params.push(subject_id);
            }
            
            if (topic_id) {
                paramCount++;
                query += ` AND b.topic_id = $${paramCount}`;
                params.push(topic_id);
            }
            
            if (correctness !== undefined && correctness !== null) {
                paramCount++;
                query += ` AND b.correctness = $${paramCount}`;
                params.push(correctness);
            }
            
            query += ` ORDER BY b.do_date DESC`;
            
            if (limit) {
                paramCount++;
                query += ` LIMIT $${paramCount}`;
                params.push(limit);
            }
            
            if (offset) {
                paramCount++;
                query += ` OFFSET $${paramCount}`;
                params.push(offset);
            }
            
            const result = await pgPool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting backlog entries by user ID:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get backlog entry by ID
    // ============================================
    static async getById(row_id) {
        try {
            const result = await pgPool.query(
                `SELECT b.*, 
                        s.name as subject_name,
                        t.name as topic_name
                 FROM backlog b
                 LEFT JOIN subject s ON b.subject_id = s.subject_id
                 LEFT JOIN topic t ON b.topic_id = t.topic_id
                 WHERE b.row_id = $1`,
                [row_id]
            );
            
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error getting backlog entry by ID:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get statistics for a user
    // ============================================
    static async getStatsByUserId(user_id, filters = {}) {
        const { subject_id, topic_id, start_date, end_date } = filters;
        
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN correctness = true THEN 1 ELSE 0 END) as correct_count,
                    SUM(CASE WHEN correctness = false THEN 1 ELSE 0 END) as incorrect_count,
                    ROUND(
                        (SUM(CASE WHEN correctness = true THEN 1 ELSE 0 END)::NUMERIC / 
                        NULLIF(COUNT(*), 0) * 100), 2
                    ) as accuracy_percentage
                FROM backlog
                WHERE user_id = $1
            `;
            const params = [user_id];
            let paramCount = 1;
            
            if (subject_id) {
                paramCount++;
                query += ` AND subject_id = $${paramCount}`;
                params.push(subject_id);
            }
            
            if (topic_id) {
                paramCount++;
                query += ` AND topic_id = $${paramCount}`;
                params.push(topic_id);
            }
            
            if (start_date) {
                paramCount++;
                query += ` AND do_date >= $${paramCount}`;
                params.push(start_date);
            }
            
            if (end_date) {
                paramCount++;
                query += ` AND do_date <= $${paramCount}`;
                params.push(end_date);
            }
            
            const result = await pgPool.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting backlog stats:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get statistics by subject
    // ============================================
    static async getStatsBySubject(user_id) {
        try {
            const result = await pgPool.query(
                `SELECT 
                    s.subject_id,
                    s.name as subject_name,
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN b.correctness = true THEN 1 ELSE 0 END) as correct_count,
                    SUM(CASE WHEN b.correctness = false THEN 1 ELSE 0 END) as incorrect_count,
                    ROUND(
                        (SUM(CASE WHEN b.correctness = true THEN 1 ELSE 0 END)::NUMERIC / 
                        NULLIF(COUNT(*), 0) * 100), 2
                    ) as accuracy_percentage
                 FROM backlog b
                 LEFT JOIN subject s ON b.subject_id = s.subject_id
                 WHERE b.user_id = $1
                 GROUP BY s.subject_id, s.name
                 ORDER BY total_attempts DESC`,
                [user_id]
            );
            
            return result.rows;
        } catch (error) {
            console.error('Error getting backlog stats by subject:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get statistics by topic
    // ============================================
    static async getStatsByTopic(user_id, subject_id = null) {
        try {
            let query = `
                SELECT 
                    t.topic_id,
                    t.name as topic_name,
                    s.subject_id,
                    s.name as subject_name,
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN b.correctness = true THEN 1 ELSE 0 END) as correct_count,
                    SUM(CASE WHEN b.correctness = false THEN 1 ELSE 0 END) as incorrect_count,
                    ROUND(
                        (SUM(CASE WHEN b.correctness = true THEN 1 ELSE 0 END)::NUMERIC / 
                        NULLIF(COUNT(*), 0) * 100), 2
                    ) as accuracy_percentage
                FROM backlog b
                LEFT JOIN topic t ON b.topic_id = t.topic_id
                LEFT JOIN subject s ON t.subject_id = s.subject_id
                WHERE b.user_id = $1
            `;
            const params = [user_id];
            
            if (subject_id) {
                query += ` AND s.subject_id = $2`;
                params.push(subject_id);
            }
            
            query += ` GROUP BY t.topic_id, t.name, s.subject_id, s.name
                      ORDER BY total_attempts DESC`;
            
            const result = await pgPool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting backlog stats by topic:', error);
            throw error;
        }
    }
    
    // ============================================
    // Delete backlog entry by ID
    // ============================================
    static async delete(row_id) {
        try {
            const result = await pgPool.query(
                'DELETE FROM backlog WHERE row_id = $1 RETURNING *',
                [row_id]
            );
            
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error deleting backlog entry:', error);
            throw error;
        }
    }
    
    // ============================================
    // Delete all backlog entries for a user
    // ============================================
    static async deleteByUserId(user_id) {
        try {
            const result = await pgPool.query(
                'DELETE FROM backlog WHERE user_id = $1',
                [user_id]
            );
            
            return result.rowCount;
        } catch (error) {
            console.error('Error deleting backlog entries by user ID:', error);
            throw error;
        }
    }
}

module.exports = Backlog;
