-- ============================================================================
-- Migration: Add points_earned to backlog table
-- ============================================================================
-- This migration adds a points_earned column to track actual points earned
-- per backlog entry instead of assuming 10 points per correct answer
-- ============================================================================

-- Add points_earned column to backlog table
ALTER TABLE backlog 
ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN backlog.points_earned IS 'Actual points earned for this question attempt (0 if incorrect)';

-- Create index for better query performance when calculating daily exp
CREATE INDEX IF NOT EXISTS idx_backlog_points_earned ON backlog(points_earned);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
