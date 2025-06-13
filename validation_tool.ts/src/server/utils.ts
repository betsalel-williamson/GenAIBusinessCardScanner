import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { DataRecord } from '../../types/types.js'; // Import new type

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// Directory paths
export const SOURCE_DATA_DIR = path.join(ROOT_DIR, 'data_source');
export const IN_PROGRESS_DATA_DIR = path.join(ROOT_DIR, 'data_in_progress');
export const VALIDATED_DATA_DIR = path.join(ROOT_DIR, 'data_validated');


export const getJsonFiles = async (): Promise<string[]> => {
    // Reading directories can throw if they don't exist, so we handle that.
    const readDirSafe = async (dir: string) => {
        try {
            return await fs.readdir(dir);
        } catch (error: any) {
            if (error.code === 'ENOENT') return []; // Directory doesn't exist
            throw error; // Other errors
        }
    }
    const sourceFiles = await readDirSafe(SOURCE_DATA_DIR);
    const inProgressFiles = await readDirSafe(IN_PROGRESS_DATA_DIR);
    const validatedFiles = await readDirSafe(VALIDATED_DATA_DIR);

    const allFiles = new Set([
        ...sourceFiles,
        ...inProgressFiles,
        ...validatedFiles,
    ]);

    return Array.from(allFiles)
        .filter(f => f.endsWith(".json"))
        .sort();
};

export const getFileStatus = async (jsonFilename: string): Promise<'validated' | 'in_progress' | 'source'> => {
    const validatedPath = path.join(VALIDATED_DATA_DIR, jsonFilename);
    const inProgressPath = path.join(IN_PROGRESS_DATA_DIR, jsonFilename);

    try {
        await fs.access(validatedPath);
        return "validated";
    } catch (e) { /* Not validated */ }

    try {
        await fs.access(inProgressPath);
        return "in_progress";
    } catch (e) { /* Not in progress */ }

    return "source";
};

const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Load data for a given filename, prioritizing in-progress, then validated, then source.
export const loadData = async (jsonFilename: string): Promise<DataRecord[] | null> => {
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
    return JSON.parse(fileContent) as DataRecord[];
};

/**
 * Applies a specific field update to a copy of the records array.
 * This is used for autosave and commit, where the client sends the full updated array.
 * @param allRecords The current full array of data records.
 * @returns A new records array with the updates applied.
 */
export const applyRecordsUpdate = (allRecords: DataRecord[]): DataRecord[] => {
    // For the new data type, the frontend sends the complete updated array.
    // So, this function simply returns the provided array (or a deep copy if further immutability is desired)
    // The previous `applyTransformationsToData` logic for bounding boxes is removed.
    return JSON.parse(JSON.stringify(allRecords));
};
