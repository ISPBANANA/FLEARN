-- ============================================================================
-- FLEARN Database Initialization Script
-- ============================================================================
-- This script initializes the FLEARN database with all necessary tables,
-- indexes, functions, triggers, and default data.
-- ============================================================================


-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 2. CORE USER TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 User Table
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

-- User indexes
CREATE INDEX idx_user_google_id ON "user"(google_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);

-- ----------------------------------------------------------------------------
-- 2.2 User Preferences Table
-- ----------------------------------------------------------------------------
CREATE TABLE prefered (
    row_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_subject_preference UNIQUE(user_id, subject)
);

-- Preferences indexes
CREATE INDEX idx_prefered_user_id ON prefered(user_id);
CREATE INDEX idx_prefered_subject ON prefered(subject);


-- ============================================================================
-- 3. SOCIAL FEATURES TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Friend Relationships
-- ----------------------------------------------------------------------------
CREATE TABLE friend (
    row_id SERIAL PRIMARY KEY,
    user1_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    user2_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Friend indexes
CREATE INDEX idx_friend_user1_id ON friend(user1_id);
CREATE INDEX idx_friend_user2_id ON friend(user2_id);

-- ----------------------------------------------------------------------------
-- 3.2 Garden (Collaborative Learning)
-- ----------------------------------------------------------------------------
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

-- Garden indexes
CREATE INDEX idx_garden_user1_id ON garden(user1_id);
CREATE INDEX idx_garden_user2_id ON garden(user2_id);


-- ============================================================================
-- 4. LEARNING CONTENT TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Subject Table
-- ----------------------------------------------------------------------------
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject indexes
CREATE INDEX idx_subject_name ON subject(name);

-- Default subjects
INSERT INTO subject (name, description) VALUES
    ('Mathematics', 'Mathematics and problem solving'),
    ('Physics', 'Physics and mechanics'),
    ('Biology', 'Life sciences and biology'),
    ('Chemistry', 'Chemistry and chemical reactions');

-- ----------------------------------------------------------------------------
-- 4.2 Topic Table
-- ----------------------------------------------------------------------------
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

-- Topic indexes
CREATE INDEX idx_topic_subject_id ON topic(subject_id);
CREATE INDEX idx_topic_name ON topic(name);
CREATE INDEX idx_topic_status ON topic(status);

-- ----------------------------------------------------------------------------
-- 4.3 Question Type Table
-- ----------------------------------------------------------------------------
CREATE TABLE question_type (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default question types
INSERT INTO question_type (type_name, description) VALUES
    ('multiple_choice', 'Single correct answer from 2-10 options'),
    ('true_false', 'Binary true or false question'),
    ('fill_blank', 'Fill in the blank(s)'),
    ('matching', 'Match items from two lists');

-- ----------------------------------------------------------------------------
-- 4.4 Question Table
-- ----------------------------------------------------------------------------
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
COMMENT ON COLUMN question.status IS 'Question visibility: private (only creator can see) or public (visible to all)';

-- Question indexes
CREATE INDEX idx_question_subject_id ON question(subject_id);
CREATE INDEX idx_question_topic_id ON question(topic_id);
CREATE INDEX idx_question_type_id ON question(type_id);
CREATE INDEX idx_question_difficulty ON question(difficulty);
CREATE INDEX idx_question_status ON question(status);
CREATE INDEX idx_question_is_active ON question(is_active);
CREATE INDEX idx_question_created_by ON question(created_by);


-- ============================================================================
-- 5. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Auto-update timestamp function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ----------------------------------------------------------------------------
-- 5.2 Apply triggers to tables
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_user_updated_at 
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_updated_at 
    BEFORE UPDATE ON friend
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_updated_at 
    BEFORE UPDATE ON garden
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_updated_at 
    BEFORE UPDATE ON topic
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_updated_at 
    BEFORE UPDATE ON question
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 6. TRACKING & ANALYTICS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Backlog Table (User Activity Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE backlog (
    row_id SERIAL PRIMARY KEY,
    do_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    subject_id INT REFERENCES subject(subject_id) ON DELETE SET NULL,
    topic_id INT REFERENCES topic(topic_id) ON DELETE SET NULL,
    correctness BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backlog indexes
CREATE INDEX idx_backlog_user_id ON backlog(user_id);
CREATE INDEX idx_backlog_subject_id ON backlog(subject_id);
CREATE INDEX idx_backlog_topic_id ON backlog(topic_id);
CREATE INDEX idx_backlog_do_date ON backlog(do_date);
CREATE INDEX idx_backlog_correctness ON backlog(correctness);


-- ============================================================================
-- END OF INITIALIZATION SCRIPT
-- ============================================================================
