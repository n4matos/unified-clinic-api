-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    clinic_id VARCHAR(255) NOT NULL, -- The clinicId this user is associated with
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert some initial users (passwords are 'password' hashed with bcrypt, placeholder for now)
-- For clinicId: 1
INSERT INTO users (username, password_hash, clinic_id)
VALUES (
    'user1_clinic1',
    '$2b$10$WQu.bK3O9Kkfv7OxuQnXfuDjYoPI.4rOQJz..7iS5RCrnuZafTWDO', -- Hashed 'password'
    '1'
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, clinic_id = EXCLUDED.clinic_id, updated_at = NOW();

-- For clinicId: 2
INSERT INTO users (username, password_hash, clinic_id)
VALUES (
    'user2_clinic2',
    '$2b$10$WQu.bK3O9Kkfv7OxuQnXfuDjYoPI.4rOQJz..7iS5RCrnuZafTWDO', -- Hashed 'password'
    '2'
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, clinic_id = EXCLUDED.clinic_id, updated_at = NOW();
