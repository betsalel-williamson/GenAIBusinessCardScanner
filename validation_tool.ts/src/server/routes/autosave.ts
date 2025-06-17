import { Router, Request, Response } from "express";
import db from "../db.js";
import { DataRecord } from "../../../types/types";

const router: Router = Router();

// Route to autosave progress for a single record file
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

    const result = await db.run(
      "UPDATE records SET data = ?, status = 'in_progress' WHERE filename = ?",
      JSON.stringify(updatedRecord, null, 2),
      json_filename,
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: `Record '${json_filename}' not found.` });
    }

    res.json({ status: "ok", message: "Draft saved." });
  } catch (error) {
    console.error(`Error autosaving ${json_filename}:`, error);
    res.status(500).json({ error: "Failed to save draft." });
  }
});

export default router;
