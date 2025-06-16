import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import HomePage from '../client/pages/HomePage';
import ValidatePage from '../client/pages/ValidatePage';
import type { DataRecord } from '../../types/types';
import type { DataEntryPaneProps, DataEntryPaneHandle } from '../client/components/DataEntryPane';
import type { ImagePaneProps } from '../client/components/ImagePane';

export const MOCK_FILE_NAME = 'test-data-000.json'; // Now a single record file name
export const MOCK_NEXT_FILE_NAME = 'test-data-001.json'; // A subsequent file

export const MOCK_SINGLE_RECORD: DataRecord = {
    "address_1": "J-1A, Ansa Industrial Estate",
    "company": "CHENAB IMPEX PVT. LTD.",
    "email": "anil@chenabimpex.com",
    "notes": "Long notes to make the div scrollable.",
    "source": "image-001.pdf"
};

export const MOCK_SOURCE_SINGLE_RECORD: DataRecord = {
    "address_1": "Original Addr",
    "company": "Original Company",
    "email": "original@email.com",
    "notes": "Original notes for testing revert.",
    "source": "image-001.pdf"
};

export const server = setupServer(
  http.get(`/api/files/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_SINGLE_RECORD); // Return single record
  }),
  http.patch(`/api/autosave/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(typeof body).toBe('object'); // Expect a single record object
    expect(Array.isArray(body)).toBe(false);
    return HttpResponse.json({ status: 'ok' });
  }),
  http.patch(`/api/commit/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(typeof body).toBe('object'); // Expect a single record object
    expect(Array.isArray(body)).toBe(false);
    return HttpResponse.json({ status: 'ok', nextFile: MOCK_NEXT_FILE_NAME });
  }),
  http.get(`/api/source-data/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_SOURCE_SINGLE_RECORD); // Return single source record
  }),
  // Mock for the next file after commit
  http.get(`/api/files/${MOCK_NEXT_FILE_NAME}`, () => {
    return HttpResponse.json({ // Mock a different record for the next file
        "address_1": "456 Oak Ave",
        "company": "Next Corp",
        "email": "next@corp.com",
        "source": "image-002.pdf"
    });
  }),
  // Mock API for HomePage's file list
  http.get('/api/files', () => {
    return HttpResponse.json([
      { filename: MOCK_FILE_NAME, status: 'source' },
      { filename: MOCK_NEXT_FILE_NAME, status: 'source' },
    ]);
  }),
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

// Mock ImagePane to prevent PDF.js issues in JSDOM
vi.mock('../client/components/ImagePane', () => {
    return {
        default: React.forwardRef<HTMLDivElement, ImagePaneProps>(({ pdfSrc }, ref) => {
            return (
                <div ref={ref} data-testid="mock-image-pane" style={{ width: '100%', height: '300px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    Mock PDF Viewer: {pdfSrc || 'No PDF'}
                </div>
            );
        }),
    };
});

// TestWrapper now only navigates to a filename, not an index
export const TestWrapper: React.FC = () => (
  <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}`]}>
    <Routes>
      <Route path="/validate/:json_filename" element={<ValidatePage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/validate/:json_filename" element={<div>Next File Page: {MOCK_NEXT_FILE_NAME}</div>} />
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
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm
    mockDataEntryPaneHandle.scrollToTop.mockClear();
    // JSDOM doesn't support layout, so we mock properties used for calculations
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
  });
}
