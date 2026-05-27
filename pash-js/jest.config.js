/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/src/**/*.test.ts', '**/src/**/*.test.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^pash-sdk$': '<rootDir>/node_modules/pash-sdk/index.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'CommonJS',
        moduleResolution: 'node',
        strict: false,
        skipLibCheck: true,
      },
    }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
