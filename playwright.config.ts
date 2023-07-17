import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

const config: PlaywrightTestConfig = {
  expect: { timeout: 30000 },
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
  retries: process.env.CI ? 3 : 2,
  testDir: "e2e",
  use: {
    baseURL,
  },
  webServer: {
    command: "yarn dev",
    url: baseURL,
  },
  workers: process.env.CI ? 1 : undefined,
};

// ts-prune-ignore-next
export default config;
