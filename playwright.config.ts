import { type PlaywrightTestConfig, devices } from "@playwright/test";

const overrideUrl = "";
const { CI, PORT = 3000 } = process.env;
const {
  "Desktop Chrome": chrome,
  "Desktop Firefox": firefox,
  "Desktop Safari": safari,
} = devices;
const baseURL = overrideUrl || `http://localhost:${PORT}`;
const config: PlaywrightTestConfig = {
  fullyParallel: true,
  projects: [
    { name: "chromium", use: chrome },
    { name: "firefox", use: firefox },
    { name: "webkit", use: safari },
  ],
  reporter: [["list"], ["html", { open: CI ? "never" : "always" }]],
  retries: CI ? 3 : 1,
  testDir: "e2e",
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: overrideUrl ? "" : CI ? "yarn serve" : "yarn dev",
    reuseExistingServer: Boolean(overrideUrl),
    url: overrideUrl || baseURL,
  },
  workers: CI ? 1 : undefined,
};

// ts-prune-ignore-next
export default config;
