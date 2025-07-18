import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { StatusProvider } from "../client/context/StatusContext";
import HomePage from "../client/pages/HomePage";
import { describe, test, expect, beforeAll, afterEach, afterAll } from "vitest";

const API_FILES_URL = "/api/files";

const server = setupServer();

const renderHomePage = () => {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StatusProvider>
        <HomePage />
      </StatusProvider>
    </MemoryRouter>
  );
  return { user, ...utils };
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HomePage", () => {
  test("displays loading message initially", () => {
    server.use(
      http.get(API_FILES_URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json([]);
      }),
    );
    renderHomePage();
    expect(screen.getByText(/loading files/i)).toBeInTheDocument();
  });

  test("renders records and batches correctly", async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          {
            filename: "validated_record.json",
            status: "validated",
            type: "record",
          },
          {
            filename: "in_progress_record.json",
            status: "in_progress",
            type: "record",
          },
          {
            filename: "source_batch.json",
            status: "source",
            type: "batch",
          },
        ]);
      }),
    );

    renderHomePage();

    await waitFor(() => {
      // Check for in_progress record
      const inProgressItem = screen
        .getByText("in_progress_record.json")
        .closest("li");
      expect(inProgressItem).toBeInTheDocument();
      expect(
        within(inProgressItem!).getByText("In Progress..."),
      ).toBeInTheDocument();
      expect(
        within(inProgressItem!).getByRole("link", { name: "Validate" }),
      ).toBeInTheDocument();

      // Check for source batch file
      const sourceBatchItem = screen
        .getByText("source_batch.json")
        .closest("li");
      expect(sourceBatchItem).toBeInTheDocument();
      expect(
        within(sourceBatchItem!).getByText(/Batch File \(Needs Ingestion\)/),
      ).toBeInTheDocument();
      expect(
        within(sourceBatchItem!).getByRole("button", { name: "Ingest" }),
      ).toBeInTheDocument();

      // Validated file should be hidden by default filter
      expect(
        screen.queryByText("validated_record.json"),
      ).not.toBeInTheDocument();
    });
  });

  test("can switch filter to show all files including validated", async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          {
            filename: "validated_record.json",
            status: "validated",
            type: "record",
          },
        ]);
      }),
    );

    renderHomePage();
    await waitFor(() => {
      expect(
        screen.queryByText("validated_record.json"),
      ).not.toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText(/show:/i);
    fireEvent.change(filterSelect, { target: { value: "all" } });

    await waitFor(() => {
      const validatedItem = screen
        .getByText("validated_record.json")
        .closest("li");
      expect(validatedItem).toBeInTheDocument();
      expect(
        within(validatedItem!).getByText("Validated ✓"),
      ).toBeInTheDocument();
      expect(
        within(validatedItem!).getByRole("link", { name: "Validate" }),
      ).toBeInTheDocument();
    });
  });

  test("displays correct empty message when no active work is available", async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          {
            filename: "validated_record.json",
            status: "validated",
            type: "record",
          },
        ]);
      }),
    );

    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText(
          "No active work found. All files may be validated, or you need to ingest a new batch.",
        ),
      ).toBeInTheDocument();
    });
  });

  test("displays correct empty message when API returns an empty array", async () => {
    server.use(http.get(API_FILES_URL, () => HttpResponse.json([])));
    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText(
          "No active work found. All files may be validated, or you need to ingest a new batch.",
        ),
      ).toBeInTheDocument();
    });
  });

  test("displays an error message when API call fails", async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json(
          { message: "Internal Server Error" },
          { status: 500 },
        );
      }),
    );
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch files/i)).toBeInTheDocument();
    });
  });
});
