-- Add due_date column to tasks table
-- Run this SQL script on your Neon PostgreSQL database

-- Step 1: Add due_date column to tasks table
ALTER TABLE tasks 
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Create index on due_date for better query performance
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'due_date';
