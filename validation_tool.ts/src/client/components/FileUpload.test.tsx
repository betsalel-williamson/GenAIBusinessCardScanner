import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  describe,
  test,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";

import { MemoryRouter } from "react-router-dom";
import { StatusProvider } from "../context/StatusContext";
import FileUpload from "../components/FileUpload";

const API_UPLOAD_URL = "/api/upload";

const server = setupServer();

const mockOnUploadComplete = vi.fn();

const renderFileUpload = () => {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <StatusProvider>
        <FileUpload onUploadComplete={mockOnUploadComplete} />
      </StatusProvider>
    </MemoryRouter>,
  );
  return { user, ...utils };
};

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockOnUploadComplete.mockClear();
});
afterAll(() => server.close());

describe("FileUpload Component", () => {
  test("renders the upload component correctly", () => {
    renderFileUpload();
    expect(
      screen.getByText(/select pdf, png, or jpg files/i),
    ).toBeInTheDocument();
  });

  test("allows user to select files and displays them in the queue", async () => {
    const { user } = renderFileUpload();
    const file = new File(["content"], "test1.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText(/select pdf, png, or jpg files/i);

    await user.upload(input, file);

    expect(screen.getByText("test1.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload 1 file/i }),
    ).toBeEnabled();
  });

  test("allows user to remove a file from the queue", async () => {
    const { user } = renderFileUpload();
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/select pdf, png, or jpg files/i);
    await user.upload(input, file);

    expect(screen.getByText("test.pdf")).toBeInTheDocument();

    // Use getByTitle to find the remove button
    const removeButton = screen.getByTitle("Remove file");
    await user.click(removeButton);

    expect(screen.queryByText("test.pdf")).not.toBeInTheDocument();
  });

  test("handles successful and skipped uploads", async () => {
    server.use(
      http.post(API_UPLOAD_URL, () => {
        return HttpResponse.json({
          message: "Upload process completed.",
          results: [
            { originalName: "test.pdf", status: "success" },
            {
              originalName: "duplicate.png",
              status: "skipped",
              reason: "Duplicate content",
            },
          ],
        });
      }),
    );

    const { user } = renderFileUpload();
    const file1 = new File(["content"], "test.pdf", {
      type: "application/pdf",
    });
    const file2 = new File(["content2"], "duplicate.png", {
      type: "image/png",
    });
    const input = screen.getByLabelText(/select pdf, png, or jpg files/i);
    await user.upload(input, [file1, file2]);

    const uploadButton = screen.getByRole("button", { name: /upload 2 file/i });
    await user.click(uploadButton);

    // Wait for the final states, skipping the intermediate "Uploading..." check
    await waitFor(() => {
      expect(screen.getByText("Processing...")).toBeInTheDocument();
      expect(screen.getByText("Duplicate content")).toBeInTheDocument();
    });

    expect(mockOnUploadComplete).toHaveBeenCalledOnce();
  });

  test("handles a server error during upload", async () => {
    const errorMessage = "Server storage is full.";
    server.use(
      http.post(API_UPLOAD_URL, () => {
        return HttpResponse.json({ error: errorMessage }, { status: 400 });
      }),
    );

    const { user } = renderFileUpload();
    const file = new File(["content"], "fail.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/select pdf, png, or jpg files/i);
    await user.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload 1 file/i });
    await user.click(uploadButton);

    // Wait for the final error message
    await waitFor(() => {
      expect(screen.getByText(`Failed: ${errorMessage}`)).toBeInTheDocument();
    });

    expect(mockOnUploadComplete).toHaveBeenCalledOnce();
  });
});
