import { Router, Request, Response } from "express";
import db from "../db.js";
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Route to commit final changes for a single record file
router.patch("/:json_filename", async (req: Request, res: Response) => {
  const { json_filename } = req.params;
  try {
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

    // Update record to validated
    const updateResult = await db.run(
      "UPDATE records SET data = ?, status = 'validated' WHERE filename = ?",
      JSON.stringify(updatedRecord, null, 2),
      json_filename,
    );

    if (updateResult.changes === 0) {
      return res
        .status(404)
        .json({ error: `Record '${json_filename}' not found.` });
    }

    // Find next file to validate
    const nextFileResult = await db.get<{ filename: string }>(
      "SELECT filename FROM records WHERE status != 'validated' ORDER BY filename LIMIT 1",
    );

    res.json({
      status: "ok",
      message: "Committed successfully.",
      nextFile: nextFileResult?.filename || null,
    });
  } catch (error) {
    console.error(`Error committing ${json_filename}:`, error);
    res.status(500).json({ error: "Failed to commit changes." });
  }
});

export default router;
