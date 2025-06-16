import { Router, Request, Response } from "express";
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    SOURCE_DATA_DIR,
    IN_PROGRESS_DATA_DIR,
    PROCESSED_BATCH_DATA_DIR,
    loadData
} from '../utils.js';
import { DataRecord } from '../../../types/types';

const router: Router = Router();

// Route to ingest a multi-record JSON file from data_source
router.post("/:json_filename", async (req: Request, res: Response) => {
    const { json_filename } = req.params;
    const sourceFilePath = path.join(SOURCE_DATA_DIR, json_filename);

    try {
        // Load the original multi-record file
        const recordsToIngest = await loadData(json_filename);

        if (!recordsToIngest || !Array.isArray(recordsToIngest)) {
            return res.status(400).json({ error: `File '${json_filename}' not found or is not a valid array of records in source directory.` });
        }

        const newFileNames: string[] = [];
        const baseName = path.basename(json_filename, '.json');

        for (let i = 0; i < recordsToIngest.length; i++) {
            const record = recordsToIngest[i];
            const recordId = uuidv4();
            // Add record_id to the record data itself
            record.record_id = recordId;

            // New filename: originalBatchName_index_uuid.json
            const newFilename = `${baseName}_${i}_${recordId}.json`;
            const savePath = path.join(IN_PROGRESS_DATA_DIR, newFilename);

            await fs.writeFile(savePath, JSON.stringify(record, null, 2));
            newFileNames.push(newFilename);
        }

        // Move the original batch file to the processed_batches directory
        const processedBatchFilePath = path.join(PROCESSED_BATCH_DATA_DIR, json_filename);
        await fs.mkdir(PROCESSED_BATCH_DATA_DIR, { recursive: true }); // Ensure target dir exists
        await fs.rename(sourceFilePath, processedBatchFilePath);

        res.json({
            status: "ok",
            message: `Successfully ingested ${recordsToIngest.length} records from '${json_filename}'.`,
            newFiles: newFileNames,
        });

    } catch (error) {
        console.error(`Error ingesting file ${json_filename}:`, error);
        res.status(500).json({ error: `Failed to ingest file '${json_filename}'. Reason: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
});

export default router;
