import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface FileStatus {
  filename: string;
  status: "validated" | "in_progress" | "source";
}

const statusStyles = {
  validated: "text-green-600 font-semibold",
  in_progress: "text-blue-600",
  source: "text-gray-500",
};

const statusText = {
  validated: "Validated ✓",
  in_progress: "In Progress...",
  source: "Ready for Ingestion",
};

type FilterStatus =
  | "all"
  | "active_work_only"
  | "in_progress_only"
  | "source_only";

const HomePage: React.FC = () => {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingestingFile, setIngestingFile] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] =
    useState<FilterStatus>("active_work_only"); // Default filter

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const data: FileStatus[] = await response.json();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleIngest = async (filename: string) => {
    if (
      !window.confirm(
        `Ingest all records from "${filename}" and prepare them for validation? The original file will be moved.`,
      )
    ) {
      return;
    }
    setIngestingFile(filename);
    try {
      const response = await fetch(`/api/ingest/${filename}`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to ingest file");
      }
      alert(`Successfully ingested '${filename}'.`);
      await fetchFiles(); // Refresh file list after ingestion
    } catch (err) {
      alert(
        `Ingestion failed for '${filename}': ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during ingestion",
      );
    } finally {
      setIngestingFile(null);
    }
  };

  const filteredFiles = files.filter((file) => {
    if (filterStatus === "all") {
      return true;
    } else if (filterStatus === "active_work_only") {
      return file.status === "source" || file.status === "in_progress";
    } else if (filterStatus === "in_progress_only") {
      return file.status === "in_progress";
    } else if (filterStatus === "source_only") {
      return file.status === "source";
    }
    return true; // Should not be reached
  });

  const getEmptyMessage = () => {
    switch (filterStatus) {
      case "all":
        return "No JSON files found in any data directory. Place multi-record JSON files in 'data_source/' to begin.";
      case "active_work_only":
        return "No active work files (in progress or ready for ingestion) found. All files might be validated, or there are no source files.";
      case "in_progress_only":
        return "No files currently in progress.";
      case "source_only":
        return "No new source files found ready for ingestion.";
      default:
        return "No files found based on current filter.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Transcription Validation
        </h1>
        <p className="text-gray-600 mb-4">
          Select a file to validate or ingest new batch files.
        </p>

        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="file-filter" className="text-gray-700 font-medium">
            Show:
          </label>
          <select
            id="file-filter"
            className="block w-auto py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="active_work_only">
              Active Work (In Progress / Source)
            </option>
            <option value="all">All Files</option>
            <option value="in_progress_only">In Progress Only</option>
            <option value="source_only">Source Only (Needs Ingestion)</option>
          </select>
        </div>

        {loading && <p>Loading files...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="divide-y divide-gray-200">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <li
                  key={file.filename}
                  className="py-4 flex justify-between items-center"
                >
                  <div className="flex-grow">
                    <span className="text-lg text-gray-800 font-medium mr-2">
                      {file.filename}
                    </span>
                    <span className={`text-sm ${statusStyles[file.status]}`}>
                      {statusText[file.status]}
                    </span>
                    {ingestingFile === file.filename && (
                      <span className="ml-2 text-blue-500 text-sm">
                        {" "}
                        (Ingesting...)
                      </span>
                    )}
                  </div>
                  {file.status === "source" ? (
                    <button
                      onClick={() => handleIngest(file.filename)}
                      disabled={!!ingestingFile}
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                      Ingest
                    </button>
                  ) : (
                    <Link
                      to={`/validate/${file.filename}`}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Validate
                    </Link>
                  )}
                </li>
              ))
            ) : (
              <li className="py-4 text-gray-500">{getEmptyMessage()}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePage;
