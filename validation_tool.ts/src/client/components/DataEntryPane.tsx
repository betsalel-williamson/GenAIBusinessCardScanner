import React from 'react';
import type { DataRecord } from '../../../types/types';

interface DataEntryPaneProps {
  currentRecord: DataRecord | null;
  currentFieldKey: string;
  currentFieldValue: string;
  fieldKeys: string[]; // List of all field keys for navigation
  onFieldChange: (newText: string) => void;
  onNextField: () => void;
  onPrevField: () => void;
  onNextRecord: () => void;
  onPrevRecord: () => void;
  autosaveStatus: { message: string, type: string };
  onCommit: () => void;
  onBack: () => void;
  onRevertField: () => void; // Revert a single field
}

const DataEntryPane: React.FC<DataEntryPaneProps> = ({
  currentRecord,
  currentFieldKey,
  currentFieldValue,
  fieldKeys,
  onFieldChange,
  onNextField,
  onPrevField,
  onNextRecord,
  onPrevRecord,
  autosaveStatus,
  onCommit,
  onBack,
  onRevertField,
}) => {
  const currentFieldIndex = fieldKeys.indexOf(currentFieldKey);
  const isFirstField = currentFieldIndex === 0;
  const isLastField = currentFieldIndex === fieldKeys.length - 1;

  if (!currentRecord) {
    return (
      <div className="p-6 border-l border-gray-200 bg-white h-full flex flex-col justify-center items-center">
        <p className="text-gray-500">No record selected.</p>
        <button
            type="button"
            onClick={onBack}
            className="mt-4 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
            Back to List
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800">Data Field: <span className="capitalize">{currentFieldKey.replace(/_/g, ' ')}</span></h3>
        <span id="autosave-status" className={`text-sm mt-1 ${autosaveStatus.type}`}>
          {autosaveStatus.message}
        </span>
      </div>
      <div className="flex-grow overflow-y-auto p-6">
        <form onSubmit={(e) => { e.preventDefault(); onNextField(); }} className="space-y-4">
          <div className="form-group">
            <label htmlFor={`field_${currentFieldKey}`} className="block text-sm font-medium text-gray-700 mb-1">
              Value:
            </label>
            <textarea
              id={`field_${currentFieldKey}`}
              name={`field_${currentFieldKey}`}
              value={currentFieldValue || ''}
              onChange={(e) => onFieldChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              rows={5}
            />
          </div>
        </form>
      </div>
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                type="button"
                onClick={onPrevField}
                disabled={isFirstField}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev Field
            </button>
            <button
                type="button"
                onClick={onNextField}
                disabled={isLastField}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next Field
            </button>
            <button
                type="button"
                onClick={onRevertField}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Revert Field
            </button>
        </div>
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={onPrevRecord}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                Prev Record
            </button>
            <button
                type="button"
                onClick={onNextRecord}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                Next Record
            </button>
            <button
                type="button"
                onClick={onCommit}
                className="flex-grow px-4 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Commit & Next File
            </button>
            <button
                type="button"
                onClick={onBack}
                className="flex-grow px-4 py-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
                Back to List
            </button>
        </div>
      </div>
    </>
  );
};

export default DataEntryPane;
