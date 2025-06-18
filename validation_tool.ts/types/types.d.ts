export interface DataRecord {
  [key: string]: string | number | boolean | undefined;
  source?: string;
  record_id?: string;
}

// Represents a file in the system, could be a batch or a single record
export interface FileInfo {
  filename: string;
  status: "validated" | "in_progress" | "source";
  type: "record" | "batch";
}

export interface AppState {
  records: DataRecord[];
  currentRecordIndex: number;
  currentFieldIndex: number;
}

export interface TransformationState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

// NEW: Type for individual file upload results from the API
export interface UploadResult {
  originalName: string;
  status: "success" | "skipped" | "error";
  reason?: string;
  newName?: string;
}

// NEW: Type for the entire upload API response payload
export interface UploadApiResponse {
  message: string;
  results: UploadResult[];
}
