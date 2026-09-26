// Verify the Docker front door without printing credentials or creating business data.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const requireBE = createRequire(new URL('../../PMS-BE/package.json', import.meta.url));
requireBE('dotenv').config({
  path: fileURLToPath(new URL('../../PMS-BE/.env', import.meta.url)),
  quiet: true,
});
const base = 'http://localhost:3000';
const results = {};
let token;
async function api(path, method = 'GET', body) {
  const response = await fetch(base + '/api/v1' + path, {
    method,
    headers: {
      Origin: base,
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  return response;
}
try {
  const page = await fetch(base + '/bookings/new');
  assert(page.ok);
  assert.match(page.headers.get('content-security-policy') || '', /default-src 'self'/);
  const html = await page.text();
  const script = html.match(/<script[^>]+src="([^"]+)"/)[1];
  const asset = await fetch(new URL(script, base + '/bookings/new'));
  assert.match(asset.headers.get('content-type'), /javascript/);
  results.deepLinksAndSecurityHeaders = 'passed';
  const response = await api('/auth/login', 'POST', {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  assert.match(response.headers.get('set-cookie') || '', /HttpOnly/i);
  token = (await response.json()).data.accessToken;
  assert(token);
  assert.equal(
    (await (await api('/auth/me')).json()).data.email,
    process.env.ADMIN_EMAIL.toLowerCase(),
  );
  results.cookieLoginThroughProxy = 'passed';
  assert(Array.isArray((await (await api('/projects')).json()).data.items));
  results.authenticatedRequest = 'passed';
} finally {
  if (token) {
    await api('/auth/logout', 'POST', {});
    results.sessionCleanup = 'passed';
  }
}
console.log(JSON.stringify({ base, checks: results }, null, 2));
