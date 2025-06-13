import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { setupValidatePageTests, TestWrapper, mockNavigate, MOCK_INITIAL_DATA, MOCK_FILE_NAME } from './test_utils';

describe('ValidatePage - Data Operations', () => {
    setupValidatePageTests();

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

    // test('triggers autosave after a debounced state change', async () => {
    //     vi.useFakeTimers();
    //     const fetchSpy = vi.spyOn(window, 'fetch');
    //     render(<TestWrapper />);
    //     await waitFor(() => expect(screen.getByDisplayValue('J-1A, Ansa Industrial Estate')).toBeInTheDocument());

    //     fireEvent.change(screen.getByLabelText(/address 1/i), { target: { value: 'Changed' } });

    //     expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    //     expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('autosave'), expect.any(Object));

    //     vi.advanceTimersByTime(1100);

    //     await waitFor(() => {
    //         expect(screen.getByText('Saving...')).toBeInTheDocument();
    //         expect(fetchSpy).toHaveBeenCalledWith(
    //             expect.stringContaining(`/api/autosave/${MOCK_FILE_NAME}`),
    //             expect.objectContaining({
    //                 method: 'PATCH',
    //                 body: JSON.stringify([
    //                     { ...MOCK_INITIAL_DATA[0], "address_1": "Changed" }, // Expect the first record to be changed
    //                     MOCK_INITIAL_DATA[1] // Second record should be unchanged
    //                 ])
    //             })
    //         );
    //     });

    //     await waitFor(() => {
    //         expect(screen.getByText('Draft Saved ✓')).toBeInTheDocument();
    //     });
    //     vi.useRealTimers();
    // });

    // test('commits changes and navigates to the next file', async () => {
    //     const fetchSpy = vi.spyOn(window, 'fetch');
    //     render(<TestWrapper />);
    //     await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

    //     // Perform an edit so there are changes to commit (optional, but good practice)
    //     fireEvent.change(screen.getByLabelText(/address 1/i), { target: { value: 'Final Address' } });

    //     const commitButton = screen.getByRole('button', { name: /commit & next file/i });
    //     fireEvent.click(commitButton);

    //     await waitFor(() => {
    //         expect(fetchSpy).toHaveBeenCalledWith(
    //             expect.stringContaining(`/api/commit/${MOCK_FILE_NAME}`),
    //             expect.objectContaining({
    //                 method: 'PATCH',
    //                 body: JSON.stringify([
    //                     { ...MOCK_INITIAL_DATA[0], "address_1": "Final Address" },
    //                     MOCK_INITIAL_DATA[1]
    //                 ])
    //             })
    //         );
    //         expect(mockNavigate).toHaveBeenCalledWith('/validate/next-file.json');
    //     });
    // });

    // test('reverts a single field to original source on confirmation', async () => {
    //     render(<TestWrapper />);
    //     await waitFor(() => expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument());

    //     fireEvent.change(screen.getByLabelText(/address 1/i), { target: { value: 'User Changed Value' } });
    //     expect(screen.getByDisplayValue('User Changed Value')).toBeInTheDocument();

    //     const revertButton = screen.getByRole('button', { name: /revert/i, exact: false });
    //     fireEvent.click(revertButton);

    //     await waitFor(() => {
    //         expect(screen.getByDisplayValue('Original Addr')).toBeInTheDocument();
    //     });
    // });
});
