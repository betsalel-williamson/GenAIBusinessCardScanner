import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { DataRecord } from '../../types/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Directory paths
export const SOURCE_DATA_DIR = path.join(ROOT_DIR, 'data_source'); // Original multi-record files
export const IN_PROGRESS_DATA_DIR = path.join(ROOT_DIR, 'data_in_progress'); // Single-record files for validation
export const VALIDATED_DATA_DIR = path.join(ROOT_DIR, 'data_validated'); // Single-record validated files
export const PROCESSED_BATCH_DATA_DIR = path.join(ROOT_DIR, 'data_processed_batches'); // Moved original batch files

/**
 * Returns a list of JSON files across source, in-progress, and validated directories.
 * Differentiates between original batch files (in data_source) and individual record files.
 */
export const getJsonFiles = async (): Promise<string[]> => {
    const readDirSafe = async (dir: string) => {
        try {
            return await fs.readdir(dir);
        } catch (error: any) {
            if (error.code === 'ENOENT') return [];
            throw error;
        }
    }

    const sourceFiles = (await readDirSafe(SOURCE_DATA_DIR))
        .filter(f => f.endsWith(".json"))
        .map(f => `${f}`); // Keep source files simple

    const inProgressFiles = (await readDirSafe(IN_PROGRESS_DATA_DIR))
        .filter(f => f.endsWith(".json"))
        .map(f => `${f}`); // These are now individual records

    const validatedFiles = (await readDirSafe(VALIDATED_DATA_DIR))
        .filter(f => f.endsWith(".json"))
        .map(f => `${f}`); // These are now individual records

    // Combine all unique files, prioritizing actual source/in-progress/validated files
    // The home page will interpret 'source' status as needing ingestion if it's an original batch file
    const allFiles = new Set([...sourceFiles, ...inProgressFiles, ...validatedFiles]);

    return Array.from(allFiles).sort();
};

export const getFileStatus = async (jsonFilename: string): Promise<'validated' | 'in_progress' | 'source'> => {
    const validatedPath = path.join(VALIDATED_DATA_DIR, jsonFilename);
    const inProgressPath = path.join(IN_PROGRESS_DATA_DIR, jsonFilename);
    const sourcePath = path.join(SOURCE_DATA_DIR, jsonFilename);

    try {
        await fs.access(validatedPath);
        return "validated";
    } catch (e) { /* Not validated */ }

    try {
        await fs.access(inProgressPath);
        return "in_progress";
    } catch (e) { /* Not in progress */ }

    try {
        await fs.access(sourcePath);
        // If it's only in source, it's an original batch file needing ingestion.
        return "source";
    } catch (e) { /* Not in source either, might be an old file reference or error */ }

    // This case should ideally not be reached for files listed by getJsonFiles,
    // but acts as a fallback if a file is somehow referenced but doesn't exist anywhere.
    // For practical purposes, files listed by getJsonFiles should always have a status.
    console.warn(`File ${jsonFilename} not found in any known data directory.`);
    return "source"; // Fallback: Treat as source if not found elsewhere
};

const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Load data for a given filename, prioritizing in-progress, then validated, then source.
 * This function is used to load individual DataRecord files (from data_in_progress or data_validated)
 * or the *original* multi-record source files from data_source for ingestion.
 * It will return a single DataRecord OR a DataRecord[] for batch files.
 * The caller must handle the type.
 */
export const loadData = async (jsonFilename: string): Promise<DataRecord | DataRecord[] | null> => {
    const inProgressPath = path.join(IN_PROGRESS_DATA_DIR, jsonFilename);
    const validatedPath = path.join(VALIDATED_DATA_DIR, jsonFilename);
    const sourcePath = path.join(SOURCE_DATA_DIR, jsonFilename);

    let loadPath: string | null = null;
    if (await fileExists(inProgressPath)) {
        loadPath = inProgressPath;
    } else if (await fileExists(validatedPath)) {
        loadPath = validatedPath;
    } else if (await fileExists(sourcePath)) {
        loadPath = sourcePath;
    }

    if (!loadPath) {
        return null;
    }

    const fileContent = await fs.readFile(loadPath, 'utf-8');
    if(!fileContent) {
        console.warn(`Empty file at ${loadPath}`);
        return null;
    }

    const parsedData = JSON.parse(fileContent);

    // If loading from data_source, it's likely a batch file (array)
    // If loading from in_progress or validated, it's always a single record (object)
    if (loadPath.startsWith(SOURCE_DATA_DIR) && Array.isArray(parsedData)) {
        return parsedData as DataRecord[];
    } else if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
        return parsedData as DataRecord;
    } else {
        // Handle unexpected format
        console.warn(`Unexpected data format in ${loadPath}:`, parsedData);
        return null;
    }
};

// applyRecordsUpdate is removed as the frontend now sends the complete single record.
// There's no longer a need to "apply" updates to an array of records on the server side.
