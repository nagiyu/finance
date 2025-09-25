const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@finance/(.*)$": "<rootDir>/$1",
    "^@common/(.*)$": "<rootDir>/../typescript-common/$1",
  }
};