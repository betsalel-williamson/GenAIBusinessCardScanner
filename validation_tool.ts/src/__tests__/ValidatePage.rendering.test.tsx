import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { setupValidatePageTests, TestWrapper, MOCK_FILE_NAME, MOCK_INITIAL_DATA } from './test_utils';
import ValidatePage from '../client/pages/ValidatePage';

describe('ValidatePage - Rendering', () => {
    setupValidatePageTests();

    test('renders both ImagePane and DataEntryPane side-by-side with correct data', async () => {
        render(<TestWrapper />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            // Verify DataEntryPane is present and contains expected data from MOCK_INITIAL_DATA[0]
            expect(screen.getByText(/record fields/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('CHENAB IMPEX PVT. LTD.')).toBeInTheDocument();

            // Verify ImagePane is present (using its mock's data-testid) and displays the correct PDF source
            const mockImagePane = screen.getByTestId('mock-image-pane');
            expect(mockImagePane).toBeInTheDocument();
            // The PDF source for MOCK_INITIAL_DATA[0] is "image-001.pdf" which becomes "/images/image-001.pdf"
            expect(mockImagePane).toHaveTextContent('Mock PDF Viewer: /images/image-001.pdf');

            // Confirm that both panes are loaded by checking elements from each
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); // From DataEntryPane
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument(); // From RecordNavigationHeader (part of the overall layout)
            expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable in DataEntryPane
        });
    });

    test('loads the last viewed record index from localStorage if no index in URL', async () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key: string) => {
                if (key === `lastViewedRecord_${MOCK_FILE_NAME}`) {
                    return '1'; // Simulate last viewed record was index 1 (the second record)
                }
                return null;
            });

        render(
            <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}`]}>
                <Routes>
                    <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Expect the content of the *second* record (index 1) to be displayed in DataEntryPane
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[1].address_1 as string)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[1].company as string)).toBeInTheDocument();

            // Expect the ImagePane to display the PDF for the *second* record
            const mockImagePane = screen.getByTestId('mock-image-pane');
            expect(mockImagePane).toHaveTextContent('Mock PDF Viewer: /images/image-002.pdf');
        });

        getItemSpy.mockRestore();
    });

    test('overrides localStorage index if record_index is provided in URL', async () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key: string) => {
                if (key === `lastViewedRecord_${MOCK_FILE_NAME}`) {
                    return '1'; // Simulate last viewed was index 1 (second record)
                }
                return null;
            });

        render(
            <MemoryRouter initialEntries={[`/validate/${MOCK_FILE_NAME}/1`]}> // Record 1 (index 0) explicitly requested
                <Routes>
                    <Route path="/validate/:json_filename/:record_index?" element={<ValidatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Expect the content of the *first* record (index 0) to be displayed, overriding localStorage
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[0].address_1 as string)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_INITIAL_DATA[0].company as string)).toBeInTheDocument();

            // Expect the ImagePane to display the PDF for the *first* record
            const mockImagePane = screen.getByTestId('mock-image-pane');
            expect(mockImagePane).toHaveTextContent('Mock PDF Viewer: /images/image-001.pdf');
        });

        getItemSpy.mockRestore();
    });
});
