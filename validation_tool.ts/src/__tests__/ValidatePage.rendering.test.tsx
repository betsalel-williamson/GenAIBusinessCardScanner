import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import {
  setupValidatePageTests,
  TestWrapper,
  MOCK_SINGLE_RECORD,
  server,
} from "./test_utils";
import { http, HttpResponse } from "msw";

describe("ValidatePage - Rendering (Single Record Files)", () => {
  setupValidatePageTests();

  test("renders both ImagePane and DataEntryPane side-by-side with correct data", async () => {
    render(<TestWrapper />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      // Verify DataEntryPane is present and contains expected data from MOCK_SINGLE_RECORD
      expect(screen.getByText(/record fields/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(MOCK_SINGLE_RECORD.address_1 as string),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(MOCK_SINGLE_RECORD.company as string),
      ).toBeInTheDocument();

      // Verify ImagePane is present (using its mock's data-testid) and displays the correct PDF source
      const mockImagePane = screen.getByTestId("mock-image-pane");
      expect(mockImagePane).toBeInTheDocument();
      // The PDF source for MOCK_SINGLE_RECORD is "image-001.pdf" which becomes "/images/image-001.pdf"
      expect(mockImagePane).toHaveTextContent(
        "Mock PDF Viewer: /images/image-001.pdf",
      );

      // Confirm that both panes are loaded by checking elements from each
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); // From DataEntryPane
      // RecordNavigationHeader is removed, so no 'Record X / Y' text expected
      expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable in DataEntryPane
    });
  });

  test("displays progress bar with correct width based on global file status", async () => {
    // Mock global API files endpoint for ValidatePage's internal fetch
    server.use(
      http.get("/api/files", () => {
        return HttpResponse.json([
          { filename: "file-001.json", status: "validated" },
          { filename: "file-002.json", status: "in_progress" },
          { filename: "file-003.json", status: "source" }, // Should not be counted in progress
          { filename: "file-004.json", status: "validated" },
        ]);
      }),
    );

    render(<TestWrapper />);

    // Wait for the progress bar to appear
    await waitFor(() => {
      const progressBar = screen.getByRole("progressbar"); // Use semantic role for progress bar
      expect(progressBar).toBeInTheDocument();
      // Based on mock data: 2 validated, 1 in_progress, 1 source
      // Total tracked = 2 (validated) + 1 (in_progress) = 3
      // Validated = 2
      // Percentage = (2 / 3) * 100 = 66.66... rounded to 67%
      expect(progressBar).toHaveStyle("width: 67%");
      expect(progressBar).toHaveClass("bg-blue-500");
    });
  });

  test("progress bar is not shown if no in-progress or validated files exist globally", async () => {
    // Mock global API files endpoint to return only source files
    server.use(
      http.get("/api/files", () => {
        return HttpResponse.json([
          { filename: "source1.json", status: "source" },
          { filename: "source2.json", status: "source" },
        ]);
      }),
    );

    render(<TestWrapper />);

    await waitFor(() => {
      // Ensure no progress bar element is present
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });
});
