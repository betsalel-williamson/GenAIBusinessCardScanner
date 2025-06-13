import React from 'react';

interface RecordNavigationHeaderProps {
    currentRecordIndex: number;
    totalRecords: number;
    isCurrentRecordSoftValidated: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const RecordNavigationHeader: React.FC<RecordNavigationHeaderProps> = ({
    currentRecordIndex,
    totalRecords,
    isCurrentRecordSoftValidated,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {
    return (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Undo
            </button>
            <span className="text-lg font-medium text-gray-700">
                Record {currentRecordIndex + 1} / {totalRecords}
                {isCurrentRecordSoftValidated && (
                    <span className="ml-2 text-green-500 text-base" title="Record validated by moving to next">✓</span>
                )}
            </span>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Redo
            </button>
        </div>
    );
};

export default RecordNavigationHeader;
