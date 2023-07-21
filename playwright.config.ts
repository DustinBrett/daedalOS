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
  reporter: process.env.CI ? "dot" : [["html", { open: "always" }]],
  testDir: "e2e",
  use: {
    baseURL,
    trace: process.env.CI ? "off" : "retain-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: {
    command: process.env.CI ? "yarn start" : "yarn dev",
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
};

// ts-prune-ignore-next
export default config;
