# ZeusPay Backoffice

Aplicación interna de operaciones para ZeusPay.

## Requisitos

- Node.js 20+
- npm 10+

## Configuración

```bash
cp .env.example .env
npm install
```

Variables en `.env`:

| Variable | Descripción |
|----------|-------------|
| `VITE_NAME` | Tenant API (`zeuspay`) |
| `VITE_APP_ID` | ID de aplicación |
| `VITE_API_BASE_KUBITQ` | Host del API |
| `VITE_API_BASE_URL` | Prefijo v1 backoffice |
| `VITE_EMAIL_EDITOR_PROJECT_ID` | Proyecto Unlayer (mailing) |

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test         # Tests unitarios (Vitest)
npm run test:e2e     # E2E (Playwright)
```

## Estructura

- `src/app/` — Router y providers
- `src/features/` — Módulos por dominio
- `src/lib/` — API client, env, constantes
- `src/components/` — UI compartida (shadcn)
