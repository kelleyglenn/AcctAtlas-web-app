const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/app/**"],
  coverageThreshold: {
    "./src/hooks/": {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    "./src/lib/": {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    "./src/providers/": {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    "./src/components/ui/": {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    "./src/components/map/": {
      statements: 35,
      branches: 40,
      functions: 35,
      lines: 35,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
