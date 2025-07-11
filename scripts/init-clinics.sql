-- Create the clinics table
CREATE TABLE IF NOT EXISTS clinics (
    clinic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL UNIQUE,
    client_secret VARCHAR(255) NOT NULL, -- bcrypt hashed secret
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert some initial clinics for testing
-- client_secret for 'secret123' hashed with bcrypt
INSERT INTO clinics (name, client_id, client_secret)
VALUES (
    'Clínica Central',
    'clinic_central_001',
    '$2b$10$WQu.bK3O9Kkfv7OxuQnXfuDjYoPI.4rOQJz..7iS5RCrnuZafTWDO'
) ON CONFLICT (client_id) DO UPDATE SET 
    name = EXCLUDED.name, 
    client_secret = EXCLUDED.client_secret, 
    updated_at = NOW();

-- client_secret for 'secret456' hashed with bcrypt
INSERT INTO clinics (name, client_id, client_secret)
VALUES (
    'Clínica Norte',
    'clinic_norte_002',
    '$2b$10$8kHJLCjmZYmJzFrPqBFnYOz6tZcnE8hCn.kAz4GIgPfBgXXcVKjIu'
) ON CONFLICT (client_id) DO UPDATE SET 
    name = EXCLUDED.name, 
    client_secret = EXCLUDED.client_secret, 
    updated_at = NOW();
