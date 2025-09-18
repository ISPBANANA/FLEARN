-- Migration script to update from Auth0 to Google Cloud Authentication
-- Run this script on existing databases to rename auth0_id to google_id

-- Check if auth0_id column exists before attempting migration
DO $$ 
BEGIN
    -- Check if auth0_id column exists
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
        
        -- Add comment to document the change
        COMMENT ON COLUMN "user".google_id IS 'Google Cloud Identity user ID (migrated from auth0_id)';
        
        RAISE NOTICE 'Successfully migrated auth0_id to google_id';
        
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user' AND column_name = 'google_id') THEN
        
        RAISE NOTICE 'Migration already completed - google_id column exists';
        
    ELSE
        RAISE EXCEPTION 'Neither auth0_id nor google_id column found in user table';
    END IF;
END $$;