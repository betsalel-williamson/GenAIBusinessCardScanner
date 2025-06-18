import React, { useRef, useState, useEffect } from "react";
import { useValidationData } from "../hooks/useValidationData";
import ImagePane from "../components/ImagePane";
import DataEntryPane, {
  DataEntryPaneHandle,
} from "../components/DataEntryPane";
import StatusDisplay from "../components/StatusDisplay";
import { FileInfo } from "../../../types/types";

const ValidatePage: React.FC = () => {
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const dataEntryPaneRef = useRef<DataEntryPaneHandle>(null);

  const [globalFiles, setGlobalFiles] = useState<FileInfo[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalFiles = async () => {
      setGlobalLoading(true);
      try {
        const response = await fetch("/api/files");
        if (!response.ok) throw new Error("Failed to fetch global file list");
        const data: FileInfo[] = await response.json();
        setGlobalFiles(data);
      } catch (err) {
        setGlobalError(
          err instanceof Error
            ? err.message
            : "Unknown error fetching global files",
        );
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchGlobalFiles();
  }, []);

  const {
    loading,
    error,
    autosaveStatus,
    currentRecord,
    currentFileSrc, // Updated prop name from the hook
    transformation,
    setTransformation,
    handleFieldChange,
    handleAddField,
    handleRevertField,
    handleCommit,
    navigateBackToList,
    handleFieldFocus,
    jsonFilename,
  } = useValidationData();

  if (loading)
    return (
      <StatusDisplay
        message="Loading..."
        type="loading"
        jsonFilename={jsonFilename}
      />
    );
  if (error)
    return (
      <StatusDisplay
        message={`Error: ${error}`}
        type="error"
        jsonFilename={jsonFilename}
      />
    );
  if (!currentRecord)
    return (
      <StatusDisplay
        message="No data found."
        type="empty"
        jsonFilename={jsonFilename}
        onBack={navigateBackToList}
      />
    );

  const recordsOnly = globalFiles.filter((f) => f.type === "record");
  const totalTrackedRecords = recordsOnly.length;
  const validatedRecords = recordsOnly.filter(
    (f) => f.status === "validated",
  ).length;

  const progressPercentage =
    totalTrackedRecords > 0
      ? Math.round((validatedRecords / totalTrackedRecords) * 100)
      : 0;

  return (
    <div className="flex h-screen bg-gray-50 pb-2">
      <div className="flex-grow p-6 flex flex-col">
        {currentRecord && currentFileSrc ? (
          <ImagePane
            imageWrapperRef={imageWrapperRef}
            pdfSrc={currentFileSrc} // Pass the correct source
            transformation={transformation}
            onTransformationChange={setTransformation}
          />
        ) : (
          <StatusDisplay
            message="No source file provided for this record."
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
      {!globalLoading && !globalError && totalTrackedRecords > 0 && (
        <div
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="fixed bottom-0 left-0 right-0 h-1.5 bg-gray-200 z-50"
        >
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
