const fixturesAndTestsToIgnore = ['/<rootDir>/[a-z]+/(fixtures|test).*/gm']

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: fixturesAndTestsToIgnore,
  watchPathIgnorePatterns: fixturesAndTestsToIgnore,
}
