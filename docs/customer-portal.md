# Customer portal

Customers sign in at `/portal/login` and are routed to their own dashboard. Staff continue to use the staff workspace. The portal includes properties, installments, personal payment receipts, PDF statements, shared documents, workflow status, notifications and account settings, with a responsive mobile layout.

When adding a customer from **Customers → Add customer**, or from **Add a new customer** in the booking flow, staff can upload an optional customer photo. Existing customers can have a photo added, replaced or removed through **Edit customer**. Photos use the existing private image storage and accept JPEG, PNG or WebP up to 5 MiB.

Staff with `customers.portal.manage` and project access can also set **Portal password** and **Confirm portal password** while creating a customer. Both entries must match, and a customer email address is required. Passwords must have 12–128 characters with uppercase, lowercase and a number. A successful creation with a password activates customer login immediately at `/portal/login`. The review step masks the password, and the server stores its hash. Creation-time password setup does not send an invitation email.

Leave both password fields blank to create the customer record without enabling login. Password setup is available only when creating a customer. If the email already belongs to an account, direct setup is rejected without changing that account's password; create the customer without a password and use the invitation flow to link an existing customer account.

Staff opens **Customers → customer record → Customer portal access → Invite customer**. The backend sends a 48-hour activation email. Existing customer accounts use their current password to accept another profile invitation. Access can be revoked from the same panel. The invitation controls require the new `customers.portal.manage` permission and project membership.

The backend migration `202610060001_customer_photo` and matching API/worker release must be deployed before this frontend release. Read the [backend rollout and access guide](../../BE/docs/customer-portal.md), including its linked security finding. This implementation has not been published to production.

## Environment selection

`npm run dev` and `npm run dev:local` load `.env.development`. The frontend runs on port 3000 and calls the backend on port 4000 directly:

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
PMS_BACKEND_URL=http://127.0.0.1:4000
VITE_NATIVE_API_URL=http://localhost:4000/api/v1
```

Start the backend separately. Open the frontend at `http://localhost:3000`, and include that origin in the local backend's `TRUSTED_ORIGINS`. Restart Vite after changing environment files or switching modes.

For development against the hosted backend, use `npm run dev:production`. It explicitly loads Vite production mode. Configure `FE/.env.production`:

```dotenv
PMS_BACKEND_URL=https://api.etihadrealestate.tech
VITE_API_BASE_URL=/api/v1
VITE_NATIVE_API_URL=https://api.etihadrealestate.tech/api/v1
```

In production development mode, Vite forwards relative `/api/v1` calls to `PMS_BACKEND_URL`; the browser's network tab shows `localhost:3000/api/v1` because that is the frontend proxy address. The actual backend in that mode is the hosted API. Local mode uses the direct port-4000 URL instead.

For the deployed static website, the existing [production workflow](production-deployment.md) supplies `VITE_API_BASE_URL=https://api.etihadrealestate.tech/api/v1` at build time. The browser calls that URL directly. Vite environment values are compiled into the application, so an environment edit requires a rebuild and redeployment. Secrets must never be stored in `VITE_*` values.

Frontend mode selection does not start any backend or Docker services.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:portal
```

The portal Playwright suite starts only a frontend preview on port 3102 and intercepts API requests with fixtures. It covers customer navigation, responsive layout, staff-route isolation, invitation activation and the staff invitation panel. It does not send invitations or create records on the live backend. Existing infrastructure integration tests remain separate under `npm run test:e2e`.

Generated API contracts are checked in for standalone frontend CI. To regenerate them in this workspace, run the backend's `npm run db:generate` and `npm run openapi`, then frontend `npm run generate:api`. The generator accepts both the current `../BE` layout and the older `../PMS-BE` layout.
