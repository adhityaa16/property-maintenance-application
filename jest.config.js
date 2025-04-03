module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    setupFiles: ['<rootDir>/test/setup.js'],
    testTimeout: 10000,
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
}; 