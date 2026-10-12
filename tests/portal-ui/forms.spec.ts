import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { chooseOption } from '../support/select';
const operations = JSON.parse(
  readFileSync(new URL('../../src/generated/operations.json', import.meta.url), 'utf8'),
) as { permission?: string }[];

async function selectRecord(scope: Page | Locator, label: string, value: string) {
  await chooseOption(scope.getByLabel(label, { exact: true }), value);
}
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
async function setup(
  page: Page,
  admin = true,
  options: {
    gallery?: boolean;
    failUploadAt?: number;
    propertyError?: 'unsupported' | 'field';
    bookingChoices?: boolean;
    failRelease?: boolean;
  } = {},
) {
  const writes: Write[] = [],
    requests: string[] = [];
  let image = 20;
  let uploadCount = 0;
  let heldUnitId = '';
  let reservationNumber = 7;
  let releaseAttempts = 0;
  let currentProject = {
    ...project,
    ...(options.gallery ? { photoId: id(60), photoIds: [60, 61, 62, 63, 64].map(id) } : {}),
  };
  let currentUnit = {
    ...unit,
    ...(options.gallery ? { photoId: id(65), photoIds: [65, 66, 67, 68, 69].map(id) } : {}),
  };
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
        body:
          raw && req.headers()['content-type']?.includes('application/json') ? JSON.parse(raw) : {},
      });
    }
    if (
      req.method() === 'POST' &&
      path.endsWith('/units') &&
      options.propertyError &&
      writes.filter((write) => write.path.endsWith('/units')).length === 1
    ) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed.',
            details:
              options.propertyError === 'unsupported'
                ? [{ path: [], message: 'Unrecognized key: "photoIds"' }]
                : [
                    {
                      path: ['number'],
                      message: 'That property number is already in use. Choose a different number.',
                    },
                  ],
          },
          meta: { requestId: 'f567a61c-0546-43f7-8711-17cbc026ea76' },
        }),
      });
      return;
    }
    if (path === '/auth/refresh') data = { accessToken: 'fixture-token' };
    else if (path === '/auth/me')
      data = {
        id: id(9),
        name: 'Test Admin',
        email: 'admin@example.invalid',
        accountType: 'STAFF',
        permissions: [...new Set(operations.map((o) => o.permission).filter(Boolean))].filter(
          (permission) => admin || permission !== 'settings.manage',
        ),
        projects: [{ projectId: project.id }],
      };
    else if (path === '/images' && isWrite) {
      uploadCount++;
      if (uploadCount === options.failUploadAt) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'UPLOAD_FAILED', message: 'Storage unavailable' },
          }),
        });
        return;
      }
      data = { id: id(image++), name: 'proof.png', mime: 'image/png', size: png.length };
    } else if (path.startsWith('/images/'))
      data = {
        url: 'data:image/png;base64,' + png.toString('base64'),
        expiresIn: 120,
        name: 'proof.png',
      };
    else if (path === '/projects')
      data = isWrite ? { id: id(90), ...writes.at(-1)?.body } : list([currentProject]);
    else if (path === '/projects/' + project.id) {
      if (isWrite) {
        const body = writes.at(-1)!.body;
        currentProject = {
          ...currentProject,
          ...body,
          ...(Array.isArray(body.photoIds) ? { photoId: body.photoIds[0] ?? null } : {}),
        };
      }
      data = currentProject;
    } else if (path === '/users')
      data = isWrite ? { id: id(91), ...writes.at(-1)?.body } : list([]);
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
      data = isWrite
        ? { id: id(30), ...writes.at(-1)?.body }
        : list([
            customer,
            ...(options.bookingChoices
              ? [{ ...customer, id: id(12), name: 'Second Buyer', reference: 'CUST-002' }]
              : []),
          ]);
    else if (path.endsWith('/units'))
      data = isWrite
        ? { id: id(31), ...writes.at(-1)?.body }
        : list(
            [
              currentUnit,
              ...(options.bookingChoices ? [{ ...unit, id: id(11), number: 'A-105' }] : []),
            ].filter(
              (item) =>
                new URL(req.url()).searchParams.get('status') !== 'AVAILABLE' ||
                item.id !== heldUnitId,
            ),
          );
    else if (path === '/projects/' + project.id + '/units/' + unit.id) {
      if (isWrite) {
        const body = writes.at(-1)!.body;
        currentUnit = {
          ...currentUnit,
          ...body,
          ...(Array.isArray(body.photoIds) ? { photoId: body.photoIds[0] ?? null } : {}),
        };
      }
      data = currentUnit;
    } else if (path.endsWith('/payment-plans')) data = list([plan]);
    else if (path.endsWith('/bookings'))
      data = isWrite
        ? { booking: { id: id(32), reference: 'BK-002' }, approval: { id: id(33) } }
        : list([{ id: id(7), reference: 'BK-001', total: '1000000', status: 'CONFIRMED' }]);
    else if (path.endsWith('/reservations')) {
      heldUnitId = String(writes.at(-1)?.body.unitId);
      data = { id: id(++reservationNumber), status: 'ACTIVE', expiresAt: '2030-01-01T00:00:00Z' };
    } else if (path.endsWith('/release')) {
      heldUnitId = '';
      if (options.failRelease && ++releaseAttempts === 1) {
        await route.abort('failed');
        return;
      }
      data = { cancelled: true };
    } else if (path.endsWith('/accounts'))
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
  await chooseOption(dialog.getByLabel('Property type', { exact: false }).first(), 'OTHER');
  await dialog.getByLabel('Other property type').fill('Warehouse');
  await dialog.getByLabel('Property area').fill('1200');
  await chooseOption(dialog.getByLabel('Area unit'), 'sq ft');
  await dialog.getByLabel('Property price').fill('5000000');
  await expect(dialog.getByText(/Extra property fees, such as development/)).toBeVisible();
  await dialog.getByLabel('Property photos', { exact: true }).setInputFiles(photo);
  await expect(dialog.getByRole('img')).toHaveCount(1);
  await chooseOption(dialog.getByLabel('Choose a feature'), 'OTHER');
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
    photoIds: [id(20)],
    featureImages: [{ feature: 'Loading bay', imageId: id(21) }],
  });
  expect(nativeDialogs).toBe(0);
});
for (const propertyError of ['unsupported', 'field'] as const) {
  test(`property ${propertyError} validation explains the problem and keeps the draft photos when returning to details`, async ({
    page,
  }) => {
    const { writes } = await setup(page, true, { propertyError });
    await page.goto('/inventory');
    await page.getByRole('button', { name: 'Add property', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Property number').fill('S104');
    await chooseOption(
      dialog.getByLabel('Property type', { exact: false }).first(),
      'RESIDENTIAL_PLOT',
    );
    await dialog.getByLabel('Property area').fill('5');
    await chooseOption(dialog.getByLabel('Area unit'), 'marla');
    await dialog.getByLabel('Property price').fill('3500000');
    await dialog.getByLabel('Property photos', { exact: true }).setInputFiles(photo);
    await expect(dialog.getByRole('img')).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Review changes' }).click();
    await expect(dialog.getByText('Photo ids', { exact: true })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
    const alert = dialog.getByRole('alert');
    await expect(alert).toContainText(
      propertyError === 'unsupported'
        ? 'The running backend does not support multiple photos yet.'
        : 'Property number: That property number is already in use. Choose a different number.',
    );
    await expect(alert).not.toContainText('f567a61c');
    await expect(alert).not.toContainText('Request validation failed.');
    await page.screenshot({ path: `test-results/portal/property-${propertyError}-error.png` });
    await dialog.getByRole('button', { name: 'Back to details' }).click();
    await expect(dialog.getByLabel('Property number')).toHaveValue('S104');
    await expect(dialog.getByRole('img')).toHaveCount(1);
    if (propertyError === 'field') {
      await expect(dialog.getByLabel('Property number')).toHaveAttribute('aria-invalid', 'true');
      await expect(
        dialog.getByText('That property number is already in use. Choose a different number.', {
          exact: true,
        }),
      ).toBeVisible();
      await dialog.getByLabel('Property number').fill('S105');
      await dialog.getByRole('button', { name: 'Review changes' }).click();
      await expect(dialog.getByRole('alert')).toHaveCount(0);
      await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
      await expect(dialog.getByText('Saved to your project')).toBeVisible();
      expect(writes.filter((write) => write.path.endsWith('/units')).at(-1)?.body).toMatchObject({
        number: 'S105',
        photoIds: [id(20)],
      });
    }
  });
}

test('non-cash payment requires proof and Other requires a description; cash does not require proof', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/collections');
  await page.getByRole('button', { name: 'Add payment', exact: true }).click();
  const d = page.getByRole('dialog');
  await selectRecord(d, 'Booking *', id(7));
  await d.getByLabel('Payment amount').fill('50000');
  await chooseOption(d.getByLabel('Payment method *', { exact: true }), 'OTHER');
  await d.getByLabel('Payment date and time').fill('2025-01-02T10:00');
  await selectRecord(d, 'Account receiving the payment *', id(10));
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
  await selectRecord(d, 'Booking *', id(7));
  await d.getByLabel('Payment amount').fill('500');
  await chooseOption(d.getByLabel('Payment method *', { exact: true }), 'CASH');
  await d.getByLabel('Payment date and time').fill('2025-01-02T10:00');
  await selectRecord(d, 'Account receiving the payment *', id(10));
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
  await selectRecord(d, 'Roles and responsibilities 1', id(6));
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
  await expect(d.getByLabel('Project photos', { exact: true })).toBeVisible();
  await expect(d.getByText('Photo *', { exact: true })).toHaveCount(0);
});
test('booking Back releases the hold and allows changing both customer and property before submission', async ({
  page,
}) => {
  const { writes } = await setup(page, true, { bookingChoices: true });
  await page.goto('/bookings/new');
  await selectRecord(page, 'Customer *', customer.id);
  await selectRecord(page, 'Property *', unit.id);
  await page.getByRole('button', { name: 'Hold property & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Choose payment schedule' })).toBeVisible();
  await page.getByLabel('Discount amount').fill('100');
  await page.getByRole('button', { name: 'Add joint owners' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose customer & property' })).toBeVisible();
  await expect(page.getByLabel('Customer *', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Property *', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Customer *', { exact: true })).toContainText('Ahmed Buyer');
  await expect(page.getByLabel('Property *', { exact: true })).toContainText('A-104');
  await selectRecord(page, 'Customer *', id(12));
  await selectRecord(page, 'Property *', id(11));
  await page.getByRole('button', { name: 'Hold property & continue' }).click();
  await expect(page.getByLabel('Discount amount')).toHaveValue('0');
  await expect(page.getByLabel('Owner 1', { exact: true })).toHaveCount(0);
  await selectRecord(page, 'Payment schedule *', id(5));
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review & submit' })).toBeVisible();
  await expect(page.locator('.wizard-body')).toContainText('Second Buyer');
  await expect(page.locator('.wizard-body')).toContainText('A-105');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit booking for approval' }).click();
  await expect(page.getByRole('heading', { name: 'Booking created' })).toBeVisible();
  expect(
    writes.filter((write) => write.path.endsWith('/reservations')).map((write) => write.body),
  ).toEqual([
    { customerId: id(2), unitId: id(3) },
    { customerId: id(12), unitId: id(11) },
  ]);
  expect(writes.find((write) => write.path.endsWith('/release'))?.path).toBe(
    `/projects/${project.id}/reservations/${id(8)}/release`,
  );
  expect(writes.find((write) => write.path.endsWith('/bookings'))?.body).toMatchObject({
    reservationId: id(9),
    discount: '0',
  });
});

test('an uncertain hold release can be retried before editing the booking', async ({ page }) => {
  const { writes } = await setup(page, true, { bookingChoices: true, failRelease: true });
  await page.goto('/bookings/new');
  await selectRecord(page, 'Customer *', customer.id);
  await selectRecord(page, 'Property *', unit.id);
  await page.getByRole('button', { name: 'Hold property & continue' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose payment schedule' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry releasing property' }).click();
  await expect(page.getByRole('heading', { name: 'Choose customer & property' })).toBeVisible();
  await expect(page.getByLabel('Property *', { exact: true })).toBeEnabled();
  expect(writes.filter((write) => write.path.endsWith('/release'))).toHaveLength(2);
});

test('booking reserves automatically and reaches submission in three steps', async ({ page }) => {
  const { writes, requests } = await setup(page);
  await page.goto('/bookings/new');
  await selectRecord(page, 'Customer *', customer.id);
  await selectRecord(page, 'Property *', unit.id);
  await expect(page.getByRole('button', { name: 'Add a new customer' })).toBeVisible();
  await page.getByRole('button', { name: 'Hold property & continue' }).click();
  await expect(page.getByRole('heading', { name: 'Choose payment schedule' })).toBeVisible();
  await selectRecord(page, 'Payment schedule *', id(5));
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
test('project codes follow the name, keep manual edits, and currency and timezone submit dropdown values', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.language-selector')).toHaveCount(0);
  await dialog.getByLabel('Name', { exact: false }).first().fill('Garden Homes');
  await expect(dialog.getByLabel('Project code')).toHaveValue('GARDEN-HOMES');
  await dialog.getByLabel('Name', { exact: false }).first().fill('Garden Homes Phase Two');
  await expect(dialog.getByLabel('Project code')).toHaveValue('GARDEN-HOMES-PHASE-T');
  await dialog.getByLabel('Project code').fill('GH-02');
  await dialog.getByLabel('Name', { exact: false }).first().fill('Garden Homes Phase Three');
  await expect(dialog.getByLabel('Project code')).toHaveValue('GH-02');
  await chooseOption(dialog.getByLabel('Currency'), 'AED');
  await chooseOption(dialog.getByLabel('Timezone'), 'Asia/Dubai');
  await page.screenshot({ path: 'test-results/portal/project-settings-form.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  expect(writes.find((write) => write.path === '/projects')?.body).toMatchObject({
    name: 'Garden Homes Phase Three',
    code: 'GH-02',
    currency: 'AED',
    timezone: 'Asia/Dubai',
  });
});

test('static choices search currencies and timezones inside their dropdowns', async ({ page }) => {
  await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel('Currency').click();
  const search = d.locator('.select-popover input');
  await search.fill('unmatched-currency');
  await expect(d.getByText('No matching records')).toBeVisible();
  await search.fill('AED');
  await expect(d.getByRole('option')).toHaveCount(1);
  await search.press('Enter');
  await expect(d.getByLabel('Currency')).toContainText('AED');
  await d.getByLabel('Timezone').click();
  await d.locator('.select-popover input').fill('Dubai');
  await expect(d.getByRole('option')).toHaveCount(1);
  await d.locator('.select-popover input').press('Enter');
  await expect(d.getByLabel('Timezone')).toContainText('Asia/Dubai');
  await d.getByLabel('Currency').click();
  await expect(d.getByRole('option', { name: /AED/ })).toHaveAttribute('aria-selected', 'true');
  await d.locator('.select-popover input').press('Escape');
  await expect(d).toBeVisible();
});

test('filters, the project switcher, report types and chart periods use searchable choices', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/inventory');
  await page.getByLabel('Filter by status').click();
  await page.locator('.select-popover input').fill('blocked');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.locator('.select-popover input').press('Enter');
  await expect(page).toHaveURL(/status=BLOCKED/);
  await chooseOption(page.getByLabel('Filter by status'), '');
  await chooseOption(page.getByLabel('Sort order'), 'asc');
  await expect(page).toHaveURL(/sort=asc/);
  await page.getByRole('combobox', { name: 'Switch project', exact: true }).click();
  await page.locator('.select-popover input').fill('Garden');
  await expect(page.getByRole('option', { name: /Garden Homes/ })).toBeVisible();
  await page.getByRole('option', { name: /Garden Homes/ }).click();
  await expect(page.getByRole('combobox', { name: 'Switch project', exact: true })).toContainText(
    'Garden Homes',
  );
  await page.goto('/reports');
  await page.getByLabel('Report', { exact: true }).click();
  await page.locator('.select-popover input').fill('ledger');
  await expect(page.getByText('Financial statements', { exact: true })).toBeVisible();
  await page.locator('[role=option][data-value=ledger]').click();
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/kind=ledger/);
  await page.goto('/dashboard');
  await chooseOption(page.getByLabel('Collection chart period'), '90');
  await expect(page.getByLabel('Collection chart period')).toContainText('Last 90 days');
  await expect(page.locator('select')).toHaveCount(0);
});

test('language is available only in the admin navbar and settings and stays in sync', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/settings');
  await expect(page.locator('.language-selector')).toHaveCount(2);
  await chooseOption(page.locator('.language-settings button[role=combobox]'), 'ar');
  await expect(page.locator('.topbar .language-selector button[role=combobox]')).toContainText(
    'العربية',
  );
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('.language-settings button[role=combobox]')).toContainText('العربية');
  await page.screenshot({ path: 'test-results/portal/admin-settings-arabic.png', fullPage: true });
});

test('staff without administration access has no language picker', async ({ page }) => {
  await setup(page, false);
  await page.goto('/customers');
  await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible();
  await expect(page.locator('.language-selector')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add customer', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.language-selector')).toHaveCount(0);
});

test('photo drop area uploads files, rejects unsupported files, and removes the selected photo', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Drop your images here, or')).toBeVisible();
  await dialog.getByLabel('Project photos', { exact: true }).setInputFiles({
    name: 'unsafe.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  });
  await expect(dialog.getByText(/Choose a JPEG, PNG or WebP image up to 5 MiB\./)).toBeVisible();
  expect(writes.filter((write) => write.path === '/images')).toHaveLength(0);
  const transfer = await page.evaluateHandle(
    (bytes) => {
      const data = new DataTransfer();
      data.items.add(new File([new Uint8Array(bytes)], 'dropped.png', { type: 'image/png' }));
      return data;
    },
    [...png],
  );
  await dialog.locator('.image-upload').dispatchEvent('drop', { dataTransfer: transfer });
  await expect(dialog.locator('.gallery-photo')).toHaveCount(1);
  await expect(dialog.getByRole('img', { name: 'Project photos 1', exact: true })).toBeVisible();
  expect(writes.filter((write) => write.path === '/images')).toHaveLength(1);
  await page.screenshot({ path: 'test-results/portal/photo-dropzone.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Remove photo 1', exact: true }).click();
  await expect(dialog.locator('.gallery-photo')).toHaveCount(0);
  await expect(dialog.getByRole('img')).toHaveCount(0);
  await transfer.dispose();
});

test('project gallery accepts five photos, rejects excessive and duplicate batches, and replaces photos at the limit', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const d = page.getByRole('dialog');
  const picker = d.getByLabel('Project photos', { exact: true });
  const photos = [1, 2, 3, 4, 5, 6].map((n) => ({ ...photo, name: `photo-${n}.png` }));
  await picker.setInputFiles(photos);
  await expect(
    d.getByText('Choose up to five photos. Remove a photo before adding more.'),
  ).toBeVisible();
  expect(writes.filter((w) => w.path === '/images')).toHaveLength(0);
  const transfer = await page.evaluateHandle(
    (bytes) => {
      const data = new DataTransfer(),
        file = new File([new Uint8Array(bytes)], 'duplicate.png', { type: 'image/png' });
      data.items.add(file);
      data.items.add(file);
      return data;
    },
    [...png],
  );
  await d.locator('.image-upload').dispatchEvent('drop', { dataTransfer: transfer });
  await expect(d.getByText(/This photo is already selected/)).toBeVisible();
  expect(writes.filter((w) => w.path === '/images')).toHaveLength(0);
  await transfer.dispose();
  await picker.setInputFiles(photos.slice(0, 5));
  await expect(d.locator('.gallery-photo')).toHaveCount(5);
  await expect(picker).toBeDisabled();
  await expect(d.getByRole('button', { name: 'Review changes' })).toBeEnabled();
  await d.getByRole('button', { name: 'Remove photo 2', exact: true }).click();
  await expect(picker).toBeEnabled();
  await picker.setInputFiles(photos[5]!);
  await expect(d.locator('.gallery-photo')).toHaveCount(5);
  await d.getByRole('button', { name: 'Make cover', exact: true }).last().click();
  await d.getByLabel('Name', { exact: false }).first().fill('Five-photo project');
  await page.screenshot({ path: 'test-results/portal/five-photo-project.png', fullPage: true });
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(d.getByText('Saved to your project')).toBeVisible();
  expect(writes.find((w) => w.path === '/projects')?.body.photoIds).toEqual([
    id(25),
    id(20),
    id(22),
    id(23),
    id(24),
  ]);
});

test('gallery keeps successful uploads after a partial failure and allows retrying the failed photo', async ({
  page,
}) => {
  const { writes } = await setup(page, true, { failUploadAt: 2 });
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const d = page.getByRole('dialog'),
    picker = d.getByLabel('Project photos', { exact: true });
  const files = [1, 2, 3].map((n) => ({ ...photo, name: `upload-${n}.png` }));
  await picker.setInputFiles(files);
  await expect(d.getByText(/upload-2.png: Storage unavailable/)).toBeVisible();
  await expect(d.locator('.gallery-photo')).toHaveCount(2);
  await expect(picker).toBeEnabled();
  await picker.setInputFiles(files[1]!);
  await expect(d.locator('.gallery-photo')).toHaveCount(3);
  await d.getByLabel('Name', { exact: false }).first().fill('Retry project');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(d.getByText('Saved to your project')).toBeVisible();
  expect(writes.find((w) => w.path === '/projects')?.body.photoIds).toEqual([
    id(20),
    id(21),
    id(22),
  ]);
});

for (const resource of ['project', 'property'] as const)
  test(`editing a ${resource} preserves its gallery, supports replacement, and can remove every photo`, async ({
    page,
  }) => {
    const { writes } = await setup(page, true, { gallery: true });
    await page.goto(resource === 'project' ? '/projects' : '/inventory');
    const title = resource === 'project' ? project.name : unit.number;
    await page
      .locator('.table-container')
      .getByRole('button', { name: title, exact: true })
      .click();
    let detail = page.getByRole('dialog');
    await expect(detail.locator('.record-gallery img')).toHaveCount(5);
    await detail.getByRole('button', { name: `Edit ${resource}`, exact: true }).click();
    let edit = page.getByRole('dialog', { name: `Edit ${resource}`, exact: true });
    await expect(edit.locator('.gallery-photo')).toHaveCount(5);
    const picker = edit.getByLabel(resource === 'project' ? 'Project photos' : 'Property photos', {
      exact: true,
    });
    await expect(picker).toBeDisabled();
    await edit.getByRole('button', { name: 'Remove photo 1', exact: true }).click();
    await picker.setInputFiles({ ...photo, name: 'replacement.png' });
    await expect(edit.locator('.gallery-photo')).toHaveCount(5);
    await edit.getByRole('button', { name: 'Review changes' }).click();
    await edit.getByRole('button', { name: 'Confirm & submit' }).click();
    edit = page.getByRole('dialog', { name: 'Request completed', exact: true });
    await expect(edit.getByText('Saved to your project')).toBeVisible();
    const path = '/projects/' + project.id + (resource === 'property' ? '/units/' + unit.id : '');
    const firstId = resource === 'project' ? 60 : 65;
    const upload = writes.find((w) => w.path === '/images')!;
    expect(upload.raw).toContain(
      `name="purpose"\r\n\r\n${resource === 'property' ? 'UNIT' : 'PROJECT'}\r\n`,
    );
    if (resource === 'property')
      expect(upload.raw).toContain(`name="projectId"\r\n\r\n${project.id}\r\n`);
    expect(writes.find((w) => w.path === path)?.body.photoIds).toEqual(
      [firstId + 1, firstId + 2, firstId + 3, firstId + 4, 20].map(id),
    );
    await edit.getByRole('button', { name: 'Done', exact: true }).click();
    detail = page.getByRole('dialog');
    await detail.getByRole('button', { name: 'Close dialog' }).click();
    await page
      .locator('.table-container')
      .getByRole('button', { name: title, exact: true })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Edit ${resource}`, exact: true })
      .click();
    edit = page.getByRole('dialog', { name: `Edit ${resource}`, exact: true });
    for (let i = 0; i < 5; i++)
      await edit.getByRole('button', { name: 'Remove photo 1', exact: true }).click();
    await edit.getByRole('button', { name: 'Review changes' }).click();
    await edit.getByRole('button', { name: 'Confirm & submit' }).click();
    edit = page.getByRole('dialog', { name: 'Request completed', exact: true });
    await expect(edit.getByText('Saved to your project')).toBeVisible();
    expect(writes.filter((w) => w.path === path).at(-1)?.body.photoIds).toEqual([]);
  });

for (const width of [1280, 390])
  test(`relation search at ${width}px opens inside the dropdown and supports Escape, keyboard selection and clearing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 911 });
    const { requests } = await setup(page);
    await page.goto('/collections');
    await page.getByRole('button', { name: 'Add payment', exact: true }).click();
    const d = page.getByRole('dialog');
    await expect(d.locator('.relation-field input[type=search]')).toHaveCount(0);
    const booking = d.getByLabel('Booking *', { exact: true });
    await booking.click();
    const search = d.locator('.select-popover input[type=search]');
    await expect(search).toBeFocused();
    await search.fill('BK-001');
    await expect(d.getByRole('option', { name: /BK-001/ })).toBeVisible();
    expect(requests.some((url) => url.includes('search=BK-001'))).toBe(true);
    await page.screenshot({
      path: `test-results/portal/searchable-booking-dropdown-${width}.png`,
      fullPage: true,
    });
    await search.press('Escape');
    await expect(d).toBeVisible();
    await expect(booking).toBeFocused();
    await expect(d.locator('.select-popover')).toHaveCount(0);
    await booking.press('ArrowDown');
    await expect(d.getByRole('option', { name: /BK-001/ })).toBeVisible();
    await d.locator('.select-popover input').press('Enter');
    await expect(booking).toContainText('BK-001');
    await booking.click();
    await d.getByRole('button', { name: 'Clear selection', exact: true }).click();
    await expect(booking).toContainText('Select a record');
    await d.getByLabel('Account receiving the payment *', { exact: true }).click();
    await expect(d.getByRole('option', { name: 'Bank', exact: true })).toBeVisible();
    const bounds = await d.locator('.select-popover').boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(911);
    await d.locator('.select-popover input').press('Escape');
    await expect(d).toBeVisible();
  });

for (const width of [847, 390])
  test(`project rows and discard confirmation fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 911 });
    await setup(page, true, { gallery: true });
    await page.goto('/projects');
    if (width === 847) {
      await page.getByRole('button', { name: 'Toggle color theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }
    const thumbnail = page.locator('.resource-thumbnail img');
    await expect(thumbnail).toBeVisible();
    const size = await thumbnail.boundingBox();
    expect(size?.width).toBe(52);
    expect(size?.height).toBe(42);
    const rowSize = await page.locator('tbody tr').boundingBox();
    expect(rowSize!.height).toBeLessThan(80);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/portal/projects-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Add project', exact: true }).click();
    const form = page.getByRole('dialog');
    await form.getByLabel('Name', { exact: false }).first().fill('Unsaved');
    await form.getByRole('button', { name: 'Close dialog' }).click();
    const confirmation = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    await expect(confirmation).toBeVisible();
    expect((await confirmation.boundingBox())!.height).toBeLessThan(width < 520 ? 310 : 240);
    await expect(confirmation.locator('.modal-body, .form-footer')).toHaveCount(0);
    await page.screenshot({ path: `test-results/portal/discard-${width}.png`, fullPage: true });
    await confirmation.getByRole('button', { name: 'Keep editing' }).click();
    await expect(form.getByLabel('Name', { exact: false }).first()).toHaveValue('Unsaved');
  });

for (const language of ['ur', 'ar'] as const)
  test(`${language} translates forms from the navbar, persists selection and fits mobile`, async ({
    page,
  }) => {
    await setup(page);
    await page.goto('/inventory');
    await chooseOption(page.locator('.topbar .language-selector button[role=combobox]'), language);
    await page
      .getByRole('button', {
        name: language === 'ur' ? 'جائیداد شامل کریں' : 'إضافة عقار',
        exact: true,
      })
      .click();
    const d = page.getByRole('dialog');
    await expect(d.locator('.language-selector')).toHaveCount(0);
    await d.getByLabel(language === 'ur' ? 'جائیداد کا نمبر' : 'رقم العقار').fill('Draft-101');
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
