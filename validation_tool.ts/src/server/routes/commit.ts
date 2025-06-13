import { Router, Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import {
    applyRecordsUpdate, // Renamed/repurposed utility function
    VALIDATED_DATA_DIR,
    IN_PROGRESS_DATA_DIR,
    getJsonFiles,
    getFileStatus
} from '../utils.js';
import { DataRecord } from '../../../types/types'; // Import new type

const router = Router();

// Route to commit final changes
router.patch("/:json_filename", async (req: Request, res: Response) => {
    const { json_filename } = req.params;
    try {
        // The frontend now sends the full updated array of records in the request body
        const updatedRecords: DataRecord[] = req.body;
        if (!Array.isArray(updatedRecords)) {
            return res.status(400).json({ error: "Invalid data format: Expected an array of records in body." });
        }

        // Apply any final server-side processing
        const dataToSave = applyRecordsUpdate(updatedRecords);

        // Save to validated directory
        const validatedPath = path.join(VALIDATED_DATA_DIR, json_filename);
        await fs.writeFile(validatedPath, JSON.stringify(dataToSave, null, 2));

        // Delete from in-progress directory
        const inProgressPath = path.join(IN_PROGRESS_DATA_DIR, json_filename);
        try {
            await fs.unlink(inProgressPath);
        } catch (e: any) {
            if (e.code !== 'ENOENT') console.error(`Could not remove in-progress file: ${e.message}`);
        }

        // Find next file to validate
        const allFiles = await getJsonFiles();
        const currentIndex = allFiles.indexOf(json_filename);

        let nextFile = null;
        if (currentIndex !== -1) {
            for (let i = currentIndex + 1; i < allFiles.length; i++) {
                const status = await getFileStatus(allFiles[i]);
                if (status !== 'validated') {
                    nextFile = allFiles[i];
                    break;
                }
            }
        }

        res.json({ status: "ok", message: "Committed successfully.", nextFile });

    } catch (error) {
        console.error(`Error committing ${json_filename}:`, error);
        res.status(500).json({ error: "Failed to commit changes." });
    }
});

export default router;
