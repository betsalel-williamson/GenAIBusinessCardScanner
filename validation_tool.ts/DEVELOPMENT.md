# 🚀 Get Started (For Developers)

This project is part of a larger monorepo. To get started with the `validation_tool.ts` web application:

1. **Install dependencies (from the monorepo root):**

   ```bash
   pnpm install
   ```

2. **Run in development mode (with SSR and API, from the monorepo root):**

   ```bash
   pnpm --filter validation_tool.ts dev:server
   # Server will start on http://localhost:7456
   ```

   (Or `pnpm --filter validation_tool.ts dev:client` for client-only UI development)

3. **Build for production (from the monorepo root):**

   ```bash
   pnpm --filter validation_tool.ts build
   ```

4. **Serve production build (from the monorepo root):**

   ```bash
   pnpm --filter validation_tool.ts serve
   ```

**To use the tool:**

1. Place your JSON data files (each containing an array of records) into the `validation_tool.ts/json_data_source/` directory.
2. Ensure each record in your JSON includes a `source` field pointing to a PDF filename (e.g., `"source": "my_document.pdf"`).
3. Place the corresponding PDF files into `dagster_project/image_data_source/` (or adjust the static file serving path in `server.ts`).
4. Navigate to `http://localhost:7456` and start validating!
