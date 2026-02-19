export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['./src/__tests__/setup.js'],
  testTimeout: 30000,
}