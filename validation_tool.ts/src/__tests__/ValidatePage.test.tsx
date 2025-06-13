import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { describe, test, expect, beforeAll, afterEach, afterAll, vi, beforeEach } from 'vitest';
import ValidatePage from '../client/pages/ValidatePage';
import HomePage from '../client/pages/HomePage'; // For navigation testing
import type { DataRecord } from '../../types/types';

const MOCK_FILE_NAME = 'test-data.json';

const MOCK_INITIAL_DATA: DataRecord[] = [
  {
    "address_1": "J-1A, Ansa Industrial Estate",
    "company": "CHENAB IMPEX PVT. LTD.",
    "email": "anil@chenabimpex.com",
    "source": "image-001.pdf"
  },
  {
    "address_1": "123 Main St",
    "company": "Another Corp",
    "email": "info@another.com",
    "source": "image-002.pdf"
  }
];

const MOCK_SOURCE_DATA: DataRecord[] = [
    {
        "address_1": "Original Addr",
        "company": "Original Company",
        "email": "original@email.com",
        "source": "image-001.pdf"
    },
    {
        "address_1": "123 Main St",
        "company": "Another Corp",
        "email": "info@another.com",
        "source": "image-002.pdf"
    }
];

const server = setupServer(
  http.get(`/api/files/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_INITIAL_DATA);
  }),
  http.patch(`/api/autosave/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(Array.isArray(body)).toBe(true); // Should send the full array of records
    return HttpResponse.json({ status: 'ok' });
  }),
  http.patch(`/api/commit/${MOCK_FILE_NAME}`, async ({ request }) => {
    const body = await request.json();
    expect(Array.isArray(body)).toBe(true); // Should send the full array of records
    return HttpResponse.json({ status: 'ok', nextFile: 'next-file.json' });
  }),
  http.get(`/api/source-data/${MOCK_FILE_NAME}`, () => {
    return HttpResponse.json(MOCK_SOURCE_DATA);
  }),
  // Mock image requests
  http.get('/public/images/*.jpg', () => {
    return new HttpResponse(null, { status: 200 }); // Mock success for image loading
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

describe('ValidatePage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        // JSDOM doesn't support layout, so we mock properties used for calculations
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
    });

    test('renders loading state and then loads data correctly for the first field', async () => {
        render(<TestWrapper />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/data field: address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument();
        });
    });

    test('allows editing a field and updates state', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        const input = screen.getByDisplayValue('J-1A, Ansa Industrial Estate') as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Changed Address' } });

        expect(input.value).toBe('Changed Address');
    });

    test('navigates to the next field', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /next field/i }));

        await waitFor(() => {
            expect(screen.getByText(/data field: company/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('CHENAB IMPEX PVT. LTD.')).toBeInTheDocument();
        });
    });

    test('navigates to the previous field', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /next field/i })); // Go to Company
        await waitFor(() => expect(screen.getByText(/data field: company/i)).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /prev field/i })); // Go back to Address_1
        await waitFor(() => {
            expect(screen.getByText(/data field: address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument();
        });
    });

    test('navigates to the next record and resets field index', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        // Navigate through all fields of the first record to reach next record
        fireEvent.click(screen.getByRole('button', { name: /next field/i })); // company
        fireEvent.click(screen.getByRole('button', { name: /next field/i })); // email
        fireEvent.click(screen.getByRole('button', { name: /next field/i })); // last field, should go to next record

        await waitFor(() => {
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument();
            expect(screen.getByText(/data field: address 1/i)).toBeInTheDocument(); // Should reset to first field
            expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
        });
    });

    test('handles undo and redo functionality for data changes', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        const undoButton = screen.getByRole('button', { name: /undo/i });
        const redoButton = screen.getByRole('button', { name: /redo/i });
        const input = screen.getByDisplayValue('J-1A, Ansa Industrial Estate') as HTMLTextAreaElement;

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

        fireEvent.change(screen.getByDisplayValue('J-1A, Ansa Industrial Estate'), { target: { value: 'Changed' } });

        // Should not have saved yet
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
        expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('autosave'), expect.any(Object));

        // Advance timers past the debounce delay
        vi.advanceTimersByTime(1100);

        await waitFor(() => {
            expect(screen.getByText('Saving...')).toBeInTheDocument();
            expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('autosave'), expect.any(Object));
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('autosave'),
                expect.objectContaining({
                    body: JSON.stringify([
                        { "address_1": "Changed", "company": "CHENAB IMPEX PVT. LTD.", "email": "anil@chenabimpex.com", "source": "image-001.pdf" },
                        { "address_1": "123 Main St", "company": "Another Corp", "email": "info@another.com", "source": "image-002.pdf" }
                    ])
                })
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Draft Saved ✓')).toBeInTheDocument();
        });
        vi.useRealTimers();
    });

    test('commits changes and navigates to the next file', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        const commitButton = screen.getByRole('button', { name: /commit & next file/i });
        fireEvent.click(commitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/validate/next-file.json');
        });
    });

    test('reverts a single field to original source on confirmation', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

        fireEvent.change(screen.getByDisplayValue('J-1A, Ansa Industrial Estate'), { target: { value: 'User Changed Value' } });
        expect(screen.getByDisplayValue('User Changed Value')).toBeInTheDocument();

        const revertButton = screen.getByRole('button', { name: /revert field/i });
        fireEvent.click(revertButton);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Original Addr')).toBeInTheDocument();
        });
    });
});
