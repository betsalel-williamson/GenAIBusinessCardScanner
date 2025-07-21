import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import {
  setupValidatePageTests,
  TestWrapper,
  MOCK_SINGLE_RECORD,
  server,
} from "../../test_utils";
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
      expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable in DataEntryPane
    });
  });

  test("displays progress bar with correct width based on global file status", async () => {
    // Mock global API files endpoint for ValidatePage's internal fetch
    server.use(
      http.get("/api/files", () => {
        return HttpResponse.json([
          { filename: "file-001.json", status: "validated", type: "record" },
          { filename: "file-002.json", status: "in_progress", type: "record" },
          { filename: "file-003.json", status: "source", type: "batch" }, // This is a batch, should NOT be counted.
          { filename: "file-004.json", status: "validated", type: "record" },
        ]);
      }),
    );

    render(<TestWrapper />);

    // Wait for the progress bar to appear
    await waitFor(() => {
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      // Based on mock data: 3 records total. 2 are validated.
      // Percentage = (2 / 3) * 100 = 66.66... rounded to 67%
      const innerBar = progressBar.querySelector("div");
      expect(innerBar).toHaveStyle("width: 67%");
      expect(innerBar).toHaveClass("bg-blue-500");
    });
  });

  test("progress bar is not shown if no in-progress or validated files exist globally", async () => {
    // Mock global API files endpoint to return only source batch files
    server.use(
      http.get("/api/files", () => {
        return HttpResponse.json([
          { filename: "source1.json", status: "source", type: "batch" },
          { filename: "source2.json", status: "source", type: "batch" },
        ]);
      }),
    );

    render(<TestWrapper />);

    await waitFor(() => {
      // Ensure no progress bar element is present because there are no "records"
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });
});
