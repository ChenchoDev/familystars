export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
