How to test the frontend (React + Vite) — frontend-only guide

Prerequisites
- Node.js (>= 18 recommended)
- npm (comes with Node) or pnpm/yarn (this guide uses npm)
- Windows PowerShell (examples use PowerShell syntax)

1) Install dependencies
Open a PowerShell terminal and run:

```powershell
cd C:\Users\eber_johns\Desktop\shikshak-v2\frontend
npm install
```

If you run into peer dependency warnings when installing test libs, you can retry with:

```powershell
npm install --legacy-peer-deps
```

2) Development server (run frontend only)

Start the Vite development server:

```powershell
npm run dev
```

This will start the frontend at http://localhost:5173 by default (Vite prints the address). If your backend runs on a different host/port, set the `VITE_API_URL` environment variable in a `.env` file at the `frontend/` folder root. Example `.env`:

VITE_API_URL=http://localhost:8000

If `VITE_API_URL` is not set the app will use relative paths (same origin).

3) Run unit tests (Vitest)

Run the full test suite:

```powershell
cd C:\Users\eber_johns\Desktop\shikshak-v2\frontend
npx vitest run --reporter default
```

Run a single test file (helpful while iterating):

```powershell
npx vitest run src/__tests__/authStore.test.js --reporter default
```

Run tests in watch mode (interactive):

```powershell
npx vitest --watch
```

4) Linting

Run ESLint across the frontend:

```powershell
npx eslint . --ext .js,.jsx,.ts,.tsx
```

5) Environment variables

Create a `.env` file in the `frontend/` folder to set `VITE_API_URL`. Example:

```
VITE_API_URL=http://localhost:8000
```

If you're running the frontend with the backend on the same origin (proxy or same domain), you can omit `VITE_API_URL`.

6) Common troubleshooting

- "No default export" errors in tests for mocked modules:
  - Vitest's `vi.mock` may need to return the default export shape: `vi.mock('../lib/apiClient', () => ({ default: { get: vi.fn(), post: vi.fn() } }))`.

- React router Link errors in tests ("useContext is null"):
  - Wrap components that use `Link` with `MemoryRouter` in tests.

- Toast errors in tests ("useToast must be used inside ToastProvider"):
  - Wrap components with `ToastProvider` in tests where `useToast()` is used.

- Peer dependency conflicts when installing testing libs:
  - Try `npm install --legacy-peer-deps`.

7) Quick checklist to run frontend-only smoke test

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Open http://localhost:5173 in browser
- (Optional) Run tests: `npx vitest run`

Contact
If you need an end-to-end testing guide (frontend + backend), I can add instructions for starting the backend and running integration tests.
