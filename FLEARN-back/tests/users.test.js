/**
 * Unit tests for Users API
 * Tests user profile management, experience tracking, and leaderboard logic
 */

describe('Users API Logic', () => {
    /**
     * Helper function to validate profile data
     */
    const validateProfileData = (data) => {
        const errors = [];
        
        if (!data.name) errors.push('Name is required');
        if (!data.email) errors.push('Email is required');
        if (data.email && !isValidEmail(data.email)) errors.push('Invalid email format');
        
        return {
            valid: errors.length === 0,
            errors
        };
    };

    /**
     * Helper function to validate email format
     */
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    /**
     * Helper function to validate subject name
     */
    const isValidSubject = (subject) => {
        const validSubjects = ['Mathematics', 'Physics', 'Biology', 'Chemistry'];
        return validSubjects.includes(subject);
    };

    /**
     * Helper function to calculate rank based on experience
     */
    const calculateRank = (totalExp) => {
        if (totalExp >= 10000) return 'Expert';
        if (totalExp >= 5000) return 'Advanced';
        if (totalExp >= 2000) return 'Intermediate';
        if (totalExp >= 500) return 'Novice';
        return 'Beginner';
    };

    /**
     * Helper function to calculate total experience
     */
    const calculateTotalExp = (mathExp, phyExp, bioExp, chemExp) => {
        return (mathExp || 0) + (phyExp || 0) + (bioExp || 0) + (chemExp || 0);
    };

    /**
     * Helper function to update subject experience
     */
    const updateSubjectExp = (currentExp, additionalExp) => {
        return (currentExp || 0) + additionalExp;
    };

    /**
     * Helper function to validate user role
     */
    const isValidRole = (role) => {
        const validRoles = ['user', 'teacher', 'admin'];
        return validRoles.includes(role);
    };

    /**
     * Helper function to filter users by role
     */
    const filterByRole = (users, role) => {
        if (!role) return users;
        return users.filter(user => user.role === role);
    };

    describe('validateProfileData', () => {
        test('should validate correct profile data', () => {
            const data = {
                name: 'John Doe',
                email: 'john@example.com',
                birthdate: '1995-05-15',
                edu_level: 'University'
            };
            const result = validateProfileData(data);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject profile without name', () => {
            const data = { email: 'john@example.com' };
            const result = validateProfileData(data);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Name is required');
        });

        test('should reject profile without email', () => {
            const data = { name: 'John Doe' };
            const result = validateProfileData(data);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Email is required');
        });

        test('should reject invalid email format', () => {
            const data = {
                name: 'John Doe',
                email: 'invalid-email'
            };
            const result = validateProfileData(data);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid email format');
        });
    });

    describe('isValidEmail', () => {
        test('should validate correct email formats', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.com')).toBe(true);
        });

        test('should reject invalid email formats', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('user @example.com')).toBe(false);
        });
    });

    describe('isValidSubject', () => {
        test('should validate correct subjects', () => {
            expect(isValidSubject('Mathematics')).toBe(true);
            expect(isValidSubject('Physics')).toBe(true);
            expect(isValidSubject('Biology')).toBe(true);
            expect(isValidSubject('Chemistry')).toBe(true);
        });

        test('should reject invalid subjects', () => {
            expect(isValidSubject('History')).toBe(false);
            expect(isValidSubject('mathematics')).toBe(false); // case sensitive
            expect(isValidSubject('')).toBe(false);
            expect(isValidSubject(null)).toBe(false);
        });
    });

    describe('calculateRank', () => {
        test('should return Beginner for low experience', () => {
            expect(calculateRank(0)).toBe('Beginner');
            expect(calculateRank(100)).toBe('Beginner');
            expect(calculateRank(499)).toBe('Beginner');
        });

        test('should return Novice for 500-1999 exp', () => {
            expect(calculateRank(500)).toBe('Novice');
            expect(calculateRank(1000)).toBe('Novice');
            expect(calculateRank(1999)).toBe('Novice');
        });

        test('should return Intermediate for 2000-4999 exp', () => {
            expect(calculateRank(2000)).toBe('Intermediate');
            expect(calculateRank(3000)).toBe('Intermediate');
            expect(calculateRank(4999)).toBe('Intermediate');
        });

        test('should return Advanced for 5000-9999 exp', () => {
            expect(calculateRank(5000)).toBe('Advanced');
            expect(calculateRank(7500)).toBe('Advanced');
            expect(calculateRank(9999)).toBe('Advanced');
        });

        test('should return Expert for 10000+ exp', () => {
            expect(calculateRank(10000)).toBe('Expert');
            expect(calculateRank(15000)).toBe('Expert');
            expect(calculateRank(100000)).toBe('Expert');
        });
    });

    describe('calculateTotalExp', () => {
        test('should sum all subject experiences', () => {
            expect(calculateTotalExp(100, 200, 300, 400)).toBe(1000);
        });

        test('should handle zero values', () => {
            expect(calculateTotalExp(0, 0, 0, 0)).toBe(0);
        });

        test('should handle null/undefined values', () => {
            expect(calculateTotalExp(100, null, undefined, 200)).toBe(300);
        });

        test('should handle mixed values', () => {
            expect(calculateTotalExp(500, 0, 250, null)).toBe(750);
        });
    });

    describe('updateSubjectExp', () => {
        test('should add experience correctly', () => {
            expect(updateSubjectExp(100, 50)).toBe(150);
            expect(updateSubjectExp(0, 100)).toBe(100);
        });

        test('should handle null current experience', () => {
            expect(updateSubjectExp(null, 50)).toBe(50);
            expect(updateSubjectExp(undefined, 100)).toBe(100);
        });

        test('should handle large numbers', () => {
            expect(updateSubjectExp(9999, 1)).toBe(10000);
        });
    });

    describe('isValidRole', () => {
        test('should validate correct roles', () => {
            expect(isValidRole('user')).toBe(true);
            expect(isValidRole('teacher')).toBe(true);
            expect(isValidRole('admin')).toBe(true);
        });

        test('should reject invalid roles', () => {
            expect(isValidRole('superadmin')).toBe(false);
            expect(isValidRole('User')).toBe(false); // case sensitive
            expect(isValidRole('')).toBe(false);
            expect(isValidRole(null)).toBe(false);
        });
    });

    describe('filterByRole', () => {
        const users = [
            { name: 'User 1', role: 'user' },
            { name: 'Teacher 1', role: 'teacher' },
            { name: 'Admin 1', role: 'admin' },
            { name: 'User 2', role: 'user' }
        ];

        test('should filter users by role', () => {
            expect(filterByRole(users, 'user')).toHaveLength(2);
            expect(filterByRole(users, 'teacher')).toHaveLength(1);
            expect(filterByRole(users, 'admin')).toHaveLength(1);
        });

        test('should return all users when no role specified', () => {
            expect(filterByRole(users, null)).toHaveLength(4);
            expect(filterByRole(users, undefined)).toHaveLength(4);
        });

        test('should return empty array for non-existent role', () => {
            expect(filterByRole(users, 'superadmin')).toHaveLength(0);
        });
    });

    describe('Leaderboard Sorting', () => {
        test('should sort users by total experience descending', () => {
            const sortByTotalExp = (users) => {
                return [...users].sort((a, b) => {
                    const totalA = calculateTotalExp(a.math_exp, a.phy_exp, a.bio_exp, a.chem_exp);
                    const totalB = calculateTotalExp(b.math_exp, b.phy_exp, b.bio_exp, b.chem_exp);
                    return totalB - totalA;
                });
            };

            const users = [
                { name: 'User 1', math_exp: 100, phy_exp: 50, bio_exp: 0, chem_exp: 0 },
                { name: 'User 2', math_exp: 200, phy_exp: 100, bio_exp: 100, chem_exp: 0 },
                { name: 'User 3', math_exp: 50, phy_exp: 25, bio_exp: 0, chem_exp: 0 }
            ];

            const sorted = sortByTotalExp(users);

            expect(sorted[0].name).toBe('User 2'); // 400 total
            expect(sorted[1].name).toBe('User 1'); // 150 total
            expect(sorted[2].name).toBe('User 3'); // 75 total
        });

        test('should sort by subject-specific experience', () => {
            const sortBySubjectExp = (users, subject) => {
                // Map subject names to database field names
                const subjectFieldMap = {
                    'Mathematics': 'math_exp',
                    'Physics': 'phy_exp',
                    'Biology': 'bio_exp',
                    'Chemistry': 'chem_exp'
                };
                const expField = subjectFieldMap[subject] || 'math_exp';
                return [...users].sort((a, b) => (b[expField] || 0) - (a[expField] || 0));
            };

            const users = [
                { name: 'User 1', math_exp: 100 },
                { name: 'User 2', math_exp: 500 },
                { name: 'User 3', math_exp: 250 }
            ];

            const sorted = sortBySubjectExp(users, 'Mathematics');

            expect(sorted[0].name).toBe('User 2');
            expect(sorted[1].name).toBe('User 3');
            expect(sorted[2].name).toBe('User 1');
        });
    });

    describe('Daily Experience Reset', () => {
        test('should determine if daily exp should be shown', () => {
            const shouldShowDailyExp = (updatedAt) => {
                if (!updatedAt) return false;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const updateDate = new Date(updatedAt);
                updateDate.setHours(0, 0, 0, 0);

                return updateDate.getTime() === today.getTime();
            };

            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            expect(shouldShowDailyExp(today.toISOString())).toBe(true);
            expect(shouldShowDailyExp(yesterday.toISOString())).toBe(false);
            expect(shouldShowDailyExp(null)).toBe(false);
        });
    });

    describe('Search Functionality', () => {
        test('should filter users by name or email', () => {
            const searchUsers = (users, query) => {
                const lowerQuery = query.toLowerCase();
                return users.filter(user =>
                    user.name.toLowerCase().includes(lowerQuery) ||
                    user.email.toLowerCase().includes(lowerQuery)
                );
            };

            const users = [
                { name: 'John Doe', email: 'john@example.com' },
                { name: 'Jane Smith', email: 'jane@example.com' },
                { name: 'Bob Johnson', email: 'bob@test.com' }
            ];

            expect(searchUsers(users, 'john')).toHaveLength(2);
            expect(searchUsers(users, 'jane')).toHaveLength(1);
            expect(searchUsers(users, 'example')).toHaveLength(2);
            expect(searchUsers(users, 'xyz')).toHaveLength(0);
        });

        test('should be case insensitive', () => {
            const searchUsers = (users, query) => {
                const lowerQuery = query.toLowerCase();
                return users.filter(user =>
                    user.name.toLowerCase().includes(lowerQuery)
                );
            };

            const users = [{ name: 'John Doe', email: 'john@example.com' }];

            expect(searchUsers(users, 'JOHN')).toHaveLength(1);
            expect(searchUsers(users, 'john')).toHaveLength(1);
            expect(searchUsers(users, 'JoHn')).toHaveLength(1);
        });
    });

    describe('Preferred Subjects Management', () => {
        test('should check for duplicate preferences', () => {
            const hasDuplicatePreference = (preferences, subject) => {
                return preferences.some(pref => pref.subject === subject);
            };

            const preferences = [
                { subject: 'Mathematics' },
                { subject: 'Physics' }
            ];

            expect(hasDuplicatePreference(preferences, 'Mathematics')).toBe(true);
            expect(hasDuplicatePreference(preferences, 'Biology')).toBe(false);
        });

        test('should validate subject list', () => {
            const validateSubjectList = (subjects) => {
                if (!Array.isArray(subjects)) return false;
                if (subjects.length === 0) return false;
                return subjects.every(s => isValidSubject(s));
            };

            expect(validateSubjectList(['Mathematics', 'Physics'])).toBe(true);
            expect(validateSubjectList(['Mathematics', 'InvalidSubject'])).toBe(false);
            expect(validateSubjectList([])).toBe(false);
            expect(validateSubjectList('Mathematics')).toBe(false);
        });
    });
});
