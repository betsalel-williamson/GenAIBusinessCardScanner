import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import cors from "cors";
import apiRouter from "./src/server/api";
import { initializeApplication } from "./src/server/init.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  await initializeApplication(); // Initialize the application

  const app = express();

  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use("/api", apiRouter);

  app.use(
    express.static(path.resolve(__dirname, "../client"), { index: false }),
  );

  // Serve static images from public directory
  app.use("/public", express.static(path.resolve(__dirname, "../../public")));
  app.use(
    "/images",
    express.static(
      path.resolve(
        __dirname,
        "..",
        "dagster_card_processor",
        "cards_to_process",
      ),
    ),
  );

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const template = await fs.readFile(
        path.resolve(__dirname, "../client/index.html"),
        "utf-8",
      );

      const { render } = await import("./src/client/entry-server.tsx");

      const appHtml = await render(url);

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.stack);
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
