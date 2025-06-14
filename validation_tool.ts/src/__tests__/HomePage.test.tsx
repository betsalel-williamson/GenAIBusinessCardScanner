import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

  test('renders file list with validated and in_progress statuses', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          { filename: 'test1.json', status: 'validated' },
          { filename: 'test2.json', status: 'in_progress' },
        ]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      // Check for validated file
      const file1Link = screen.getByRole('link', { name: 'test1.json' });
      expect(file1Link).toBeInTheDocument();
      expect(file1Link).toHaveAttribute('href', '/validate/test1.json');
      expect(screen.getByText('Validated ✓')).toBeInTheDocument();

      // Check for in_progress file
      const file2Link = screen.getByRole('link', { name: 'test2.json' });
      expect(file2Link).toBeInTheDocument();
      expect(file2Link).toHaveAttribute('href', '/validate/test2.json');
      expect(screen.getByText('In Progress...')).toBeInTheDocument();
    });
  });

  test('renders file list with source status (no status text shown)', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([
          { filename: 'new_file.json', status: 'source' },
        ]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      const newFileLink = screen.getByRole('link', { name: 'new_file.json' });
      expect(newFileLink).toBeInTheDocument();
      expect(newFileLink).toHaveAttribute('href', '/validate/new_file.json');
      // For 'source' status, the statusText is an empty string, so we expect it NOT to be in the document.
      expect(screen.queryByText(/source/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Validated ✓')).not.toBeInTheDocument();
      expect(screen.queryByText('In Progress...')).not.toBeInTheDocument();
    });
  });

  test('displays "No JSON files found" when API returns an empty array', async () => {
    server.use(
      http.get(API_FILES_URL, () => {
        return HttpResponse.json([]);
      })
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/No JSON files found/i)).toBeInTheDocument();
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
      // FIX: The error message directly uses the message from the catch block, which is 'Failed to fetch files'
      expect(screen.getByText(/Failed to fetch files/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading files/i)).not.toBeInTheDocument();
    });
  });
});
