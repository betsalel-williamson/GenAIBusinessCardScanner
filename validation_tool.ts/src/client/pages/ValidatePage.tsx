import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUndoableState } from '../hooks/useUndoableState';
import { useDebounce } from '../hooks/useDebounce';
import ImagePane from '../components/ImagePane';
import DataEntryPane from '../components/DataEntryPane';
import type { DataRecord, AppState, TransformationState } from '../../../types/types';

// Helper to get PDF path from record source (e.g., "file.pdf" -> "/images/file.pdf")
const getPDFSrcFromRecord = (record: DataRecord | undefined) => {
    if (!record?.source || typeof record.source !== 'string' || record.source.trim() === '') {
        return ""; // Return empty string if source is missing, not a string, or empty
    }
    const baseName = record.source.split(".").slice(0, -1).join(".");
    return `/images/${baseName}.pdf`; // Changed to .pdf
};

const ValidatePage: React.FC = () => {
    const { json_filename } = useParams<{ json_filename: string }>();
    const navigate = useNavigate();

    const imageWrapperRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autosaveStatus, setAutosaveStatus] = useState({ message: '', type: ''});

    // useUndoableState manages the array of records
    const [
        records,
        setRecords,
        undoRecords,
        redoRecords,
        resetRecords,
        canUndoRecords,
        canRedoRecords
    ] = useUndoableState<DataRecord[]>([]);

    // Local state for current record and image transformation
    const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
    const [transformation, setTransformation] = useState<TransformationState>({
        offsetX: 0,
        offsetY: 0,
        scale: 1.0
    });

    const debouncedRecords = useDebounce(records, 1000);

    // Memoize the current record
    const currentRecord = useMemo(() => records[currentRecordIndex] || null, [records, currentRecordIndex]);

    // Initial data load
    useEffect(() => {
        if (!json_filename) return;
        setLoading(true);
        fetch(`/api/files/${json_filename}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((initialData: DataRecord[]) => {
                if (!Array.isArray(initialData)) {
                    throw new Error("Invalid data format: Expected an array of records.");
                }
                resetRecords(initialData); // Set initial records for undo history
                setCurrentRecordIndex(0);
                setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 }); // Reset image view
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [json_filename, resetRecords]);

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

    // Handler for updating a field's value
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

    // Handler for adding a new field to the current record
    const handleAddField = useCallback((key: string, value: string) => {
        if (!currentRecord) return;
        const newRecords = records.map((rec, rIdx) => {
            if (rIdx === currentRecordIndex) {
                // Ensure key doesn't already exist before adding
                if (!(key in rec)) {
                    return { ...rec, [key]: value };
                }
            }
            return rec;
        });
        setRecords(newRecords);
    }, [records, currentRecordIndex, setRecords, currentRecord]);

    const handleCommit = useCallback(async () => {
        if (!json_filename || records.length === 0) return;

        setAutosaveStatus({ message: "Committing...", type: "status-progress" });

        try {
            const response = await fetch(`/api/commit/${json_filename}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(records), // Send all records for final commit
            });
            if (!response.ok) throw new Error("Commit failed on server");
            const result = await response.json();
            if (result.nextFile) {
                navigate(`/validate/${result.nextFile}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            setAutosaveStatus({ message: "Commit Failed!", type: "status-error" });
            console.error(err);
        }
    }, [json_filename, records, navigate]);

    const handleNextRecord = useCallback(() => {
        if (currentRecordIndex < records.length - 1) {
            setCurrentRecordIndex(prev => prev + 1);
            setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 }); // Reset image view for new record
        } else {
            // No more records, prompt to commit or go back to list
            if (window.confirm("No more records. Do you want to commit changes and go back to file list?")) {
                handleCommit();
            } else {
                navigate('/');
            }
        }
    }, [currentRecordIndex, records.length, navigate, handleCommit]);

    const handlePrevRecord = useCallback(() => {
        if (currentRecordIndex > 0) {
            setCurrentRecordIndex(prev => prev - 1);
            setTransformation({ offsetX: 0, offsetY: 0, scale: 1.0 }); // Reset image view for new record
        }
    }, [currentRecordIndex]);

    const handleRevertField = useCallback(async (keyToRevert: string) => {
        if (!json_filename || !currentRecord || !keyToRevert) return;
        if (!window.confirm(`Revert "${keyToRevert}" to original source?`)) return;

        try {
            setAutosaveStatus({ message: "Reverting field...", type: "status-progress" });
            const response = await fetch(`/api/source-data/${json_filename}`);
            if (!response.ok) throw new Error('Failed to fetch source data.');

            const sourceData: DataRecord[] = await response.json();
            // Find the original value for the specific record and key
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


    if (loading) return <div className="p-8 text-xl">Loading...</div>;
    if (error) return <div className="p-8 text-xl text-red-500">Error: {error}</div>;
    if (records.length === 0) return <div className="p-8 text-xl">No data found for {json_filename}.</div>;

    const currentPDFSrc = getPDFSrcFromRecord(currentRecord);

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-grow p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <button
                        onClick={undoRecords}
                        disabled={!canUndoRecords}
                        className="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Undo
                    </button>
                    <span className="text-lg font-medium text-gray-700">
                        Record {currentRecordIndex + 1} / {records.length}
                    </span>
                    <button
                        onClick={redoRecords}
                        disabled={!canRedoRecords}
                        className="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Redo
                    </button>
                </div>
                {currentRecord && currentPDFSrc ? (
                    <ImagePane
                        imageWrapperRef={imageWrapperRef}
                        pdfSrc={currentPDFSrc}
                        transformation={transformation}
                        onTransformationChange={setTransformation}
                    />
                ) : (
                    <div className="flex-grow flex items-center justify-center bg-gray-200 text-gray-700 text-center p-4 rounded-md">
                        {currentRecord ? (
                            <p>No PDF 'source' field found for the current record, or it's empty.<br/>
                            Please ensure your JSON data includes a 'source' field (e.g., "my_document.pdf").</p>
                        ) : (
                            <p>No record selected or data is empty. <br/>
                            Check your JSON file in 'data_source/' for '{json_filename}'.</p>
                        )}
                    </div>
                )}
            </div>
            <div className="w-1/3 max-w-md h-full flex flex-col border-l border-gray-200 bg-white">
                <DataEntryPane
                    currentRecord={currentRecord}
                    onFieldChange={handleFieldChange}
                    onAddField={handleAddField} // Pass the new handler
                    onNextRecord={handleNextRecord}
                    onPrevRecord={handlePrevRecord}
                    autosaveStatus={autosaveStatus}
                    onCommit={handleCommit}
                    onBack={() => navigate('/')}
                    onRevertField={handleRevertField}
                />
            </div>
        </div>
    );
};

export default ValidatePage;
