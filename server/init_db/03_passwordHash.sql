-- First make sure we're using the correct database
\c recruitment;

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update all existing passwords for recruiters (role_id = 1) that aren't already hashed
UPDATE person 
SET password = crypt(password, gen_salt('bf', 10))
WHERE role_id = 1 
AND password IS NOT NULL 
AND NOT (password LIKE '$2a$%' OR password LIKE '$2b$%');

-- Add a comment to log that the script ran
COMMENT ON TABLE person IS 'Passwords hashed by initialization script at ' || current_timestamp;