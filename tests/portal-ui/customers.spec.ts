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
const password = 'Customer-Password-123';
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
  await page.getByRole('button', { name: 'Existing Buyer', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
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
  await expect.poll(() => requests.filter((path) => path === customerRoot).length).toBe(2);
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
  await expect(table.getByRole('button', { name: 'Buyer 026', exact: true })).toBeVisible();
  await chooseOption(table.getByLabel('Rows per page'), '10');
  await expect(table.locator('tbody tr')).toHaveCount(10);
  await expect(table.getByRole('button', { name: 'Existing Buyer', exact: true })).toBeVisible();
  await table.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(table.getByRole('button', { name: 'Buyer 011', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search Customers', exact: true }).fill('Buyer 063');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.getByRole('button', { name: 'Buyer 063', exact: true })).toBeVisible();
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
  await page.goto('/customers');
  await page.getByRole('button', { name: 'Add customer', exact: true }).click();
  return page.getByRole('dialog');
}

async function fillCustomer(dialog: Locator, email = 'new@example.invalid') {
  await dialog.getByLabel('Name', { exact: false }).first().fill('New Buyer');
  await dialog.getByLabel('Phone number').fill('+92 300 7654321');
  await dialog.getByLabel('National ID or passport number').fill('35202-1234567-8');
  if (email) await dialog.getByLabel('Email address').fill(email);
}

test('customer photo uploads to its project and portal password stays masked in review', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const dialog = await openCustomer(page);
  await fillCustomer(dialog);
  await expect(dialog.getByRole('group', { name: 'Customer portal login' })).toBeVisible();
  await dialog.getByLabel('Customer photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Customer photo' })).toBeVisible();
  await dialog.getByLabel('Portal password', { exact: true }).fill(password);
  await dialog.locator('#field-confirmPassword').fill(password);
  await expect(dialog.locator('#field-password')).toHaveAttribute('type', 'password');
  await expect(dialog.locator('#field-confirmPassword')).toHaveAttribute('type', 'password');
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.screenshot({ path: 'test-results/portal/customer-create.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: 'test-results/portal/customer-create-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.getByRole('button', { name: 'Confirm & submit' })).toBeVisible();
  await expect(dialog.locator('.review-values')).not.toContainText(password);
  await expect(dialog.locator('.review-values')).not.toContainText('Confirm Password');
  expect(writes.filter((write) => write.path === customerRoot)).toHaveLength(0);
  await dialog.getByRole('button', { name: 'Back to details' }).click();
  await expect(dialog.getByLabel('Portal password', { exact: true })).toHaveValue(password);
  await expect(dialog.locator('#field-confirmPassword')).toHaveValue(password);
  await expect(dialog.getByRole('img', { name: 'Customer photo' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByText('Saved to your project')).toBeVisible();
  const upload = writes.find((write) => write.path === '/images')!;
  expect(upload.raw).toContain('name="purpose"\r\n\r\nCUSTOMER\r\n');
  expect(upload.raw).toContain(`name="projectId"\r\n\r\n${project.id}\r\n`);
  const created = writes.find((write) => write.path === customerRoot)!;
  expect(created.body).toMatchObject({
    name: 'New Buyer',
    email: 'new@example.invalid',
    phone: '+92 300 7654321',
    identity: '35202-1234567-8',
    photoId: id(20),
    password,
  });
  expect(created.body).not.toHaveProperty('confirmPassword');
});

test('customer portal password requires a strong password, email and matching confirmation', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const dialog = await openCustomer(page);
  await fillCustomer(dialog);
  await dialog.getByLabel('Portal password', { exact: true }).fill('short');
  await dialog.locator('#field-confirmPassword').fill('short');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.locator('#field-password')).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('button', { name: 'Confirm & submit' })).toHaveCount(0);
  await dialog.getByLabel('Portal password', { exact: true }).fill(password);
  await dialog.locator('#field-confirmPassword').fill('');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.getByText('Confirm the portal password.', { exact: true })).toBeVisible();
  await dialog.locator('#field-confirmPassword').fill('Different-Password-123');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.getByText('Passwords do not match.', { exact: true })).toBeVisible();
  await dialog.locator('#field-confirmPassword').fill(password);
  await dialog.getByLabel('Email address').fill('');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(
    dialog.getByText('Enter an email address to enable customer login.', { exact: true }),
  ).toBeVisible();
  await dialog.getByLabel('Email address').fill('invalid');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.locator('#field-email')).toHaveAttribute('aria-invalid', 'true');
  await expect(dialog.getByRole('button', { name: 'Confirm & submit' })).toHaveCount(0);
  await dialog.getByLabel('Email address').fill('new@example.invalid');
  await dialog.getByLabel('Portal password', { exact: true }).fill('');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.getByText('Passwords do not match.', { exact: true })).toBeVisible();
  await expect(dialog.locator('#field-password')).toHaveAttribute('aria-invalid', 'true');
  expect(writes.filter((write) => write.path === customerRoot)).toHaveLength(0);
});

test('customer creation can leave password blank and invite the customer afterwards', async ({
  page,
}) => {
  const { writes } = await setup(page);
  const dialog = await openCustomer(page);
  await fillCustomer(dialog);
  await expect(dialog.getByLabel('Portal password', { exact: true })).toHaveValue('');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByText('Saved to your project')).toBeVisible();
  const created = writes.find((write) => write.path === customerRoot)!;
  expect(created.body).not.toHaveProperty('password');
  expect(created.body).not.toHaveProperty('confirmPassword');
  expect(created.body).not.toHaveProperty('photoId');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'New Buyer', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Customer portal access' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Invite customer' }).click();
  await expect(dialog.getByRole('status')).toHaveText(
    'Invitation queued for email delivery. The customer has 48 hours to activate access.',
  );
  expect(writes.some((write) => write.path === `${customerRoot}/${id(30)}/portal/invite`)).toBe(
    true,
  );
});

test('staff without portal management can create a customer with a photo and no login fields', async ({
  page,
}) => {
  const { writes, requests } = await setup(page, false);
  const dialog = await openCustomer(page);
  await fillCustomer(dialog, '');
  await expect(dialog.locator('#field-password')).toHaveCount(0);
  await expect(dialog.locator('#field-confirmPassword')).toHaveCount(0);
  await dialog.getByLabel('Customer photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Customer photo' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByText('Saved to your project')).toBeVisible();
  const created = writes.find((write) => write.path === customerRoot)!;
  expect(created.body).toMatchObject({ name: 'New Buyer', photoId: id(20) });
  expect(created.body).not.toHaveProperty('password');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'New Buyer', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Customer portal access' })).toHaveCount(0);
  expect(requests.some((path) => path.endsWith('/portal'))).toBe(false);
});

test('editing a customer can upload their photo without exposing password changes', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto(`/customers?record=${id(2)}`);
  await page.getByRole('button', { name: 'Edit customer', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit customer', exact: true });
  await expect(dialog.locator('#field-password')).toHaveCount(0);
  await expect(dialog.locator('#field-confirmPassword')).toHaveCount(0);
  await expect(dialog.getByRole('group', { name: 'Customer portal login' })).toHaveCount(0);
  await dialog.getByLabel('Customer photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Customer photo' })).toBeVisible();
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

test('adding a customer from a booking supports photo and portal login and selects the new record', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/bookings/new');
  await page.getByRole('button', { name: 'Add a new customer' }).click();
  const dialog = page.getByRole('dialog');
  await fillCustomer(dialog);
  await dialog.getByLabel('Customer photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img', { name: 'Customer photo' })).toBeVisible();
  await dialog.getByLabel('Portal password', { exact: true }).fill(password);
  await dialog.locator('#field-confirmPassword').fill(password);
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByLabel('Customer *', { exact: true })).toContainText('New Buyer');
  await page.getByLabel('Customer *', { exact: true }).click();
  await expect(page.locator(`[role="option"][data-value="${id(30)}"]`)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(writes.find((write) => write.path === customerRoot)?.body).toMatchObject({
    photoId: id(20),
    password,
  });
});
