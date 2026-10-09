# Forms, photos and languages

The React frontend supports English, Urdu and Arabic. Choose a language from the selector at the bottom of the page, or from the header of an open dialog. The preference is saved on this device. Urdu and Arabic use right-to-left layouts, including the staff workspace and customer portal. Switching languages keeps current form entries.

Navigation, form labels, examples, explanations, standard choices, validation messages and common actions have translations in `src/lib/translations.json`. Customer names, property numbers, notes, uploaded documents and other business content remain as entered. API field names and enum values remain unchanged. Unrecognized server messages fall back to their original text; generated PDF documents use the backend's existing templates.

## Form changes

- **Projects:** optional photo on creation and editing. An existing project photo can be replaced or removed.
- **Properties:** optional photo; an **Other** property type with a required description; a numeric area with a fixed choice of marla, kanal, square feet, square yards, square metres, acres or hectares. Extra property fees are explained separately from the property price.
- **Features:** choose common features or enter an **Other** feature. Each selected feature can have its own optional photo.
- **Leads:** fields have examples and guidance explaining the contact details and enquiry source.
- **Customers:** optional customer photo on creation and editing, including adding, replacing or removing a photo on existing records. The same customer form is available within the booking flow. When adding a customer, staff with `customers.portal.manage` can optionally set and confirm a portal password to enable login immediately. A customer email address is required when setting a password; passwords must have 12–128 characters with uppercase, lowercase and a number. Leave both password fields blank to save a customer record and invite them later. Passwords can only be set in the creation form; an existing email account must be linked through the invitation flow without replacing its password.
- **Bookings:** three steps—choose customer/property, choose a payment schedule, review/submit. Continuing from the first step places the temporary property hold. A new customer can be added within the flow. Backend approval, reservation expiry and payment requirements still apply.
- **Payments received:** all methods except cash require a payment-proof image. **Other** also requires a payment-method description. Proof can be a receipt, transfer screenshot, cheque or deposit slip.
- **Dealers and team members:** a photo is required for new records. Existing records remain valid without a photo. Role choices describe responsibilities and list the role's actual current permissions.
- **Accounts & money:** clearer navigation and explanations for accounts, bank transactions and accounting entries.
- **Documents:** enter a display/download name. The actual file extension is preserved automatically.
- **Unsaved changes:** closing a form or navigating away uses the existing Radix dialog library. Browser refresh/tab-close warnings are controlled by the browser and cannot use an app dialog.

## Backend update required

The matching backend adds migrations `202610040001_form_images` and `202610060001_customer_photo`. The frontend and backend must be updated together because customer photos and creation-time portal access use new API fields, and new dealer/team records, non-cash payments and document uploads require additional fields.

On the machine running the intended backend, verify that `BE/.env` points to the intended database, then run from `BE`:

```powershell
npm run db:migrate
npm run db:generate
npm run build
```

Restart the backend process after updating it. No database migration is applied by running the frontend. Development uses `FE/.env.development` and the configured `http://localhost:4000/api/v1`; production builds use `FE/.env.production`. Restart Vite after editing environment files.

Images use the backend's existing private S3-compatible storage. Configure that storage and its browser-reachable signed URL endpoint on the backend. JPEG, PNG and WebP are accepted up to 5 MiB; document uploads keep the PDF/JPEG/PNG limit of 10 MiB. Images are checked for file signatures, purpose, permissions and project membership. Image preview links expire after 120 seconds and refresh while displayed. Cancelling a form can leave an unattached private upload; retain or clean these according to the operator's storage policy.

## Verification

```powershell
# FE
npm run typecheck
npm run lint
npm test
npm run build
npm run test:portal

# BE
npm run typecheck
npm run lint
npm run build
npm run test:unit
```

The browser suite includes uploads, conditional validation, role help, booking steps, document names, language switching, draft preservation, mobile RTL and the existing customer portal. It intercepts all API calls and starts only a frontend preview. Backend unit/regression tests run PostgreSQL in memory with PGlite, with storage and other external integrations mocked. They do not start Docker or alter a local/hosted application database. The separate infrastructure integration suite needs its configured PostgreSQL, Redis and object storage and is not part of these isolated checks.
