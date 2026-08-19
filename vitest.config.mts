// Birim testleri icin Vitest ayarlari.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig.json icindeki "@/*" takma adinin Vitest karsiligi.
  // Next.js bunu kendisi cozer; Vitest tsconfig yollarini okumaz.
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "jsdom",
  },
});
