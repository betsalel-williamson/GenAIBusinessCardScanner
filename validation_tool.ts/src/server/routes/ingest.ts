import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";
import { SOURCE_DATA_DIR, PROCESSED_BATCH_DATA_DIR } from "../utils.js";
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Route to ingest a multi-record JSON file from data_source into the database
router.post("/:json_filename", async (req: Request, res: Response) => {
  const { json_filename } = req.params;
  const sourceFilePath = path.join(SOURCE_DATA_DIR, json_filename);

  try {
    const fileContent = await fs.readFile(sourceFilePath, "utf-8");
    const recordsToIngest: DataRecord[] = JSON.parse(fileContent);

    if (!Array.isArray(recordsToIngest)) {
      return res.status(400).json({
        error: `File '${json_filename}' is not a valid array of records.`,
      });
    }

    const newFileNames: string[] = [];
    const baseName = path.basename(json_filename, ".json");

    await db.exec("BEGIN TRANSACTION");

    for (let i = 0; i < recordsToIngest.length; i++) {
      const record = recordsToIngest[i];
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
    const processedBatchFilePath = path.join(
      PROCESSED_BATCH_DATA_DIR,
      json_filename,
    );
    await fs.mkdir(PROCESSED_BATCH_DATA_DIR, { recursive: true });
    await fs.rename(sourceFilePath, processedBatchFilePath);

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
