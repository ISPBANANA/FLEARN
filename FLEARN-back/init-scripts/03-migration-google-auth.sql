-- Migration script to update from Auth0 to Google Cloud Authentication
-- Run this script on existing databases to rename auth0_id to google_id

-- Rename the column from auth0_id to google_id
ALTER TABLE "user" RENAME COLUMN auth0_id TO google_id;

-- Update any existing auth0| prefixed IDs to google| prefixed IDs
UPDATE "user" SET google_id = REPLACE(google_id, 'auth0|', 'google|') WHERE google_id LIKE 'auth0|%';

-- Add comment to document the change
COMMENT ON COLUMN "user".google_id IS 'Google Cloud Identity user ID (previously auth0_id)';