module.exports = require("next/jest")()({
  moduleDirectories: [".", "node_modules"],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  testEnvironment: "jsdom",
});
