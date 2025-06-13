import React, { useState } from 'react';
import type { DataRecord } from '../../../types/types';

interface DataEntryPaneProps {
  currentRecord: DataRecord | null;
  onFieldChange: (key: string, newValue: string) => void;
  onAddField: (key: string, value: string) => void; // New prop for adding fields
  onNextRecord: () => void;
  onPrevRecord: () => void;
  autosaveStatus: { message: string, type: string };
  onCommit: () => void;
  onBack: () => void;
  onRevertField: (key: string) => void; // Updated to revert a specific field
}

const DataEntryPane: React.FC<DataEntryPaneProps> = ({
  currentRecord,
  onFieldChange,
  onAddField,
  onNextRecord,
  onPrevRecord,
  autosaveStatus,
  onCommit,
  onBack,
  onRevertField,
}) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

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

  const handleAddField = () => {
    if (newFieldName.trim() && !(newFieldName.trim() in currentRecord)) {
      onAddField(newFieldName.trim(), newFieldValue);
      setNewFieldName('');
      setNewFieldValue('');
    } else {
      alert('Field name cannot be empty or already exists!');
    }
  };

  const sortedFieldKeys = Object.keys(currentRecord).sort();
  // Filter out the 'source' field from being editable
  const editableFieldKeys = sortedFieldKeys.filter(key => key !== 'source');


  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800">Record Fields</h3>
        <span id="autosave-status" className={`text-sm mt-1 ${autosaveStatus.type}`}>
          {autosaveStatus.message}
        </span>
      </div>
      <div className="flex-grow overflow-y-auto p-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {editableFieldKeys.map((key) => (
            <div key={key} className="form-group">
              <label htmlFor={`field_${key}`} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/_/g, ' ')}:
              </label>
              <div className="flex items-center gap-2">
                <textarea
                  id={`field_${key}`}
                  name={`field_${key}`}
                  value={String(currentRecord[key] || '')}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[50px]"
                  rows={3}
                />
                <button
                    type="button"
                    onClick={() => onRevertField(key)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-red-400 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    title={`Revert ${key.replace(/_/g, ' ')}`}
                >
                    Revert
                </button>
              </div>
            </div>
          ))}

          {/* Add New Field Section */}
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
            <h4 className="text-xl font-semibold text-gray-800">Add New Field</h4>
            <div>
              <label htmlFor="newFieldName" className="block text-sm font-medium text-gray-700 mb-1">
                Field Name:
              </label>
              <input
                type="text"
                id="newFieldName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., website_url"
              />
            </div>
            <div>
              <label htmlFor="newFieldValue" className="block text-sm font-medium text-gray-700 mb-1">
                Field Value:
              </label>
              <textarea
                id="newFieldValue"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[50px]"
                rows={3}
                placeholder="Value for new field"
              />
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Field
            </button>
          </div>
        </form>
      </div>
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2">
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
    </>
  );
};

export default DataEntryPane;
