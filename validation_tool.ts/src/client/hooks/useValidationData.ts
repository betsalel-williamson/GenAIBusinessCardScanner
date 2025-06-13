import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUndoableState } from './useUndoableState';
import { useDebounce } from './useDebounce';
import type { DataRecord, TransformationState } from '../../../types/types';
import type { DataEntryPaneHandle } from '../components/DataEntryPane';

// Helper to get PDF path from record source (e.g., "file.pdf" -> "/images/file.pdf")
const getPDFSrcFromRecord = (record: DataRecord | undefined) => {
    if (!record?.source || typeof record.source !== 'string' || record.source.trim() === '') {
        return ""; // Return empty string if source is missing, not a string, or empty
    }
    const baseName = record.source.split(".").slice(0, -1).join(".");
    return `/images/${baseName}.pdf`; // Changed to .pdf
};

const LOCAL_STORAGE_KEY_LAST_VIEWED_PREFIX = 'lastViewedRecord_';
const LOCAL_STORAGE_KEY_SOFT_VALIDATED_PREFIX = 'softValidatedIndices_';

interface UseValidationDataHook {
    loading: boolean;
    error: string | null;
    autosaveStatus: { message: string, type: string };
    currentRecord: DataRecord | null;
    currentRecordIndex: number;
    totalRecords: number;
    currentPDFSrc: string;
    isCurrentRecordSoftValidated: boolean;
    canUndoRecords: boolean;
    canRedoRecords: boolean;
    transformation: TransformationState;
    setTransformation: (newState: TransformationState) => void;
    handleFieldChange: (key: string, newValue: string) => void;
    handleAddField: (key: string, value: string) => void;
    handleRevertField: (key: string) => Promise<void>;
    handleNextRecord: () => void;
    handlePrevRecord: () => void;
    handleCommit: () => Promise<void>;
    undoRecords: () => void;
    redoRecords: () => void;
    navigateBackToList: () => void;
}

export const useValidationData = (dataEntryPaneRef: React.RefObject<DataEntryPaneHandle>): UseValidationDataHook => {
    const { json_filename, record_index } = useParams<{ json_filename: string; record_index?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autosaveStatus, setAutosaveStatus] = useState({ message: '', type: '' });

    const initialRecordIndexRef = useRef(0);
    const [softValidatedIndices, setSoftValidatedIndices] = useState<Set<number>>(new Set());

    const [
        records,
        setRecords,
        undoRecords,
        redoRecords,
        resetRecords,
        canUndoRecords,
        canRedoRecords
    ] = useUndoableState<DataRecord[]>([]);

    const [currentRecordIndex, setCurrentRecordIndex] = useState(initialRecordIndexRef.current);
    const [transformation, setTransformation] = useState<TransformationState>({
        offsetX: 0,
        offsetY: 0,
        scale: 1.0
    });

    const debouncedRecords = useDebounce(records, 1000);

    const currentRecord = useMemo(() => records[currentRecordIndex] || null, [records, currentRecordIndex]);
    const currentPDFSrc = useMemo(() => getPDFSrcFromRecord(currentRecord), [currentRecord]);
    const isCurrentRecordSoftValidated = useMemo(() => softValidatedIndices.has(currentRecordIndex), [softValidatedIndices, currentRecordIndex]);

    // Initial data load and index/soft-validation determination
    useEffect(() => {
        if (!json_filename) return;

        setLoading(true);

        let initialIdx = 0;
        if (record_index) {
            initialIdx = Math.max(0, parseInt(record_index, 10) - 1);
        } else {
            try {
                const storedIndex = localStorage.getItem(`${LOCAL_STORAGE_KEY_LAST_VIEWED_PREFIX}${json_filename}`);
                if (storedIndex !== null) {
                    initialIdx = Math.max(0, parseInt(storedIndex, 10));
                }
            } catch (e) {
                console.warn("Failed to read last viewed record from localStorage:", e);
            }
        }
        initialRecordIndexRef.current = initialIdx;

        try {
            const storedSoftValidated = localStorage.getItem(`${LOCAL_STORAGE_KEY_SOFT_VALIDATED_PREFIX}${json_filename}`);
            if (storedSoftValidated) {
                setSoftValidatedIndices(new Set(JSON.parse(storedSoftValidated)));
            } else {
                setSoftValidatedIndices(new Set());
            }
        } catch (e) {
            console.warn("Failed to read soft-validated indices from localStorage:", e);
            setSoftValidatedIndices(new Set());
        }


        fetch(`/api/files/${json_filename}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((initialData: DataRecord[]) => {
                if (!Array.isArray(initialData)) {
                    throw new Error("Invalid data format: Expected an array of records.");
                }
                resetRecords(initialData);

                const finalInitialIndex = Math.min(initialIdx, initialData.length - 1);
                setCurrentRecordIndex(finalInitialIndex);

                setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 });
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [json_filename, record_index, resetRecords]);

    // Synchronize currentRecordIndex state with URL and localStorage
    useEffect(() => {
        if (!json_filename || records.length === 0) return;

        try {
            localStorage.setItem(`${LOCAL_STORAGE_KEY_LAST_VIEWED_PREFIX}${json_filename}`, currentRecordIndex.toString());
        } catch (e) {
            console.warn("Failed to write last viewed record to localStorage:", e);
        }

        const urlRecordParam = parseInt(record_index || '1', 10);
        if (currentRecordIndex + 1 !== urlRecordParam) {
            navigate(`/validate/${json_filename}/${currentRecordIndex + 1}`, { replace: true });
        }
    }, [currentRecordIndex, json_filename, record_index, navigate, records.length]);

    // Save soft-validated indices to localStorage
    useEffect(() => {
        if (!json_filename) return;
        try {
            localStorage.setItem(`${LOCAL_STORAGE_KEY_SOFT_VALIDATED_PREFIX}${json_filename}`, JSON.stringify(Array.from(softValidatedIndices)));
        } catch (e) {
            console.warn("Failed to write soft-validated indices to localStorage:", e);
        }
    }, [softValidatedIndices, json_filename]);


    const autoSave = useCallback(async (dataToSave: DataRecord[]) => {
        if (!json_filename) return;

        setAutosaveStatus({ message: "Saving...", type: "status-progress" });

        try {
            const response = await fetch(`/api/autosave/${json_filename}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });
            if (!response.ok) throw new Error("Autosave failed on server");
            setAutosaveStatus({ message: "Draft Saved ✓", type: "status-validated" });
        } catch (err) {
            setAutosaveStatus({ message: "Save Failed!", type: "status-error" });
            console.error(err);
        }
    }, [json_filename]);

    // Autosave effect (triggered by debouncedRecords)
    useEffect(() => {
        if (debouncedRecords.length > 0 && (canUndoRecords || canRedoRecords)) {
            autoSave(debouncedRecords);
        }
    }, [debouncedRecords, autoSave, canUndoRecords, canRedoRecords]);

    // Handlers for DataEntryPane
    const handleFieldChange = useCallback((key: string, newValue: string) => {
        if (!currentRecord) return;
        const newRecords = records.map((rec, rIdx) => {
            if (rIdx === currentRecordIndex) {
                return { ...rec, [key]: newValue };
            }
            return rec;
        });
        setRecords(newRecords);
    }, [records, currentRecordIndex, setRecords, currentRecord]);

    const handleAddField = useCallback((key: string, value: string) => {
        if (!currentRecord) return;
        const newRecords = records.map((rec, rIdx) => {
            if (rIdx === currentRecordIndex) {
                if (!(key in rec)) {
                    return { ...rec, [key]: value };
                }
            }
            return rec;
        });
        setRecords(newRecords);
    }, [records, currentRecordIndex, setRecords, currentRecord]);

    const handleRevertField = useCallback(async (keyToRevert: string) => {
        if (!json_filename || !currentRecord || !keyToRevert) return;
        if (!window.confirm(`Revert "${keyToRevert}" to original source?`)) return;

        try {
            setAutosaveStatus({ message: "Reverting field...", type: "status-progress" });
            const response = await fetch(`/api/source-data/${json_filename}`);
            if (!response.ok) throw new Error('Failed to fetch source data.');

            const sourceData: DataRecord[] = await response.json();
            const originalValue = sourceData[currentRecordIndex]?.[keyToRevert];

            if (originalValue !== undefined) {
                const newRecords = records.map((rec, rIdx) => {
                    if (rIdx === currentRecordIndex) {
                        return { ...rec, [keyToRevert]: originalValue };
                    }
                    return rec;
                });
                setRecords(newRecords);
                setAutosaveStatus({ message: "Field Reverted ✓", type: "status-validated" });
            } else {
                setAutosaveStatus({ message: `Original value not found for field "${keyToRevert}".`, type: "status-error" });
            }
        } catch (err) {
            setAutosaveStatus({ message: "Revert Failed!", type: "status-error" });
            console.error(err);
        }
    }, [json_filename, currentRecord, currentRecordIndex, records, setRecords]);

    const handleCommit = useCallback(async () => {
        if (!window.confirm("Committing will validate ALL records in this file and move it. Are you sure?")) {
            return;
        }

        if (!json_filename || records.length === 0) return;

        setAutosaveStatus({ message: "Committing...", type: "status-progress" });

        try {
            const response = await fetch(`/api/commit/${json_filename}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records),
            });
            if (!response.ok) throw new Error("Commit failed on server");
            const result = await response.json();

            try {
                localStorage.removeItem(`${LOCAL_STORAGE_KEY_LAST_VIEWED_PREFIX}${json_filename}`);
                localStorage.removeItem(`${LOCAL_STORAGE_KEY_SOFT_VALIDATED_PREFIX}${json_filename}`);
            } catch (e) {
                console.warn("Failed to clear localStorage for committed file:", e);
            }

            if (result.nextFile) {
                navigate(`/validate/${result.nextFile}/1`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setAutosaveStatus({ message: "Commit Failed!", type: "status-error" });
            console.error(err);
        }
    }, [json_filename, records, navigate]);

    const handleNextRecord = useCallback(() => {
        if (currentRecordIndex < records.length - 1) {
            setSoftValidatedIndices(prev => new Set(prev).add(currentRecordIndex));
            setCurrentRecordIndex(prev => prev + 1);
            setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 });
            dataEntryPaneRef.current?.scrollToTop();
        } else {
            setSoftValidatedIndices(prev => new Set(prev).add(currentRecordIndex));
            if (window.confirm("No more records. Do you want to commit changes and go back to file list?")) {
                handleCommit();
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [currentRecordIndex, records.length, navigate, handleCommit, dataEntryPaneRef]);

    const handlePrevRecord = useCallback(() => {
        if (currentRecordIndex > 0) {
            setCurrentRecordIndex(prev => prev - 1);
            setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 });
            dataEntryPaneRef.current?.scrollToTop();
        }
    }, [currentRecordIndex, dataEntryPaneRef]);

    const navigateBackToList = useCallback(() => {
        navigate('/', { replace: true });
    }, [navigate]);

    // Keyboard Navigation Effect
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
            }

            if (event.key === 'ArrowLeft') {
                handlePrevRecord();
            } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
                handleNextRecord();
            } else if (event.key === 'Escape') {
                navigateBackToList();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePrevRecord, handleNextRecord, navigateBackToList]);

    return {
        loading,
        error,
        autosaveStatus,
        currentRecord,
        currentRecordIndex,
        totalRecords: records.length,
        currentPDFSrc,
        isCurrentRecordSoftValidated,
        canUndoRecords,
        canRedoRecords,
        transformation,
        setTransformation,
        handleFieldChange,
        handleAddField,
        handleRevertField,
        handleNextRecord,
        handlePrevRecord,
        handleCommit,
        undoRecords,
        redoRecords,
        navigateBackToList,
    };
};
