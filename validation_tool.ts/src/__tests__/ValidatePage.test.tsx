import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, test, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import HomePage from '../client/pages/HomePage'; // For navigation testing
import ValidatePage from '../client/pages/ValidatePage';
import type { DataRecord } from '../../types/types';

const MOCK_FILE_NAME = 'test-data.json';

const MOCK_INITIAL_DATA: DataRecord[] = [
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

const MOCK_SOURCE_DATA: DataRecord[] = [
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

const server = setupServer(
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
  http.get('/images/*.pdf', () => {
    return new HttpResponse(new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A,
      0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65,
      0x20, 0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x0A, 0x2F, 0x50, 0x61, 0x67, 0x65,
      0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F,
      0x62, 0x6A, 0x0A, 0x32, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54,
      0x79, 0x70, 0x65, 0x20, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x0A, 0x2F, 0x43, 0x6F, 0x75,
      0x6E, 0x74, 0x20, 0x31, 0x0A, 0x2F, 0x4B, 0x69, 0x64, 0x73, 0x20, 0x5B, 0x33, 0x20, 0x30,
      0x20, 0x52, 0x5D, 0x0A, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x33,
      0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x20,
      0x2F, 0x50, 0x61, 0x67, 0x65, 0x0A, 0x2F, 0x50, 0x61, 0x72, 0x65, 0x6E, 0x74, 0x20, 0x32,
      0x20, 0x30, 0x20, 0x52, 0x0A, 0x2F, 0x4D, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6F, 0x78, 0x20,
      0x5B, 0x30, 0x20, 0x30, 0x20, 0x31, 0x20, 0x31, 0x5D, 0x0A, 0x2F, 0x52, 0x65, 0x73, 0x6F,
      0x75, 0x72, 0x63, 0x65, 0x73, 0x20, 0x3C, 0x3C, 0x3E, 0x3E, 0x0A, 0x2F, 0x43, 0x6F, 0x6E,
      0x74, 0x65, 0x6E, 0x74, 0x73, 0x20, 0x34, 0x20, 0x30, 0x20, 0x52, 0x0A, 0x3E, 0x3E, 0x0A,
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x34, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A,
      0x3C, 0x3C, 0x2F, 0x4C, 0x65, 0x6E, 0x67, 0x74, 0x68, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x39, 0x38, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A,
      0x2F, 0x58, 0x4F, 0x62, 0x6A, 0x65, 0x63, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x20,
      0x6F, 0x62, 0x6A, 0x0A, 0x65, 0x6E, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6D, 0x0A, 0x65,
      0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x35, 0x0A,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33,
      0x35, 0x20, 0x66, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x39, 0x20,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x37, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x31, 0x36, 0x36, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E,
      0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x35, 0x32, 0x20, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x20, 0x6E, 0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x34, 0x34, 0x39,
      0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x74, 0x72, 0x61, 0x69, 0x6C, 0x65,
      0x72, 0x0A, 0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x35, 0x2F, 0x52, 0x6F, 0x6F,
      0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x2F, 0x49, 0x6E, 0x66, 0x6F, 0x20, 0x36, 0x20,
      0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66,
      0x0A, 0x35, 0x34, 0x39, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A
    ]), { headers: { 'Content-Type': 'application/pdf' } });
  }),
  http.get('/src/client/pdfjs-build/pdf.worker.min.mjs', () => {
    return HttpResponse.text(`self.onmessage = function(e) { console.log("Worker received:", e.data); self.postMessage({ type: "worker_ready" }); };`, {
        headers: { 'Content-Type': 'application/javascript' }
    });
  })
);

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the DataEntryPane's scroll behavior for testing
const mockDataEntryPaneHandle = {
    scrollToTop: vi.fn(),
};

vi.mock('../client/components/DataEntryPane', async () => {
    const actual = await vi.importActual('../client/components/DataEntryPane');
    return {
        ...actual,
        default: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => mockDataEntryPaneHandle);
            // FIX: Pass actual.default (the component itself) instead of actual.default.type
            return React.createElement(actual.default, props, null);
        }),
    };
});


// Wrapper component for routing context
const TestWrapper: React.FC = () => (
  <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}`]}>
    <Routes>
      <Route path="/validate/:json_filename" element={<ValidatePage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/validate/next-file.json" element={<div>Next File Page</div>} />
    </Routes>
  </MemoryRouter>
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ValidatePage - Full List UI with Scroll and Keyboard Nav', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        // Reset mock for DataEntryPane's scrollToTop
        mockDataEntryPaneHandle.scrollToTop.mockClear();
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
    });

    test('navigates to the next record and scrolls fields to top on Next Record button click', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /next record/i }));

        await waitFor(() => {
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(1);
        });
    });

    test('navigates to the previous record and scrolls fields to top on Prev Record button click', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /next record/i }));
        await waitFor(() => expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /prev record/i }));

        await waitFor(() => {
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(2); // One call for next, one for prev
        });
    });

    test('navigates to the next record using Right Arrow key', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });

        await waitFor(() => {
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(1);
        });
    });

    test('navigates to the previous record using Left Arrow key', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        // Go to next record first
        fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });
        await waitFor(() => expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument());
        mockDataEntryPaneHandle.scrollToTop.mockClear(); // Clear count for this specific test

        // Go back to previous record
        fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' });

        await waitFor(() => {
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(1);
        });
    });

    test('renders all editable fields for the current record', async () => {
        render(<TestWrapper />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/record fields/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('CHENAB IMPEX PVT. LTD.')).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument();
        });
    });

    test('allows editing a field and updates state', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

        const input = screen.getByLabelText(/address 1/i) as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Changed Address' } });

        expect(input.value).toBe('Changed Address');
    });

    test('allows adding a new field to the current record', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('e.g., website_url'), { target: { value: 'website_new' } });
        fireEvent.change(screen.getByPlaceholderText('Value for new field'), { target: { value: 'http://new.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add field/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/website new/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('http://new.com')).toBeInTheDocument();
        });
    });

    test('handles undo and redo functionality for data changes', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        const undoButton = screen.getByRole('button', { name: /undo/i });
        const redoButton = screen.getByRole('button', { name: /redo/i });
        const input = screen.getByLabelText(/address 1/i) as HTMLTextAreaElement;

        expect(undoButton).toBeDisabled();

        fireEvent.change(input, { target: { value: 'Changed' } });
        expect(input.value).toBe('Changed');
        expect(undoButton).toBeEnabled();

        fireEvent.click(undoButton);
        expect(input.value).toBe('J-1A, Ansa Industrial Estate');
        expect(undoButton).toBeDisabled();
        expect(redoButton).toBeEnabled();

        fireEvent.click(redoButton);
        expect(input.value).toBe('Changed');
    });

    test('triggers autosave after a debounced state change', async () => {
        vi.useFakeTimers();
        const fetchSpy = vi.spyOn(window, 'fetch');
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/address 1/i), { target: { value: 'Changed' } });

        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
        expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('autosave'), expect.any(Object));

        vi.advanceTimersByTime(1100);

        await waitFor(() => {
            expect(screen.getByText('Saving...')).toBeInTheDocument();
            expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('autosave'), expect.any(Object));
        });

        await waitFor(() => {
            expect(screen.getByText('Draft Saved ✓')).toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    test('commits changes and navigates to the next file', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

        const commitButton = screen.getByRole('button', { name: /commit & next file/i });
        fireEvent.click(commitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/validate/next-file.json');
        });
    });

    test('reverts a single field to original source on confirmation', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/address 1/i), { target: { value: 'User Changed Value' } });
        expect(screen.getByDisplayValue('User Changed Value')).toBeInTheDocument();

        const revertButton = screen.getByRole('button', { name: /revert/i, exact: false });
        fireEvent.click(revertButton);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Original Addr')).toBeInTheDocument();
        });
    });
});
