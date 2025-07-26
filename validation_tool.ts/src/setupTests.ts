import "@testing-library/jest-dom";
import { vi } from "vitest";
import { tmpdir } from "os";
import { join } from "path";
import { mkdtempSync, rmSync } from "fs"; // Use sync versions for module-level setup

// Create a temporary directory synchronously at module load time
const tempTestDir = mkdtempSync(join(tmpdir(), "test-cards-to-process-"));
process.env.CARDS_TO_PROCESS_MOUNT_PATH = tempTestDir;

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

// Cleanup the temporary directory after all tests are done
afterAll(() => {
  if (tempTestDir) {
    rmSync(tempTestDir, { recursive: true, force: true });
  }
});
