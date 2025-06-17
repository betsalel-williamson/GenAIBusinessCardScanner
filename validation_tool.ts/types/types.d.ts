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
