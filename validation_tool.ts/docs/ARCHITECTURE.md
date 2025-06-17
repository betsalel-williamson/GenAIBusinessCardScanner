# Project Architecture: Transcription Validation Tool

## Project Overview

This project provides a modern web application designed for efficiently validating and editing structured data extracted from documents, typically alongside their corresponding PDF sources. It offers a side-by-side interface for viewing a PDF and editing its associated data records, incorporating robust features like autosaving, undo/redo, and a clear data management workflow.

## High-Level Architecture

The application employs a **Client-Server-Side Rendered (SSR) architecture** built with Vite and Express, offering benefits like improved initial load performance and SEO.

### 1. Server-Side (Node.js/Express with Vite)

- **`server.ts`**: The core Express server. It integrates Vite in `middlewareMode` for SSR during development and serves pre-built client assets in production.
- **API Endpoints (`src/server/api.ts` and sub-routes)**:
  - `/api/files`: Lists all available JSON files and their current status (source, in-progress, validated).
  - `/api/files/:filename`: Serves the current data for a specific JSON file, prioritizing in-progress changes.
  - `/api/source-data/:filename`: Provides the original, untouched data for a specific JSON file from the `data_source` directory, primarily used for field-level revert functionality.
  - `/api/autosave/:filename` (PATCH): Receives the full updated array of records from the client and saves it to the `data_in_progress` directory.
  - `/api/commit/:filename` (PATCH): Receives the full updated array, saves it to the `data_validated` directory, deletes the in-progress version, and identifies the next file for validation.
- **Static File Serving**: Serves static assets, including PDF images. Notably, the `/images` route is configured to serve PDFs from a `dagster_card_processor/cards_to_process` directory, suggesting integration with an external data processing pipeline.
- **Data Directories (`data_source`, `data_in_progress`, `data_validated`)**: These directories on the server define the lifecycle of data files. They are automatically created on server startup if they don't exist.

### 2. Client-Side (React/TypeScript with Vite)

- **React App (`src/client/App.tsx`)**: The main React application defines the client-side routes using `react-router-dom`.
- **SSR Entry Points (`src/client/entry-client.tsx`, `src/client/entry-server.tsx`)**: Handle hydration on the client and server-side rendering respectively.
- **Pages**:
  - `HomePage.tsx`: Displays a list of JSON files with their status and provides links to the `ValidatePage`.
  - `ValidatePage.tsx`: The primary validation interface, composing the `ImagePane` and `DataEntryPane`.
- **Components**:
  - `ImagePane.tsx`: Renders PDF documents using `pdfjs-dist` (dynamically imported to support SSR). It provides features like panning and zooming the PDF.
  - `DataEntryPane.tsx`: Displays editable fields for the current data record. It supports adding new fields, reverting fields to their original source, and includes navigation controls.
  - `RecordNavigationHeader.tsx`: Displays record progression and provides Undo/Redo buttons.
  - `StatusDisplay.tsx`: A generic component for showing loading, error, or empty states.
- **Custom Hooks (`src/client/hooks/`)**:
  - `useValidationData.ts`: **The central state management and logic hub for `ValidatePage`.** It handles data fetching, autosaving (using `useDebounce`), undo/redo (using `useUndoableState`), record navigation, keyboard shortcuts, and persistence of user progress in `localStorage`.
  - `useUndoableState.ts`: A generic hook for managing state with undo/redo capabilities.
  - `useDebounce.ts`: A generic hook for debouncing values, used to limit autosave frequency.
- **Styling**: Uses Tailwind CSS for rapid UI development and utility-first styling. Some custom CSS is used for the PDF viewer's complex rendering requirements.

## Key Features and Functionality

- **Modern Technology Stack**: Built with React 18, TypeScript, Vite, Express, Tailwind CSS.
- **Server-Side Rendering (SSR)**: Improves initial page load times and SEO.
- **Data Lifecycle Management**: Clear separation of data into `data_source`, `data_in_progress`, and `data_validated` directories.
- **Intuitive Validation UI**: Side-by-side display of PDF documents and their corresponding editable JSON data.
- **Real-time Autosave**: Automatically saves changes to `data_in_progress` with a 1-second debounce, providing a robust backup mechanism.
- **Comprehensive Undo/Redo**: Track and revert/reapply changes to data records within the current file session.
- **Field-Level Revert**: Revert individual fields to their original value as found in the `data_source` file.
- **Dynamic Field Addition**: Users can add new custom key-value pairs to records.
- **PDF Interaction**: Pan and zoom capabilities for the displayed PDF document. PDFs automatically zoom to fit width on load.
- **Efficient Navigation**:
  - "Next Record" and "Prev Record" buttons.
  - Keyboard shortcuts: `ArrowRight` (Next), `ArrowLeft` (Previous), `Enter` (Next).
  - Global Undo/Redo: `Ctrl/Cmd + Z` (Undo), `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` (Redo).
  - Field-specific interaction: `Escape` (revert field to its state when focused and blur), `Ctrl/Cmd + Enter` (blur field without reverting).
  - `Escape` from global context navigates back to the file list.
- **Commit Workflow**: A "Commit & Next File" button finalizes the validation for a file, moving it to `data_validated` and automatically navigating to the next unvalidated file (if any).
- **Progress Persistence**: The last viewed record index and "soft-validated" records within a file are saved to `localStorage` for continuity across sessions.
- **Robust Testing**: Utilizes Vitest, React Testing Library, and Mock Service Worker (MSW) for comprehensive unit and integration testing.

## Project Structure & Important Files

```bash
.
├── .github/                       # GitHub Actions CI/CD workflows
│   └── workflows/
│       └── nodejs.yml             # CI pipeline for testing and building
├── .gitignore                     # Files/directories to ignore in Git
├── .nvmrc                         # Specifies Node.js version 20
├── .prettierignore                # Files to ignore for Prettier formatting
├── README.md                      # Project description and quick start guide
├── index.html                     # Main HTML file, client-side entry point, SSR target
├── postcss.config.cjs             # PostCSS configuration (Tailwind, Autoprefixer)
├── public/                        # Static assets served directly
│   ├── about.txt                  # Font licensing info
│   └── pdf.worker.min.js          # PDF.js worker (copied/symlinked)
├── server.ts                      # Main Express server for API and SSR
├── src/
│   ├── __tests__/                 # Unit and integration tests
│   │   ├── HomePage.test.tsx
│   │   ├── ValidatePage.data_operations.test.tsx
│   │   ├── ValidatePage.editing.test.tsx
│   │   ├── ValidatePage.navigation.test.tsx
│   │   ├── ValidatePage.rendering.test.tsx
│   │   ├── setupTests.ts
│   │   └── test_utils.tsx         # Mocking and helper utilities for tests
│   ├── client/                    # React client-side application
│   │   ├── App.tsx                # React Router setup
│   │   ├── Context.tsx            # Example React Context (currently unused)
│   │   ├── components/            # Reusable React components
│   │   │   ├── DataEntryPane.tsx    # Editable data fields and controls
│   │   │   ├── Footer.tsx
│   │   │   ├── ImagePane.tsx        # PDF viewer with pan/zoom
│   │   │   ├── RecordNavigationHeader.tsx # Record index and undo/redo buttons
│   │   │   └── StatusDisplay.tsx    # Generic status messages
│   │   ├── entry-client.tsx       # Client-side React hydration entry
│   │   ├── entry-server.tsx       # Server-side React rendering entry
│   │   ├── hooks/                 # Custom React hooks for logic reuse
│   │   │   ├── useDebounce.ts
│   │   │   ├── useUndoableState.ts
│   │   │   └── useValidationData.ts # **Main logic hook for ValidatePage**
│   │   ├── index.css              # Global styles (Tailwind + custom PDF styles)
│   │   └── pages/                 # React page components
│   │       ├── HomePage.tsx       # File listing page
│   │       └── ValidatePage.tsx   # Main validation UI
│   └── server/                    # Node.js server-side logic
│       ├── api.ts                 # Express router combining API sub-routes
│       ├── routes/                # Specific API route handlers
│       │   ├── autosave.ts
│       │   ├── commit.ts
│       │   ├── files.ts
│       │   └── sourceData.ts
│       └── utils.ts               # Server-side utilities (file system, data paths)
├── tailwind.config.cjs            # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration for client/server
├── types/                         # Global TypeScript type definitions
│   └── types.d.ts                 # Shared interfaces (DataRecord, TransformationState)
└── vite.config.ts                 # Vite build and Vitest test configuration
```

## Data Management and Workflow

The system uses three core directories for data management:

1. **`data_source/`**: Contains the original, untouched JSON files that need validation. These are read-only from the application's perspective, serving as the ground truth for "revert" operations.
2. **`data_in_progress/`**: When a file from `data_source` is opened for editing, any changes are automatically saved here via the autosave mechanism. This allows users to pick up where they left off if they close the browser or the server restarts.
3. **`data_validated/`**: Once a file's data is fully validated and the user clicks "Commit & Next File", the final JSON data is moved to this directory. The corresponding file is then removed from `data_in_progress`.

This workflow ensures data integrity, allows for partial work saving, and provides a clear separation of validated vs. unvalidated data.

## Contributing

To contribute to this project, follow these steps:

1. **Setup Development Environment**:

   - Ensure Node.js 20 (or higher, as specified in `.nvmrc`) is installed. `nvm use` will apply the correct version if you use nvm.
   - Install pnpm: `npm install -g pnpm`
   - Install dependencies: `pnpm install`

2. **Run Development Servers**:

   - To run the full SSR development server: `pnpm dev:server` (This will typically open on `http://localhost:7456`).
   - To run only the client-side Vite development server (useful for UI-only development, without full SSR and API integration): `pnpm dev:client`

3. **Building and Serving Production Assets**:

   - Build the client and server bundles: `pnpm build` (output goes to `dist/`)
   - Serve the production build (runs the compiled Node.js server): `pnpm serve`

4. **Testing**:

   - Run all tests: `pnpm test`
   - Run tests in watch mode: `pnpm test --watch`
   - Type checking: `pnpm typecheck`

5. **Code Style**:
   - The project uses Prettier and ESLint. Ensure your code conforms to the established style by running `pnpm lint` and `pnpm format`. Most IDEs can integrate these tools.
