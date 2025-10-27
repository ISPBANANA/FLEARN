-- ============================================================================
-- FLEARN Database Initialization Script
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- User & Social Tables
-- ----------------------------------------------------------------------------

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

CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE topic (
    topic_id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subject(subject_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'public' CHECK (status IN ('private', 'public')),
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_subject_topic UNIQUE(subject_id, name)
);

CREATE TABLE question_type (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE question (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id INT REFERENCES subject(subject_id) ON DELETE CASCADE,
    topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
    mongo_content_id VARCHAR(24) NOT NULL,
    type_id INT REFERENCES question_type(type_id),
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    points INT DEFAULT 10,
    status TEXT DEFAULT 'private' CHECK (status IN ('private', 'public')),
    created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

COMMENT ON COLUMN question.mongo_content_id IS 'MongoDB ObjectId reference to question_contents collection';
COMMENT ON COLUMN question.difficulty IS 'Question difficulty level from 1 (easiest) to 5 (hardest)';
COMMENT ON COLUMN question.time_limit IS 'Time limit for answering the question in seconds';
COMMENT ON COLUMN question.status IS 'Question visibility: private (only creator can see) or public (visible to all)';

-- ----------------------------------------------------------------------------
-- Default Data
-- ----------------------------------------------------------------------------

-- Insert subjects
INSERT INTO subject (name, description) VALUES
    ('Mathematics', 'Mathematics and problem solving'),
    ('Physics', 'Physics and mechanics'),
    ('Biology', 'Life sciences and biology'),
    ('Chemistry', 'Chemistry and chemical reactions');

-- Insert topics
INSERT INTO topic (subject_id, name, description, status) VALUES
    ((SELECT subject_id FROM subject WHERE name = 'Mathematics'), 'Calculus - L''Hôpital', 'L''Hôpital''s rule and applications', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Mathematics'), 'Algebra - Linear Equations', 'Linear equations and systems', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Mathematics'), 'Geometry - Triangles', 'Triangle properties and theorems', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Physics'), 'Mechanics - Newton''s Laws', 'Newton''s laws of motion', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Physics'), 'Thermodynamics - Heat Transfer', 'Heat transfer and thermodynamic processes', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Biology'), 'Cell Biology - Organelles', 'Cell structure and organelles', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Biology'), 'Genetics - DNA', 'DNA structure and function', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Chemistry'), 'Organic Chemistry - Hydrocarbons', 'Hydrocarbon compounds and reactions', 'public'),
    ((SELECT subject_id FROM subject WHERE name = 'Chemistry'), 'Inorganic Chemistry - Periodic Table', 'Periodic table and element properties', 'public');

-- Insert question types
INSERT INTO question_type (type_name, description) VALUES
    ('multiple_choice', 'Single correct answer from 2-10 options'),
    ('true_false', 'Binary true or false question'),
    ('fill_blank', 'Fill in the blank(s)'),
    ('matching', 'Match items from two lists');

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

-- User indexes
CREATE INDEX idx_user_google_id ON "user"(google_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);

-- Social indexes
CREATE INDEX idx_prefered_user_id ON prefered(user_id);
CREATE INDEX idx_prefered_subject ON prefered(subject);
CREATE INDEX idx_friend_user1_id ON friend(user1_id);
CREATE INDEX idx_friend_user2_id ON friend(user2_id);
CREATE INDEX idx_garden_user1_id ON garden(user1_id);
CREATE INDEX idx_garden_user2_id ON garden(user2_id);

-- Subject indexes
CREATE INDEX idx_subject_name ON subject(name);

-- Topic indexes
CREATE INDEX idx_topic_subject_id ON topic(subject_id);
CREATE INDEX idx_topic_name ON topic(name);
CREATE INDEX idx_topic_status ON topic(status);

-- Question indexes
CREATE INDEX idx_question_subject_id ON question(subject_id);
CREATE INDEX idx_question_topic_id ON question(topic_id);
CREATE INDEX idx_question_type_id ON question(type_id);
CREATE INDEX idx_question_difficulty ON question(difficulty);
CREATE INDEX idx_question_status ON question(status);
CREATE INDEX idx_question_is_active ON question(is_active);
CREATE INDEX idx_question_created_by ON question(created_by);

-- ----------------------------------------------------------------------------
-- Functions & Triggers
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_updated_at BEFORE UPDATE ON friend
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_updated_at BEFORE UPDATE ON garden
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_updated_at BEFORE UPDATE ON question
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_updated_at BEFORE UPDATE ON topic
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Migrations (for existing databases)
-- ----------------------------------------------------------------------------

-- Migration: Auth0 to Google Cloud Authentication
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user' AND column_name = 'auth0_id') THEN
        ALTER TABLE "user" RENAME COLUMN auth0_id TO google_id;
        UPDATE "user" SET google_id = REPLACE(google_id, 'auth0|', 'google|') WHERE google_id LIKE 'auth0|%';
        DROP INDEX IF EXISTS idx_user_auth0_id;
        CREATE INDEX IF NOT EXISTS idx_user_google_id ON "user"(google_id);
        RAISE NOTICE 'Migrated auth0_id to google_id';
    ELSE
        RAISE NOTICE 'Migration skipped - google_id column already exists';
    END IF;
END $$;

-- Migration: User Role Support
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'role') THEN
        ALTER TABLE "user" ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'admin')) NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
        RAISE NOTICE 'Added role column to user table';
    ELSE
        RAISE NOTICE 'Migration skipped - role column already exists';
    END IF;
END $$;

-- Migration: Preferred Subject Enhancement
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user' AND column_name = 'preferred_subject') THEN
        ALTER TABLE "user" DROP COLUMN preferred_subject;
        RAISE NOTICE 'Removed deprecated preferred_subject column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_user_subject_preference') THEN
        ALTER TABLE prefered ADD CONSTRAINT unique_user_subject_preference UNIQUE (user_id, subject);
        RAISE NOTICE 'Added unique constraint to prefered table';
    END IF;
END $$;

-- Migration: Garden Status Enhancement
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'garden_status_check' AND table_name = 'garden') THEN
        ALTER TABLE garden DROP CONSTRAINT garden_status_check;
        ALTER TABLE garden ADD CONSTRAINT garden_status_check 
            CHECK (status IN ('pending', 'active', 'inactive', 'completed'));
        RAISE NOTICE 'Updated garden status constraint';
    END IF;
END $$;

-- Migration: Remove Category Table (deprecated)
DO $$
BEGIN
    -- Remove category_id from question table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'question' AND column_name = 'category_id') THEN
        ALTER TABLE question DROP COLUMN category_id;
        RAISE NOTICE 'Removed category_id from question table';
    END IF;
    
    -- Remove category_id from subject table
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subject' AND column_name = 'category_id') THEN
        ALTER TABLE subject DROP COLUMN category_id;
        RAISE NOTICE 'Removed category_id from subject table';
    END IF;
    
    -- Drop category table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category') THEN
        DROP TABLE category CASCADE;
        RAISE NOTICE 'Removed deprecated category table';
    END IF;
END $$;

-- Migration: Topic Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic') THEN
        CREATE TABLE topic (
            topic_id SERIAL PRIMARY KEY,
            subject_id INT REFERENCES subject(subject_id) ON DELETE CASCADE,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'public' CHECK (status IN ('private', 'public')),
            created_by UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT unique_subject_topic UNIQUE(subject_id, name)
        );
        
        CREATE INDEX idx_topic_subject_id ON topic(subject_id);
        CREATE INDEX idx_topic_name ON topic(name);
        CREATE INDEX idx_topic_status ON topic(status);
        CREATE TRIGGER update_topic_updated_at BEFORE UPDATE ON topic
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Created topic table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'question' AND column_name = 'topic_id') THEN
        ALTER TABLE question ADD COLUMN topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_question_topic_id ON question(topic_id);
        RAISE NOTICE 'Added topic_id to question table';
    END IF;
END $$;

-- Migration: Backlog Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backlog') THEN
        CREATE TABLE backlog (
            row_id SERIAL PRIMARY KEY,
            do_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
            subject_id INT REFERENCES subject(subject_id) ON DELETE SET NULL,
            topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
            correctness BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_backlog_user_id ON backlog(user_id);
        CREATE INDEX idx_backlog_subject_id ON backlog(subject_id);
        CREATE INDEX idx_backlog_topic_id ON backlog(topic_id);
        CREATE INDEX idx_backlog_do_date ON backlog(do_date);
        CREATE INDEX idx_backlog_correctness ON backlog(correctness);
        
        RAISE NOTICE 'Created backlog table';
    END IF;
END $$;
