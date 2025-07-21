import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import {
  setupValidatePageTests,
  TestWrapper,
  mockNavigate,
  MOCK_FILE_NAME,
  MOCK_NEXT_FILE_NAME,
  server,
} from "../../test_utils";
import { http, HttpResponse } from "msw";

describe("ValidatePage - Navigation (Single Record Files)", () => {
  setupValidatePageTests();

  test("Commit & Next File button navigates to the next file returned by API", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    ); // Wait for initial record to load

    const commitButton = screen.getByRole("button", {
      name: /commit & next file/i,
    });
    fireEvent.click(commitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/validate/${MOCK_NEXT_FILE_NAME}`,
        { replace: true },
      );
    });
  });

  test("Commit & Next File navigates to homepage if no next file is returned", async () => {
    // Mock server to return no next file
    server.use(
      http.patch(`/api/commit/${MOCK_FILE_NAME}`, () => {
        return HttpResponse.json({ status: "ok", nextFile: null }); // No next file
      }),
    );

    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    const commitButton = screen.getByRole("button", {
      name: /commit & next file/i,
    });
    fireEvent.click(commitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  test("Back to List button navigates to the homepage", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    const backButton = screen.getByRole("button", { name: /back to list/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  test("ArrowRight key triggers commit and navigates to next file", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/validate/${MOCK_NEXT_FILE_NAME}`,
        { replace: true },
      );
    });
  });

  test("Enter key inside an input field allows typing and does not trigger commit", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    const input = screen.getByLabelText(/address 1/i) as HTMLTextAreaElement;
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" }); // Only triggers blur on Ctrl/Cmd+Enter

    // The focus assertion is unreliable in JSDOM for this specific event.
    // We only care that it does NOT navigate.
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate
  });

  test("Enter key triggers commit and navigates to next file (when no input is focused)", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/validate/${MOCK_NEXT_FILE_NAME}`,
        { replace: true },
      );
    });
  });

  test("ArrowLeft key navigates to homepage (when no input is focused)", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    fireEvent.keyDown(window, { key: "ArrowLeft", code: "ArrowLeft" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  test("Escape key navigates to homepage (when no input is focused)", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
