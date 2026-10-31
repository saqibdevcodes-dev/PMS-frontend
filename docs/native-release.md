# Native development and release

All clients share the React UI and the centralized backend. No backend or database is embedded in an installer. Windows installers connect to the production HTTPS API automatically. Source development uses localhost; mobile builds require a reachable HTTPS service for real devices.

## Windows

Run inside `FE`:

```powershell
npm ci
npm run desktop
npm run desktop:package
```

Electron binaries are normally downloaded by npm installation. If a previous dependency install skipped them, run `node node_modules/electron/install.js` before packaging. `electron-builder.yml` uses that installed distribution to avoid re-extracting a second Electron archive during packaging.

The installer is `release/Estate-PMS-Setup-1.0.0.exe`; `release/win-unpacked/Estate PMS.exe` is the unpacked application. This development build is **unsigned**. Windows may show an unknown-publisher prompt. It has not been published or installed into the user's account by the build scripts.

Packaged Windows builds use **`https://api.etihadrealestate.tech/api/v1`**. No per-PC server configuration is required. Local API settings inherited from an older installation or terminal do not redirect a packaged app.

Source development defaults to `http://127.0.0.1:4000/api/v1`. Set `PMS_DESKTOP_API_URL` before `npm run desktop` to override it, or use `%APPDATA%/estate-pms-frontend/server.json` (Electron's user-data directory, based on the package name):

```json
{
  "apiUrl": "http://127.0.0.1:4000/api/v1"
}
```

The API overrides apply only to unpackaged development. Only HTTPS and explicit loopback HTTP are accepted there. Credentials and URL query strings are rejected. Refresh tokens are encrypted with Windows safeStorage and held outside the renderer; access tokens stay in memory. The preload exposes only specific application methods. Node integration is disabled, context isolation and renderer sandboxing are enabled, and arbitrary navigation/popups are denied.

For a public release, provide an organization's code-signing identity to electron-builder, enable `win.signExecutable`, set the matching publisher identity and require signing in the release environment. Preserve signing-key access in a secret manager. Publish the installer, blockmap and release metadata to an HTTPS update location you control. Only then set `updateUrl` in `server.json` (or `PMS_UPDATE_URL`). No update feed is configured in the delivered localhost build. The profile page exposes update checking, explicit download, and restart after the download is ready. Test signature verification, interrupted downloads and manual rollback with a previous signed installer before distributing updates.

The automated desktop test uses a hidden window and an isolated ignored test profile. It checks login, absence of tokens in localStorage, encrypted persistence, process restart/session restoration and logout. Native print dialogs, printer selection, file-save dialogs, actual installer execution and signed updates require an interactive Windows acceptance run; the test does not claim those checks.

## Android

The project is `android/`, application ID `com.estate.pms`. Generated Capacitor build configuration targets SDK 36, minimum SDK 24 and Java 21. Install Android Studio, its SDK/platform tools and a compatible JDK 21. Set `ANDROID_HOME` and `JAVA_HOME`, or select those tools in Android Studio. These SDKs are not installed in the current workspace environment.

```powershell
npm run mobile:sync
npm run android
# From FE/android, after SDK setup:
.\gradlew.bat assembleDebug
```

For the current localhost API on a USB-connected device or emulator:

```powershell
adb reverse tcp:4000 tcp:4000
adb reverse tcp:9002 tcp:9002
```

The second mapping lets local signed storage downloads reach MinIO. Loopback HTTP is explicitly allowed by `network_security_config.xml`; other cleartext servers are denied. The native HTTP adapter handles requests outside the WebView, so no broad mixed-content exception is enabled. For remote devices, build with `VITE_NATIVE_API_URL=https://your-api.example/api/v1` and configure the backend's public HTTPS storage endpoint as well.

For a release, supply `PMS_ANDROID_KEYSTORE` (absolute keystore path), `PMS_ANDROID_STORE_PASSWORD`, `PMS_ANDROID_KEY_ALIAS` and `PMS_ANDROID_KEY_PASSWORD` through your secure build environment, then:

```powershell
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease
```

Release assembly refuses missing signing credentials. Keep keystores and recovery copies outside the repository. The normal outputs are under `app/build/outputs/apk/release` and `app/build/outputs/bundle/release`. Increment `versionCode` for each store upload.

Android push requires your Firebase project configuration at `android/app/google-services.json`, plus a backend push delivery adapter configured for that project. The file is ignored. Permission requests and device registration occur after the user chooses **Enable push notifications** in their profile. No push provider account or credentials have been invented.

## iOS

The project is `ios/App/App.xcodeproj`, with Swift Package Manager dependencies generated by Capacitor. Building an IPA requires macOS, a compatible Xcode installation, an Apple development team, bundle ID registration and provisioning. Windows cannot produce or sign the iOS release.

On the Mac:

```sh
npm ci
npm run mobile:sync
npm run ios
```

Select the App target, your signing team, and a device/simulator. Use **Product > Archive** for an App Store/TestFlight distribution. Keep `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` aligned with the release. Local networking is allowed in Info.plist; camera/photo usage strings are included. The iOS simulator's localhost refers to its Mac, so run the backend there or use a reachable HTTPS development service. An iPhone's localhost refers to the phone and will not reach this Windows PC.

For push, add the Push Notifications capability and verify the generated `aps-environment` entitlement against the provisioning profile. Remote notification background mode and AppDelegate registration callbacks are provided. Configure APNs credentials in the backend's push adapter and test on a real device. Camera, QR and push behavior cannot be validated with browser mocks alone.

## Shared native behavior and release checks

- Capacitor secure storage holds refresh tokens; JavaScript never persists access tokens. App resume refreshes server data. Android back navigates or minimizes the app.
- Camera upload, QR reference search, native sharing and file downloads use installed Capacitor plugins. The app remains online-first; financial actions wait for server confirmation.
- Web/Electron/native API calls send `X-Client-Version: 1.0.0`; the backend can enforce `MIN_CLIENT_VERSION`. Keep the header, package version, Android versionName and iOS marketing version synchronized when releasing.
- Run login, restart/refresh, project switching, booking/approval/payment workflows, uploads/downloads, session revocation and logout on each supported device class. Then check permission denial, network interruption, background/resume, keyboard/safe areas, Android back, camera/scanning and push.
- Test a downloaded installer/APK/IPA, actual signed updates and a printer separately from source-level development tests. Store accounts, HTTPS hosting, production push/signing credentials and physical hardware remain external prerequisites.

The current deliverables include native source/configuration and the Windows packaging workflow. No Android APK/AAB, iOS IPA, signed release, store publication or hardware validation is claimed without those prerequisites.
