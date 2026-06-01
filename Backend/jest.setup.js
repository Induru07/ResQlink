// Backend/jest.setup.js - Configure Jest environment

// Set test environment variables
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_key_for_testing_only';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resqlink-test';
process.env.NODE_ENV = 'test';

// Mock timers if needed
// jest.useFakeTimers();

// Suppress console output during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Longer timeout for database operations
jest.setTimeout(30000);
