# Estate PMS frontend

React, Vite and strict TypeScript frontend for the backend in `../PMS-BE`. The shared application runs in a browser, Electron on Windows, and Capacitor on Android/iOS. It uses the real REST API, with project membership and permissions enforced by the backend.

For `https://etihadrealestate.tech`, follow the [production deployment guide](docs/production-deployment.md). The frontend GitHub Actions workflow deploys static files to the existing VPS and calls `https://api.etihadrealestate.tech/api/v1` directly.

## Open the application

With the backend Docker stack running, open **http://localhost:3000**. Sign in with the administrator credentials configured in `../PMS-BE/.env` (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Credentials are deliberately not copied into frontend files. An empty project list is expected on a new installation: create a project, configure its accounts and payment plans, then add inventory and customers.

From the parent `PMS` directory, start or rebuild the existing containers with:

```powershell
docker compose -p pms -f PMS-BE/compose.yaml --profile app up -d --build
docker compose -f PMS-FE/compose.yaml up -d --build
```

The frontend joins the existing `pms_default` Docker network. Set `PMS_DOCKER_NETWORK` if your backend uses a different Compose project name. Keep the existing `pms` project name to reuse its databases and volumes after moving the backend into `PMS-BE`.

## Local development

Use Node.js 22.12 or newer. Run these commands inside `PMS-FE`:

```powershell
npm ci
cp .env.example .env
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:4000`. `PMS_BACKEND_URL` changes that upstream. Stop only the frontend container before using development port 3000 (`docker compose stop frontend` from `PMS-FE`). Use **localhost**, matching the backend's trusted browser origin. Do not put passwords, signing keys or backend secrets in `VITE_*` variables; they are public build settings.

## Features

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

API generation reads `../PMS-BE/docs/openapi.json`. After backend schema changes, run `npm run db:generate`, `npm run build` and `npm run openapi` inside `PMS-BE`, then regenerate frontend contracts.

Browser/desktop integration tests require the backend dependencies running in Docker, installed Electron binaries, and a current build in `PMS-FE/dist`. They start a separate API/worker on port 4100 and Vite on 3100. They reset **only** the dedicated `pms_frontend_test` database, Redis database 5, and use the `pms-frontend-test` storage bucket. Do not use those test resources for application data. Test credentials and screenshots are written to ignored `test-results`; the HTML report is `playwright-report/index.html`. The main application database is not seeded with demonstration transactions.

## Native apps

```powershell
npm run desktop
npm run desktop:package
npm run mobile:sync
npm run android
```

Windows installer output is `release/Estate-PMS-Setup-1.0.0.exe`. The development installer is unsigned. Android and iOS native source projects are in `android/` and `ios/`. Android builds need JDK 21 and Android SDK 36; iOS builds require macOS and Xcode. See [native build and release instructions](docs/native-release.md) for localhost connectivity, signing, HTTPS, push configuration, versioning and the device testing checklist.
