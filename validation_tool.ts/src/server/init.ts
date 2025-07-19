import fs from "node:fs/promises";
import { initDb } from "./db.js";

export async function initializeApplication() {
  // Create data directories for ingestion pipeline
  const dataDirs = ["data_source", "data_processed_batches"];
  await Promise.all(dataDirs.map((dir) => fs.mkdir(dir, { recursive: true })));
  await initDb(); // Initialize the database
}
