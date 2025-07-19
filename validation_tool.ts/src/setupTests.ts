import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock EventSource
global.EventSource = vi.fn(() => ({
  onmessage: vi.fn(),
  onerror: vi.fn(),
  close: vi.fn(),
}));
