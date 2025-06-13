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
});
