import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { IN_PROGRESS_DATA_DIR } from "../utils.js"; // applyRecordsUpdate removed
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Route to autosave progress for a single record file
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

    const savePath = path.join(IN_PROGRESS_DATA_DIR, json_filename);
    await fs.writeFile(savePath, JSON.stringify(updatedRecord, null, 2)); // Save the single record
    res.json({ status: "ok", message: "Draft saved." });
  } catch (error) {
    console.error(`Error autosaving ${json_filename}:`, error);
    res.status(500).json({ error: "Failed to save draft." });
  }
});

export default router;
