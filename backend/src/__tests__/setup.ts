// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/roster_db_test?schema=public';

// Increase timeout for database operations
jest.setTimeout(30000);

