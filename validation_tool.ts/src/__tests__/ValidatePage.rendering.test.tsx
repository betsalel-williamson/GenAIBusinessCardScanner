import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // Import Routes and Route
import { describe, test, expect, vi } from 'vitest';
import { setupValidatePageTests, TestWrapper, MOCK_FILE_NAME, MOCK_INITIAL_DATA } from './test_utils';
import ValidatePage from '../client/pages/ValidatePage'; // Import ValidatePage directly for specific renders

describe('ValidatePage - Rendering', () => {
    setupValidatePageTests();

    test('renders all editable fields for the current record when index is provided in URL', async () => {
        render(<TestWrapper />); // TestWrapper uses MOCK_INITIAL_DATA for record 1 (index 0)
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/record fields/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('CHENAB IMPEX PVT. LTD.')).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument(); // Verify current record index display
        });
    });

    test('loads the last viewed record index from localStorage if no index in URL', async () => {
        // Mock localStorage.getItem for this specific test
        // We're simulating that the user last viewed the second record (index 1)
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key: string) => {
                if (key === `lastViewedRecord_${MOCK_FILE_NAME}`) {
                    return '1'; // Simulate last viewed record was index 1 (the second record)
                }
                return null; // For other keys, return null or default behavior
            });

        // Render ValidatePage without record_index in initialEntries
        render(
            <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}`]}>
                <Routes>
                    <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Expect the content of the *second* record (index 1) to be displayed
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument(); // Record index display
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[1].address_1 as string)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[1].company as string)).toBeInTheDocument();
        });

        getItemSpy.mockRestore(); // Clean up the spy after the test
    });

    test('overrides localStorage index if record_index is provided in URL', async () => {
        // Mock localStorage.getItem to return a *different* index, which should be ignored
        // We'll provide index 0 in the URL, but localStorage pretends index 1 was last viewed.
        // The URL should take precedence.
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key: string) => {
                if (key === `lastViewedRecord_${MOCK_FILE_NAME}`) {
                    return '1'; // Simulate last viewed was index 1 (second record)
                }
                return null;
            });

        // Render ValidatePage with record_index 0 in initialEntries (URL: /validate/filename/1)
        render(
            <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}/1`]}> // Record 1 (index 0) explicitly requested
                <Routes>
                    <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Expect the content of the *first* record (index 0) to be displayed, overriding localStorage
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument(); // Record index display
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[0].address_1 as string)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[0].company as string)).toBeInTheDocument();
        });

        getItemSpy.mockRestore(); // Clean up the spy after the test
    });
});
