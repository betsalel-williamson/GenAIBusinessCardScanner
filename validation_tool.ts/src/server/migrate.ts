import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db, { initDb } from "./db.js";
import { DataRecord } from "../../types/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");

// Define directories
const IN_PROGRESS_DIR = path.join(ROOT_DIR, "data_in_progress");
const VALIDATED_DIR = path.join(ROOT_DIR, "data_validated");
const MIGRATED_DIR = path.join(ROOT_DIR, "data_migrated");

/**
 * Processes a directory of JSON files and migrates them to the database.
 * @param {string} dirPath - The path to the directory to process.
 * @param {'in_progress' | 'validated'} status - The status to assign to the records.
 */
async function processDirectory(
  dirPath: string,
  status: "in_progress" | "validated",
) {
  console.log(`Processing directory: ${dirPath}`);
  let files;
  try {
    files = await fs.readdir(dirPath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if ((error as { code: string }).code !== "ENOENT") {
        console.log(`Directory not found, skipping: ${dirPath}`);
        return;
      }
      throw error;
    } else {
      throw error;
    }
  }

  for (const filename of files) {
    if (!filename.endsWith(".json")) continue;

    const filePath = path.join(dirPath, filename);

    try {
      // Check if record already exists in the database
      const existing = await db.get(
        "SELECT id FROM records WHERE filename = ?",
        filename,
      );

      if (existing) {
        console.log(`Skipping '${filename}' (already in database).`);
        continue;
      }

      // Read file content
      const content = await fs.readFile(filePath, "utf-8");
      const record: DataRecord = JSON.parse(content);
      const recordJson = JSON.stringify(record, null, 2);

      // Insert into database
      // For migrated data, 'data' and 'source_data' are the same.
      await db.run(
        "INSERT INTO records (filename, status, data, source_data) VALUES (?, ?, ?, ?)",
        filename,
        status,
        recordJson,
        recordJson,
      );

      console.log(`Migrated '${filename}' with status '${status}'.`);

      // Move the file to the migrated directory to prevent re-processing
      const migratedFilePath = path.join(MIGRATED_DIR, filename);
      await fs.rename(filePath, migratedFilePath);
      console.log(`Moved '${filename}' to migrated directory.`);
    } catch (err) {
      console.error(`Failed to process file '${filename}':`, err);
    }
  }
}

/**
 * Main migration function.
 */
async function runMigration() {
  console.log("Starting database migration...");

  // 1. Ensure the database schema is up to date
  await initDb();

  // 2. Ensure the migrated directory exists
  await fs.mkdir(MIGRATED_DIR, { recursive: true });

  // 3. Process the directories
  await processDirectory(IN_PROGRESS_DIR, "in_progress");
  await processDirectory(VALIDATED_DIR, "validated");

  console.log("Migration complete.");
  await db.close();
}

runMigration().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
