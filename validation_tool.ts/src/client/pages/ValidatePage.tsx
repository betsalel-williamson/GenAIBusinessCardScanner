import React, { useRef } from 'react';
import { useValidationData } from '../hooks/useValidationData';
import ImagePane from '../components/ImagePane';
import DataEntryPane, { DataEntryPaneHandle } from '../components/DataEntryPane';
import StatusDisplay from '../components/StatusDisplay';


const ValidatePage: React.FC = () => {
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const dataEntryPaneRef = useRef<DataEntryPaneHandle>(null);

    const {
        loading,
        error,
        autosaveStatus,
        currentRecord, // Now represents the single record for the current file
        currentPDFSrc,
        transformation,
        setTransformation,
        handleFieldChange,
        handleAddField,
        handleRevertField,
        handleCommit, // This now implicitly handles "next record" (i.e., next file)
        navigateBackToList,
        handleFieldFocus,
        jsonFilename, // Pass filename to StatusDisplay if needed
    } = useValidationData(dataEntryPaneRef);

    // No longer need totalRecords or currentRecordIndex within a file
    // No longer need isCurrentRecordSoftValidated

    if (loading) return <StatusDisplay message="Loading..." type="loading" jsonFilename={jsonFilename} />;
    if (error) return <StatusDisplay message={`Error: ${error}`} type="error" jsonFilename={jsonFilename} />;
    // If currentRecord is null and not loading/error, it implies the file itself was empty or missing.
    // We can also infer 'totalRecords' from whether currentRecord exists.
    if (!currentRecord) return <StatusDisplay message="No data found." type="empty" jsonFilename={jsonFilename} onBack={navigateBackToList} />;

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-grow p-6 flex flex-col">
                {/* RecordNavigationHeader removed as it's no longer relevant for single-record files */}
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
                    // onNextRecord and onPrevRecord props removed
                />
            </div>
        </div>
    );
};

export default ValidatePage;
