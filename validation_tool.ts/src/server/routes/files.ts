import { Router, Request, Response } from "express";
import { getFileListWithStatus, loadData } from "../utils.js";

const router: Router = Router();

// Route to get the list of all files (batches and records) and their statuses
router.get("/", async (req: Request, res: Response) => {
  try {
    const fileStatuses = await getFileListWithStatus();
    res.json(fileStatuses);
  } catch (error) {
    console.error("Error getting files:", error);
    res.status(500).json({ error: "Failed to retrieve file list." });
  }
});

// Route to get data for a specific file (now a single record from DB)
router.get("/:json_filename", async (req: Request, res: Response) => {
  try {
    const data = await loadData(req.params.json_filename);
    if (!data) {
      return res.status(404).json({ error: "Record not found in database." });
    }
    res.json(data);
  } catch (error) {
    console.error(`Error loading data for ${req.params.json_filename}:`, error);
    res.status(500).json({ error: "Failed to load record data." });
  }
});

export default router;
