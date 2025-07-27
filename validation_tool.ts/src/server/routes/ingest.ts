import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import getDb from "../db.js";
import { SOURCE_DATA_DIR, JSON_DATA_PROCESSED } from "../utils.js";
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Helper function to validate if an object conforms to DataRecord
function isValidDataRecord(record: unknown): record is DataRecord {
  if (typeof record !== "object" || record === null) {
    return false;
  }

  const dataRecord = record as Record<string, unknown>; // Type assertion for iteration

  for (const key in dataRecord) {
    if (Object.prototype.hasOwnProperty.call(dataRecord, key)) {
      const value = dataRecord[key];
      if (
        !(
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          typeof value === "undefined"
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

// Route to ingest a multi-record JSON file from json_data_source into the database
router.post("/:json_filename", async (req: Request, res: Response) => {
  const { json_filename } = req.params;
  const sourceFilePath = path.join(SOURCE_DATA_DIR, json_filename);

  try {
    const fileContent = await fs.readFile(sourceFilePath, "utf-8");
    let recordsToIngest: unknown = JSON.parse(fileContent);

    // If the parsed content is not an array, assume it's a single DataRecord and wrap it in an array
    if (!Array.isArray(recordsToIngest)) {
      recordsToIngest = [recordsToIngest];
    }

    // Validate each record
    for (const record of recordsToIngest as unknown[]) {
      // Cast to unknown[] for iteration
      if (!isValidDataRecord(record)) {
        return res.status(400).json({
          error: `File '${json_filename}' contains invalid data. Each record must conform to the DataRecord interface.`,
        });
      }
    }

    const newFileNames: string[] = [];
    const baseName = path.basename(json_filename, ".json");

    const db = await getDb();
    await db.exec("BEGIN TRANSACTION");

    for (let i = 0; i < (recordsToIngest as DataRecord[]).length; i++) {
      // Cast to DataRecord[] after validation
      const record = (recordsToIngest as DataRecord[])[i];
      const recordId = uuidv4();
      record.record_id = recordId; // Add unique ID to the record itself

      const newFilename = `${baseName}_${i}_${recordId}.json`;
      const recordJson = JSON.stringify(record, null, 2);

      await db.run(
        "INSERT INTO records (filename, status, data, source_data) VALUES (?, ?, ?, ?)",
        newFilename,
        "source",
        recordJson, // Current data
        recordJson, // Original source data for revert
      );

      newFileNames.push(newFilename);
    }

    await db.exec("COMMIT");

    // Move the original batch file to the processed_batches directory
    const jsonDataProcessedFilePath = path.join(
      JSON_DATA_PROCESSED,
      json_filename,
    );
    await fs.mkdir(JSON_DATA_PROCESSED, { recursive: true });
    await fs.rename(sourceFilePath, jsonDataProcessedFilePath);

    res.json({
      status: "ok",
      message: `Successfully ingested ${recordsToIngest.length} records from '${json_filename}'.`,
      newFiles: newFileNames,
    });
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error(`Error ingesting file ${json_filename}:`, error);
    res.status(500).json({
      error: `Failed to ingest file '${json_filename}'. Reason: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
});

export default router;
