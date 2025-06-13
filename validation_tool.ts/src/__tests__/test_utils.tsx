import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, test, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import HomePage from '../client/pages/HomePage'; // For navigation testing
import ValidatePage from '../client/pages/ValidatePage';
import type { DataRecord } from '../../types/types';
import type { DataEntryPaneProps, DataEntryPaneHandle } from '../client/components/DataEntryPane';
import type { ImagePaneProps } from '../client/components/ImagePane'; // Import ImagePaneProps type

export const MOCK_FILE_NAME = 'test-data.json';

export const MOCK_INITIAL_DATA: DataRecord[] = [
  {
    "address_1": "J-1A, Ansa Industrial Estate",
    "company": "CHENAB IMPEX PVT. LTD.",
    "email": "anil@chenabimpex.com",
    "notes": "Long notes to make the div scrollable.",
    "source": "image-001.pdf"
  },
  {
    "address_1": "123 Main St",
    "company": "Another Corp",
    "email": "info@another.com",
    "notes": "Even longer notes for second record.",
    "source": "image-002.pdf"
  }
];

export const MOCK_SOURCE_DATA: DataRecord[] = [
    {
        "address_1": "Original Addr",
        "company": "Original Company",
        "email": "original@email.com",
        "notes": "Original notes for testing revert.",
        "source": "image-001.pdf"
    },
    {
        "address_1": "123 Main St",
        "company": "Another Corp",
        "email": "info@another.com",
        "notes": "Original notes for second record.",
        "source": "image-002.pdf"
    }
];

export const server = setupServer(
  http.get(`/api/files/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_INITIAL_DATA);
  }),
  http.patch(`/api/autosave/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(Array.isArray(body)).toBe(true);
    return HttpResponse.json({ status: 'ok' });
  }),
  http.patch(`/api/commit/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(Array.isArray(body)).toBe(true);
    return HttpResponse.json({ status: 'ok', nextFile: 'next-file.json' });
  }),
  http.get(`/api/source-data/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_SOURCE_DATA);
  }),
  // No need to mock PDF or worker requests if ImagePane is mocked
);

export const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

export const mockDataEntryPaneHandle = {
    scrollToTop: vi.fn(),
};

vi.mock('../client/components/DataEntryPane', async () => {
    const actualModule = await vi.importActual<typeof import('../client/components/DataEntryPane')>(
        '../client/components/DataEntryPane'
    );
    const OriginalDataEntryPaneComponent = actualModule.default;

    return {
        ...actualModule,
        default: React.forwardRef<DataEntryPaneHandle, DataEntryPaneProps>((props, ref) => {
            React.useImperativeHandle(ref, () => mockDataEntryPaneHandle);
            return React.createElement(OriginalDataEntryPaneComponent, { ...props, ref });
        }),
    };
});

// NEW MOCK: Mock ImagePane to prevent PDF.js issues in JSDOM
vi.mock('../client/components/ImagePane', () => {
    return {
        default: React.forwardRef<HTMLDivElement, ImagePaneProps>(({ pdfSrc }, ref) => {
            // A simple mock for the ImagePane component
            // It displays the PDF source for debugging in tests, but doesn't actually render PDF.
            return (
                <div ref={ref} data-testid="mock-image-pane" style={{ width: '100%', height: '300px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    Mock PDF Viewer: {pdfSrc || 'No PDF'}
                </div>
            );
        }),
    };
});

export const TestWrapper: React.FC = () => (
  <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}/1`]}> {/* Updated initial entry for tests */}
    <Routes>
      {/* record_index is optional for tests as well now */}
      <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
      <Route path="/" element={<HomePage />} />
      {/* Updated route path for next file for consistency, though it won't be navigated to directly by tests here */}
      <Route path="/validate/next-file.json/1" element={<div>Next File Page</div>} />
    </Routes>
  </MemoryRouter>
);

// Global setup/teardown for all ValidatePage-related tests
export function setupValidatePageTests() {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear(); // Clear localStorage between tests to prevent interference
  });
  afterAll(() => server.close());

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockDataEntryPaneHandle.scrollToTop.mockClear();
    // JSDOM doesn't support layout, so we mock properties used for calculations
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
  });
}
