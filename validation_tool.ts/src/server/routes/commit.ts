import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import {
  VALIDATED_DATA_DIR,
  IN_PROGRESS_DATA_DIR,
  getJsonFiles,
  getFileStatus,
} from "../utils.js"; // applyRecordsUpdate removed
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Route to commit final changes for a single record file
router.patch("/:json_filename", async (req: Request, res: Response) => {
  const { json_filename } = req.params;
  try {
    // The frontend now sends the full updated single record in the request body
    const updatedRecord: DataRecord = req.body;
    if (
      typeof updatedRecord !== "object" ||
      updatedRecord === null ||
      Array.isArray(updatedRecord)
    ) {
      return res.status(400).json({
        error: "Invalid data format: Expected a single record object in body.",
      });
    }

    // Save to validated directory
    const validatedPath = path.join(VALIDATED_DATA_DIR, json_filename);
    await fs.writeFile(validatedPath, JSON.stringify(updatedRecord, null, 2));

    // Delete from in-progress directory
    const inProgressPath = path.join(IN_PROGRESS_DATA_DIR, json_filename);
    try {
      await fs.unlink(inProgressPath);
    } catch (e: any) {
      if (e.code !== "ENOENT")
        console.error(
          `Could not remove in-progress file ${inProgressPath}: ${e.message}`,
        );
    }

    // Find next file to validate (which is now the next single-record JSON file)
    const allFiles = await getJsonFiles(); // This list now contains all single-record JSON files
    const currentIndex = allFiles.indexOf(json_filename);

    let nextFile = null;
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < allFiles.length; i++) {
        const status = await getFileStatus(allFiles[i]);
        if (status !== "validated") {
          // Find the first non-validated (source or in_progress) file
          nextFile = allFiles[i];
          break;
        }
      }
    }

    res.json({
      status: "ok",
      message: "Committed successfully.",
      nextFile: nextFile,
    });
  } catch (error) {
    console.error(`Error committing ${json_filename}:`, error);
    res.status(500).json({ error: "Failed to commit changes." });
  }
});

export default router;
