/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  collectCoverageFrom: ['src/utils/**/*.ts', 'src/store/**/*.ts', 'src/services/storage.ts'],
  coverageThreshold: {
    global: { branches: 85, functions: 90, lines: 95, statements: 95 },
  },
};
