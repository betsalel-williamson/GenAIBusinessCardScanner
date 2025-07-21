import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock EventSource
global.EventSource = vi.fn(() => ({
  onmessage: vi.fn(),
  onerror: vi.fn(),
  close: vi.fn(),
}));

// Mock pdfjs-dist to prevent DOMMatrix errors in JSDOM
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {
    workerSrc: "", // Mock workerSrc
  },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn(() => ({
        getViewport: vi.fn(() => ({ width: 100, height: 100 })),
        render: vi.fn(() => ({
          promise: Promise.resolve(),
        })),
      })),
      destroy: vi.fn(),
    }),
  })),
  version: "mock-version",
}));
