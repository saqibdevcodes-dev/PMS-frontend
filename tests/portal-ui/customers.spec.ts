import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { chooseOption } from '../support/select';

const operations = JSON.parse(
  readFileSync(new URL('../../src/generated/operations.json', import.meta.url), 'utf8'),
) as { permission?: string }[];
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const project = {
  id: id(1),
  name: 'Garden Homes',
  code: 'GH',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
};
const customerRoot = `/projects/${project.id}/customers`;
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1cAAAAASUVORK5CYII=',
  'base64',
);
const photo = { name: 'customer.png', mimeType: 'image/png', buffer: png };
const list = (items: unknown[]) => ({
  items,
  pagination: { page: 1, limit: 25, total: items.length, totalPages: 1 },
});
type Write = { path: string; method: string; body: Record<string, unknown>; raw: string };

async function setup(page: Page, portalPermission = true, customerCount = 1) {
  const writes: Write[] = [];
  const requests: string[] = [];
  const customers: Record<string, unknown>[] = [
    {
      id: id(2),
      name: 'Existing Buyer',
      reference: 'CUST-001',
      phone: '03001234567',
      email: 'existing@example.invalid',
      createdAt: '2026-09-21T10:00:00Z',
      identityLast4: '1234',
      photoId: id(20),
    },
  ];
  for (let index = 2; index <= customerCount; index++)
    customers.push({
      id: id(100 + index),
      name: `Buyer ${String(index).padStart(3, '0')}`,
      reference: `CUST-${String(index).padStart(3, '0')}`,
      phone: '+92 300 1234567',
      email: `buyer${index}@example.invalid`,
      createdAt: '2026-09-21T10:00:00Z',
      identityLast4: '9876',
    });
  let portalStatus = 'NOT_ACTIVE';
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    requests.push(path);
    const isWrite = request.method() !== 'GET';
    const raw = request.postData() ?? '';
    const body = request.headers()['content-type']?.includes('application/json')
      ? (JSON.parse(raw || '{}') as Record<string, unknown>)
      : {};
    if (isWrite && path !== '/auth/refresh')
      writes.push({ path, method: request.method(), body, raw });
    let data: unknown;
    if (path === '/auth/refresh') data = { accessToken: 'fixture-token' };
    else if (path === '/auth/me')
      data = {
        id: id(9),
        name: 'Test Staff',
        email: 'staff@example.invalid',
        accountType: 'STAFF',
        permissions: [...new Set(operations.map((o) => o.permission).filter(Boolean))].filter(
          (permission) => portalPermission || permission !== 'customers.portal.manage',
        ),
        projects: [{ projectId: project.id }],
      };
    else if (path === '/projects') data = list([project]);
    else if (path === '/notifications') data = list([]);
    else if (path === '/compatibility')
      data = { apiVersion: 'v1', minimumClientVersion: '1.0.0', platforms: ['web'] };
    else if (path === '/images' && isWrite)
      data = { id: id(20), name: photo.name, mime: photo.mimeType, size: png.length };
    else if (path.startsWith('/images/'))
      data = { url: 'data:image/png;base64,' + png.toString('base64'), expiresIn: 120 };
    else if (path === customerRoot + '/check-email') data = { exists: false, existingMember: null };
    else if (path === customerRoot) {
      if (isWrite) {
        const customer = {
          id: id(30),
          reference: 'CUST-002',
          name: body.name,
          phone: body.phone,
          email: body.email,
          photoId: body.photoId,
          communicationConsent: body.communicationConsent,
        };
        customers.push(customer);
        portalStatus = body.password ? 'ACTIVE' : 'NOT_ACTIVE';
        data = customer;
      } else {
        const params = new URL(request.url()).searchParams;
        const pageNumber = Number(params.get('page') || 1);
        const pageSize = Number(params.get('limit') || 25);
        const search = (params.get('search') || '').toLowerCase();
        const filtered = customers.filter((customer) =>
          `${customer.name} ${customer.email} ${customer.reference}`.toLowerCase().includes(search),
        );
        data = {
          items: filtered.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
          pagination: {
            page: pageNumber,
            limit: pageSize,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / pageSize),
          },
        };
      }
    } else if (path.startsWith(customerRoot + '/') && path.endsWith('/portal/invite')) {
      portalStatus = 'PENDING';
      data = { status: portalStatus };
    } else if (path.startsWith(customerRoot + '/') && path.endsWith('/portal'))
      data = {
        status: portalStatus,
        email: customers.at(-1)?.email,
        expiresAt: portalStatus === 'PENDING' ? '2030-01-01T00:00:00Z' : null,
      };
    else if (path.startsWith(customerRoot + '/'))
      data = customers.find((customer) => customer.id === path.split('/').at(-1));
    else if (path.endsWith('/units')) data = list([]);
    else data = list([]);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });
  });
  return { writes, requests, customers };
}

test('returning to the admin tab refreshes changed customer photos in the list and open record immediately', async ({
  page,
}) => {
  const { requests, customers } = await setup(page);
  await page.goto('/customers');
  await expect(page.locator('.customer-avatar img')).toBeVisible();
  await page.locator('.record-link').filter({ hasText: 'Existing Buyer' }).click();
  await expect(
    page.getByRole('heading', { name: 'Existing Buyer', exact: true, level: 1 }),
  ).toBeVisible();
  const detailPath = customerRoot + '/' + id(2);
  await expect.poll(() => requests.filter((path) => path === detailPath).length).toBe(1);
  // Simulate another session updating the customer's profile while this tab is hidden.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    window.dispatchEvent(new Event('visibilitychange'));
  });
  customers[0]!.photoId = id(21);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    window.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => requests.includes('/images/' + id(21))).toBe(true);
  await expect.poll(() => requests.filter((path) => path === detailPath).length).toBe(2);
  await page.goto('/customers');
  await expect
    .poll(() => requests.filter((path) => path === customerRoot).length)
    .toBeGreaterThanOrEqual(2);
  expect(requests.filter((path) => path === '/images/' + id(20)).length).toBeGreaterThan(0);
});

test('customer directory combines photos with names, edits records and paginates and searches on mobile', async ({
  page,
}) => {
  await setup(page, true, 63);
  await page.goto('/customers');
  const table = page.locator('.customer-directory');
  await expect(table.getByRole('columnheader', { name: 'Full name' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Photo Id' })).toHaveCount(0);
  await expect(table.locator('tbody tr')).toHaveCount(25);
  await expect(table.locator('.customer-avatar img')).toHaveCount(1);
  await expect(table.getByText('CUST-001', { exact: true })).toBeVisible();
  await page.screenshot({
    path: 'test-results/portal/customer-directory-desktop.png',
    fullPage: true,
  });
  await table.getByRole('button', { name: 'Edit Existing Buyer', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Name', { exact: false }).first()).toHaveValue(
    'Existing Buyer',
  );
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await table.getByRole('button', { name: 'Page 2', exact: true }).click();
  await expect(table.getByRole('button', { name: 'Buyer 026', exact: true }).first()).toBeVisible();
  await chooseOption(table.getByLabel('Rows per page'), '10');
  await expect(table.locator('tbody tr')).toHaveCount(10);
  await expect(
    table.getByRole('button', { name: 'Existing Buyer', exact: true }).first(),
  ).toBeVisible();
  await table.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(table.getByRole('button', { name: 'Buyer 011', exact: true }).first()).toBeVisible();
  await page.getByRole('textbox', { name: 'Search Customers', exact: true }).fill('Buyer 063');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.getByRole('button', { name: 'Buyer 063', exact: true }).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({
    path: 'test-results/portal/customer-directory-mobile.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({
    path: 'test-results/portal/customer-directory-dark-mobile.png',
    fullPage: true,
  });
});

async function openCustomer(page: Page) {
  await page.goto('/bookings/new');
  await page.getByRole('button', { name: 'Add customer', exact: true }).click();
  return page.getByRole('dialog');
}

async function fillCustomer(dialog: Locator, email = 'new@example.invalid') {
  await dialog.getByLabel('Name', { exact: false }).first().fill('New Buyer');
  await dialog.getByLabel('Phone number').fill('+92 300 7654321');
  await dialog.getByLabel('National ID or passport number').fill('35202-1234567-8');
  if (email) await dialog.getByLabel('Email address').fill(email);
}

test('customer creation uploads its project photo, reviews contact details and generates credentials on the server', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const dialog = await openCustomer(page);
  await fillCustomer(dialog);
  await expect(dialog.locator('#field-password')).toHaveCount(0);
  await expect(dialog.locator('#field-confirmPassword')).toHaveCount(0);
  await expect(dialog.getByText(/A secure password is generated automatically/)).toBeVisible();
  await dialog.getByLabel('Member photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Member photo' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.locator('.review-values')).toContainText('new@example.invalid');
  await dialog.getByRole('button', { name: 'Back to details' }).click();
  await expect(dialog.getByLabel('Email address')).toHaveValue('new@example.invalid');
  await expect(dialog.getByRole('img', { name: 'Member photo' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog).toHaveCount(0);
  const upload = writes.find((w) => w.path === '/images')!;
  expect(upload.raw).toContain(project.id);
  const created = writes.find((w) => w.path === customerRoot)!;
  expect(created.body).toMatchObject({
    name: 'New Buyer',
    email: 'new@example.invalid',
    photoId: id(20),
  });
  expect(created.body).not.toHaveProperty('password');
});

test('customer creation validates required contact and identity details before submitting', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const d = await openCustomer(page);
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.locator('.field-error').first()).toBeVisible();
  await fillCustomer(d, 'invalid');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByRole('button', { name: 'Confirm & submit' })).toHaveCount(0);
  expect(writes.some((w) => w.path === customerRoot)).toBe(false);
});

test('customer creation requires a valid email for generated portal credentials', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const d = await openCustomer(page);
  await fillCustomer(d, '');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByRole('button', { name: 'Confirm & submit' })).toHaveCount(0);
  expect(writes.some((w) => w.path === customerRoot)).toBe(false);
  await d.getByLabel('Email address').fill('new@example.invalid');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(d).toHaveCount(0);
  expect(writes.find((w) => w.path === customerRoot)?.body.email).toBe('new@example.invalid');
});

test('staff without portal management can create a customer with a photo and no login controls', async ({
  page,
}) => {
  const { writes, requests } = await setup(page, false);
  const d = await openCustomer(page);
  await fillCustomer(d);
  await expect(d.locator('#field-password')).toHaveCount(0);
  await d.getByLabel('Member photo', { exact: true }).setInputFiles(photo);
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(d).toHaveCount(0);
  expect(writes.find((w) => w.path === customerRoot)?.body).toMatchObject({
    name: 'New Buyer',
    photoId: id(20),
  });
  await page.goto('/customers/' + id(30));
  await expect(page.getByRole('heading', { name: 'Member portal access' })).toHaveCount(0);
  expect(requests.some((p) => p.endsWith('/portal'))).toBe(false);
});

test('editing a customer can upload their photo without exposing password changes', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto(`/customers?record=${id(2)}`);
  await page.getByRole('button', { name: 'Edit customer', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit customer details', exact: true });
  await expect(dialog.locator('#field-password')).toHaveCount(0);
  await expect(dialog.locator('#field-confirmPassword')).toHaveCount(0);
  await expect(dialog.getByRole('group', { name: 'Customer portal login' })).toHaveCount(0);
  await dialog.getByLabel('Member photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Member photo' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Request completed' }).getByText('Saved to your project'),
  ).toBeVisible();
  const uploaded = writes.find((write) => write.path === '/images')!;
  expect(uploaded.raw).toContain('name="purpose"\r\n\r\nCUSTOMER\r\n');
  expect(uploaded.raw).toContain(`name="projectId"\r\n\r\n${project.id}\r\n`);
  const updated = writes.find((write) => write.method === 'PATCH')!;
  expect(updated.path).toBe(`${customerRoot}/${id(2)}`);
  expect(updated.body).toMatchObject({ photoId: id(20) });
  expect(updated.body).not.toHaveProperty('password');
});

test('adding a customer from a booking supports photo and generated credentials and selects the new record', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/bookings/new');
  await page.getByRole('button', { name: 'Add customer', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await fillCustomer(dialog);
  await dialog.getByLabel('Member photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Member photo' })).toBeVisible();
  await expect(dialog.locator('#field-password')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Customer', { exact: true })).toContainText('New Buyer');
  await page.getByLabel('Customer', { exact: true }).click();
  await expect(page.locator(`[role="option"][data-value="${id(30)}"]`)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(writes.find((write) => write.path === customerRoot)?.body).toMatchObject({
    photoId: id(20),
  });
});

for (const theme of ['light', 'dark'] as const) {
  for (const width of [1440, 390]) {
    test(`QR customer directory stays usable in ${theme} mode at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((theme) => {
        localStorage.setItem(
          'estate-preferences-v1',
          JSON.stringify({ state: { theme }, version: 0 }),
        );
      }, theme);
      const { writes } = await setup(page, true, 3);
      await page.goto('/members/qr');
      await expect(
        page.getByRole('heading', { name: 'Customer QR codes', exact: true }),
      ).toBeVisible();
      await expect(page.locator('.id-card-name')).toHaveText('Existing Buyer');
      await expect(page.locator('.breadcrumb')).toContainText('Customer QR codes');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const buyer = page.getByRole('button', { name: /Buyer 002/ });
      await buyer.focus();
      await page.keyboard.press('Enter');
      await expect(buyer).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.id-card-name')).toHaveText('Buyer 002');
      await page.getByRole('searchbox', { name: 'Search customers' }).fill('Buyer 003');
      await expect(page.locator('.mqr-member')).toHaveCount(1);
      await page.getByRole('button', { name: 'Clear search', exact: true }).click();
      await expect(page.locator('.mqr-member')).toHaveCount(3);
      const panelColor = await page
        .locator('.mqr-directory')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(panelColor).toBe(theme === 'dark' ? 'rgb(20, 20, 20)' : 'rgb(255, 255, 255)');
      await page.screenshot({
        path: `test-results/portal/qr-${theme}-${width}.png`,
        fullPage: true,
      });
      expect(writes).toHaveLength(0);
    });
  }
}

test('system theme follows OS changes and explicit light preference overrides them', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('estate-preferences-v1'))
      localStorage.setItem(
        'estate-preferences-v1',
        JSON.stringify({ state: { theme: 'system' }, version: 0 }),
      );
  });
  await setup(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/profile');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f5f6f8');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('customer QR passes print alone on light paper from a dark workspace', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'estate-preferences-v1',
      JSON.stringify({ state: { theme: 'dark' }, version: 0 }),
    ),
  );
  await setup(page);
  await page.goto('/members/qr');
  await expect(page.locator('.id-card-name')).toHaveText('Existing Buyer');
  await page.evaluate(() => document.body.classList.add('print-customer-badge-active'));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await expect(page.locator('#printable-customer-badge')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(page.locator('.mqr-directory')).toBeHidden();
  await page.pdf({
    path: 'test-results/portal/customer-pass-print.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => document.body.classList.remove('print-customer-badge-active'));
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
