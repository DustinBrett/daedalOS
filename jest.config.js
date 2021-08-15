module.exports = {
  moduleDirectories: [".", "node_modules"],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  testEnvironment: "jsdom",
};
