# Estate PMS frontend

React, Vite and strict TypeScript frontend for the backend in `../BE` (the older `../PMS-BE` layout is also supported for API generation). The shared application runs in a browser, Electron on Windows, and Capacitor on Android/iOS. It uses the real REST API, with project membership and permissions enforced by the backend.

For `https://etihadrealestate.tech`, follow the [production deployment guide](docs/production-deployment.md). The frontend GitHub Actions workflow deploys static files to the existing VPS and calls `https://api.etihadrealestate.tech/api/v1` directly.

Customers now have their own `/portal/login` and dashboard, with property details, installments, personal receipts, shared documents and statements. Staff invite customers from their record. See the [customer portal and environment guide](docs/customer-portal.md) for rollout requirements and the security finding discovered during validation.

## Open the application

Start the frontend as described below and open **http://localhost:3000**. The default command calls your separately running local backend at **http://localhost:4000/api/v1** directly. Sign in with an account from that backend; credentials are deliberately not copied into frontend files. Staff accounts open the project workspace and invited customer accounts open the customer portal.

## Local development

Use Node.js 22.12 or newer. Run these commands inside `FE`:

```powershell
npm ci
npm run dev
```

`npm run dev` and `npm run dev:local` select `.env.development`, with `VITE_API_BASE_URL=http://localhost:4000/api/v1`. Copy `.env.development.example` if the file does not exist. Browser API requests now show port **4000**, while the frontend remains on **3000**. Restart Vite after changing environment files or switching modes.

Use `npm run dev:production` to select `.env.production` and the hosted backend. In that mode, `VITE_API_BASE_URL=/api/v1` uses Vite's proxy with `PMS_BACKEND_URL=https://api.etihadrealestate.tech`. No backend is started by these frontend commands. Open the frontend using **localhost** and include `http://localhost:3000` in the local backend's `TRUSTED_ORIGINS` for direct requests and cookie sessions. Do not put passwords, signing keys or backend secrets in `VITE_*` variables; they are public build settings.

## Features

See [forms, photos and languages](docs/forms-and-languages.md) for the guided forms, Urdu/Arabic interface and required backend migration.

- Responsive project workspace, light/dark/system themes, command search, notifications and personal work.
- Inventory table/cards/matrix, search and pagination, CSV import, customer records and CRM pipeline.
- Reservation and booking wizard, exact decimal payment previews, separate-person approvals, collections, receipt printing and recovery.
- Dealer commissions, NDCs, transfers, cancellations, refunds, possession and snag workflows.
- Accounting, journals, periods, reconciliation, vendors, permissions, users and project settings.
- Private uploads, document generation, and 20 server-calculated report types with PDF/Excel downloads.
- Web cookie sessions, native encrypted session storage, controlled retries and unsaved-change prompts.

Forms and actions are generated from the backend's OpenAPI operation contracts, with dedicated interfaces for booking, reporting, dashboard and document workflows. See [module coverage](docs/module-coverage.md) and [architecture](docs/architecture.md).

## Build and verify

```powershell
npm run generate:api
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

API generation reads `../BE/docs/openapi.json`, with `../PMS-BE` as a fallback. After backend schema changes, run `npm run db:generate`, `npm run build` and `npm run openapi` inside the backend, then regenerate frontend contracts. `npm run test:portal` runs the separate portal browser tests with intercepted API fixtures and no backend services.

Browser/desktop integration tests require the backend dependencies running in Docker, installed Electron binaries, and a current build in `PMS-FE/dist`. They start a separate API/worker on port 4100 and Vite on 3100. They reset **only** the dedicated `pms_frontend_test` database, Redis database 5, and use the `pms-frontend-test` storage bucket. Do not use those test resources for application data. Test credentials and screenshots are written to ignored `test-results`; the HTML report is `playwright-report/index.html`. The main application database is not seeded with demonstration transactions.

## Native apps

```powershell
npm run desktop
npm run desktop:package
npm run mobile:sync
npm run android
```

Windows installer output is `release/Estate-PMS-Setup-1.0.0.exe`. The development installer is unsigned. Android and iOS native source projects are in `android/` and `ios/`. Android builds need JDK 21 and Android SDK 36; iOS builds require macOS and Xcode. See [native build and release instructions](docs/native-release.md) for localhost connectivity, signing, HTTPS, push configuration, versioning and the device testing checklist.
