-- Add priority column to tasks table
-- Run this SQL script on your Neon PostgreSQL database

-- Step 1: Create the ENUM type for task priority
CREATE TYPE taskpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Step 2: Add priority column to tasks table with default value
ALTER TABLE tasks 
ADD COLUMN priority taskpriority NOT NULL DEFAULT 'MEDIUM';

-- Step 3: Create index on priority for better query performance
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'priority';
