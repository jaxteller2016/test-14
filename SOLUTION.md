# Solution Overview

## Backend

- Replaced blocking fs.readFileSync with async fs.promises in routes.
- Implemented pagination (page, limit) and server-side search (q) in GET /api/items.
- Added input validation and robust error handling; POST now validates payload.
- Introduced a cached stats utility with fs.watch invalidation to avoid recomputation on each GET /api/stats.
- Made the Express app exportable and disabled side-effects in tests.
- Added Jest + Supertest tests for happy paths and error cases.

## Frontend

- Fixed memory leak using AbortController in Items and DataContext (setState gated by signal).
- Implemented pagination + search UI that calls server-side API.
- Integrated react-window virtualization for performant large lists.
- Added basic loading skeleton and ARIA attributes.

## Trade-offs

- Simple substring search for q; consider indexing if dataset grows.
- File-based storage kept for the exercise; a DB would simplify concurrency.
- Stats cache invalidates on file change; for large files consider hashing or incremental updates.

## How to Run

- Backend:
  - npm i
  - npm test
  - npm start
- Frontend:
  - npm i
  - npm start
