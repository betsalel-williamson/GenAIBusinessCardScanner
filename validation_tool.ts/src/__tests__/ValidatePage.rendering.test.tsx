import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import { setupValidatePageTests, TestWrapper, MOCK_FILE_NAME, MOCK_SINGLE_RECORD } from './test_utils';
import ValidatePage from '../client/pages/ValidatePage';

describe('ValidatePage - Rendering (Single Record Files)', () => {
    setupValidatePageTests();

    test('renders both ImagePane and DataEntryPane side-by-side with correct data', async () => {
        render(<TestWrapper />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            // Verify DataEntryPane is present and contains expected data from MOCK_SINGLE_RECORD
            expect(screen.getByText(/record fields/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_SINGLE_RECORD.address_1 as string)).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_SINGLE_RECORD.company as string)).toBeInTheDocument();

            // Verify ImagePane is present (using its mock's data-testid) and displays the correct PDF source
            const mockImagePane = screen.getByTestId('mock-image-pane');
            expect(mockImagePane).toBeInTheDocument();
            // The PDF source for MOCK_SINGLE_RECORD is "image-001.pdf" which becomes "/images/image-001.pdf"
            expect(mockImagePane).toHaveTextContent('Mock PDF Viewer: /images/image-001.pdf');

            // Confirm that both panes are loaded by checking elements from each
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); // From DataEntryPane
            // RecordNavigationHeader is removed, so no 'Record X / Y' text expected
            expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable in DataEntryPane
        });
    });

    // Tests related to 'last viewed record index from localStorage' and 'record_index in URL' are removed
    // as these concepts are no longer applicable in a single-record-per-file workflow.
    // Each file IS a record.
});
