import { beforeAll, afterAll, afterEach } from '@jest/globals';

/**
 * Global test setup and teardown
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
// Don't override API_URL - let each test file use its own defaults
// process.env.API_URL = process.env.API_URL || 'http://localhost:3000';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test hooks
beforeAll(async () => {
  console.log('🚀 Starting test suite...');
  // Each test file uses its own BASE_URL
});

afterAll(async () => {
  console.log('✅ Test suite completed');
});

afterEach(() => {
  // Clean up mocks after each test
  jest.clearAllMocks();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
