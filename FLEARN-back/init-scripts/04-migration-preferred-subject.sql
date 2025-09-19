-- Migration to enhance preferred subjects functionality
-- This script is safe to run multiple times

DO $$ 
BEGIN
    -- Remove preferred_subject column if it was added by mistake
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user' 
        AND column_name = 'preferred_subject'
    ) THEN
        ALTER TABLE "user" DROP COLUMN preferred_subject;
        RAISE NOTICE 'Removed preferred_subject column from user table (using prefered table instead)';
    END IF;
    
    -- Add unique constraint to prevent duplicate subject preferences per user
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_subject_preference'
    ) THEN
        ALTER TABLE prefered ADD CONSTRAINT unique_user_subject_preference UNIQUE (user_id, subject);
        RAISE NOTICE 'Added unique constraint to prevent duplicate subject preferences';
    ELSE
        RAISE NOTICE 'Unique constraint for subject preferences already exists';
    END IF;
    
    -- Add index for better performance on subject queries
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_prefered_subject'
    ) THEN
        CREATE INDEX idx_prefered_subject ON prefered(subject);
        RAISE NOTICE 'Added index on subject column for better performance';
    ELSE
        RAISE NOTICE 'Index on subject column already exists';
    END IF;
    
END $$;