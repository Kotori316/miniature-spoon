/// <reference types="vitest" />
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { configDefaults } from 'vitest/config';

export default defineWorkersConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, "test/production.test.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          compatibilityFlags: ["nodejs_compat"],
          sitePath: "./assets/",
          bindings: {
            "ENVIRONMENT": "unit-test",
          },
        }
      }
    },
  }
})
