import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ViteUserConfig as VitestUserConfigInterface } from "vitest/config";

const vitestConfig: VitestUserConfigInterface = {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
    coverage: {
      thresholds: {
        // Thresholds for all files
        functions: 95,
        branches: 70,
      },
      provider: "v8",
      reporter: ["default", "text", "json", "html"],
      ignoreEmptyLines: true,
    },
    // Add JUnit reporter for GitHub Actions test summary
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'junit.xml',
    },
  },
  esbuild: {
    // Transpile all files with ESBuild to remove comments from code coverage.
    // Required for `test.coverage.ignoreEmptyLines` to work:
    include: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.ts", "**/*.tsx"],
  },
};

export default defineConfig({
  plugins: [react()],
  // The 'server' block with proxy settings has been removed.
  // In our integrated SSR development setup, the Express server (server.ts)
  // handles all requests, including API calls. The Vite server runs in
  // middleware mode and does not need to proxy requests. This was causing
  // the ECONNREFUSED error.
  build: {
    minify: false, // TODO: update to true for production build
  },
  test: vitestConfig.test,
});
