// Uctan uca duman testi ayarlari. Testler uretim yapisi uzerinde calisir.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "npx serve out -l 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
  },
});
