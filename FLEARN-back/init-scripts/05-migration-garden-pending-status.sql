-- Migration: Add 'pending' status to garden table
-- This allows garden invitations to work similar to friend requests

-- Drop the existing check constraint
ALTER TABLE garden DROP CONSTRAINT garden_status_check;

-- Add the new check constraint with 'pending' status included
ALTER TABLE garden ADD CONSTRAINT garden_status_check 
    CHECK (status IN ('pending', 'active', 'inactive', 'completed'));

-- Update default status to 'pending' for new garden invitations
-- (This doesn't change existing behavior as we explicitly set status in code)