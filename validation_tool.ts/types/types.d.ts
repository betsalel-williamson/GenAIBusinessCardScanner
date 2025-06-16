export interface DataRecord {
  [key: string]: string | number | boolean | undefined; // Represents a single contact/entry, allow undefined for new fields
  source?: string; // e.g., "06032025_006.pdf" - used to link to image
  record_id?: string; // New: Unique identifier for this specific record (card)
}

// Global state for the entire validation process for a file
export interface AppState {
  records: DataRecord[]; // All records in the current JSON file
  currentRecordIndex: number; // Index of the currently active record
  currentFieldIndex: number; // Index of the currently active field within the current record
}

// Simple transformation state for basic image viewing
export interface TransformationState {
  offsetX: number;
  offsetY: number;
  scale: number;
}
