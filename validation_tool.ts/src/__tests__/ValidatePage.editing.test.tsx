import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { setupValidatePageTests, TestWrapper } from './test_utils';

describe('ValidatePage - Editing', () => {
    setupValidatePageTests();

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

        // FIX: Use a more flexible regex for placeholder text matching
        fireEvent.change(screen.getByPlaceholderText(/website_url/i), { target: { value: 'website_new' } });
        fireEvent.change(screen.getByPlaceholderText('Value for new field'), { target: { value: 'http://new.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add field/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/website new/i)).toBeInTheDocument();
            expect(screen.getByDisplayValue('http://new.com')).toBeInTheDocument();
        });
    });
});
