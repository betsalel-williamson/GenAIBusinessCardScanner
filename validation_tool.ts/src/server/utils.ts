import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { DataRecord } from "../../types/types.js";
import getDb from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");

// Directory paths for ingestion process
export const SOURCE_DATA_DIR =
  process.env.SOURCE_DATA_MOUNT_PATH || path.join(ROOT_DIR, "data_source");
export const PROCESSED_BATCH_DATA_DIR =
  process.env.PROCESSED_BATCH_DATA_MOUNT_PATH ||
  path.join(ROOT_DIR, "data_processed_batches");

export interface FileInfo {
  filename: string;
  status: "validated" | "in_progress" | "source";
  type: "record" | "batch";
}

/**
 * Returns a combined list of batch files needing ingestion and records for validation.
 */
export const getFileListWithStatus = async (): Promise<FileInfo[]> => {
  // 1. Get batch files from the data_source directory
  let sourceBatchFiles: FileInfo[] = [];
  try {
    const files = await fs.readdir(SOURCE_DATA_DIR);
    sourceBatchFiles = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        filename: f,
        status: "source",
        type: "batch",
      }));
  } catch (error) {
    // The `error` object is of type `unknown`. We must verify its shape
    // before accessing properties to ensure type safety.
    if (error && typeof error === "object" && "code" in error) {
      // If the error is anything other than "file not found", re-throw it.
      if ((error as { code: string }).code !== "ENOENT") {
        throw error;
      }
      // Otherwise, the directory doesn't exist, which is acceptable.
    } else {
      // If the error is not in the expected shape, re-throw it.
      throw error;
    }
  }

  const db = await getDb();
  // 2. Get individual records from the database
  const recordsFromDb = await db.all<FileInfo[]>(
    "SELECT filename, status FROM records",
  );
  recordsFromDb.forEach((r) => (r.type = "record"));

  // 3. Combine and return
  const allFiles = [...sourceBatchFiles, ...recordsFromDb];
  return allFiles.sort((a, b) => a.filename.localeCompare(b.filename));
};

/**
 * Loads a single record's data from the database.
 */
export const loadData = async (
  jsonFilename: string,
): Promise<DataRecord | null> => {
  const db = await getDb();

  const result = await db.get<{ data: string }>(
    "SELECT data FROM records WHERE filename = ?",
    jsonFilename,
  );

  if (!result) {
    return null;
  }
  return JSON.parse(result.data);
};

/**
 * Loads the original source data for a record from the database for the revert functionality.
 */
export const loadSourceData = async (
  jsonFilename: string,
): Promise<DataRecord | null> => {
  const db = await getDb();

  const result = await db.get<{ source_data: string }>(
    "SELECT source_data FROM records WHERE filename = ?",
    jsonFilename,
  );

  if (!result) {
    return null;
  }
  return JSON.parse(result.source_data);
};
