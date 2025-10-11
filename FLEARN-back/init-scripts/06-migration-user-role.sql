-- Migration script to add role column to user table
-- This adds support for user roles: user, teacher, admin

DO $$ 
BEGIN
    -- Check if role column already exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'role') THEN
        
        -- Add the role column with default value 'user'
        ALTER TABLE "user" ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'teacher', 'admin'));
        
        -- Set all existing users to 'user' role (this is redundant due to DEFAULT but explicit)
        UPDATE "user" SET role = 'user' WHERE role IS NULL;
        
        -- Make the column NOT NULL after setting default values
        ALTER TABLE "user" ALTER COLUMN role SET NOT NULL;
        
        -- Create index for better query performance on role-based queries
        CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
        
        -- Add comment to document the column
        COMMENT ON COLUMN "user".role IS 'User role: user (default), teacher, or admin';
        
        RAISE NOTICE 'Successfully added role column to user table';
        
    ELSE
        RAISE NOTICE 'Migration already completed - role column exists';
    END IF;
END $$;