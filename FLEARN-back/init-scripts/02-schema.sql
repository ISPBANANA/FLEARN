-- SQL schema for FLEARN project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prefered (
    row_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    streak INT DEFAULT 0,
    uptime_streak DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_auth0_id ON "user"(auth0_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_prefered_user_id ON prefered(user_id);
CREATE INDEX idx_friend_user1_id ON friend(user1_id);
CREATE INDEX idx_friend_user2_id ON friend(user2_id);
CREATE INDEX idx_garden_user1_id ON garden(user1_id);
CREATE INDEX idx_garden_user2_id ON garden(user2_id);

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
