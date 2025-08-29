import { type PlaywrightTestConfig, devices } from "@playwright/test";

const OVERRIDE_URL = "";
const { CI, PORT = 3000 } = process.env;

const {
  "Desktop Chrome": chrome,
  "Desktop Firefox": firefox,
  "Desktop Safari": safari,
} = devices;
const baseURL = OVERRIDE_URL || `http://localhost:${PORT}`;
const config: PlaywrightTestConfig = {
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: CI
        ? chrome
        : {
            ...chrome,
            launchOptions: {
              args: ["--enable-gpu", "--use-gl=angle"],
            },
          },
    },
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
    command: OVERRIDE_URL ? "" : CI ? "yarn serve" : "yarn dev",
    reuseExistingServer: Boolean(OVERRIDE_URL),
    url: OVERRIDE_URL || baseURL,
  },
  workers: CI ? 1 : undefined,
};

// ts-prune-ignore-next
export default config;
