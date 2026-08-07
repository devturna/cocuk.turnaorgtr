// Birim testleri icin Vitest ayarlari.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "jsdom",
  },
});
