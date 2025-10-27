const { pgPool, getMongoDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class Question {
    
    // ============================================
    // Create a new question
    // ============================================
    static async create(questionData) {
        const { subject_id, category_id, type_name, difficulty, points, time_limit, status, content, created_by } = questionData;
        
        try {
            // 1. Insert content into MongoDB
            const db = getMongoDb();
            const mongoResult = await db.collection('question_contents').insertOne({
                question_type: type_name,
                ...content,
                created_at: new Date(),
                updated_at: new Date()
            });
            const mongo_content_id = mongoResult.insertedId.toString();
            
            // 2. Get question type ID
            const typeResult = await pgPool.query(
                'SELECT type_id FROM question_type WHERE type_name = $1',
                [type_name]
            );
            
            if (typeResult.rows.length === 0) {
                throw new Error(`Invalid question type: ${type_name}`);
            }
            
            const type_id = typeResult.rows[0].type_id;
            
            // 3. Insert metadata into PostgreSQL
            const pgResult = await pgPool.query(
                `INSERT INTO question (subject_id, category_id, mongo_content_id, type_id, difficulty, points, time_limit, status, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [subject_id, category_id || null, mongo_content_id, type_id, difficulty, points || 10, time_limit, status || 'private', created_by]
            );
            
            return { 
                ...pgResult.rows[0], 
                content,
                type_name 
            };
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get question by ID with content
    // ============================================
    static async getById(question_id) {
        try {
            // 1. Get metadata from PostgreSQL
            const pgResult = await pgPool.query(
                `SELECT q.*, qt.type_name, s.name as subject_name, c.name as category_name
                 FROM question q
                 JOIN question_type qt ON q.type_id = qt.type_id
                 JOIN subject s ON q.subject_id = s.subject_id
                 LEFT JOIN category c ON q.category_id = c.category_id
                 WHERE q.question_id = $1 AND q.is_active = true`,
                [question_id]
            );
            
            if (pgResult.rows.length === 0) return null;
            
            const questionMeta = pgResult.rows[0];
            
            // 2. Get content from MongoDB
            const db = getMongoDb();
            const content = await db.collection('question_contents').findOne({
                _id: new ObjectId(questionMeta.mongo_content_id)
            });
            
            if (!content) {
                console.error(`MongoDB content not found for question ${question_id}`);
                return null;
            }
            
            return { ...questionMeta, content };
        } catch (error) {
            console.error('Error getting question by ID:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get questions with filters
    // ============================================
    static async getAll(filters = {}) {
        const { subject_id, category_id, type, type_name, difficulty, status, limit = 10, offset = 0 } = filters;
        
        // Accept both 'type' and 'type_name' parameters (type is alias for type_name)
        const questionType = type_name || type;
        
        try {
            let query = `
                SELECT q.question_id, q.difficulty, q.points, q.time_limit, q.status,
                       qt.type_name, s.name as subject_name, c.name as category_name,
                       q.created_at
                FROM question q
                JOIN question_type qt ON q.type_id = qt.type_id
                JOIN subject s ON q.subject_id = s.subject_id
                LEFT JOIN category c ON q.category_id = c.category_id
                WHERE q.is_active = true
            `;
            const params = [];
            
            if (subject_id) {
                params.push(subject_id);
                query += ` AND q.subject_id = $${params.length}`;
            }
            
            if (category_id) {
                params.push(category_id);
                query += ` AND q.category_id = $${params.length}`;
            }
            
            if (questionType) {
                params.push(questionType);
                query += ` AND qt.type_name = $${params.length}`;
            }
            
            if (difficulty) {
                params.push(difficulty);
                query += ` AND q.difficulty = $${params.length}`;
            }
            
            if (status) {
                params.push(status);
                query += ` AND q.status = $${params.length}`;
            }
            
            params.push(limit, offset);
            query += ` ORDER BY q.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
            
            const result = await pgPool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting all questions:', error);
            throw error;
        }
    }
    
    // ============================================
    // Validate answer (NO DATABASE SAVE)
    // ============================================
    static async validateAnswer(question_id, userAnswer) {
        try {
            const question = await this.getById(question_id);
            if (!question) throw new Error('Question not found');
            
            let isCorrect = false;
            let correctAnswers = [];
            let partialScore = 0;
            
            switch (question.content.question_type) {
                
                // Multiple Choice & True/False
                case 'multiple_choice':
                case 'true_false':
                    correctAnswers = question.content.options
                        .filter(opt => opt.is_correct)
                        .map(opt => opt.id);
                    isCorrect = correctAnswers.includes(userAnswer.selected_option);
                    partialScore = isCorrect ? question.points : 0;
                    break;
                
                // Fill in the Blank
                case 'fill_blank':
                    const blank = question.content.blanks[0];
                    const userText = userAnswer.text_answer?.trim();
                    
                    isCorrect = blank.correct_answers.some(ans => {
                        const compareUser = blank.case_sensitive ? userText : userText?.toLowerCase();
                        const compareAns = blank.case_sensitive ? ans : ans.toLowerCase();
                        return compareUser === compareAns;
                    });
                    
                    partialScore = isCorrect ? question.points : 0;
                    break;
                
                // Matching
                case 'matching':
                    const userMatches = userAnswer.matches || [];
                    const allCorrect = question.content.correct_matches.every(correct => 
                        userMatches.some(user => 
                            user.left === correct.left && user.right === correct.right
                        )
                    );
                    
                    // Partial credit for matching
                    const correctMatchCount = question.content.correct_matches.filter(correct =>
                        userMatches.some(user => user.left === correct.left && user.right === correct.right)
                    ).length;
                    
                    isCorrect = allCorrect;
                    partialScore = Math.floor((correctMatchCount / question.content.correct_matches.length) * question.points);
                    break;
            }
            
            // Calculate time bonus (if answered quickly)
            let timeBonus = 0;
            if (isCorrect && userAnswer.time_taken && question.time_limit) {
                const timeRatio = userAnswer.time_taken / question.time_limit;
                if (timeRatio < 0.5) {
                    timeBonus = Math.floor(partialScore * 0.5); // 50% bonus for fast answers
                } else if (timeRatio < 0.75) {
                    timeBonus = Math.floor(partialScore * 0.25); // 25% bonus
                }
            }
            
            return {
                isCorrect,
                correctAnswers,
                explanation: question.content.explanation,
                pointsEarned: partialScore + timeBonus,
                pointsPossible: question.points,
                timeBonus,
                media: question.content.media || []
            };
        } catch (error) {
            console.error('Error validating answer:', error);
            throw error;
        }
    }
    
    // ============================================
    // Update question
    // ============================================
    static async update(question_id, updates) {
        const { difficulty, points, time_limit, category_id, status, content, is_active } = updates;
        
        try {
            // Validate status if provided
            if (status && !['private', 'public'].includes(status)) {
                throw new Error('Status must be either "private" or "public"');
            }
            
            // Update MongoDB content if provided
            if (content) {
                const question = await this.getById(question_id);
                if (!question) throw new Error('Question not found');
                
                const db = getMongoDb();
                await db.collection('question_contents').updateOne(
                    { _id: new ObjectId(question.mongo_content_id) },
                    { $set: { ...content, updated_at: new Date() } }
                );
            }
            
            // Update PostgreSQL metadata
            const fields = [];
            const values = [];
            let paramCount = 1;
            
            if (difficulty !== undefined) {
                fields.push(`difficulty = $${paramCount++}`);
                values.push(difficulty);
            }
            if (points !== undefined) {
                fields.push(`points = $${paramCount++}`);
                values.push(points);
            }
            if (time_limit !== undefined) {
                fields.push(`time_limit = $${paramCount++}`);
                values.push(time_limit);
            }
            if (category_id !== undefined) {
                fields.push(`category_id = $${paramCount++}`);
                values.push(category_id);
            }
            if (status !== undefined) {
                fields.push(`status = $${paramCount++}`);
                values.push(status);
            }
            if (is_active !== undefined) {
                fields.push(`is_active = $${paramCount++}`);
                values.push(is_active);
            }
            
            if (fields.length === 0 && !content) {
                throw new Error('No fields to update');
            }
            
            if (fields.length > 0) {
                fields.push(`updated_at = NOW()`);
                values.push(question_id);
                
                const result = await pgPool.query(
                    `UPDATE question SET ${fields.join(', ')} WHERE question_id = $${paramCount} RETURNING *`,
                    values
                );
                
                return result.rows[0];
            }
            
            return await this.getById(question_id);
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    }
    
    // ============================================
    // Delete question (soft delete)
    // ============================================
    static async delete(question_id) {
        try {
            const result = await pgPool.query(
                'UPDATE question SET is_active = false WHERE question_id = $1 RETURNING *',
                [question_id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get all subjects
    // ============================================
    static async getSubjects() {
        try {
            const result = await pgPool.query(
                `SELECT s.*, c.name as category_name 
                 FROM subject s 
                 LEFT JOIN category c ON s.category_id = c.category_id
                 ORDER BY s.name`
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting subjects:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get all categories
    // ============================================
    static async getCategories(filters = {}) {
        try {
            const { parent_only } = filters;
            
            let query = `
                SELECT c.*, 
                       pc.name as parent_category_name,
                       COUNT(DISTINCT s.subject_id) as subject_count,
                       COUNT(DISTINCT q.question_id) as question_count
                FROM category c
                LEFT JOIN category pc ON c.parent_category_id = pc.category_id
                LEFT JOIN subject s ON s.category_id = c.category_id
                LEFT JOIN question q ON q.category_id = c.category_id
            `;
            
            if (parent_only === 'true') {
                query += ' WHERE c.parent_category_id IS NULL';
            }
            
            query += ' GROUP BY c.category_id, pc.name ORDER BY c.name';
            
            const result = await pgPool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }
    
    // ============================================
    // Get all question types
    // ============================================
    static async getQuestionTypes() {
        try {
            const result = await pgPool.query(
                'SELECT * FROM question_type ORDER BY type_name'
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting question types:', error);
            throw error;
        }
    }
}

module.exports = Question;
