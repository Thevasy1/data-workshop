# Dataset Module Design

## Goal

Complete the front-end work for member 4 and member 5 in the Data Workshop project without changing back-end behavior or pushing to the remote repository.

## Scope

Member 4 owns the dataset list and dataset creation flow:

- Dataset list with keyword, data source, collection status, and date-range filters.
- Pagination and visible collection progress.
- Entry points for creating datasets, viewing details, deleting datasets, and checking collection logs.
- Dataset creation as a three-step wizard: basic information, collection rules, and confirmation.
- Collection rule configuration with field mappings, filters, schedule, and source-type-specific options.

Member 5 owns the dataset detail page:

- Dataset basic information and collection status.
- Field structure table.
- Sample preview table.
- Version management with compare and rollback actions.
- Dataset operations: export, delete, and mark as available for labeling.

## Architecture

The implementation stays inside the existing Vue 3 + TypeScript + Vite + Element Plus app. The dataset module will use the existing `request` wrapper, router conventions, `CommonTable`, and `StatusTag` components.

The dataset API module will be aligned with the RESTful interface document while keeping the Vite mock server as the local data source. The UI will use code-native Element Plus controls and local mock responses so the project remains front-end-only and easy to verify.

## Data Flow

1. List and create pages call `src/api/dataset.ts`.
2. `src/api/dataset.ts` maps to `/datasets` RESTful endpoints under the existing `/api` base URL.
3. `src/mock/index.ts` returns deterministic mock data for list, options, detail, fields, samples, versions, compare, export, delete, and label status.
4. Route navigation connects `/dataset/list`, `/dataset/create`, and `/dataset/detail/:id`.

## Testing

Validation will include:

- TypeScript production build through `npm run build`.
- ESLint through `npm run lint` if dependencies install cleanly.
- Rendered app smoke testing on the dataset list, create wizard, and detail page through the local dev server.
- Interaction checks for filtering, page navigation, wizard progression, log dialog, tabs, export, rollback, label status, and delete confirmation.

## Non-Goals

- No remote push.
- No back-end implementation.
- No redesign of unrelated modules.
- No change to data source or preprocess ownership beyond the dataset integration points needed by this task.
