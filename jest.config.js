module.exports = {
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  moduleNameMapper: {
    '^@/components/(.*)': '<rootDir>/components/$1',
    '^@/contexts/(.*)': '<rootDir>/contexts/$1',
    '^@/hooks/(.*)': '<rootDir>/hooks/$1',
    '^@/public/(.*)': '<rootDir>/public/$1',
    '^@/styles/(.*)': '<rootDir>/styles/$1',
    '^@/types/(.*)': '<rootDir>/types/$1',
    '^@/utils/(.*)': '<rootDir>/utils/$1'
  }
};
