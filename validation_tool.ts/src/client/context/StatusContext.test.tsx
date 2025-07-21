import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, Mock } from "vitest";
import { StatusProvider, useStatus } from "../context/StatusContext";

// Mock EventSource
global.EventSource = vi.fn(() => ({
  onmessage: vi.fn(),
  onerror: vi.fn(),
  close: vi.fn(),
})) as Mock;

const TestComponent = () => {
  const { statuses } = useStatus();
  return <div data-testid="statuses">{JSON.stringify(statuses)}</div>;
};

describe("StatusContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should establish a connection and update status on message", () => {
    render(
      <StatusProvider>
        <TestComponent />
      </StatusProvider>,
    );

    const mockEventSourceInstance = (EventSource as Mock).mock.results[0].value;

    const testMessage = {
      fileId: "test-file-123",
      status: "processing",
      message: "AI is thinking...",
    };

    // Simulate receiving a message from the server
    act(() => {
      mockEventSourceInstance.onmessage({ data: JSON.stringify(testMessage) });
    });

    expect(screen.getByTestId("statuses").textContent).toContain(
      "test-file-123",
    );
    expect(screen.getByTestId("statuses").textContent).toContain("processing");
  });

  test("should close the connection on unmount", () => {
    const { unmount } = render(
      <StatusProvider>
        <TestComponent />
      </StatusProvider>,
    );

    const mockEventSourceInstance = (EventSource as Mock).mock.results[0].value;
    unmount();

    expect(mockEventSourceInstance.close).toHaveBeenCalledTimes(1);
  });
});
