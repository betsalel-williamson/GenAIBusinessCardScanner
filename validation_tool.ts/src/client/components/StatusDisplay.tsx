import React from "react";

interface StatusDisplayProps {
  message: string;
  type: "loading" | "error" | "empty" | "no-source";
  jsonFilename?: string;
  onBack?: () => void; // Optional prop for "Back to List" button
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  message,
  type,
  jsonFilename,
  onBack,
}) => {
  let messageClass = "";
  let description = "";

  switch (type) {
    case "loading":
      messageClass = "text-gray-600";
      description = "Please wait while data is loaded.";
      break;
    case "error":
      messageClass = "text-red-500";
      description = "An unexpected error occurred.";
      break;
    case "empty":
      messageClass = "text-gray-500";
      description = `No data found for ${jsonFilename || "this file"}. Check your JSON file in 'json_data_source/'.`;
      break;
    case "no-source":
      messageClass = "text-gray-700";
      description =
        "No PDF 'source' field found for the current record, or it's empty. Please ensure your JSON data includes a 'source' field (e.g., 'my_document.pdf').";
      break;
    default:
      messageClass = "text-gray-600";
      break;
  }

  return (
    <div className="grow flex items-center justify-center text-center p-4 rounded-md">
      <div className={`text-xl ${messageClass}`}>
        <p className="font-semibold mb-2">{message}</p>
        <p className="text-base">{description}</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Back to List
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
