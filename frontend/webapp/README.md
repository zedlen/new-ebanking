# ZeusPay Webapp

Modern e-banking client for **ZeusPay** 


## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- API (dev): proxied to `http://localhost:3001` via `/api/*` — set `VITE_API_BASE_KUBITQ=` empty in `.env` so requests are same-origin.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_ENV` | Segment in login URL (`local`, `production`, …) |
| `VITE_APP_NAME` | **Backend auth slug** in login path (e.g. `livingrock`, `zeuspay`) — not UI branding |
| `VITE_API_BASE_KUBITQ` | API host; **empty in dev** uses Vite proxy |
| `VITE_API_BASE_URL` | v1 path (default `/api/v1`) |
| `VITE_API_BASE_URL_V2` | v2 path |
| `VITE_API_BASE_URL_V3` | v3 path |
| `VITE_API_TIMEOUT` | Request timeout (ms) |

## Auth

- **Session:** HttpOnly cookie (`withCredentials: true`) + optional **Bearer** token in memory from login.
- **Profile:** `GET /api/v1/ebanking/auth/me` on bootstrap and after login.
- **No JWT** in `localStorage` / `sessionStorage`.
- **RSA private key** and encryption key: **memory only** (Zustand) for card payload decrypt — lost on full page refresh; user must log in again for CVV/PIN.

## Routes

| Path | Access |
|------|--------|
| `/` | Login |
| `/recover-password` | Recover password |
| `/menu/profile` | All authenticated users |
| `/menu/:customerId/accounts` | All |
| `/menu/:customerId/accounts/:id/details/*` | All (transfer tab: own account only) |
| `/menu/cards` | Persona física (`taxpayer_type_id === 1`) |
| `/menu/clients`, `/menu/affiliations`, `/menu/customer-registration` | Persona moral (`taxpayer_type_id === 2`) |

Guards: `ProtectedRoute` → `TaxpayerTypeGuard` (see `src/app/guards/`).

## Project structure

```
src/
├── app/           router, SessionBootstrap, guards
├── api/           client, endpoints, services
├── features/      auth, accounts, movements, transfers, cards,
│                  clients, affiliations, customer-registration, profile, shell
└── shared/        components, store, constants, utils
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | `tsc` + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright smoke (starts preview server) |
| `npm run test:e2e:ui` | Playwright UI mode |

### E2E tests

Smoke tests (no API): login/recover pages render; protected routes redirect when logged out.

```bash
npm run build
npm run test:e2e
```

Optional — live API smoke (staging credentials):

```bash
E2E_USERNAME=your-user E2E_PASSWORD=your-pass npm run test:e2e
```