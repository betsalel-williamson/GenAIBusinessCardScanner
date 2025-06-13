import React, { useRef } from 'react';
import { useValidationData } from '../hooks/useValidationData'; // New import
import ImagePane from '../components/ImagePane';
import DataEntryPane, { DataEntryPaneHandle } from '../components/DataEntryPane';
import RecordNavigationHeader from '../components/RecordNavigationHeader';
import StatusDisplay from '../components/StatusDisplay';


const ValidatePage: React.FC = () => {
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const dataEntryPaneRef = useRef<DataEntryPaneHandle>(null);

    const {
        loading,
        error,
        autosaveStatus,
        currentRecord,
        currentRecordIndex,
        totalRecords,
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
    } = useValidationData(dataEntryPaneRef); // Use the custom hook

    if (loading) return <StatusDisplay message="Loading..." type="loading" />;
    if (error) return <StatusDisplay message={`Error: ${error}`} type="error" />;
    if (totalRecords === 0) return <StatusDisplay message="No data found." type="empty" onBack={navigateBackToList} />;

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-grow p-6 flex flex-col">
                <RecordNavigationHeader
                    currentRecordIndex={currentRecordIndex}
                    totalRecords={totalRecords}
                    isCurrentRecordSoftValidated={isCurrentRecordSoftValidated}
                    onUndo={undoRecords}
                    onRedo={redoRecords}
                    canUndo={canUndoRecords}
                    canRedo={canRedoRecords}
                />
                {currentRecord && currentPDFSrc ? (
                    <ImagePane
                        imageWrapperRef={imageWrapperRef}
                        pdfSrc={currentPDFSrc}
                        transformation={transformation}
                        onTransformationChange={setTransformation}
                    />
                ) : (
                    <StatusDisplay
                        message="No PDF source provided."
                        type="no-source"
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
                    onNextRecord={handleNextRecord}
                    onPrevRecord={handlePrevRecord}
                    autosaveStatus={autosaveStatus}
                    onCommit={handleCommit}
                    onBack={navigateBackToList}
                    onRevertField={handleRevertField}
                />
            </div>
        </div>
    );
};

export default ValidatePage;
