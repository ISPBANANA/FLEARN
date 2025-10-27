/**
 * Unit tests for Topics API
 * Tests topic creation, validation, and management
 */

describe('Topics API Logic', () => {
    /**
     * Helper function to validate topic data
     */
    const validateTopicData = (data) => {
        if (!data.subject_id) {
            return { valid: false, error: 'subject_id is required' };
        }
        if (!data.name) {
            return { valid: false, error: 'name is required' };
        }
        if (data.status && !['private', 'public'].includes(data.status)) {
            return { valid: false, error: 'status must be either "private" or "public"' };
        }
        return { valid: true };
    };

    /**
     * Helper function to check for duplicate topic names
     */
    const isDuplicateTopic = (existingTopics, subjectId, topicName) => {
        return existingTopics.some(topic => 
            topic.subject_id === subjectId && 
            topic.name.toLowerCase() === topicName.toLowerCase()
        );
    };

    /**
     * Helper function to filter topics by status
     */
    const filterTopicsByStatus = (topics, status) => {
        return topics.filter(topic => topic.status === status);
    };

    /**
     * Helper function to filter topics by subject
     */
    const filterTopicsBySubject = (topics, subjectId) => {
        return topics.filter(topic => topic.subject_id === subjectId);
    };

    /**
     * Helper function to calculate topic statistics
     */
    const calculateTopicStatistics = (questions) => {
        if (!questions || questions.length === 0) {
            return {
                total_questions: 0,
                avg_difficulty: 0,
                difficulty_distribution: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                }
            };
        }

        const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard' };
        const distribution = questions.reduce((acc, q) => {
            const level = difficultyMap[q.difficulty] || 'medium';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, { easy: 0, medium: 0, hard: 0 });

        const avgDifficulty = questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length;

        return {
            total_questions: questions.length,
            avg_difficulty: Math.round(avgDifficulty * 100) / 100,
            difficulty_distribution: distribution
        };
    };

    describe('validateTopicData', () => {
        test('should validate correct topic data', () => {
            const data = {
                subject_id: 1,
                name: 'Calculus',
                description: 'Advanced calculus',
                status: 'public'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(true);
        });

        test('should reject topic without subject_id', () => {
            const data = {
                name: 'Calculus'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('subject_id is required');
        });

        test('should reject topic without name', () => {
            const data = {
                subject_id: 1
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('name is required');
        });

        test('should reject topic with invalid status', () => {
            const data = {
                subject_id: 1,
                name: 'Calculus',
                status: 'invalid'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('status must be either "private" or "public"');
        });

        test('should accept topic without status (optional)', () => {
            const data = {
                subject_id: 1,
                name: 'Calculus'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(true);
        });

        test('should accept topic with valid status "private"', () => {
            const data = {
                subject_id: 1,
                name: 'Calculus',
                status: 'private'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(true);
        });

        test('should accept topic with valid status "public"', () => {
            const data = {
                subject_id: 1,
                name: 'Calculus',
                status: 'public'
            };
            const result = validateTopicData(data);
            expect(result.valid).toBe(true);
        });
    });

    describe('isDuplicateTopic', () => {
        const existingTopics = [
            { topic_id: 1, subject_id: 1, name: 'Calculus - Integration' },
            { topic_id: 2, subject_id: 1, name: 'Algebra - Linear Equations' },
            { topic_id: 3, subject_id: 2, name: 'Mechanics - Forces' }
        ];

        test('should detect duplicate topic name in same subject', () => {
            const result = isDuplicateTopic(existingTopics, 1, 'Calculus - Integration');
            expect(result).toBe(true);
        });

        test('should detect duplicate with different case', () => {
            const result = isDuplicateTopic(existingTopics, 1, 'CALCULUS - INTEGRATION');
            expect(result).toBe(true);
        });

        test('should allow same name in different subject', () => {
            const result = isDuplicateTopic(existingTopics, 3, 'Calculus - Integration');
            expect(result).toBe(false);
        });

        test('should allow new unique topic name', () => {
            const result = isDuplicateTopic(existingTopics, 1, 'Calculus - Differentiation');
            expect(result).toBe(false);
        });
    });

    describe('filterTopicsByStatus', () => {
        const topics = [
            { topic_id: 1, name: 'Topic 1', status: 'public' },
            { topic_id: 2, name: 'Topic 2', status: 'private' },
            { topic_id: 3, name: 'Topic 3', status: 'public' },
            { topic_id: 4, name: 'Topic 4', status: 'private' }
        ];

        test('should filter public topics', () => {
            const result = filterTopicsByStatus(topics, 'public');
            expect(result).toHaveLength(2);
            expect(result.every(t => t.status === 'public')).toBe(true);
        });

        test('should filter private topics', () => {
            const result = filterTopicsByStatus(topics, 'private');
            expect(result).toHaveLength(2);
            expect(result.every(t => t.status === 'private')).toBe(true);
        });

        test('should return empty array for non-existent status', () => {
            const result = filterTopicsByStatus(topics, 'archived');
            expect(result).toHaveLength(0);
        });
    });

    describe('filterTopicsBySubject', () => {
        const topics = [
            { topic_id: 1, subject_id: 1, name: 'Math Topic 1' },
            { topic_id: 2, subject_id: 1, name: 'Math Topic 2' },
            { topic_id: 3, subject_id: 2, name: 'Physics Topic 1' },
            { topic_id: 4, subject_id: 2, name: 'Physics Topic 2' }
        ];

        test('should filter topics by subject_id 1', () => {
            const result = filterTopicsBySubject(topics, 1);
            expect(result).toHaveLength(2);
            expect(result.every(t => t.subject_id === 1)).toBe(true);
        });

        test('should filter topics by subject_id 2', () => {
            const result = filterTopicsBySubject(topics, 2);
            expect(result).toHaveLength(2);
            expect(result.every(t => t.subject_id === 2)).toBe(true);
        });

        test('should return empty array for non-existent subject', () => {
            const result = filterTopicsBySubject(topics, 99);
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateTopicStatistics', () => {
        test('should calculate statistics for multiple questions', () => {
            const questions = [
                { difficulty: 1 }, // easy
                { difficulty: 2 }, // medium
                { difficulty: 2 }, // medium
                { difficulty: 3 }  // hard
            ];

            const stats = calculateTopicStatistics(questions);

            expect(stats.total_questions).toBe(4);
            expect(stats.avg_difficulty).toBe(2);
            expect(stats.difficulty_distribution.easy).toBe(1);
            expect(stats.difficulty_distribution.medium).toBe(2);
            expect(stats.difficulty_distribution.hard).toBe(1);
        });

        test('should handle all easy questions', () => {
            const questions = [
                { difficulty: 1 },
                { difficulty: 1 },
                { difficulty: 1 }
            ];

            const stats = calculateTopicStatistics(questions);

            expect(stats.total_questions).toBe(3);
            expect(stats.avg_difficulty).toBe(1);
            expect(stats.difficulty_distribution.easy).toBe(3);
            expect(stats.difficulty_distribution.medium).toBe(0);
            expect(stats.difficulty_distribution.hard).toBe(0);
        });

        test('should handle empty questions array', () => {
            const stats = calculateTopicStatistics([]);

            expect(stats.total_questions).toBe(0);
            expect(stats.avg_difficulty).toBe(0);
            expect(stats.difficulty_distribution.easy).toBe(0);
            expect(stats.difficulty_distribution.medium).toBe(0);
            expect(stats.difficulty_distribution.hard).toBe(0);
        });

        test('should handle null questions', () => {
            const stats = calculateTopicStatistics(null);

            expect(stats.total_questions).toBe(0);
            expect(stats.avg_difficulty).toBe(0);
        });

        test('should round average difficulty to 2 decimal places', () => {
            const questions = [
                { difficulty: 1 },
                { difficulty: 2 },
                { difficulty: 3 }
            ];

            const stats = calculateTopicStatistics(questions);

            expect(stats.avg_difficulty).toBe(2);
        });
    });

    describe('Topic Update Logic', () => {
        test('should merge update data with existing topic', () => {
            const mergeTopicData = (existingTopic, updates) => {
                return {
                    ...existingTopic,
                    ...updates,
                    updated_at: new Date().toISOString()
                };
            };

            const existing = {
                topic_id: 1,
                subject_id: 1,
                name: 'Original Name',
                description: 'Original Description',
                status: 'public'
            };

            const updates = {
                description: 'Updated Description'
            };

            const merged = mergeTopicData(existing, updates);

            expect(merged.name).toBe('Original Name');
            expect(merged.description).toBe('Updated Description');
            expect(merged.status).toBe('public');
        });

        test('should allow updating all fields', () => {
            const mergeTopicData = (existingTopic, updates) => {
                return {
                    ...existingTopic,
                    ...updates
                };
            };

            const existing = {
                topic_id: 1,
                subject_id: 1,
                name: 'Original',
                description: 'Original',
                status: 'public'
            };

            const updates = {
                name: 'Updated',
                description: 'Updated',
                status: 'private'
            };

            const merged = mergeTopicData(existing, updates);

            expect(merged.name).toBe('Updated');
            expect(merged.description).toBe('Updated');
            expect(merged.status).toBe('private');
        });
    });
});
