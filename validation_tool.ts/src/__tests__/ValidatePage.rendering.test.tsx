import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { setupValidatePageTests, TestWrapper } from './test_utils';

describe('ValidatePage - Rendering', () => {
    setupValidatePageTests();

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
            expect(screen.queryByLabelText(/source/i)).not.toBeInTheDocument(); // Source field should NOT be editable
        });
    });
});
