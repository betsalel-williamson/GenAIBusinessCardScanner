import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import HomePage from '../client/pages/HomePage';
import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';

const API_FILES_URL = '/api/files';

// Setup MSW server to mock API requests
const server = setupServer();

// Wrapper component to provide MemoryRouter for HomePage
const renderHomePage = () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

beforeAll(() => server.listen()); // Start the mock server before all tests
afterEach(() => server.resetHandlers()); // Reset handlers after each test to ensure isolation
afterAll(() => server.close()); // Close the server after all tests are done

describe('HomePage', () => {
  test('displays loading message initially', () => {
    // We don't mock the response immediately to simulate a delay
    server.use(
      http.get(API_FILES_URL, async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
        return HttpResponse.json([]);
      })
    );

    renderHomePage();
    expect(screen.getByText(/loading files/i)).toBeInTheDocument();
  });

  test('renders file list with active work files by default (in_progress and source)', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          { filename: 'validated_file.json', status: 'validated' },
          { filename: 'in_progress_file.json', status: 'in_progress' },
          { filename: 'source_file.json', status: 'source' },
        ]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      // Check for in_progress file (should be visible)
      expect(screen.getByRole('link', { name: 'in_progress_file.json' })).toBeInTheDocument();
      expect(screen.getByText('In Progress...')).toBeInTheDocument();

      // Check for source file (should be visible)
      expect(screen.getByText('source_file.json')).toBeInTheDocument();
      expect(screen.getByText('Ready for Ingestion')).toBeInTheDocument();

      // Check for validated file (should NOT be visible by default)
      expect(screen.queryByRole('link', { name: 'validated_file.json' })).not.toBeInTheDocument();
      expect(screen.queryByText('Validated ✓')).not.toBeInTheDocument();
    });
  });

  test('can switch filter to show all files including validated', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          { filename: 'validated_file.json', status: 'validated' },
          { filename: 'in_progress_file.json', status: 'in_progress' },
          { filename: 'source_file.json', status: 'source' },
        ]);
      })
    );

    renderHomePage();

    // Wait for initial load and verify default filter hides validated
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'validated_file.json' })).not.toBeInTheDocument();
    });

    // Change filter to 'All Files'
    const filterSelect = screen.getByLabelText(/show:/i);
    fireEvent.change(filterSelect, { target: { value: 'all' } });

    // Wait for validated file to appear
    await waitFor(() => {
      const validatedFileLink = screen.getByRole('link', { name: 'validated_file.json' });
      expect(validatedFileLink).toBeInTheDocument();
      expect(screen.getByText('Validated ✓')).toBeInTheDocument();
    });
  });

  test('displays "No active work files" message when no in-progress or source files with default filter', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          { filename: 'validated_file.json', status: 'validated' },
        ]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/No active work files/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading files/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'validated_file.json' })).not.toBeInTheDocument();
    });
  });

  test('displays "No JSON files found" when API returns an empty array with default filter', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/No active work files/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading files/i)).not.toBeInTheDocument();
    });
  });


  test('displays an error message when API call fails', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch files/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading files/i)).not.toBeInTheDocument();
    });
  });
});
