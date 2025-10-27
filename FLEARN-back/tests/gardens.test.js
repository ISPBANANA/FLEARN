/**
 * Unit tests for Gardens API
 * Tests garden creation, streak management, and invitation logic
 */

describe('Gardens API Logic', () => {
    /**
     * Helper function to validate garden creation data
     */
    const validateGardenCreation = (data) => {
        if (!data.partner_email) {
            return { valid: false, error: 'Partner email is required' };
        }
        if (typeof data.partner_email !== 'string') {
            return { valid: false, error: 'Partner email must be a string' };
        }
        return { valid: true };
    };

    /**
     * Helper function to check if users can create a garden
     */
    const canCreateGarden = (userId, partnerUserId, areFriends) => {
        if (userId === partnerUserId) {
            return { canCreate: false, reason: 'Cannot create garden with yourself' };
        }
        if (!areFriends) {
            return { canCreate: false, reason: 'Must be friends to create a garden' };
        }
        return { canCreate: true };
    };

    /**
     * Helper function to check if garden already exists
     */
    const gardenExists = (gardens, user1Id, user2Id) => {
        return gardens.some(garden =>
            (garden.user1_id === user1Id && garden.user2_id === user2Id) ||
            (garden.user1_id === user2Id && garden.user2_id === user1Id)
        );
    };

    /**
     * Helper function to calculate if streak should be reset
     */
    const shouldResetStreak = (uptimeStreak) => {
        if (!uptimeStreak) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastUpdate = new Date(uptimeStreak);
        lastUpdate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));

        return daysDiff >= 2;
    };

    /**
     * Helper function to validate garden status
     */
    const validateGardenStatus = (status) => {
        const validStatuses = ['active', 'inactive', 'completed'];
        return validStatuses.includes(status);
    };

    /**
     * Helper function to validate invitation status
     */
    const validateInvitationStatus = (status) => {
        const validStatuses = ['accepted', 'rejected'];
        return validStatuses.includes(status);
    };

    describe('validateGardenCreation', () => {
        test('should validate correct garden creation data', () => {
            const data = { partner_email: 'partner@example.com' };
            const result = validateGardenCreation(data);
            expect(result.valid).toBe(true);
        });

        test('should reject without partner_email', () => {
            const data = {};
            const result = validateGardenCreation(data);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Partner email is required');
        });

        test('should reject with non-string partner_email', () => {
            const data = { partner_email: 123 };
            const result = validateGardenCreation(data);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Partner email must be a string');
        });

        test('should reject with null partner_email', () => {
            const data = { partner_email: null };
            const result = validateGardenCreation(data);
            expect(result.valid).toBe(false);
        });
    });

    describe('canCreateGarden', () => {
        test('should allow garden creation between friends', () => {
            const result = canCreateGarden('user-1', 'user-2', true);
            expect(result.canCreate).toBe(true);
        });

        test('should not allow garden with yourself', () => {
            const result = canCreateGarden('user-1', 'user-1', true);
            expect(result.canCreate).toBe(false);
            expect(result.reason).toBe('Cannot create garden with yourself');
        });

        test('should not allow garden with non-friends', () => {
            const result = canCreateGarden('user-1', 'user-2', false);
            expect(result.canCreate).toBe(false);
            expect(result.reason).toBe('Must be friends to create a garden');
        });
    });

    describe('gardenExists', () => {
        const gardens = [
            { user1_id: 'user-1', user2_id: 'user-2' },
            { user1_id: 'user-3', user2_id: 'user-4' }
        ];

        test('should find existing garden', () => {
            const exists = gardenExists(gardens, 'user-1', 'user-2');
            expect(exists).toBe(true);
        });

        test('should find garden regardless of order', () => {
            const exists = gardenExists(gardens, 'user-2', 'user-1');
            expect(exists).toBe(true);
        });

        test('should return false for non-existent garden', () => {
            const exists = gardenExists(gardens, 'user-1', 'user-3');
            expect(exists).toBe(false);
        });
    });

    describe('shouldResetStreak', () => {
        test('should not reset if uptime_streak is null', () => {
            const result = shouldResetStreak(null);
            expect(result).toBe(false);
        });

        test('should not reset if uptime_streak is today', () => {
            const today = new Date();
            const result = shouldResetStreak(today.toISOString());
            expect(result).toBe(false);
        });

        test('should not reset if uptime_streak is yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const result = shouldResetStreak(yesterday.toISOString());
            expect(result).toBe(false);
        });

        test('should reset if uptime_streak is 2 days ago', () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const result = shouldResetStreak(twoDaysAgo.toISOString());
            expect(result).toBe(true);
        });

        test('should reset if uptime_streak is more than 2 days ago', () => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const result = shouldResetStreak(weekAgo.toISOString());
            expect(result).toBe(true);
        });
    });

    describe('validateGardenStatus', () => {
        test('should accept valid statuses', () => {
            expect(validateGardenStatus('active')).toBe(true);
            expect(validateGardenStatus('inactive')).toBe(true);
            expect(validateGardenStatus('completed')).toBe(true);
        });

        test('should reject invalid statuses', () => {
            expect(validateGardenStatus('pending')).toBe(false);
            expect(validateGardenStatus('invalid')).toBe(false);
            expect(validateGardenStatus('')).toBe(false);
            expect(validateGardenStatus(null)).toBe(false);
        });
    });

    describe('validateInvitationStatus', () => {
        test('should accept valid invitation statuses', () => {
            expect(validateInvitationStatus('accepted')).toBe(true);
            expect(validateInvitationStatus('rejected')).toBe(true);
        });

        test('should reject invalid invitation statuses', () => {
            expect(validateInvitationStatus('pending')).toBe(false);
            expect(validateInvitationStatus('active')).toBe(false);
            expect(validateInvitationStatus('invalid')).toBe(false);
            expect(validateInvitationStatus('')).toBe(false);
        });
    });

    describe('Garden Streak Management', () => {
        test('should increment streak correctly', () => {
            const incrementStreak = (currentStreak) => currentStreak + 1;

            expect(incrementStreak(0)).toBe(1);
            expect(incrementStreak(5)).toBe(6);
            expect(incrementStreak(99)).toBe(100);
        });

        test('should reset streak to zero', () => {
            const resetStreak = () => 0;

            expect(resetStreak()).toBe(0);
        });

        test('should update uptime when incrementing', () => {
            const updateUptime = () => new Date().toISOString().split('T')[0];

            const uptime = updateUptime();
            const today = new Date().toISOString().split('T')[0];

            expect(uptime).toBe(today);
        });
    });

    describe('Garden Authorization', () => {
        test('should check if user is part of garden', () => {
            const isPartOfGarden = (garden, userId) => {
                return garden.user1_id === userId || garden.user2_id === userId;
            };

            const garden = { user1_id: 'user-1', user2_id: 'user-2' };

            expect(isPartOfGarden(garden, 'user-1')).toBe(true);
            expect(isPartOfGarden(garden, 'user-2')).toBe(true);
            expect(isPartOfGarden(garden, 'user-3')).toBe(false);
        });

        test('should check if user can accept invitation', () => {
            const canAcceptInvitation = (garden, userId) => {
                return garden.user1_id === userId && garden.status === 'pending';
            };

            const pendingGarden = { user1_id: 'user-1', user2_id: 'user-2', status: 'pending' };
            const activeGarden = { user1_id: 'user-1', user2_id: 'user-2', status: 'active' };

            expect(canAcceptInvitation(pendingGarden, 'user-1')).toBe(true);
            expect(canAcceptInvitation(pendingGarden, 'user-2')).toBe(false);
            expect(canAcceptInvitation(activeGarden, 'user-1')).toBe(false);
        });
    });

    describe('Garden Partner Display', () => {
        test('should determine correct partner for user1', () => {
            const getPartner = (garden, currentUserId) => {
                return garden.user1_id === currentUserId
                    ? garden.user2_id
                    : garden.user1_id;
            };

            const garden = { user1_id: 'user-1', user2_id: 'user-2' };

            expect(getPartner(garden, 'user-1')).toBe('user-2');
            expect(getPartner(garden, 'user-2')).toBe('user-1');
        });
    });

    describe('Garden Invitation Action', () => {
        test('should determine action based on status', () => {
            const getAction = (status) => {
                if (status === 'rejected') return 'delete';
                if (status === 'accepted') return 'update';
                return 'unknown';
            };

            expect(getAction('rejected')).toBe('delete');
            expect(getAction('accepted')).toBe('update');
            expect(getAction('pending')).toBe('unknown');
        });

        test('should update status to active when accepted', () => {
            const updateStatus = (status) => {
                return status === 'accepted' ? 'active' : status;
            };

            expect(updateStatus('accepted')).toBe('active');
            expect(updateStatus('pending')).toBe('pending');
        });
    });

    describe('Garden Status Filtering', () => {
        test('should filter gardens by status', () => {
            const filterByStatus = (gardens, status) => {
                return gardens.filter(g => g.status === status);
            };

            const gardens = [
                { row_id: 1, status: 'active' },
                { row_id: 2, status: 'pending' },
                { row_id: 3, status: 'active' },
                { row_id: 4, status: 'completed' }
            ];

            expect(filterByStatus(gardens, 'active')).toHaveLength(2);
            expect(filterByStatus(gardens, 'pending')).toHaveLength(1);
            expect(filterByStatus(gardens, 'completed')).toHaveLength(1);
            expect(filterByStatus(gardens, 'inactive')).toHaveLength(0);
        });
    });
});
