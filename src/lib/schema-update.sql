-- Add work_mode column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_mode VARCHAR(10) DEFAULT 'onsite';

-- Add working_days column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true}'::jsonb;
