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

-- Category table for organizing questions
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO category (name, description, parent_category_id) VALUES
    ('STEM', 'Science, Technology, Engineering, Mathematics', NULL),
    ('Languages', 'Language learning and literature', NULL),
    ('Arts', 'Creative and performing arts', NULL),
    ('Social Sciences', 'History, geography, and social studies', NULL);

-- Insert subcategories
INSERT INTO category (name, description, parent_category_id) VALUES
    ('Mathematics', 'Mathematics and problem solving', (SELECT category_id FROM category WHERE name = 'STEM')),
    ('Physics', 'Physics and mechanics', (SELECT category_id FROM category WHERE name = 'STEM')),
    ('Biology', 'Life sciences and biology', (SELECT category_id FROM category WHERE name = 'STEM')),
    ('Chemistry', 'Chemistry and chemical reactions', (SELECT category_id FROM category WHERE name = 'STEM'));

-- Subject table for organizing questions by subject
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subject (name, category_id, description) VALUES
    ('Mathematics', (SELECT category_id FROM category WHERE name = 'Mathematics'), 'Mathematics and problem solving'),
    ('Physics', (SELECT category_id FROM category WHERE name = 'Physics'), 'Physics and mechanics'),
    ('Biology', (SELECT category_id FROM category WHERE name = 'Biology'), 'Life sciences and biology'),
    ('Chemistry', (SELECT category_id FROM category WHERE name = 'Chemistry'), 'Chemistry and chemical reactions');

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
    ('fill_blank', 'Fill in the blank(s)'),
    ('matching', 'Match items from two lists');

-- Main questions table (metadata stored in PostgreSQL, content in MongoDB)
CREATE TABLE question (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id INT REFERENCES subject(subject_id) ON DELETE CASCADE,
    category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
    mongo_content_id VARCHAR(24) NOT NULL,  -- Reference to MongoDB document _id
    type_id INT REFERENCES question_type(type_id),
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    points INT DEFAULT 10,
    time_limit INT,  -- Time limit in seconds
    status TEXT DEFAULT 'private' CHECK (status IN ('private', 'public')),
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Add comments to document the columns
COMMENT ON COLUMN question.mongo_content_id IS 'MongoDB ObjectId reference to question_contents collection';
COMMENT ON COLUMN question.difficulty IS 'Question difficulty level from 1 (easiest) to 5 (hardest)';
COMMENT ON COLUMN question.time_limit IS 'Time limit for answering the question in seconds';
COMMENT ON COLUMN question.status IS 'Question visibility: private (only creator can see) or public (visible to all)';
COMMENT ON COLUMN question.category_id IS 'Category for additional organization and filtering';

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
CREATE INDEX idx_question_category_id ON question(category_id);
CREATE INDEX idx_question_type_id ON question(type_id);
CREATE INDEX idx_question_difficulty ON question(difficulty);
CREATE INDEX idx_question_status ON question(status);
CREATE INDEX idx_question_is_active ON question(is_active);
CREATE INDEX idx_question_created_by ON question(created_by);
CREATE INDEX idx_subject_name ON subject(name);
CREATE INDEX idx_subject_category_id ON subject(category_id);
CREATE INDEX idx_category_name ON category(name);
CREATE INDEX idx_category_parent ON category(parent_category_id);

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

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category
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

-- Migration: Add Category Table and Update Question Table
DO $$
BEGIN
    -- Check if category table already exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'category') THEN
        
        -- Create category table if it doesn't exist
        CREATE TABLE category (
            category_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            parent_category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default categories
        INSERT INTO category (name, description, parent_category_id) VALUES
            ('STEM', 'Science, Technology, Engineering, Mathematics', NULL),
            ('Languages', 'Language learning and literature', NULL),
            ('Arts', 'Creative and performing arts', NULL),
            ('Social Sciences', 'History, geography, and social studies', NULL);
        
        -- Insert subcategories
        INSERT INTO category (name, description, parent_category_id) VALUES
            ('Mathematics', 'Mathematics and problem solving', (SELECT category_id FROM category WHERE name = 'STEM')),
            ('Physics', 'Physics and mechanics', (SELECT category_id FROM category WHERE name = 'STEM')),
            ('Biology', 'Life sciences and biology', (SELECT category_id FROM category WHERE name = 'STEM')),
            ('Chemistry', 'Chemistry and chemical reactions', (SELECT category_id FROM category WHERE name = 'STEM'));
        
        -- Create indexes
        CREATE INDEX idx_category_name ON category(name);
        CREATE INDEX idx_category_parent ON category(parent_category_id);
        
        -- Create trigger for updated_at
        CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Successfully created category table';
    ELSE
        RAISE NOTICE 'Category table already exists';
    END IF;
    
    -- Add category_id to subject table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subject' AND column_name = 'category_id') THEN
        
        -- Add category_id column to subject table
        ALTER TABLE subject ADD COLUMN category_id INT REFERENCES category(category_id) ON DELETE SET NULL;
        
        -- Update existing subjects with category_id based on their names
        UPDATE subject SET category_id = (SELECT category_id FROM category WHERE category.name = subject.name);
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_subject_category_id ON subject(category_id);
        
        -- Remove old category column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subject' AND column_name = 'category') THEN
            ALTER TABLE subject DROP COLUMN category;
        END IF;
        
        RAISE NOTICE 'Successfully added category_id to subject table';
    ELSE
        RAISE NOTICE 'Subject table already has category_id column';
    END IF;
    
    -- Add category_id to question table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'question' AND column_name = 'category_id') THEN
        
        ALTER TABLE question ADD COLUMN category_id INT REFERENCES category(category_id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_question_category_id ON question(category_id);
        
        RAISE NOTICE 'Successfully added category_id to question table';
    ELSE
        RAISE NOTICE 'Question table already has category_id column';
    END IF;
    
    -- Add status column to question table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'question' AND column_name = 'status') THEN
        
        ALTER TABLE question ADD COLUMN status TEXT DEFAULT 'private' CHECK (status IN ('private', 'public'));
        CREATE INDEX IF NOT EXISTS idx_question_status ON question(status);
        
        RAISE NOTICE 'Successfully added status column to question table';
    ELSE
        RAISE NOTICE 'Question table already has status column';
    END IF;
END $$;
