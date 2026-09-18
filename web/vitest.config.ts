import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Reprend le mapping "@/*": ["./*"] de tsconfig.json (racine web/) -- sans
// ça, tout module de app/ ou lib/ qui importe via l'alias "@/..." (la
// quasi-totalité du code) ne peut pas être charge par un test vitest.
export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
