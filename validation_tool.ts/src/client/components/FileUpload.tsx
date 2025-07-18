import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useStatus } from "../context/StatusContext";
import type { UploadApiResponse, UploadResult } from "../../../types/types";

interface UploadedFile {
  file: File;
  status: "queued" | "uploading" | "success" | "error" | "skipped" | "processing" | "ready_for_review";
  message: string;
}

interface FileUploadProps {
  onUploadComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const { statuses } = useStatus();
  const [filesToUpload, setFilesToUpload] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files);
    const newUploads: UploadedFile[] = selectedFiles.map((file) => ({
      file,
      status: "queued",
      message: `${(file.size / 1024).toFixed(2)} KB`,
    }));
    setFilesToUpload((current) => [...current, ...newUploads]);
    event.target.value = "";
  };

  const handleUpload = useCallback(async () => {
    const filesToProcess = filesToUpload.filter(
      (f) => f.status === "queued" || f.status === "error",
    );
    if (filesToProcess.length === 0) return;

    setIsUploading(true);
    setFilesToUpload((current) =>
      current.map((f) =>
        filesToProcess.some((p) => p.file.name === f.file.name)
          ? { ...f, status: "uploading", message: "Uploading..." }
          : f,
      ),
    );

    const formData = new FormData();
    filesToProcess.forEach((f) => {
      formData.append("files", f.file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || "Upload failed on the server.";
        throw new Error(errorMessage);
      }

      const successData = responseData as UploadApiResponse;

      setFilesToUpload((current) =>
        current.map((f) => {
          const result = successData.results?.find(
            (r: UploadResult) => r.originalName === f.file.name,
          );
          if (result) {
            return {
              ...f,
              status: result.status,
              message:
                result.status === "success"
                  ? "Processing..."
                  : result.reason || "Error",
            };
          }
          return f;
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setFilesToUpload((current) =>
        current.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", message: `Failed: ${errorMessage}` }
            : f,
        ),
      );
    } finally {
      setIsUploading(false);
      onUploadComplete();
    }
  }, [filesToUpload, onUploadComplete]);

  const removeFile = (fileName: string) => {
    setFilesToUpload((current) =>
      current.filter((f) => f.file.name !== fileName),
    );
  };

  const clearCompleted = () => {
    setFilesToUpload((current) =>
      current.filter((f) => f.status === "queued" || f.status === "uploading"),
    );
  };

  const hasCompletedFiles = filesToUpload.some(
    (f) => f.status === "success" || f.status === "skipped" || f.status === "ready_for_review",
  );
  const queuedFilesCount = filesToUpload.filter(
    (f) => f.status === "queued" || f.status === "error",
  ).length;

  const getStatusStyle = (
    status: "queued" | "uploading" | "success" | "error" | "skipped" | "processing" | "ready_for_review",
  ) => {
    switch (status) {
      case "success":
      case "ready_for_review":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "skipped":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Upload Business Cards
      </h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>Select PDF, PNG, or JPG files</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Duplicates are skipped based on file content.
        </p>
      </div>

      {filesToUpload.length > 0 && (
        <div className="mt-4">
          <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {filesToUpload.map(({ file, status, message }) => {
              const fileStatus = statuses[file.name];
              const currentStatus = fileStatus ? fileStatus.status : status;
              const currentMessage = fileStatus ? fileStatus.message : message;

              return (
                <li
                  key={file.name}
                  className="flex items-center justify-between text-sm p-2 bg-white rounded-md border border-gray-200"
                >
                  <span className="truncate pr-2">{file.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {currentStatus === "ready_for_review" ? (
                      <Link
                        to={`/validate/${file.name}`}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Ready for Review
                      </Link>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                          currentStatus,
                        )}`}
                      >
                        {currentMessage}
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.name)}
                      disabled={isUploading}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50 font-bold text-lg"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        {hasCompletedFiles ? (
          <button
            onClick={clearCompleted}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Clear List
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={handleUpload}
          disabled={isUploading || queuedFilesCount === 0}
          className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : `Upload ${queuedFilesCount} File(s)`}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;