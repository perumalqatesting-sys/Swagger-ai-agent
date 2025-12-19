module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/tests/__mocks__/uuid.ts',
    '^openai$': '<rootDir>/tests/__mocks__/openai.ts',
  },
};
