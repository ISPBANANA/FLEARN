const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { checkJwt, optionalJwt } = require('../middleware/auth');

// ============================================
// POST /api/questions - Create new question
// Usage Example:
// POST /api/questions
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "subject_id": 1,
//   "category_id": 5,  // Optional - for additional categorization
//   "topic_id": 1,  // Optional - assign to a topic
//   "type_name": "multiple_choice",
//   "difficulty": 2,
//   "points": 10,
//   "time_limit": 60,
//   "status": "public",  // Optional - "private" (default) or "public"
//   "content": {
//     "question_text": "What is 2+2?",
//     "options": [
//       { "id": "a", "text": "3", "is_correct": false },
//       { "id": "b", "text": "4", "is_correct": true },
//       { "id": "c", "text": "5", "is_correct": false }
//     ],
//     "explanation": "2+2 equals 4"
//   }
// }
// ============================================
router.post('/', checkJwt, async (req, res) => {
    try {
        const { subject_id, category_id, topic_id, type_name, difficulty, points, time_limit, status, content } = req.body;
        
        // Basic validation
        if (!subject_id || !type_name || !difficulty || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: subject_id, type_name, difficulty, content'
            });
        }
        
        // Validate status if provided
        if (status && !['private', 'public'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be either "private" or "public"'
            });
        }
        
        // Validation rules for each question type
        const validationRules = {
            multiple_choice: (c) => {
                if (!c.options || c.options.length < 2) {
                    throw new Error('Multiple choice needs at least 2 options');
                }
                if (c.options.filter(opt => opt.is_correct).length !== 1) {
                    throw new Error('Multiple choice must have exactly 1 correct answer');
                }
            },
            true_false: (c) => {
                if (!c.options || c.options.length !== 2) {
                    throw new Error('True/False must have exactly 2 options');
                }
                if (c.options.filter(opt => opt.is_correct).length !== 1) {
                    throw new Error('True/False must have exactly 1 correct answer');
                }
            },
            fill_blank: (c) => {
                if (!c.blanks || c.blanks.length === 0) {
                    throw new Error('Fill blank needs at least one blank');
                }
                if (!c.blanks[0].correct_answers || c.blanks[0].correct_answers.length === 0) {
                    throw new Error('Fill blank needs at least one correct answer');
                }
            },
            matching: (c) => {
                if (!c.left_items || !c.right_items || !c.correct_matches) {
                    throw new Error('Matching needs left items, right items, and correct matches');
                }
                if (c.left_items.length === 0 || c.right_items.length === 0) {
                    throw new Error('Matching needs at least one item on each side');
                }
            }
        };
        
        // Validate content based on type
        if (validationRules[type_name]) {
            validationRules[type_name](content);
        }
        
        const question = await Question.create({
            subject_id,
            category_id,
            topic_id,
            type_name,
            difficulty,
            points,
            time_limit,
            status,
            content,
            created_by: req.user.user_id || req.user.sub
        });
        
        res.status(201).json({
            success: true,
            data: question,
            message: `${type_name} question created successfully`
        });
        
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/questions - Get all questions (with filters)
// Usage Example:
// GET /api/questions
// GET /api/questions?subject_id=1
// GET /api/questions?category_id=1
// GET /api/questions?topic_id=1
// GET /api/questions?type=multiple_choice
// GET /api/questions?difficulty=2
// GET /api/questions?status=public
// GET /api/questions?subject_id=1&topic_id=1&type=multiple_choice&difficulty=2&status=public&limit=5&offset=0
// ============================================
router.get('/', async (req, res) => {
    try {
        const questions = await Question.getAll(req.query);
        
        res.json({
            success: true,
            data: questions,
            count: questions.length
        });
        
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/questions/subjects - Get all subjects
// Usage Example:
// GET /api/questions/subjects
// ============================================
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await Question.getSubjects();
        
        res.json({
            success: true,
            data: subjects
        });
        
    } catch (error) {
        console.error('Error getting subjects:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/questions/categories - Get all categories
// Usage Example:
// GET /api/questions/categories
// GET /api/questions/categories?parent_only=true
// ============================================
router.get('/categories', async (req, res) => {
    try {
        const categories = await Question.getCategories(req.query);
        
        res.json({
            success: true,
            data: categories
        });
        
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/questions/types - Get all question types
// Usage Example:
// GET /api/questions/types
// ============================================
router.get('/types', async (req, res) => {
    try {
        const types = await Question.getQuestionTypes();
        
        res.json({
            success: true,
            data: types
        });
        
    } catch (error) {
        console.error('Error getting question types:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// GET /api/questions/:id - Get single question
// Usage Example:
// GET /api/questions/123e4567-e89b-12d3-a456-426614174000
// Note: Correct answers are sanitized (removed) from response
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.getById(req.params.id);
        
        if (!question) {
            return res.status(404).json({ 
                success: false, 
                error: 'Question not found' 
            });
        }
        
        // Don't send correct answers to frontend (sanitize)
        const sanitizedContent = { ...question.content };
        
        // Remove is_correct flag from options (for multiple choice, true/false, multi-select)
        if (sanitizedContent.options) {
            sanitizedContent.options = sanitizedContent.options.map(({ is_correct, ...opt }) => opt);
        }
        
        // Remove correct answers from fill blank
        if (sanitizedContent.blanks) {
            sanitizedContent.blanks = sanitizedContent.blanks.map(({ correct_answers, ...blank }) => blank);
        }
        
        // Remove correct matches from matching
        if (sanitizedContent.correct_matches) {
            delete sanitizedContent.correct_matches;
        }
        
        // Remove sample answer and keywords from essay
        if (sanitizedContent.sample_answer) {
            delete sanitizedContent.sample_answer;
        }
        if (sanitizedContent.keywords) {
            delete sanitizedContent.keywords;
        }
        
        res.json({
            success: true,
            data: {
                question_id: question.question_id,
                type: question.type_name,
                subject: question.subject_name,
                category: question.category_name,
                topic: question.topic_name,
                difficulty: question.difficulty,
                points: question.points,
                time_limit: question.time_limit,
                status: question.status,
                ...sanitizedContent
            }
        });
        
    } catch (error) {
        console.error('Error getting question:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// POST /api/questions/:id/validate - Validate answer (NO DB SAVE)
// Usage Examples:
// 
// Multiple Choice / True-False:
// POST /api/questions/:id/validate
// Body: { "answer": "b", "time_taken": 30 }
// 
// Fill Blank:
// Body: { "answer": "mitochondria", "time_taken": 25 }
// 
// Matching:
// Body: { 
//   "answer": [
//     { "left": "1", "right": "b" },
//     { "left": "2", "right": "c" }
//   ],
//   "time_taken": 60
// }
// ============================================
router.post('/:id/validate', async (req, res) => {
    try {
        const { answer, time_taken } = req.body;
        
        if (!answer) {
            return res.status(400).json({
                success: false,
                error: 'Answer is required'
            });
        }
        
        // Normalize answer format based on what was sent
        let normalizedAnswer = {};
        
        if (typeof answer === 'string') {
            // Single selection (multiple choice, true/false) or text (fill blank)
            normalizedAnswer = { 
                selected_option: answer,
                text_answer: answer
            };
        } else if (Array.isArray(answer)) {
            // Matching
            if (answer.length > 0 && typeof answer[0] === 'object' && answer[0].left && answer[0].right) {
                normalizedAnswer = { matches: answer };
            }
        } else if (typeof answer === 'object') {
            // Already normalized
            normalizedAnswer = answer;
        }
        
        // Add time taken
        if (time_taken) {
            normalizedAnswer.time_taken = time_taken;
        }
        
        const result = await Question.validateAnswer(req.params.id, normalizedAnswer);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error validating answer:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// PUT /api/questions/:id - Update question
// Usage Example:
// PUT /api/questions/123e4567-e89b-12d3-a456-426614174000
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body: {
//   "difficulty": 3,
//   "points": 15,
//   "time_limit": 90,
//   "category_id": 6,  // Optional - update category
//   "status": "public",  // Optional - change visibility
//   "content": {
//     "question_text": "Updated question text",
//     "options": [...]
//   }
// }
// ============================================
router.put('/:id', checkJwt, async (req, res) => {
    try {
        const updated = await Question.update(req.params.id, req.body);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            data: updated,
            message: 'Question updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// DELETE /api/questions/:id - Delete question (soft delete)
// Usage Example:
// DELETE /api/questions/123e4567-e89b-12d3-a456-426614174000
// Headers: Authorization: Bearer <JWT_TOKEN>
// Note: This is a soft delete (sets is_active = false)
// ============================================
router.delete('/:id', checkJwt, async (req, res) => {
    try {
        const deleted = await Question.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
