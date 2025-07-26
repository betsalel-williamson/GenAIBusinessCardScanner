import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import type { DataRecord } from "../../../types/types";

// Define the desired order of fields
const FIELD_ORDER = [
  "company",
  "website",
  "prefix",
  "full_name",
  "first_name",
  "last_name",
  "title",
  "address_1",
  "address_2",
  "address_3",
  "city",
  "state_or_state_code",
  "country_or_country_code",
  "zip_code_or_post_code",
  "phone",
  "extension",
  "cell",
  "email",
  "retailer_type",
  "source", // Keep source here if you want it to appear, but it will be filtered from editing
  "date_imported",
  "contact_type",
  "notes",
  "time_imported",
  "products",
];

export interface DataEntryPaneProps {
  currentRecord: DataRecord | null;
  onFieldChange: (key: string, newValue: string) => void;
  onAddField: (key: string, value: string) => void;
  autosaveStatus: { message: string; type: string };
  onCommit: () => void;
  onBack: () => void;
  onRevertField: (key: string) => void;
  onFieldFocus: (key: string, initialValue: string) => void;
}

// Define the imperative handle for parent components
export interface DataEntryPaneHandle {
  scrollToTop: () => void;
}

const DataEntryPane = forwardRef<DataEntryPaneHandle, DataEntryPaneProps>(
  (
    {
      currentRecord,
      onFieldChange,
      onAddField,
      autosaveStatus,
      onCommit,
      onBack,
      onRevertField,
      onFieldFocus,
    },
    ref,
  ) => {
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const scrollableDivRef = useRef<HTMLDivElement>(null); // Ref for the scrollable content

    // Expose scrollToTop function to parent component via ref
    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (scrollableDivRef.current) {
          scrollableDivRef.current.scrollTop = 0;
        }
      },
    }));

    if (!currentRecord) {
      return (
        <div className="p-6 border-l border-gray-200 bg-white h-full flex flex-col justify-center items-center">
          <p className="text-gray-500">
            No record selected. This file might be empty or invalid.
          </p>
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
        setNewFieldName("");
        setNewFieldValue("");
      } else {
        alert("Field name cannot be empty or already exists!");
      }
    };

    const allCurrentKeys = Object.keys(currentRecord);
    const orderedKeys: string[] = [];
    const seenKeys = new Set<string>();

    FIELD_ORDER.forEach((key) => {
      if (allCurrentKeys.includes(key)) {
        orderedKeys.push(key);
        seenKeys.add(key);
      }
    });

    allCurrentKeys.forEach((key) => {
      if (!seenKeys.has(key)) {
        orderedKeys.push(key);
      }
    });
    orderedKeys.sort((a, b) => {
      const aIndex = FIELD_ORDER.indexOf(a);
      const bIndex = FIELD_ORDER.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) {
        return -1;
      }
      if (bIndex !== -1) {
        return 1;
      }
      return a.localeCompare(b);
    });

    const nonEditableFields = ["source", "date_imported", "time_imported"];
    const editableFieldKeys = orderedKeys.filter(
      (key) => !nonEditableFields.includes(key),
    );

    // For "Add New Field" section: Filter FIELD_ORDER for suggestions
    const suggestedNewFieldNames = FIELD_ORDER.filter(
      (key) =>
        !allCurrentKeys.includes(key) && !nonEditableFields.includes(key),
    );

    return (
      <>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">
            Record Fields
          </h3>
          <span
            id="autosave-status"
            className={`text-sm mt-1 ${autosaveStatus.type}`}
          >
            {autosaveStatus.message}
          </span>
        </div>
        <div ref={scrollableDivRef} className="grow overflow-y-auto p-6">
          {" "}
          {/* Assign ref here */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {editableFieldKeys.map((key) => (
              <div key={key} className="form-group">
                <label
                  htmlFor={`field_${key}`}
                  className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                  {key.replace(/_/g, " ")}:
                </label>
                <div className="flex items-center gap-2">
                  <textarea
                    id={`field_${key}`}
                    name={`field_${key}`} // Add name attribute for better identification
                    value={String(currentRecord[key] || "")}
                    onChange={(e) => onFieldChange(key, e.target.value)}
                    onFocus={(e) => onFieldFocus(key, e.target.value)} // Report focus event
                    className="grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[50px]"
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={() => onRevertField(key)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-red-400 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    title={`Revert ${key.replace(/_/g, " ")}`}
                  >
                    Revert
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Field Section */}
            <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
              <h4 className="text-xl font-semibold text-gray-800">
                Add New Field
              </h4>
              <div>
                <label
                  htmlFor="newFieldName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Field Name:
                </label>
                <input
                  type="text"
                  id="newFieldName"
                  name="newFieldName" // Add name attribute
                  list="suggested-new-fields" // Link to datalist
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onFocus={(e) => onFieldFocus("newFieldName", e.target.value)} // Report focus event
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., website_url or select from list"
                />
                <datalist id="suggested-new-fields">
                  {suggestedNewFieldNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label
                  htmlFor="newFieldValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Field Value:
                </label>
                <textarea
                  id="newFieldValue"
                  name="newFieldValue" // Add name attribute
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  onFocus={(e) => onFieldFocus("newFieldValue", e.target.value)} // Report focus event
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
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 justify-end">
          {" "}
          {/* Align buttons to end */}
          <button
            type="button"
            onClick={onCommit}
            className="grow px-4 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Commit & Next File
          </button>
          <button
            type="button"
            onClick={onBack}
            className="grow px-4 py-3 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Back to List
          </button>
        </div>
      </>
    );
  },
);

export default DataEntryPane;
