import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

const config: PlaywrightTestConfig = {
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  reporter: [["list"], ["html"]],
  retries: process.env.CI ? 2 : 1,
  testDir: "e2e",
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.CI ? "yarn start" : "yarn dev",
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
};

// ts-prune-ignore-next
export default config;
