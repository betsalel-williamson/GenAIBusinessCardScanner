import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { denyImports } from "vite-env-only"; // Keep this import as it was in your file

export default defineConfig({
  plugins: [
    react(),
    denyImports({
      // Keep this plugin as it was in your file
      client: {
        specifiers: ["fs-extra", /^node:/, "@prisma/*"],
        files: ["**/server/*"],
      },
      server: {
        specifiers: ["jquery"],
      },
    }),
  ],
  build: {
    minify: true,
  },
  test: {
    globals: true, // Common setting for all projects
    setupFiles: ["src/setupTests.ts"], // Common setting for all projects
    coverage: {
      // Common setting for all projects
      thresholds: {
        functions: 95,
        branches: 70,
      },
      provider: "v8",
      reporter: ["default", "text", "json", "html"],
      ignoreEmptyLines: true,
    },
    reporters: ["default", "junit"], // Common setting for all projects
    outputFile: {
      // Common setting for all projects
      junit: "junit.xml",
    },
    projects: [
      {
        // Client-side tests
        extends: true,
        test: {
          environment: "jsdom",
          include: ["src/client/**/*.test.{ts,tsx}"],
        },
      },
      {
        // Server-side tests
        extends: true,
        test: {
          environment: "node",
          include: ["src/server/**/*.test.ts"],
        },
      },
    ],
  },
  esbuild: {
    // Common setting for all projects
    include: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.ts", "**/*.tsx"],
  },
});
