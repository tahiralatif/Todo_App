-- Add missing ENUM values to notificationtype
ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'SIGNUP';
ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'LOGOUT';

-- Verify the ENUM values
SELECT unnest(enum_range(NULL::notificationtype))::text AS enum_value;
