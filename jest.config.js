module.exports = {
  verbose: true,
  testEnvironment: 'node',
  setupFiles: ['dotenv/config', './jest/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  preset: 'ts-jest',
  testRegex: '.*(\\.test|tests).*\\.(ts|js)$',
  // setupFiles: [
  //   "<rootDir>/tests/__helpers__/beforeEachSuite.ts"
  // ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/__helpers__/',
    '/tests/e2e/',
    '/build/',
  ],
  collectCoverage: true,
  coverageDirectory: 'test-results/coverage',
  coveragePathIgnorePatterns: ['src/rql/parser.ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'jest-junit.xml',
      },
    ],
    [
      'jest-stare',
      {
        resultDir: 'test-results',
        reportTitle: 'Test report generated with jest-stare!',
        additionalResultsProcessors: ['jest-junit'],
        coverageLink: 'coverage/lcov-report/index.html',
        jestStareConfigJson: 'jest-stare.json',
        jestGlobalConfigJson: 'globalStuff.json',
      },
    ],
  ],
};
