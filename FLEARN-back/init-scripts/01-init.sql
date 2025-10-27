-- ============================================================================
-- FLEARN Database Initialization Script
-- Consolidated schema and migrations
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Base Schema
-- ----------------------------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    profile_pic TEXT,
    name TEXT,
    email TEXT UNIQUE,
    birthdate DATE,
    edu_level TEXT,
    rank TEXT DEFAULT 'Beginner',
    streak INT DEFAULT 0,
    uptime_streak DATE,
    completed_task INT DEFAULT 0,
    daily_exp INT DEFAULT 0,
    math_exp INT DEFAULT 0,
    phy_exp INT DEFAULT 0,
    bio_exp INT DEFAULT 0,
    chem_exp INT DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to document the google_id column
COMMENT ON COLUMN "user".google_id IS 'Google Cloud Identity user ID (migrated from auth0_id)';
COMMENT ON COLUMN "user".role IS 'User role: user (default), teacher, or admin';

CREATE TABLE prefered (
    row_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_subject_preference UNIQUE(user_id, subject)
);

CREATE TABLE friend (
    row_id SERIAL PRIMARY KEY,
    user1_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    user2_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE garden (
    row_id SERIAL PRIMARY KEY,
    user1_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    user2_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'completed')),
    streak INT DEFAULT 0,
    uptime_streak DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- ----------------------------------------------------------------------------
-- Question System Tables
-- ----------------------------------------------------------------------------

-- Subject table for organizing questions by subject
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subject (name, category, description) VALUES
    ('Mathematics', 'STEM', 'Mathematics and problem solving'),
    ('Physics', 'STEM', 'Physics and mechanics'),
    ('Biology', 'STEM', 'Life sciences and biology'),
    ('Chemistry', 'STEM', 'Chemistry and chemical reactions');

-- Question types table
CREATE TABLE question_type (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert question types
INSERT INTO question_type (type_name, description) VALUES
    ('multiple_choice', 'Single correct answer from 2-10 options'),
    ('true_false', 'Binary true or false question'),
    ('multi_select', 'Multiple correct answers'),
    ('essay', 'Free text answer'),
    ('fill_blank', 'Fill in the blank(s)'),
    ('matching', 'Match items from two lists');

-- Main questions table (metadata stored in PostgreSQL, content in MongoDB)
CREATE TABLE question (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id INT REFERENCES subject(subject_id) ON DELETE CASCADE,
    mongo_content_id VARCHAR(24) NOT NULL,  -- Reference to MongoDB document _id
    type_id INT REFERENCES question_type(type_id),
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    points INT DEFAULT 10,
    time_limit INT,  -- Time limit in seconds
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Add comment to document the mongo_content_id column
COMMENT ON COLUMN question.mongo_content_id IS 'MongoDB ObjectId reference to question_contents collection';
COMMENT ON COLUMN question.difficulty IS 'Question difficulty level from 1 (easiest) to 5 (hardest)';
COMMENT ON COLUMN question.time_limit IS 'Time limit for answering the question in seconds';

-- ----------------------------------------------------------------------------
-- Indexes for better query performance
-- ----------------------------------------------------------------------------

CREATE INDEX idx_user_google_id ON "user"(google_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
CREATE INDEX idx_prefered_user_id ON prefered(user_id);
CREATE INDEX idx_prefered_subject ON prefered(subject);
CREATE INDEX idx_friend_user1_id ON friend(user1_id);
CREATE INDEX idx_friend_user2_id ON friend(user2_id);
CREATE INDEX idx_garden_user1_id ON garden(user1_id);
CREATE INDEX idx_garden_user2_id ON garden(user2_id);

-- Question system indexes
CREATE INDEX idx_question_subject_id ON question(subject_id);
CREATE INDEX idx_question_type_id ON question(type_id);
CREATE INDEX idx_question_difficulty ON question(difficulty);
CREATE INDEX idx_question_is_active ON question(is_active);
CREATE INDEX idx_question_created_by ON question(created_by);
CREATE INDEX idx_subject_name ON subject(name);

-- ----------------------------------------------------------------------------
-- Triggers and Functions
-- ----------------------------------------------------------------------------

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_updated_at BEFORE UPDATE ON friend
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_updated_at BEFORE UPDATE ON garden
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_updated_at BEFORE UPDATE ON question
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Migrations (for existing databases)
-- ----------------------------------------------------------------------------

-- Migration: Auth0 to Google Cloud Authentication
DO $$ 
BEGIN
    -- Check if auth0_id column exists before attempting migration
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user' AND column_name = 'auth0_id') THEN
        
        -- Rename the column from auth0_id to google_id
        ALTER TABLE "user" RENAME COLUMN auth0_id TO google_id;
        
        -- Update any existing auth0| prefixed IDs to google| prefixed IDs
        UPDATE "user" SET google_id = REPLACE(google_id, 'auth0|', 'google|') 
        WHERE google_id LIKE 'auth0|%';
        
        -- Drop old index if it exists
        DROP INDEX IF EXISTS idx_user_auth0_id;
        
        -- Create new index for google_id if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_user_google_id ON "user"(google_id);
        
        RAISE NOTICE 'Successfully migrated auth0_id to google_id';
        
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user' AND column_name = 'google_id') THEN
        
        RAISE NOTICE 'Migration already completed - google_id column exists';
        
    ELSE
        RAISE EXCEPTION 'Neither auth0_id nor google_id column found in user table';
    END IF;
END $$;

-- Migration: Preferred Subject Enhancement
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
    -- (Already included in schema above, this is for existing databases)
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
END $$;

-- Migration: User Role Support
DO $$ 
BEGIN
    -- Check if role column already exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'role') THEN
        
        -- Add the role column with default value 'user'
        ALTER TABLE "user" ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'admin'));
        
        -- Set all existing users to 'user' role
        UPDATE "user" SET role = 'user' WHERE role IS NULL;
        
        -- Make the column NOT NULL after setting default values
        ALTER TABLE "user" ALTER COLUMN role SET NOT NULL;
        
        -- Create index for better query performance on role-based queries
        CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
        
        RAISE NOTICE 'Successfully added role column to user table';
        
    ELSE
        RAISE NOTICE 'Migration already completed - role column exists';
    END IF;
END $$;

-- Migration: Garden Status Enhancement
DO $$
BEGIN
    -- Update garden status constraint to include 'pending'
    -- First check if the constraint exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'garden_status_check'
        AND table_name = 'garden'
    ) THEN
        ALTER TABLE garden DROP CONSTRAINT garden_status_check;
        ALTER TABLE garden ADD CONSTRAINT garden_status_check 
            CHECK (status IN ('pending', 'active', 'inactive', 'completed'));
        RAISE NOTICE 'Updated garden status constraint to include pending status';
    ELSE
        RAISE NOTICE 'Garden status constraint already up to date';
    END IF;
END $$;
