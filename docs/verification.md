# Verification and delivery status

Verified on Windows on 23 September 2026, using the existing Docker PostgreSQL, Redis and MinIO services. The web stack is React/Vite, with no Next.js dependency.

| Check                                                     | Result                                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Strict TypeScript and Vite production build               | Passed                                                                                                                  |
| Frontend ESLint                                           | Passed                                                                                                                  |
| Frontend unit tests                                       | 12 passed                                                                                                               |
| Production-build browser and Windows integration tests    | 7 passed                                                                                                                |
| Backend unit/API contract tests after metadata correction | 18 passed                                                                                                               |
| Backend ESLint and Docker API/worker builds               | Passed                                                                                                                  |
| Docker frontend build                                     | Passed; serves localhost:3000                                                                                           |
| Front-door smoke check                                    | Passed: nested-page assets, CSP, HttpOnly login through proxy, authenticated request and logout                         |
| Backend runtime smoke check                               | Passed: liveness, database/Redis/storage readiness, API contract, administrator login, authenticated request and logout |
| Windows NSIS x64 installer                                | Built at `release/Estate-PMS-Setup-1.0.0.exe`; unsigned development build                                               |
| Android and iOS Capacitor synchronization                 | Passed; 12 native plugins registered for each platform                                                                  |
| Dependency audit                                          | No known vulnerabilities reported in the installed dependency tree                                                      |

The seven integration tests cover:

1. Windows launch/login, encrypted refresh storage, restart/session restoration and logout in a separate test profile.
2. Browser login/refresh, HttpOnly cookie, no persisted tokens, themes and mobile layout without horizontal overflow.
3. Inventory search, pagination, details, card view and real CSV import.
4. Required-field validation and actual customer creation.
5. Reservation, draft booking, separate-person approval, payment entry/verification and confirmed booking.
6. A worker-generated PDF download and a real document upload.
7. Restricted users' navigation/actions and direct-route permission guard.

These tests use a separate `pms_frontend_test` database and test worker. They do not populate the real application with sample customer or financial records. The final test run uses the production build to avoid development hot reload during packaging. Screenshots in ignored `test-results` were reviewed in light/dark desktop and mobile layouts.

The Windows encryption test must run under a normal Windows user context. A restricted automation sandbox cannot access DPAPI and can fail to initialize Electron's renderer. The successful run used the normal user context, with the test window hidden.

## External release prerequisites

No Android SDK/JDK installation is available on this machine. APK/AAB compilation and hardware camera, scanner and push acceptance tests remain to be run after those tools are installed. iOS compilation/signing needs a Mac with Xcode and an Apple team. Public HTTPS endpoints, FCM/APNs credentials, Windows signing, trusted update hosting and store accounts have not been supplied. Actual installer installation, printer dialogs and signed update delivery are not claimed as tested.

Native projects, signing configuration and the acceptance checklist are provided in [native-release.md](native-release.md). Localhost remains configured as requested.
