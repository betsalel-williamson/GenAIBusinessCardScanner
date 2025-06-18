import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUndoableState } from "./useUndoableState";
import { useDebounce } from "./useDebounce";
import type { DataRecord, TransformationState } from "../../../types/types";

// Helper to get PDF/Image path from record source.
const getSourceFileSrcFromRecord = (record: DataRecord | null): string => {
  if (
    !record?.source ||
    typeof record.source !== "string" ||
    record.source.trim() === ""
  ) {
    return "";
  }
  // The `source` field now contains the full filename (e.g., hash.pdf, hash.png)
  // We just need to encode it for the URL.
  return `/images/${encodeURIComponent(record.source)}`;
};

interface UseValidationDataHook {
  loading: boolean;
  error: string | null;
  autosaveStatus: { message: string; type: string };
  currentRecord: DataRecord | null;
  currentFileSrc: string; // Renamed for clarity (can be PDF or image)
  canUndoRecord: boolean;
  canRedoRecord: boolean;
  transformation: TransformationState;
  setTransformation: (newState: TransformationState) => void;
  handleFieldChange: (key: string, newValue: string) => void;
  handleAddField: (key: string, value: string) => void;
  handleRevertField: (key: string) => Promise<void>;
  handleCommit: () => Promise<void>;
  undoRecord: () => void;
  redoRecord: () => void;
  navigateBackToList: () => void;
  handleFieldFocus: (key: string, initialValue: string) => void;
  jsonFilename: string;
}

export const useValidationData = (): UseValidationDataHook => {
  const { json_filename } = useParams<{ json_filename: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState({
    message: "",
    type: "",
  });

  const [focusedFieldInfo, setFocusedFieldInfo] = useState<{
    key: string;
    initialValue: string;
  } | null>(null);

  const [
    recordData,
    setRecordData,
    undoRecord,
    redoRecord,
    resetRecord,
    canUndoRecord,
    canRedoRecord,
  ] = useUndoableState<DataRecord | null>(null);

  const currentRecord = recordData;
  const currentFileSrc = useMemo(
    () => getSourceFileSrcFromRecord(currentRecord),
    [currentRecord],
  );

  const [transformation, setTransformation] = useState<TransformationState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
  });

  const debouncedRecordData = useDebounce(recordData, 1000);

  useEffect(() => {
    if (!json_filename) {
      setError("No filename provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    resetRecord(null);

    fetch(`/api/files/${json_filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: DataRecord) => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            console.warn(
              "Received an array for single record. Using the first element.",
            );
            resetRecord(data[0]);
          } else {
            throw new Error("Empty array received for single record file.");
          }
        } else if (typeof data === "object" && data !== null) {
          resetRecord(data);
        } else {
          throw new Error(
            "Invalid data format: Expected a single record object.",
          );
        }
        setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [json_filename, resetRecord]);

  const autoSave = useCallback(
    async (dataToSave: DataRecord) => {
      if (!json_filename) return;
      setAutosaveStatus({ message: "Saving...", type: "status-progress" });
      try {
        const response = await fetch(`/api/autosave/${json_filename}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });
        if (!response.ok) throw new Error("Autosave failed on server");
        setAutosaveStatus({
          message: "Draft Saved ✓",
          type: "status-validated",
        });
      } catch (err) {
        setAutosaveStatus({ message: "Save Failed!", type: "status-error" });
        console.error(err);
      }
    },
    [json_filename],
  );

  useEffect(() => {
    if (debouncedRecordData && canUndoRecord) {
      autoSave(debouncedRecordData);
    }
  }, [debouncedRecordData, autoSave, canUndoRecord]);

  const handleFieldChange = useCallback(
    (key: string, newValue: string) => {
      if (!currentRecord) return;
      setRecordData({ ...currentRecord, [key]: newValue });
    },
    [currentRecord, setRecordData],
  );

  const handleAddField = useCallback(
    (key: string, value: string) => {
      if (!currentRecord) return;
      if (!(key in currentRecord)) {
        setRecordData({ ...currentRecord, [key]: value });
      }
    },
    [currentRecord, setRecordData],
  );

  const handleRevertField = useCallback(
    async (keyToRevert: string) => {
      if (!json_filename || !currentRecord || !keyToRevert) return;
      if (!window.confirm(`Revert "${keyToRevert}" to original source?`))
        return;

      try {
        setAutosaveStatus({
          message: "Reverting field...",
          type: "status-progress",
        });
        const response = await fetch(`/api/source-data/${json_filename}`);
        if (!response.ok) throw new Error("Failed to fetch source data.");

        const sourceData: DataRecord = await response.json();
        const originalValue = sourceData[keyToRevert];

        if (originalValue !== undefined) {
          setRecordData({ ...currentRecord, [keyToRevert]: originalValue });
          setAutosaveStatus({
            message: "Field Reverted ✓",
            type: "status-validated",
          });
        } else {
          setAutosaveStatus({
            message: `Original value not found for field "${keyToRevert}".`,
            type: "status-error",
          });
        }
      } catch (err) {
        setAutosaveStatus({ message: "Revert Failed!", type: "status-error" });
        console.error(err);
      }
    },
    [json_filename, currentRecord, setRecordData],
  );

  const handleCommit = useCallback(async () => {
    if (!currentRecord) {
      alert("No record data to commit.");
      return;
    }
    if (
      !window.confirm(
        "Commit this record and move to the next unvalidated file?",
      )
    ) {
      return;
    }

    if (!json_filename) return;

    setAutosaveStatus({ message: "Committing...", type: "status-progress" });

    try {
      const response = await fetch(`/api/commit/${json_filename}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentRecord),
      });
      if (!response.ok) throw new Error("Commit failed on server");
      const result = await response.json();

      if (result.nextFile) {
        navigate(`/validate/${result.nextFile}`, { replace: true });
      } else {
        alert("All files validated! Navigating back to the list.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      setAutosaveStatus({ message: "Commit Failed!", type: "status-error" });
      console.error(err);
    }
  }, [json_filename, currentRecord, navigate]);

  const navigateBackToList = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  const handleFieldFocus = useCallback((key: string, initialValue: string) => {
    setFocusedFieldInfo({ key, initialValue });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputField =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (canUndoRecord) {
          event.preventDefault();
          undoRecord();
        }
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "y" || (event.shiftKey && event.key === "Z"))
      ) {
        if (canRedoRecord) {
          event.preventDefault();
          redoRecord();
        }
        return;
      }

      if (isInputField) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (
            focusedFieldInfo &&
            focusedFieldInfo.key ===
              (activeElement as HTMLInputElement | HTMLTextAreaElement).name
          ) {
            handleFieldChange(
              focusedFieldInfo.key,
              focusedFieldInfo.initialValue,
            );
          }
          (activeElement as HTMLElement).blur();
          setFocusedFieldInfo(null);
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          (activeElement as HTMLElement).blur();
          setFocusedFieldInfo(null);
          return;
        }
        return;
      }

      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        handleCommit();
      } else if (event.key === "ArrowLeft" || event.key === "Escape") {
        event.preventDefault();
        navigateBackToList();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleCommit,
    navigateBackToList,
    undoRecord,
    redoRecord,
    handleFieldChange,
    focusedFieldInfo,
    canUndoRecord,
    canRedoRecord,
  ]);

  return {
    loading,
    error,
    autosaveStatus,
    currentRecord,
    currentFileSrc,
    canUndoRecord,
    canRedoRecord,
    transformation,
    setTransformation,
    handleFieldChange,
    handleAddField,
    handleRevertField,
    handleCommit,
    undoRecord,
    redoRecord,
    navigateBackToList,
    handleFieldFocus,
    jsonFilename: json_filename || "",
  };
};
