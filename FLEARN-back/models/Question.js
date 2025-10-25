const { pgPool, getMongoDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class Question {
    
    // ============================================
    // Create a new question
    // ============================================
    static async create(questionData) {
        const { subject_id, type_name, difficulty, points, time_limit, content, created_by } = questionData;
        
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
                `INSERT INTO question (subject_id, mongo_content_id, type_id, difficulty, points, time_limit, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [subject_id, mongo_content_id, type_id, difficulty, points || 10, time_limit, created_by]
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
                `SELECT q.*, qt.type_name, s.name as subject_name
                 FROM question q
                 JOIN question_type qt ON q.type_id = qt.type_id
                 JOIN subject s ON q.subject_id = s.subject_id
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
        const { subject_id, type, type_name, difficulty, limit = 10, offset = 0 } = filters;
        
        // Accept both 'type' and 'type_name' parameters (type is alias for type_name)
        const questionType = type_name || type;
        
        try {
            let query = `
                SELECT q.question_id, q.difficulty, q.points, q.time_limit,
                       qt.type_name, s.name as subject_name,
                       q.created_at
                FROM question q
                JOIN question_type qt ON q.type_id = qt.type_id
                JOIN subject s ON q.subject_id = s.subject_id
                WHERE q.is_active = true
            `;
            const params = [];
            
            if (subject_id) {
                params.push(subject_id);
                query += ` AND q.subject_id = $${params.length}`;
            }
            
            if (questionType) {
                params.push(questionType);
                query += ` AND qt.type_name = $${params.length}`;
            }
            
            if (difficulty) {
                params.push(difficulty);
                query += ` AND q.difficulty = $${params.length}`;
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
                
                // Multi-Select
                case 'multi_select':
                    correctAnswers = question.content.options
                        .filter(opt => opt.is_correct)
                        .map(opt => opt.id);
                    
                    const selectedSet = new Set(userAnswer.selected_options || []);
                    const correctSet = new Set(correctAnswers);
                    
                    // Perfect match
                    isCorrect = selectedSet.size === correctSet.size && 
                               [...selectedSet].every(x => correctSet.has(x));
                    
                    // Partial credit calculation
                    if (question.content.partial_credit) {
                        const correctSelected = [...selectedSet].filter(x => correctSet.has(x)).length;
                        const incorrectSelected = selectedSet.size - correctSelected;
                        const totalCorrect = correctSet.size;
                        
                        // Score = (correct selections / total correct) * points
                        // Penalty for wrong selections
                        partialScore = Math.max(0, 
                            ((correctSelected / totalCorrect) - (incorrectSelected * 0.2)) * question.points
                        );
                        partialScore = Math.floor(partialScore);
                    } else {
                        partialScore = isCorrect ? question.points : 0;
                    }
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
                
                // Essay (Cannot auto-validate)
                case 'essay':
                    isCorrect = null;
                    partialScore = 0;
                    
                    // Check word count
                    const wordCount = userAnswer.text_answer?.split(/\s+/).length || 0;
                    const meetsWordLimit = wordCount >= (question.content.word_limit?.min || 0) &&
                                          wordCount <= (question.content.word_limit?.max || Infinity);
                    
                    return {
                        isCorrect: null,
                        correctAnswers: null,
                        explanation: question.content.explanation,
                        pointsEarned: 0,
                        pointsPossible: question.points,
                        requiresManualGrading: true,
                        wordCount,
                        meetsWordLimit,
                        keywords: question.content.keywords,
                        sampleAnswer: question.content.sample_answer
                    };
                
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
        const { difficulty, points, time_limit, content, is_active } = updates;
        
        try {
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
                'SELECT * FROM subject ORDER BY name'
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting subjects:', error);
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
