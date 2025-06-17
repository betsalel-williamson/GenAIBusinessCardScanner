import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUndoableState } from "./useUndoableState";
import { useDebounce } from "./useDebounce";
import type { DataRecord, TransformationState } from "../../../types/types";

// Helper to get PDF path from record source (e.g., "file.pdf" -> "/images/file.pdf")
const getPDFSrcFromRecord = (record: DataRecord | null) => {
  if (
    !record?.source ||
    typeof record.source !== "string" ||
    record.source.trim() === ""
  ) {
    return ""; // Return empty string if source is missing, not a string, or empty
  }
  const baseName = record.source.split(".").slice(0, -1).join(".");
  // Encode the basename to handle spaces and other special characters in filenames
  return `/images/${encodeURIComponent(baseName)}.pdf`;
};

// Local storage keys are removed as per-record indexing is no longer needed

interface UseValidationDataHook {
  loading: boolean;
  error: string | null;
  autosaveStatus: { message: string; type: string };
  currentRecord: DataRecord | null; // Now the single record for the current file
  currentPDFSrc: string;
  canUndoRecord: boolean; // Renamed from canUndoRecords
  canRedoRecord: boolean; // Renamed from canRedoRecords
  transformation: TransformationState;
  setTransformation: (newState: TransformationState) => void;
  handleFieldChange: (key: string, newValue: string) => void;
  handleAddField: (key: string, value: string) => void;
  handleRevertField: (key: string) => Promise<void>;
  handleCommit: () => Promise<void>; // Commit and advance to next file
  undoRecord: () => void; // Renamed from undoRecords
  redoRecord: () => void; // Renamed from redoRecords
  navigateBackToList: () => void;
  handleFieldFocus: (key: string, initialValue: string) => void;
  jsonFilename: string; // Expose jsonFilename for StatusDisplay
}

export const useValidationData = (): UseValidationDataHook => {
  const { json_filename } = useParams<{ json_filename: string }>(); // record_index removed
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState({
    message: "",
    type: "",
  });

  // Store info about the currently focused field for Escape/Ctrl+Enter behavior
  const [focusedFieldInfo, setFocusedFieldInfo] = useState<{
    key: string;
    initialValue: string;
  } | null>(null);

  // Use useUndoableState for the *single* DataRecord
  const [
    recordData, // Now holds the single DataRecord object
    setRecordData,
    undoRecord, // Renamed from undoRecords
    redoRecord, // Renamed from redoRecords
    resetRecord, // Renamed from resetRecords
    canUndoRecord, // Renamed from canUndoRecords
    canRedoRecord, // Renamed from canRedoRecords
  ] = useUndoableState<DataRecord | null>(null);

  // currentRecord is just recordData
  const currentRecord = recordData;
  const currentPDFSrc = useMemo(
    () => getPDFSrcFromRecord(currentRecord),
    [currentRecord],
  );

  // Transformation state for PDF viewer, resets on file change
  const [transformation, setTransformation] = useState<TransformationState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1.0,
  });

  const debouncedRecordData = useDebounce(recordData, 1000);

  // Initial data load for the single record file
  useEffect(() => {
    if (!json_filename) {
      setError("No filename provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    resetRecord(null); // Clear previous record data before fetching new one

    fetch(`/api/files/${json_filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: DataRecord) => {
        // Expect a single DataRecord
        // Ensure the fetched data is a plain object, not an array.
        // If the backend was still returning an array for some reason, take the first one.
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

        setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 }); // Reset PDF view for new record
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // No localStorage for lastViewedRecord or softValidatedIndices in single-record flow
  }, [json_filename, resetRecord]);

  const autoSave = useCallback(
    async (dataToSave: DataRecord) => {
      if (!json_filename) return;

      setAutosaveStatus({ message: "Saving...", type: "status-progress" });

      try {
        const response = await fetch(`/api/autosave/${json_filename}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave), // Send the single record
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

  // Autosave effect (triggered by debouncedRecordData)
  useEffect(() => {
    // Only autosave if there's actual record data and it has changed (canUndoRecord implies change from initial)
    if (debouncedRecordData && canUndoRecord) {
      autoSave(debouncedRecordData);
    }
  }, [debouncedRecordData, autoSave, canUndoRecord]);

  // Handlers for DataEntryPane
  const handleFieldChange = useCallback(
    (key: string, newValue: string) => {
      if (!currentRecord) return;
      setRecordData({ ...currentRecord, [key]: newValue }); // Update the single record
    },
    [currentRecord, setRecordData],
  );

  const handleAddField = useCallback(
    (key: string, value: string) => {
      if (!currentRecord) return;
      if (!(key in currentRecord)) {
        // Only add if field doesn't exist
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

        const sourceData: DataRecord = await response.json(); // Expect single DataRecord
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
        body: JSON.stringify(currentRecord), // Send the single record
      });
      if (!response.ok) throw new Error("Commit failed on server");
      const result = await response.json();

      // No localStorage items to clear related to record index/soft validation

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

  // Handler for when a field gains focus (used by DataEntryPane)
  const handleFieldFocus = useCallback((key: string, initialValue: string) => {
    setFocusedFieldInfo({ key, initialValue });
  }, []);

  // Keyboard Navigation Effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputField =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      // Global Undo/Redo (Ctrl/Cmd + Z/Y or Shift+Z) - always works
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        if (canUndoRecord) {
          // Check against renamed state
          event.preventDefault(); // Prevent browser undo
          undoRecord(); // Use renamed function
        }
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "y" || (event.shiftKey && event.key === "Z"))
      ) {
        if (canRedoRecord) {
          // Check against renamed state
          event.preventDefault(); // Prevent browser redo
          redoRecord(); // Use renamed function
        }
        return;
      }

      if (isInputField) {
        // Field-specific Escape behavior
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
          (activeElement as HTMLElement).blur(); // Blur the field
          setFocusedFieldInfo(null); // Clear focused field info
          return;
        }
        // Ctrl/Cmd + Enter to accept change and blur field
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          (activeElement as HTMLElement).blur(); // Blur the field
          setFocusedFieldInfo(null); // Clear focused field info
          return;
        }
        // For ArrowLeft, ArrowRight, Enter (without modifier):
        // Do NOT preventDefault() to allow native text input behavior (cursor movement, new lines).
        return; // Consume event, no global navigation
      }

      // Global navigation when no input field is focused
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        handleCommit(); // Commit current record and move to next file
      } else if (event.key === "ArrowLeft" || event.key === "Escape") {
        event.preventDefault();
        navigateBackToList(); // Navigate back to the file list
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleCommit, // Now responsible for advancing
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
    currentPDFSrc,
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
    jsonFilename: json_filename || "", // Expose filename
  };
};
