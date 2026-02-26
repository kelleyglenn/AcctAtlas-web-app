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
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/app/page.tsx",
  ],
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "test-results", outputName: "junit.xml" },
    ],
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 65,
      functions: 70,
      lines: 75,
    },
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
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    "./src/components/ui/": {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    "./src/components/map/": {
      statements: 55,
      branches: 55,
      functions: 50,
      lines: 55,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
