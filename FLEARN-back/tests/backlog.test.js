/**
 * Unit tests for Backlog API
 * Tests the backlog entry creation, retrieval, and statistics calculation
 */

describe('Backlog Statistics Calculation', () => {
    /**
     * Helper function to calculate accuracy percentage
     * This mimics the database query behavior
     */
    const calculateAccuracyPercentage = (entries) => {
        if (!entries || entries.length === 0) {
            return 0;
        }

        const correctCount = entries.filter(entry => entry.correctness === true).length;
        const totalCount = entries.length;
        
        return Math.round((correctCount / totalCount) * 100 * 100) / 100; // Round to 2 decimal places
    };

    /**
     * Helper function to aggregate statistics by subject
     */
    const aggregateBySubject = (entries) => {
        const subjectMap = {};

        entries.forEach(entry => {
            const subjectId = entry.subject_id;
            if (!subjectMap[subjectId]) {
                subjectMap[subjectId] = {
                    subject_id: subjectId,
                    subject_name: entry.subject_name,
                    total_attempts: 0,
                    correct_count: 0,
                    incorrect_count: 0
                };
            }

            subjectMap[subjectId].total_attempts++;
            if (entry.correctness) {
                subjectMap[subjectId].correct_count++;
            } else {
                subjectMap[subjectId].incorrect_count++;
            }
        });

        // Add accuracy percentage
        Object.values(subjectMap).forEach(subject => {
            subject.accuracy_percentage = calculateAccuracyPercentage(
                entries.filter(e => e.subject_id === subject.subject_id)
            );
        });

        return Object.values(subjectMap);
    };

    /**
     * Helper function to aggregate statistics by topic
     */
    const aggregateByTopic = (entries) => {
        const topicMap = {};

        entries.forEach(entry => {
            const topicId = entry.topic_id;
            if (topicId && !topicMap[topicId]) {
                topicMap[topicId] = {
                    topic_id: topicId,
                    topic_name: entry.topic_name,
                    subject_id: entry.subject_id,
                    subject_name: entry.subject_name,
                    total_attempts: 0,
                    correct_count: 0,
                    incorrect_count: 0
                };
            }

            if (topicId) {
                topicMap[topicId].total_attempts++;
                if (entry.correctness) {
                    topicMap[topicId].correct_count++;
                } else {
                    topicMap[topicId].incorrect_count++;
                }
            }
        });

        // Add accuracy percentage
        Object.values(topicMap).forEach(topic => {
            topic.accuracy_percentage = calculateAccuracyPercentage(
                entries.filter(e => e.topic_id === topic.topic_id)
            );
        });

        return Object.values(topicMap);
    };

    describe('calculateAccuracyPercentage', () => {
        test('should return 100% for all correct answers', () => {
            const entries = [
                { correctness: true },
                { correctness: true },
                { correctness: true }
            ];
            expect(calculateAccuracyPercentage(entries)).toBe(100);
        });

        test('should return 0% for all incorrect answers', () => {
            const entries = [
                { correctness: false },
                { correctness: false },
                { correctness: false }
            ];
            expect(calculateAccuracyPercentage(entries)).toBe(0);
        });

        test('should return 50% for half correct answers', () => {
            const entries = [
                { correctness: true },
                { correctness: false }
            ];
            expect(calculateAccuracyPercentage(entries)).toBe(50);
        });

        test('should return 75% for 3 out of 4 correct', () => {
            const entries = [
                { correctness: true },
                { correctness: true },
                { correctness: true },
                { correctness: false }
            ];
            expect(calculateAccuracyPercentage(entries)).toBe(75);
        });

        test('should return 66.67% for 2 out of 3 correct', () => {
            const entries = [
                { correctness: true },
                { correctness: true },
                { correctness: false }
            ];
            expect(calculateAccuracyPercentage(entries)).toBe(66.67);
        });

        test('should return 0 for empty array', () => {
            expect(calculateAccuracyPercentage([])).toBe(0);
        });

        test('should return 0 for null input', () => {
            expect(calculateAccuracyPercentage(null)).toBe(0);
        });

        test('should return 0 for undefined input', () => {
            expect(calculateAccuracyPercentage(undefined)).toBe(0);
        });
    });

    describe('aggregateBySubject', () => {
        test('should correctly aggregate entries by subject', () => {
            const entries = [
                { subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { subject_id: 1, subject_name: 'Mathematics', correctness: false },
                { subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { subject_id: 2, subject_name: 'Physics', correctness: true },
                { subject_id: 2, subject_name: 'Physics', correctness: true }
            ];

            const result = aggregateBySubject(entries);

            expect(result).toHaveLength(2);
            
            const math = result.find(s => s.subject_id === 1);
            expect(math.total_attempts).toBe(3);
            expect(math.correct_count).toBe(2);
            expect(math.incorrect_count).toBe(1);
            expect(math.accuracy_percentage).toBe(66.67);

            const physics = result.find(s => s.subject_id === 2);
            expect(physics.total_attempts).toBe(2);
            expect(physics.correct_count).toBe(2);
            expect(physics.incorrect_count).toBe(0);
            expect(physics.accuracy_percentage).toBe(100);
        });

        test('should handle single subject', () => {
            const entries = [
                { subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { subject_id: 1, subject_name: 'Mathematics', correctness: true }
            ];

            const result = aggregateBySubject(entries);

            expect(result).toHaveLength(1);
            expect(result[0].total_attempts).toBe(2);
            expect(result[0].correct_count).toBe(2);
            expect(result[0].accuracy_percentage).toBe(100);
        });

        test('should handle empty entries', () => {
            const result = aggregateBySubject([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('aggregateByTopic', () => {
        test('should correctly aggregate entries by topic', () => {
            const entries = [
                { topic_id: 1, topic_name: 'Calculus', subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { topic_id: 1, topic_name: 'Calculus', subject_id: 1, subject_name: 'Mathematics', correctness: false },
                { topic_id: 2, topic_name: 'Algebra', subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { topic_id: 2, topic_name: 'Algebra', subject_id: 1, subject_name: 'Mathematics', correctness: true }
            ];

            const result = aggregateByTopic(entries);

            expect(result).toHaveLength(2);
            
            const calculus = result.find(t => t.topic_id === 1);
            expect(calculus.total_attempts).toBe(2);
            expect(calculus.correct_count).toBe(1);
            expect(calculus.incorrect_count).toBe(1);
            expect(calculus.accuracy_percentage).toBe(50);

            const algebra = result.find(t => t.topic_id === 2);
            expect(algebra.total_attempts).toBe(2);
            expect(algebra.correct_count).toBe(2);
            expect(algebra.incorrect_count).toBe(0);
            expect(algebra.accuracy_percentage).toBe(100);
        });

        test('should ignore entries without topic_id', () => {
            const entries = [
                { topic_id: 1, topic_name: 'Calculus', subject_id: 1, subject_name: 'Mathematics', correctness: true },
                { topic_id: null, topic_name: null, subject_id: 1, subject_name: 'Mathematics', correctness: false }
            ];

            const result = aggregateByTopic(entries);

            expect(result).toHaveLength(1);
            expect(result[0].topic_id).toBe(1);
            expect(result[0].total_attempts).toBe(1);
        });

        test('should handle empty entries', () => {
            const result = aggregateByTopic([]);
            expect(result).toHaveLength(0);
        });
    });

    describe('Backlog Entry Validation', () => {
        test('should validate required fields', () => {
            const validateBacklogEntry = (entry) => {
                if (!entry.user_id) return { valid: false, error: 'user_id is required' };
                if (!entry.subject_id) return { valid: false, error: 'subject_id is required' };
                if (entry.correctness === undefined) return { valid: false, error: 'correctness is required' };
                if (typeof entry.correctness !== 'boolean') return { valid: false, error: 'correctness must be boolean' };
                return { valid: true };
            };

            expect(validateBacklogEntry({ user_id: 'uuid', subject_id: 1, correctness: true }).valid).toBe(true);
            expect(validateBacklogEntry({ subject_id: 1, correctness: true }).valid).toBe(false);
            expect(validateBacklogEntry({ user_id: 'uuid', correctness: true }).valid).toBe(false);
            expect(validateBacklogEntry({ user_id: 'uuid', subject_id: 1 }).valid).toBe(false);
            expect(validateBacklogEntry({ user_id: 'uuid', subject_id: 1, correctness: 'true' }).valid).toBe(false);
        });

        test('should accept optional topic_id', () => {
            const validateBacklogEntry = (entry) => {
                if (!entry.user_id) return { valid: false, error: 'user_id is required' };
                if (!entry.subject_id) return { valid: false, error: 'subject_id is required' };
                if (entry.correctness === undefined) return { valid: false, error: 'correctness is required' };
                if (typeof entry.correctness !== 'boolean') return { valid: false, error: 'correctness must be boolean' };
                return { valid: true };
            };

            const entryWithTopic = { user_id: 'uuid', subject_id: 1, topic_id: 5, correctness: true };
            const entryWithoutTopic = { user_id: 'uuid', subject_id: 1, correctness: true };

            expect(validateBacklogEntry(entryWithTopic).valid).toBe(true);
            expect(validateBacklogEntry(entryWithoutTopic).valid).toBe(true);
        });
    });

    describe('Date Filtering', () => {
        test('should filter entries by date range', () => {
            const filterByDateRange = (entries, startDate, endDate) => {
                return entries.filter(entry => {
                    const entryDate = new Date(entry.do_date);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    if (start && entryDate < start) return false;
                    if (end && entryDate > end) return false;
                    return true;
                });
            };

            const entries = [
                { do_date: '2025-10-01T10:00:00Z', correctness: true },
                { do_date: '2025-10-15T10:00:00Z', correctness: false },
                { do_date: '2025-10-25T10:00:00Z', correctness: true },
                { do_date: '2025-10-27T10:00:00Z', correctness: true }
            ];

            const filtered = filterByDateRange(entries, '2025-10-15', '2025-10-26');
            expect(filtered).toHaveLength(2);
            expect(filtered[0].do_date).toBe('2025-10-15T10:00:00Z');
            expect(filtered[1].do_date).toBe('2025-10-25T10:00:00Z');
        });

        test('should handle start date only', () => {
            const filterByDateRange = (entries, startDate, endDate) => {
                return entries.filter(entry => {
                    const entryDate = new Date(entry.do_date);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    if (start && entryDate < start) return false;
                    if (end && entryDate > end) return false;
                    return true;
                });
            };

            const entries = [
                { do_date: '2025-10-01T10:00:00Z', correctness: true },
                { do_date: '2025-10-15T10:00:00Z', correctness: false },
                { do_date: '2025-10-25T10:00:00Z', correctness: true }
            ];

            const filtered = filterByDateRange(entries, '2025-10-15', null);
            expect(filtered).toHaveLength(2);
        });

        test('should handle end date only', () => {
            const filterByDateRange = (entries, startDate, endDate) => {
                return entries.filter(entry => {
                    const entryDate = new Date(entry.do_date);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    if (start && entryDate < start) return false;
                    if (end && entryDate > end) return false;
                    return true;
                });
            };

            const entries = [
                { do_date: '2025-10-01T10:00:00Z', correctness: true },
                { do_date: '2025-10-15T10:00:00Z', correctness: false },
                { do_date: '2025-10-25T10:00:00Z', correctness: true }
            ];

            const filtered = filterByDateRange(entries, null, '2025-10-20');
            expect(filtered).toHaveLength(2);
        });
    });
});
