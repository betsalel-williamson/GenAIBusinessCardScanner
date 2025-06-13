import { Router, Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import { applyRecordsUpdate, IN_PROGRESS_DATA_DIR } from '../utils.js';
import { DataRecord } from '../../../types/types'; // Import new type

const router: Router = Router();

// Route to autosave progress
router.patch("/:json_filename", async (req: Request, res: Response) => {
    const { json_filename } = req.params;
    try {
        // The frontend now sends the full updated array of records in the request body
        const updatedRecords: DataRecord[] = req.body;
        if (!Array.isArray(updatedRecords)) {
            return res.status(400).json({ error: "Invalid data format: Expected an array of records in body." });
        }

        // Apply any necessary server-side updates/sanitization (none needed for this simple change)
        const dataToSave = applyRecordsUpdate(updatedRecords);

        const savePath = path.join(IN_PROGRESS_DATA_DIR, json_filename);
        await fs.writeFile(savePath, JSON.stringify(dataToSave, null, 2));
        res.json({ status: "ok", message: "Draft saved." });
    } catch (error) {
        console.error(`Error autosaving ${json_filename}:`, error);
        res.status(500).json({ error: "Failed to save draft." });
    }
});

export default router;
