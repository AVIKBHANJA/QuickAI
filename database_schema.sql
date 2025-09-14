-- QuickAI Database Schema
-- Run these queries in your PostgreSQL database dashboard

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  free_usage INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table for GPay tracking
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  gpay_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create creations table (if it doesn't exist already)
CREATE TABLE IF NOT EXISTS creations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  publish BOOLEAN DEFAULT FALSE,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table for user documents
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);

-- Add a test user (optional - remove this in production)
-- Password is "test123" - hash will be generated on registration
-- INSERT INTO users (name, email, password_hash) VALUES 
-- ('Test User', 'test@example.com', '$2a$12$placeholder_hash_will_be_generated');

SELECT 'Database schema created successfully!' as message;
