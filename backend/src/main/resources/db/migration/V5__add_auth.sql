-- V5: Add password_hash column to users and seed demo user password
-- Plain ADD COLUMN (compatible with MySQL 8.0+)
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL;

-- Set password for demo user: 'demo123'
-- BCrypt hash of 'demo123' with strength 10
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'demo@dukanai.com';
