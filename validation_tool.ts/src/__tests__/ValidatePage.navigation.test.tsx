import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { setupValidatePageTests, TestWrapper, mockDataEntryPaneHandle } from './test_utils';

describe('ValidatePage - Navigation', () => {
    setupValidatePageTests();

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

        fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });
        await waitFor(() => expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument());
        mockDataEntryPaneHandle.scrollToTop.mockClear();

        fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' });

        await waitFor(() => {
            expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(1);
        });
    });


    test('navigates to the next record using Enter key', async () => {
        render(<TestWrapper />);
        await waitFor(() => expect(screen.getByText(/record 1 \/ 2/i)).toBeInTheDocument());

        fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText(/record 2 \/ 2/i)).toBeInTheDocument();
            expect(mockDataEntryPaneHandle.scrollToTop).toHaveBeenCalledTimes(1);
        });
    });
});
