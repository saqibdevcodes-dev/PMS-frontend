# Frontend deployment: etihadrealestate.tech

This deployment serves the frontend at `https://etihadrealestate.tech` on the
existing VPS. The backend remains at `https://api.etihadrealestate.tech`.
All new files belong to the frontend repository. The workflow deploys only static
frontend files; it does not modify backend configuration, run Prisma, restart the
backend, or change the existing API Nginx site.

## Confirm the existing Nginx layout

The supplied site file is for Nginx running directly on Ubuntu/Debian. Reuse the
existing Nginx installation and certificate tooling. If Nginx runs in Docker or a
hosting panel manages it, adapt the site installation and filesystem mounts to
that setup before enabling the workflow.

The browser calls `https://api.etihadrealestate.tech/api/v1` directly. The new
frontend site serves static files and has no API proxy. Its Content Security Policy
allows connections to the existing API domain. The local Docker configuration
continues to use its existing `/api/v1` proxy.

A read-only OPTIONS check on 2026-09-26 returned HTTP 204 with
`Access-Control-Allow-Origin: https://etihadrealestate.tech` and
`Access-Control-Allow-Credentials: true`. The existing API already permits the
frontend origin. Both domains use HTTPS and share the same site; the frontend's
existing `credentials: include` fetch setting sends API cookies during refresh.

Do not enable a second conflicting server block if an apex-domain site already
exists. Merge the frontend locations into that site and preserve its existing
TLS certificate directives. The API site's configuration is not involved.

## One-time VPS preparation

Use your existing SSH deployment account below in place of `deploy`. It needs
write access to the frontend directory and no sudo access for routine releases.
Ensure `bash`, `rsync`, and `curl` are available on the VPS.

```sh
sudo mkdir -p /var/www/pms-frontend/releases /var/www/pms-frontend/assets
sudo chown -R deploy:deploy /var/www/pms-frontend
sudo chmod 755 /var/www/pms-frontend
```

Add a dedicated CI SSH public key to this account's `~/.ssh/authorized_keys`.
Keep the private key in GitHub secrets, not in this repository.

Point the apex DNS record for `etihadrealestate.tech` to the VPS. Any AAAA record
must also reach this server over IPv6. Leave the API domain's DNS unchanged.

Copy the frontend site configuration to the existing
Nginx sites directory. For a new Ubuntu/Debian site, with this repository checked
out on the VPS:

```sh
sudo cp deployment/etihadrealestate.nginx.conf /etc/nginx/sites-available/etihadrealestate.tech
sudo ln -s /etc/nginx/sites-available/etihadrealestate.tech /etc/nginx/sites-enabled/etihadrealestate.tech
sudo nginx -t
sudo systemctl reload nginx
```

The commands above are for a new frontend site only. If that file or server block
already exists, review and update the existing apex site instead of overwriting it.

The supplied file starts with HTTP so certificate issuance can bootstrap. If the
apex domain does not already have HTTPS, use the VPS's existing certificate manager
to issue its certificate and redirect HTTP to HTTPS. With an existing Certbot
installation, the command is:

```sh
sudo certbot --nginx -d etihadrealestate.tech --redirect
sudo nginx -t
sudo systemctl reload nginx
```

Complete HTTPS setup before the first pipeline deployment. Do not replace or
reissue the API domain's certificate as part of this task.

## GitHub configuration

In the frontend repository, create a GitHub environment named `production` and
restrict its deployment branches to `main`. Add these environment secrets:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IPv4 address or SSH hostname |
| `VPS_USER` | Existing deployment account |
| `VPS_SSH_KEY` | Dedicated deployment private key |
| `VPS_KNOWN_HOSTS` | Verified SSH host-key entry for `VPS_HOST` |

For a nonstandard SSH port, set environment variable `VPS_PORT` to that port.
It defaults to `22`. The host-key entry must use `[host]:port` for a nonstandard
port. Verify the SSH host key through the VPS console or a trusted existing
connection rather than trusting an unverified key collected during CI.

The workflow is located at `.github/workflows/deploy.yml`, relative to the
frontend repository root. It assumes `package.json` is also at that root.

## Release flow

1. Pull requests run lint, 12 existing unit tests, TypeScript checks, and a Vite build.
2. Successful builds from `main` upload their `dist` artifact to the deployment job.
3. CI uploads a release to `/var/www/pms-frontend/releases/<commit>` over SSH.
4. Hashed assets are copied to a shared directory so already-open tabs can continue
   loading older chunks after deployment.
5. The activation script switches the `current` symlink atomically, verifies the
   exact frontend release through local HTTPS and the existing public API, and restores the previous
   symlink if those checks fail. A first deployment has no earlier release to restore.
6. CI checks the public frontend and API routes. Public-route failures mark the
   workflow failed; automatic rollback applies to the activation checks in step 5.

The frontend uses the build-time setting
`VITE_API_BASE_URL=https://api.etihadrealestate.tech/api/v1`.
No backend secrets are required in the frontend build or deployment job.
Commit the generated frontend API contracts with backend contract changes;
frontend CI does not need access to a sibling backend checkout.

Commit and push the frontend deployment files after completing the VPS and GitHub
configuration. Then monitor the frontend repository's Actions tab. No files have
been published to the VPS just by preparing these local files.

## Verification and rollback

Check `https://etihadrealestate.tech`, open `/dashboard` directly, sign in with an
existing production user, refresh the browser, and sign out. Verify document
downloads if the application uses them. The administrator created for the local
development database is not automatically an administrator in production.

To restore a previous release, run on the VPS as the deployment user, replacing
`PREVIOUS_COMMIT_SHA` with a retained 40-character commit SHA:

```sh
ln -sfn /var/www/pms-frontend/releases/PREVIOUS_COMMIT_SHA /var/www/pms-frontend/current-next
mv -Tf /var/www/pms-frontend/current-next /var/www/pms-frontend/current
```

Old releases and shared assets are retained intentionally. Periodically prune
releases after the rollback window; prune shared assets only when no retained
release or active-client support window needs them.

References: [Vite deployment](https://vite.dev/guide/static-deploy.html),
[GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments),
[Nginx proxy directives](https://nginx.org/en/docs/http/ngx_http_proxy_module.html).
