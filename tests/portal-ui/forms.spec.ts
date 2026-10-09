import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
const customer = { id: id(2), name: 'Ahmed Buyer', reference: 'CUST-001', phone: '03001234567' };
const unit = {
  id: id(3),
  number: 'A-104',
  type: 'RESIDENTIAL_PLOT',
  status: 'AVAILABLE',
  size: '5',
  measurementUnit: 'marla',
  price: '1000000',
  charges: '10000',
};
const plan = {
  id: id(4),
  name: '12-month plan',
  versions: [
    {
      id: id(5),
      version: 1,
      schedule: [{ label: 'Full payment', percent: '100', days: 0, months: 0 }],
    },
  ],
};
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1cAAAAASUVORK5CYII=',
  'base64',
);
const photo = { name: 'proof.png', mimeType: 'image/png', buffer: png };
const list = (items: unknown[]) => ({
  items,
  pagination: { page: 1, limit: 25, total: items.length, totalPages: 1 },
});
type Write = { path: string; body: Record<string, unknown>; raw: string };
async function setup(page: Page) {
  const writes: Write[] = [],
    requests: string[] = [];
  let image = 20;
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname.replace('/api/v1', '');
    requests.push(req.url());
    let data: unknown;
    const isWrite = req.method() !== 'GET';
    if (isWrite && path !== '/auth/refresh') {
      const raw = req.postData() ?? '';
      writes.push({
        path,
        raw,
        body: req.headers()['content-type']?.includes('application/json') ? JSON.parse(raw) : {},
      });
    }
    if (path === '/auth/refresh') data = { accessToken: 'fixture-token' };
    else if (path === '/auth/me')
      data = {
        id: id(9),
        name: 'Test Admin',
        email: 'admin@example.invalid',
        accountType: 'STAFF',
        permissions: [...new Set(operations.map((o) => o.permission).filter(Boolean))],
        projects: [{ projectId: project.id }],
      };
    else if (path === '/images' && isWrite)
      data = { id: id(image++), name: 'proof.png', mime: 'image/png', size: png.length };
    else if (path.startsWith('/images/'))
      data = {
        url: 'data:image/png;base64,' + png.toString('base64'),
        expiresIn: 120,
        name: 'proof.png',
      };
    else if (path === '/projects')
      data = isWrite ? { id: id(90), ...writes.at(-1)?.body } : list([project]);
    else if (path === '/users') data = isWrite ? { id: id(91), ...writes.at(-1)?.body } : list([]);
    else if (path === '/roles')
      data = {
        roles: [
          {
            id: id(6),
            name: 'Sales Executive',
            permissions: [
              { permissionKey: 'customers.create' },
              { permissionKey: 'bookings.create' },
            ],
          },
        ],
        permissions: [],
      };
    else if (path === '/notifications') data = list([]);
    else if (path === '/compatibility')
      data = { apiVersion: 'v1', minimumClientVersion: '1.0.0', platforms: ['web'] };
    else if (path.endsWith('/customers'))
      data = isWrite ? { id: id(30), ...writes.at(-1)?.body } : list([customer]);
    else if (path.endsWith('/units'))
      data = isWrite ? { id: id(31), ...writes.at(-1)?.body } : list([unit]);
    else if (path.endsWith('/payment-plans')) data = list([plan]);
    else if (path.endsWith('/bookings'))
      data = isWrite
        ? { booking: { id: id(32), reference: 'BK-002' }, approval: { id: id(33) } }
        : list([{ id: id(7), reference: 'BK-001', total: '1000000', status: 'CONFIRMED' }]);
    else if (path.endsWith('/reservations'))
      data = { id: id(8), status: 'ACTIVE', expiresAt: '2030-01-01T00:00:00Z' };
    else if (path.endsWith('/accounts'))
      data = list([{ id: id(10), name: 'Bank', code: 'BANK', type: 'ASSET' }]);
    else if (path.endsWith('/documents'))
      data = isWrite ? { id: id(34), name: 'Agreement A-104.png' } : list([]);
    else if (path.endsWith('/dealers') || path.endsWith('/payments') || path.endsWith('/leads'))
      data = isWrite ? { id: id(35), ...writes.at(-1)?.body } : list([]);
    else data = list([]);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });
  });
  return { writes, requests };
}
test('property form supports custom types, area choices, feature pictures and a library discard dialog', async ({
  page,
}) => {
  const { writes } = await setup(page);
  let nativeDialogs = 0;
  page.on('dialog', (dialog) => {
    nativeDialogs++;
    void dialog.dismiss();
  });
  await page.goto('/inventory');
  await page.getByRole('button', { name: 'Add property', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Property number').fill('W-105');
  await dialog.getByLabel('Property type', { exact: false }).first().selectOption('OTHER');
  await dialog.getByLabel('Other property type').fill('Warehouse');
  await dialog.getByLabel('Property area').fill('1200');
  await dialog.getByLabel('Area unit').selectOption('sq ft');
  await dialog.getByLabel('Property price').fill('5000000');
  await expect(dialog.getByText(/Extra property fees, such as development/)).toBeVisible();
  await dialog.getByLabel('Photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img')).toHaveCount(1);
  await dialog.getByLabel('Choose a feature').selectOption('OTHER');
  await dialog.getByLabel('Other feature').fill('Loading bay');
  await dialog.getByRole('button', { name: 'Add feature', exact: true }).click();
  await dialog.getByLabel('Feature photo', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img')).toHaveCount(2);
  await page.screenshot({ path: 'test-results/portal/english-property-form.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Keep editing' }).click();
  await expect(dialog.getByLabel('Property number')).toHaveValue('W-105');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByText('Saved to your project')).toBeVisible();
  const body = writes.find((w) => w.path.endsWith('/units'))!.body;
  expect(body).toMatchObject({
    number: 'W-105',
    type: 'OTHER',
    typeDetails: 'Warehouse',
    measurementUnit: 'sq ft',
    photoId: id(20),
    featureImages: [{ feature: 'Loading bay', imageId: id(21) }],
  });
  expect(nativeDialogs).toBe(0);
});
test('non-cash payment requires proof and Other requires a description; cash does not require proof', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/collections');
  await page.getByRole('button', { name: 'Add payment', exact: true }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel('Booking *', { exact: true }).selectOption(id(7));
  await d.getByLabel('Payment amount').fill('50000');
  await d.getByLabel('Payment method *', { exact: true }).selectOption('OTHER');
  await d.getByLabel('Payment date and time').fill('2025-01-02T10:00');
  await d.getByLabel('Account receiving the payment *', { exact: true }).selectOption(id(10));
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByText('Describe how this payment was made.')).toBeVisible();
  await d.getByLabel('Other payment method').fill('Mobile wallet');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByText('Upload a payment proof image for non-cash payments.')).toBeVisible();
  expect(writes.filter((w) => w.path.endsWith('/payments'))).toHaveLength(0);
  await d.getByLabel('Payment proof image', { exact: true }).setInputFiles(photo);
  await expect(d.getByRole('img')).toBeVisible();
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  expect(writes.find((w) => w.path.endsWith('/payments'))?.body).toMatchObject({
    method: 'OTHER',
    methodDetails: 'Mobile wallet',
    proofImageId: id(20),
  });
  await d.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Add payment', exact: true }).click();
  await d.getByLabel('Booking *', { exact: true }).selectOption(id(7));
  await d.getByLabel('Payment amount').fill('500');
  await d.getByLabel('Payment method *', { exact: true }).selectOption('CASH');
  await d.getByLabel('Payment date and time').fill('2025-01-02T10:00');
  await d.getByLabel('Account receiving the payment *', { exact: true }).selectOption(id(10));
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByRole('button', { name: 'Confirm & submit' })).toBeVisible();
});
test('staff and dealer photos are required, roles explain permissions, and project pictures are optional', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/users');
  await page.getByRole('button', { name: 'Add team member' }).click();
  const d = page.getByRole('dialog');
  await expect(d.getByText('Photo *', { exact: true })).toBeVisible();
  await d.getByRole('button', { name: 'Add Roles and responsibilities' }).click();
  await d.getByLabel('Roles and responsibilities 1', { exact: true }).selectOption(id(6));
  await expect(
    d.getByText('Follows up leads, adds customers, reserves properties and prepares bookings.'),
  ).toBeVisible();
  await d.getByText('View current permissions').click();
  await expect(d.getByText('customers — create', { exact: true })).toBeVisible();
  await d.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await page.goto('/dealers');
  await page.getByRole('button', { name: 'Add dealer', exact: true }).click();
  await expect(d.getByText('Photo *', { exact: true })).toBeVisible();
  await d.getByRole('button', { name: 'Close dialog' }).click();
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  await expect(d.getByText('Photo', { exact: true })).toBeVisible();
  await expect(d.getByText('Photo *', { exact: true })).toHaveCount(0);
});
test('booking reserves automatically and reaches submission in three steps', async ({ page }) => {
  const { writes, requests } = await setup(page);
  await page.goto('/bookings/new');
  await page.getByLabel('Customer *', { exact: true }).selectOption(customer.id);
  await page.getByLabel('Property *', { exact: true }).selectOption(unit.id);
  await expect(page.getByRole('button', { name: 'Add a new customer' })).toBeVisible();
  await page.getByRole('button', { name: 'Hold property & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Choose payment schedule' })).toBeVisible();
  await page.getByLabel('Payment schedule *', { exact: true }).selectOption(id(5));
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review & submit' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit booking for approval' }).click();
  await expect(page.getByRole('heading', { name: 'Booking created' })).toBeVisible();
  expect(writes.filter((w) => w.path.endsWith('/reservations'))).toHaveLength(1);
  expect(writes.find((w) => w.path.endsWith('/bookings'))?.body).toMatchObject({
    reservationId: id(8),
    planVersionId: id(5),
  });
  expect(requests.some((url) => url.includes('/units?') && url.includes('status=AVAILABLE'))).toBe(
    true,
  );
});
test('document uploads send a chosen display and download name', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload document', exact: true }).first().click();
  const d = page.getByRole('dialog');
  await d.locator('input[type=file]').setInputFiles(photo);
  await d.getByLabel('Document name *').fill('Agreement A-104');
  await d.getByRole('button', { name: 'Upload document', exact: true }).click();
  await expect(d).toHaveCount(0);
  const doc = writes.find((w) => w.path.endsWith('/documents'))!;
  expect(doc.raw).toContain('name="name"');
  expect(doc.raw).toContain('Agreement A-104');
});
for (const language of ['ur', 'ar'] as const)
  test(`${language} translates forms, preserves drafts, persists selection and fits mobile`, async ({
    page,
  }) => {
    await setup(page);
    await page.goto('/inventory');
    await page.getByRole('button', { name: 'Add property', exact: true }).click();
    const d = page.getByRole('dialog');
    await d.getByLabel('Property number').fill('Draft-101');
    await d.getByLabel('Language / زبان / اللغة').selectOption(language);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(
      d.getByRole('heading', {
        name: language === 'ur' ? 'جائیداد شامل کریں' : 'إضافة عقار',
        exact: true,
      }),
    ).toBeVisible();
    await expect(d.getByLabel(language === 'ur' ? 'جائیداد کا نمبر' : 'رقم العقار')).toHaveValue(
      'Draft-101',
    );
    await expect(d.getByLabel(language === 'ur' ? 'رقبے کی اکائی' : 'وحدة المساحة')).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/${language}-property-form.png`,
      fullPage: true,
    });
    await d
      .getByRole('button', { name: language === 'ur' ? 'ونڈو بند کریں' : 'إغلاق النافذة' })
      .click();
    await page
      .getByRole('button', {
        name: language === 'ur' ? 'تبدیلیاں چھوڑ دیں' : 'تجاهل التغييرات',
        exact: true,
      })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(
      page.getByRole('heading', {
        name: language === 'ur' ? 'جائیدادیں' : 'العقارات',
        exact: true,
      }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/portal/${language}-mobile.png`, fullPage: true });
  });
