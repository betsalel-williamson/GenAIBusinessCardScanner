import React, { useRef, useState, useEffect } from 'react';
import { useValidationData } from '../hooks/useValidationData';
import ImagePane from '../components/ImagePane';
import DataEntryPane, { DataEntryPaneHandle } from '../components/DataEntryPane';
import StatusDisplay from '../components/StatusDisplay';

interface FileStatus { // Define FileStatus interface locally for ValidatePage's global file fetch
  filename: string;
  status: "validated" | "in_progress" | "source";
}

const ValidatePage: React.FC = () => {
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const dataEntryPaneRef = useRef<DataEntryPaneHandle>(null);

    // State for global file progress bar
    const [globalFiles, setGlobalFiles] = useState<FileStatus[]>([]);
    const [globalLoading, setGlobalLoading] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Fetch global file list for progress bar
    useEffect(() => {
        const fetchGlobalFiles = async () => {
            setGlobalLoading(true);
            try {
                const response = await fetch('/api/files');
                if (!response.ok) throw new Error('Failed to fetch global file list');
                const data: FileStatus[] = await response.json();
                setGlobalFiles(data);
            } catch (err) {
                setGlobalError(err instanceof Error ? err.message : 'Unknown error fetching global files');
            } finally {
                setGlobalLoading(false);
            }
        };
        fetchGlobalFiles();
    }, []); // Empty dependency array means it runs once on mount

    const {
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
        jsonFilename,
    } = useValidationData(dataEntryPaneRef);

    if (loading) return <StatusDisplay message="Loading..." type="loading" jsonFilename={jsonFilename} />;
    if (error) return <StatusDisplay message={`Error: ${error}`} type="error" jsonFilename={jsonFilename} />;
    if (!currentRecord) return <StatusDisplay message="No data found." type="empty" jsonFilename={jsonFilename} onBack={navigateBackToList} />;

    // Calculations for the progress bar
    const totalTrackedRecords = globalFiles.filter(f => f.status === 'in_progress' || f.status === 'validated').length;
    const validatedRecords = globalFiles.filter(f => f.status === 'validated').length;
    const progressPercentage = totalTrackedRecords > 0 ? Math.round((validatedRecords / totalTrackedRecords) * 100) : 0;

    return (
        <div className="flex h-screen bg-gray-50 pb-2"> {/* Added pb-2 for progress bar clearance */}
            <div className="flex-grow p-6 flex flex-col">
                {currentRecord && currentPDFSrc ? (
                    <ImagePane
                        imageWrapperRef={imageWrapperRef}
                        pdfSrc={currentPDFSrc}
                        transformation={transformation}
                        onTransformationChange={setTransformation}
                    />
                ) : (
                    <StatusDisplay
                        message="No PDF source provided for this record."
                        type="no-source"
                        jsonFilename={jsonFilename}
                        onBack={navigateBackToList}
                    />
                )}
            </div>
            <div className="w-1/3 max-w-md h-full flex flex-col border-l border-gray-200 bg-white">
                <DataEntryPane
                    ref={dataEntryPaneRef}
                    currentRecord={currentRecord}
                    onFieldChange={handleFieldChange}
                    onAddField={handleAddField}
                    autosaveStatus={autosaveStatus}
                    onCommit={handleCommit}
                    onBack={navigateBackToList}
                    onRevertField={handleRevertField}
                    onFieldFocus={handleFieldFocus}
                />
            </div>

            {/* Progress Bar (only show if there are tracked records) */}
            {!globalLoading && !globalError && totalTrackedRecords > 0 && (
                <div className="fixed bottom-0 left-0 right-0 h-1.5 bg-gray-200 z-50">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default ValidatePage;
