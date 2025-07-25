import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors"; // Re-adding the import for cors
import { createServer as createViteServer } from "vite";
import apiRouter from "./src/server/api";
import { initializeApplication } from "./src/server/init.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isTest = process.env.NODE_ENV === "test";

async function createServer() {
  await initializeApplication(); // Initialize the application

  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: isTest ? "error" : "info",
  });

  app.use(vite.middlewares);

  app.use(cors()); // Re-adding cors middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use("/api", apiRouter);

  // Serve static images from public directory
  app.use("/public", express.static(path.resolve(__dirname, "public")));
  app.use(
    "/images",
    express.static(
      process.env.CARDS_TO_PROCESS_MOUNT_PATH ||
        path.resolve(__dirname, "..", "dagster_project", "cards_to_process"),
    ),
  );

  app.use("*splat", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const template = await fs.readFile(
        path.resolve(__dirname, "index.html"),
        "utf-8",
      );

      const transformedTemplate = await vite.transformIndexHtml(url, template);

      const { render } = await vite.ssrLoadModule(
        "/src/client/entry-server.tsx",
      );

      const appHtml = await render(url);

      const html = transformedTemplate.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
        next(e);
      } else {
        next(new Error("Unknown error during SSR"));
      }
    }
  });

  const port = process.env.PORT || 7456;
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`✅ Server is listening on http://localhost:${port}`);
  });
}

createServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
