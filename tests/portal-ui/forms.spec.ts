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
  location: 'Lahore',
  downPaymentPercent: '20',
  ndcValidityDays: 30,
  features: [],
  description: 'Garden community',
  availableProperties: 1,
  _count: { units: 1, plans: 0 },
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
    customerCount?: number;
    draftBooking?: boolean;
    portfolio?: boolean;
  } = {},
) {
  const writes: Write[] = [],
    requests: string[] = [];
  let image = 20;
  let uploadCount = 0;
  let bookingStatus = options.draftBooking ? 'DRAFT' : 'CONFIRMED';
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
        permissions: [
          ...new Set([
            ...operations.map((o) => o.permission).filter(Boolean),
            'discounts.approve',
            'settings.manage',
          ]),
        ].filter((permission) => admin || permission !== 'settings.manage'),
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
    } else if (path === '/projects/' + project.id + '/branding') data = currentProject;
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
    else if (options.portfolio && !isWrite && /\/customers(?:\/[^/]+)?$/.test(path)) {
      const booking = {
        id: id(7),
        reference: 'BK-001',
        unit,
        customers: [customer],
        status: 'CONFIRMED',
        paymentType: 'INSTALLMENTS',
        paymentStatus: 'INSTALLMENTS',
      };
      const customers = [
        { ...customer, paymentStatus: 'INSTALLMENTS', bookings: [booking] },
        {
          ...customer,
          id: id(12),
          name: 'Unassigned Buyer',
          paymentStatus: 'UNASSIGNED',
          bookings: [],
        },
        {
          ...customer,
          id: id(13),
          name: 'Paid Buyer',
          paymentStatus: 'FULLY_PAID',
          bookings: [{ ...booking, paymentStatus: 'FULLY_PAID' }],
        },
      ];
      const group = new URL(req.url()).searchParams.get('group');
      data = path.endsWith('/customers')
        ? {
            ...list(customers.filter((c) => !group || c.paymentStatus === group)),
            groups: { ALL: 3, INSTALLMENTS: 1, FULLY_PAID: 1, UNASSIGNED: 1, PENDING: 0 },
          }
        : customers.find((c) => path.endsWith(c.id));
    } else if (path.endsWith('/customers'))
      data = isWrite
        ? { id: id(30), ...writes.at(-1)?.body }
        : list([
            customer,
            ...Array.from({ length: (options.customerCount ?? 1) - 1 }, (_, index) => ({
              ...customer,
              id: id(100 + index),
              name: `Buyer ${index + 2}`,
            })),
            ...(options.bookingChoices
              ? [{ ...customer, id: id(12), name: 'Second Buyer', reference: 'CUST-002' }]
              : []),
          ]);
    else if (path.endsWith('/customers/' + customer.id)) data = customer;
    else if (path.endsWith('/units'))
      data = isWrite
        ? { id: id(31), ...writes.at(-1)?.body }
        : list([
            {
              ...currentUnit,
              ...(options.portfolio
                ? {
                    bookings: [
                      {
                        id: id(7),
                        reference: 'BK-001',
                        customers: [customer],
                        status: options.draftBooking ? 'DRAFT' : 'CONFIRMED',
                      },
                    ],
                  }
                : {}),
            },
            ...(options.bookingChoices ? [{ ...unit, id: id(11), number: 'A-105' }] : []),
          ]);
    else if (path === '/projects/' + project.id + '/units/' + unit.id) {
      if (isWrite) {
        const body = writes.at(-1)!.body;
        currentUnit = {
          ...currentUnit,
          ...body,
          ...(Array.isArray(body.photoIds) ? { photoId: body.photoIds[0] ?? null } : {}),
        };
      }
      data = {
        ...currentUnit,
        ...(options.portfolio
          ? {
              bookings: [
                { id: id(7), reference: 'BK-001', customers: [customer], status: 'CONFIRMED' },
              ],
            }
          : {}),
      };
    } else if (path.endsWith('/payment-plans')) data = list([plan]);
    else if (path.endsWith('/bookings/' + id(7) + '/confirm')) {
      bookingStatus = 'CONFIRMED';
      data = { id: id(7), reference: 'BK-001', status: bookingStatus };
    } else if (path.endsWith('/bookings/' + id(7)))
      data = {
        id: id(7),
        reference: 'BK-001',
        customer,
        unit,
        paymentType: 'INSTALLMENTS',
        status: bookingStatus,
        total: '1000',
        downPayment: '200',
        position: {
          collected: '200',
          outstanding: '800',
          installments: [
            {
              id: id(71),
              label: 'Down payment',
              dueDate: '2090-01-01',
              amount: '200',
              paid: '200',
              outstanding: '0',
            },
            {
              id: id(72),
              label: 'Balance',
              dueDate: '2090-02-01',
              amount: '800',
              paid: '0',
              outstanding: '800',
            },
          ],
        },
      };
    else if (path.endsWith('/bookings'))
      data = isWrite
        ? { booking: { id: id(32), reference: 'BK-002', status: 'CONFIRMED' } }
        : list([
            {
              id: id(7),
              reference: 'BK-001',
              customer,
              unit,
              paymentType: 'FULL_PAYMENT',
              total: '1000000',
              status: bookingStatus,
            },
          ]);
    else if (path.endsWith('/accounts'))
      data = list([{ id: id(10), name: 'Bank', code: 'BANK', type: 'ASSET' }]);
    else if (path.endsWith('/documents'))
      data = isWrite ? { id: id(34), name: 'Agreement A-104.png' } : list([]);
    else if (path.endsWith('/payments'))
      data = isWrite ? { id: id(35), ...writes.at(-1)?.body } : list([]);
    else if (path.endsWith('/transfers') || path.endsWith('/possessions'))
      data = isWrite ? { id: id(36), ...writes.at(-1)?.body, status: 'PENDING' } : list([]);
    else data = list([]);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });
  });
  return { writes, requests };
}
async function fillCaseChecks(d: Locator, possession = false) {
  await d
    .getByLabel('Authority or housing society', { exact: false })
    .fill('Garden Housing Society');
  await d
    .getByLabel('Case file / document references', { exact: false })
    .fill('CASE-100: signed application, CNIC, allotment and fee receipts');
  for (const field of [
    'Identity checked',
    'Ownership checked',
    'Application and supporting documents checked',
    'Applicable taxes and fees checked',
    ...(possession
      ? ['Property released for possession', 'Site plan / demarcation checked']
      : ['Consent of owners and buyer checked']),
  ])
    await d.getByRole('checkbox', { name: field }).check();
}
for (const width of [1280, 390])
  test(`property purchase draft review and posting at ${width}px`, async ({ page }) => {
    await setup(page);
    await page.setViewportSize({ width, height: 900 });
    const seller = {
      id: id(80),
      name: 'Lahore Land Seller',
      phone: '03001234567',
      category: 'SELLER',
    };
    let purchase: Record<string, unknown> | undefined;
    let confirmation: Record<string, unknown> | undefined;
    const stamp = '2026-10-24T09:00:00.000Z';
    await page.route('**/api/v1/projects/*/vendors**', (route) =>
      route.fulfill({ json: { success: true, data: list([seller]) } }),
    );
    await page.route('**/api/v1/projects/*/property-purchases**', async (route) => {
      const req = route.request(),
        url = new URL(req.url());
      if (req.method() === 'POST' && url.pathname.endsWith('/property-purchases'))
        purchase = {
          ...req.postDataJSON(),
          id: id(81),
          reference: 'PUR-00000001',
          vendor: seller,
          status: 'DRAFT',
          total: '1050000.00',
          updatedAt: stamp,
          journalId: null,
        };
      if (req.method() === 'POST' && url.pathname.endsWith('/post')) {
        confirmation = req.postDataJSON();
        purchase = {
          ...purchase,
          status: 'POSTED',
          journalId: id(82),
          journal: { id: id(82), reference: 'JV-00000001' },
        };
      }
      await route.fulfill({
        json: {
          success: true,
          data:
            req.method() === 'GET' && url.pathname.endsWith('/property-purchases')
              ? list(purchase ? [purchase] : [])
              : purchase,
        },
      });
    });
    await page.goto('/property-purchases');
    await page.getByRole('button', { name: 'Add property purchase', exact: true }).click();
    const form = page.getByRole('dialog', { name: 'Add property purchase', exact: true });
    await chooseOption(form.getByRole('combobox', { name: /^Seller/ }), seller.id);
    await form.getByRole('textbox', { name: /^Title/ }).fill('Land for Garden Homes');
    await form.getByRole('textbox', { name: /^Location/ }).fill('Lahore');
    await form.getByLabel('Purchase date', { exact: false }).fill('2026-10-24');
    await form.getByRole('textbox', { name: /^Purchase price/ }).fill('1000000');
    await form.getByRole('textbox', { name: /^Non-recoverable acquisition taxes/ }).fill('50000');
    await form.getByRole('textbox', { name: /^Purchase agreement reference/ }).fill('DEED-100');
    await expect(form.locator('.purchase-cost-summary')).toContainText('PKR 1,050,000.00');
    expect(await form.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({
      path: `test-results/portal/purchase-draft-${width}.png`,
      fullPage: true,
    });
    await form.getByRole('button', { name: 'Review changes', exact: true }).click();
    await form.getByRole('button', { name: 'Confirm & submit', exact: true }).click();
    await expect.poll(() => purchase?.status).toBe('DRAFT');
    await page.goto('/property-purchases?record=' + id(81));
    await page.getByRole('button', { name: 'Post purchase', exact: true }).click();
    const review = page.getByRole('dialog', { name: 'Post purchase', exact: true });
    await expect(review.getByText('Lahore Land Seller', { exact: true })).toBeVisible();
    await expect(review.getByText('PKR 1,050,000.00', { exact: true })).toBeVisible();
    await review.getByRole('button', { name: 'Post purchase', exact: true }).click();
    await expect
      .poll(() => confirmation)
      .toEqual({ expectedTotal: '1050000.00', expectedUpdatedAt: stamp });
    await page.goto('/property-purchases?record=' + id(81));
    await expect(page.getByRole('button', { name: 'Post purchase', exact: true })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Edit property purchase', exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Print voucher', exact: true })).toBeVisible();
  });

test('project branding is available on creation and saves a separate logo', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const d = page.getByRole('dialog', { name: 'Add project', exact: true });
  await d.getByRole('textbox', { name: /^Name/ }).fill('Garden Extension');
  await d.getByRole('textbox', { name: /^Location/ }).fill('Lahore');
  await d.getByLabel('Project logo', { exact: true }).setInputFiles(photo);
  await expect(d.getByRole('img', { name: 'Project logo', exact: true })).toBeVisible();
  expect(writes.find((w) => w.path === '/images')?.raw).toContain('PROJECT_LOGO');
  await d.getByRole('button', { name: /Review changes|Continue/ }).click();
  await d.getByRole('button', { name: 'Confirm & submit', exact: true }).click();
  await expect.poll(() => writes.find((w) => w.path === '/projects')?.body.logoId).toBe(id(20));
});
for (const width of [1280, 390])
  test(`project branding settings replace, cancel and remove a logo at ${width}px`, async ({
    page,
  }) => {
    const { writes } = await setup(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/settings');
    const card = page.locator('.project-branding-card');
    await expect(card.getByRole('heading', { name: 'Project branding' })).toBeVisible();
    await card.getByLabel('Project logo', { exact: true }).setInputFiles(photo);
    await card.getByRole('button', { name: 'Save project logo' }).click();
    await expect
      .poll(() => writes.filter((w) => w.path === '/projects/' + project.id).at(-1)?.body.logoId)
      .toBe(id(20));
    await expect(card.getByRole('button', { name: 'Save project logo' })).toBeDisabled();
    await card
      .getByLabel('Project logo', { exact: true })
      .setInputFiles({ ...photo, name: 'replacement.png' });
    await card.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(card.getByRole('button', { name: 'Save project logo' })).toBeDisabled();
    await card
      .getByLabel('Project logo', { exact: true })
      .setInputFiles({ ...photo, name: 'replacement.png' });
    await card.getByRole('button', { name: 'Save project logo' }).click();
    await expect
      .poll(() => writes.filter((w) => w.path === '/projects/' + project.id).at(-1)?.body.logoId)
      .toBe(id(22));
    await expect(card.getByRole('button', { name: 'Save project logo' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `test-results/portal/project-branding-${width}.png`,
      fullPage: true,
    });
    await card.getByRole('button', { name: 'Remove photo', exact: true }).click();
    await card.getByRole('button', { name: 'Save project logo' }).click();
    await expect
      .poll(() => writes.filter((w) => w.path === '/projects/' + project.id).at(-1)?.body.logoId)
      .toBeNull();
  });
test('project branding appears on a printable journal voucher', async ({ page }) => {
  await setup(page);
  const artwork = readFileSync(
    new URL('../../public/logos/EtihadRealEstate-white-bg.png', import.meta.url),
  );
  await page.route('**/api/v1/images/*', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { url: 'data:image/png;base64,' + artwork.toString('base64') },
      },
    }),
  );
  const voucher = {
    id: id(70),
    reference: 'JV-000001',
    description: 'Capital contribution',
    postedAt: '2026-10-24',
    project: { ...project, logoId: id(20) },
    reversal: null,
    reversalOf: null,
    lines: [
      {
        id: id(71),
        account: { code: '1000', name: 'Cash' },
        vendor: null,
        debit: '500000',
        credit: '0',
      },
      {
        id: id(72),
        account: { code: '3000', name: 'Capital' },
        vendor: null,
        debit: '0',
        credit: '500000',
      },
    ],
  };
  await page.route('**/api/v1/projects/*/journals**', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: route.request().url().includes(id(70)) ? voucher : list([voucher]),
      },
    }),
  );
  await page.goto('/journals?record=' + id(70));
  await page.getByRole('button', { name: 'Print voucher', exact: true }).click();
  const d = page.getByRole('dialog', { name: 'Journal voucher', exact: true });
  await expect(d.getByRole('img', { name: project.name, exact: true })).toBeVisible();
  await expect(d.getByRole('cell', { name: '1000 · Cash', exact: true })).toBeVisible();
  await expect(d.locator('tfoot')).toContainText('PKR 500,000.00');
  await page.screenshot({ path: 'test-results/portal/project-branded-voucher.png' });
  await page.emulateMedia({ media: 'print' });
  await expect(d.getByRole('cell', { name: '1000 · Cash', exact: true })).toBeVisible();
  await expect(d.getByRole('img', { name: project.name, exact: true })).toBeVisible();
  await expect(d.getByRole('button', { name: 'Print voucher', exact: true })).toBeHidden();
  await page.screenshot({ path: 'test-results/portal/project-branded-voucher-print.png' });
});
for (const width of [1280, 390]) {
  test(`ownership transfer checklist, clearance and review work at ${width}px`, async ({
    page,
  }) => {
    const { writes, requests } = await setup(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/transfers');
    await expect(
      page.getByRole('heading', { name: 'Transfer with a complete case file' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Add transfer', exact: true }).click();
    const d = page.getByRole('dialog', { name: 'Add transfer', exact: true });
    await expect(d.getByRole('combobox', { name: /Ndc|Clearance certificate/i })).toHaveCount(0);
    await chooseOption(d.getByRole('combobox', { name: /^Booking/ }), id(7));
    await chooseOption(d.getByRole('combobox', { name: /^New owner/ }), customer.id);
    await d.getByRole('textbox', { name: /^Transfer fee/ }).fill('0');
    await fillCaseChecks(d);
    await chooseOption(
      d.getByRole('combobox', { name: 'Authority clearance', exact: false }),
      'NOT_REQUIRED',
    );
    await expect(d.getByLabel('Clearance document reference', { exact: false })).toHaveCount(0);
    await d.getByRole('button', { name: 'Review changes' }).click();
    await expect(
      d.getByText('Explain why separate authority clearance is not required.'),
    ).toBeVisible();
    await d
      .getByLabel('Reason separate clearance is not required', { exact: false })
      .fill('Authority confirmed no separate certificate for this case, REF-10.');
    await d.getByRole('checkbox', { name: 'Consent of owners and buyer checked' }).uncheck();
    await d.getByRole('button', { name: 'Review changes' }).click();
    await expect(d.getByText('Complete this check before continuing.')).toBeVisible();
    await d.getByRole('checkbox', { name: 'Consent of owners and buyer checked' }).check();
    await chooseOption(
      d.getByRole('combobox', { name: 'Authority clearance', exact: false }),
      'VERIFIED',
    );
    await expect(
      d.getByLabel('Reason separate clearance is not required', { exact: false }),
    ).toHaveCount(0);
    await d.getByLabel('Clearance document reference', { exact: false }).fill('NDC-100');
    await d.getByLabel('Clearance expiry date', { exact: false }).fill('2020-01-01');
    await d.getByRole('button', { name: 'Review changes' }).click();
    await expect(
      d.getByText('The clearance has expired. Verify a current document.'),
    ).toBeVisible();
    await d.getByLabel('Clearance expiry date', { exact: false }).fill('2099-01-01');
    await d.getByRole('button', { name: 'Review changes' }).click();
    await expect(d.locator('.verification-summary')).toContainText('Garden Housing Society');
    await expect(d.locator('.verification-summary')).toContainText('NDC-100');
    await expect(d.locator('.verification-summary')).not.toContainText('Configured');
    await expect(d.locator('.verification-summary')).not.toContainText('REF-10');
    await expect(d.locator('.ownership-parties')).toContainText('BK-001');
    await expect(d.locator('.ownership-parties')).toContainText('A-104');
    await expect(d.locator('.ownership-parties')).toContainText('Ahmed Buyer');
    expect(await d.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({
      path: `test-results/portal/transfer-review-${width}.png`,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Confirm & submit' }).click();
    await expect(page.getByRole('dialog', { name: 'Request completed' })).toBeVisible();
    const body = writes.find((w) => w.path.endsWith('/transfers'))!.body;
    expect(body).not.toHaveProperty('ndcId');
    expect(body.verification).toMatchObject({
      clearanceStatus: 'VERIFIED',
      clearanceReference: 'NDC-100',
      consentVerified: true,
    });
    expect(body.verification).not.toHaveProperty('clearanceReason');
    expect(requests.some((url) => url.includes('/ndcs'))).toBe(false);
  });
}
test('possession checklist and signed handover receipt are shown', async ({ page }) => {
  await setup(page);
  await page.goto('/possessions');
  await page.getByRole('button', { name: 'Add possession request', exact: true }).click();
  const d = page.getByRole('dialog', { name: 'Add possession request', exact: true });
  await chooseOption(d.getByRole('combobox', { name: /^Booking/ }), id(7));
  await fillCaseChecks(d, true);
  await chooseOption(
    d.getByRole('combobox', { name: 'Authority clearance', exact: false }),
    'NOT_REQUIRED',
  );
  await d
    .getByLabel('Reason separate clearance is not required', { exact: false })
    .fill('Developer confirmed possession release REF-20.');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.locator('.verification-summary')).toContainText('Site plan / demarcation checked');
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await page.goto('/possessions');
  const record = {
    id: id(36),
    booking: { reference: 'BK-001' },
    status: 'PENDING',
    inspectionAt: '2026-10-15',
    snags: [],
  };
  await page.route('**/api/v1/projects/*/possessions**', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: new URL(route.request().url()).pathname.endsWith(id(36)) ? record : list([record]),
      },
    }),
  );
  await page.goto('/possessions?record=' + id(36));
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Complete handover', exact: true })
    .click();
  const handover = page.getByRole('dialog', { name: 'Complete handover', exact: true });
  await expect(
    handover.getByLabel('Signed handover receipt reference', { exact: false }),
  ).toBeVisible();
  await handover
    .getByLabel('Signed handover receipt reference', { exact: false })
    .fill('HANDOVER-100');
  await handover
    .getByLabel('Owner or authorised recipient name', { exact: false })
    .fill('Ahmed Buyer');
  await handover.getByRole('button', { name: 'Review changes' }).click();
  await expect(handover.locator('.review-values')).toContainText('HANDOVER-100');
  await expect(handover.locator('.review-values')).toContainText('Ahmed Buyer');
});
for (const width of [1280, 390]) {
  test(`portfolio groups and customer/property links work at ${width}px`, async ({ page }) => {
    const { writes, requests } = await setup(page, true, { portfolio: true, draftBooking: true });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/inventory');
    const relation = page.locator('.portfolio-relation').first();
    await expect(relation).toContainText('Pending booking');
    await relation.getByRole('link', { name: customer.name }).click();
    const customerDetail = page.getByRole('dialog', { name: customer.name, exact: true });
    await expect(customerDetail).toBeVisible();
    await expect(customerDetail.locator('.detail-portfolio')).toContainText('Installments');
    await customerDetail.getByRole('link', { name: 'Property A-104', exact: true }).click();
    await expect(page.getByRole('dialog', { name: /A-104/ })).toBeVisible();
    await page.goto('/customers');
    await expect(page.locator('.portfolio-groups')).toContainText('All customers3');
    await page.locator('.portfolio-groups').getByRole('button', { name: 'Installments' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody')).toContainText(customer.name);
    await expect.poll(() => requests.some((r) => r.includes('group=INSTALLMENTS'))).toBe(true);
    await page.locator('.portfolio-groups').getByRole('button', { name: 'Fully paid' }).click();
    await expect(page.locator('tbody')).toContainText('Paid Buyer');
    await page.locator('.portfolio-groups').getByRole('button', { name: 'No property' }).click();
    await expect(page.locator('tbody')).toContainText('No property assigned');
    const size = page.getByRole('combobox', { name: 'Rows per page' });
    await chooseOption(size, '100');
    await expect(size).toContainText('100');
    const label = size.locator(':scope > span');
    expect(await label.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect((await size.boundingBox())!.width).toBeGreaterThanOrEqual(95);
    await page.screenshot({
      path: `test-results/portal/customer-portfolios-${width}.png`,
      fullPage: true,
    });
    expect(writes).toHaveLength(0);
  });
}

test('a full-width edit dialog is capped by its parent and respects reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setup(page);
  await page.goto('/inventory?record=' + unit.id);
  const parent = page.locator('.modal[data-modal-depth="0"]');
  const editButton = parent.getByRole('button', { name: 'Edit property', exact: true });
  await editButton.click();
  const edit = page.getByRole('dialog', { name: 'Edit property', exact: true });
  await expect(edit).toHaveAttribute('data-modal-depth', '1');
  expect(await parent.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(850);
  expect(await edit.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(786);
  expect(
    await edit.evaluate((el) => parseFloat(getComputedStyle(el).animationDuration)),
  ).toBeLessThan(0.001);
  await page.keyboard.press('Escape');
  await expect(edit).toHaveCount(0);
  await expect(editButton).toBeFocused();
  await expect(parent).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(parent).toHaveCount(0);
});

test('replacing the Create menu opens a normal sized dialog with focus inside it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 850 });
  await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  const quick = page.getByRole('dialog', { name: 'Start something new' });
  await quick.getByRole('button', { name: 'Add project', exact: true }).click();
  const form = page.getByRole('dialog', { name: 'Add project', exact: true });
  await expect(form).toHaveAttribute('data-modal-depth', '0');
  await expect(quick).toHaveCount(0);
  expect(await form.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(850);
  await expect(form.getByRole('button', { name: 'Close dialog' })).toBeFocused();
});

test('document upload keeps its draft when a smaller discard prompt is dismissed', async ({
  page,
}) => {
  const { writes } = await setup(page);
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload document', exact: true }).click();
  const form = page.locator('.modal[data-modal-depth="0"]');
  await form.getByLabel('Document name', { exact: false }).fill('Draft document');
  await form.getByRole('button', { name: 'Close dialog' }).click();
  const prompt = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
  await expect(prompt).toHaveAttribute('data-modal-depth', '1');
  const parentWidth = await form.evaluate((el) => (el as HTMLElement).offsetWidth);
  expect(await prompt.evaluate((el) => (el as HTMLElement).offsetWidth)).toBeLessThan(parentWidth);
  await page.keyboard.press('Escape');
  await expect(prompt).toHaveCount(0);
  await expect(form.getByLabel('Document name', { exact: false })).toHaveValue('Draft document');
  await form.getByRole('button', { name: 'Close dialog' }).click();
  await prompt.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(form).toHaveCount(0);
  expect(writes).toHaveLength(0);
});

for (const width of [1280, 847, 390]) {
  test(`sales workspace layouts fit ${width}px without losing controls`, async ({ page }) => {
    const { writes } = await setup(page);
    await page.setViewportSize({ width, height: 950 });
    await page.addInitScript(() =>
      localStorage.setItem(
        'estate-preferences-v1',
        JSON.stringify({ state: { language: 'en', theme: 'dark' }, version: 0 }),
      ),
    );
    for (const [path, selector, name] of [
      ['/bookings/new', '.booking-workspace', 'booking-workspace'],
      ['/payment-plans?booking=' + id(7), '.payment-workspace', 'payment-workspace'],
      ['/settings', '.project-settings-card', 'project-settings'],
    ]) {
      await page.goto(path!);
      const card = page.locator(selector!);
      await expect(card).toBeVisible();
      if (name === 'payment-workspace') {
        await expect(page.getByRole('progressbar', { name: 'Payment progress' })).toHaveAttribute(
          'value',
          '20',
        );
        await expect(
          page.getByRole('button', { name: 'Change remaining installments', exact: true }),
        ).toBeEnabled();
      }
      if (name === 'project-settings')
        await expect(card.getByText('30', { exact: false }).first()).toBeVisible();
      const bounds = (await card.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: `test-results/portal/${name}-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
    expect(writes).toHaveLength(0);
  });
}

test('a failed workspace import shows a friendly reload action and recovers', async ({ page }) => {
  await setup(page);
  const shellModule = /\/(?:src\/components\/layout\/Shell\.tsx|assets\/Shell-[^/]+\.js)(?:\?.*)?$/;
  let blocked = false;
  await page.route(shellModule, async (route) => {
    if (!blocked) {
      blocked = true;
      await route.abort('failed');
    } else await route.continue();
  });
  await page.goto('/projects');
  await expect(page.getByRole('alert')).toContainText('This screen needs a fresh start');
  await expect(page.getByText('Unexpected Application Error!', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reload workspace', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  expect(blocked).toBe(true);
});
for (const width of [1280, 390])
  test(`booking confirmation has one useful step and submits once at ${width}px`, async ({
    page,
  }) => {
    const { writes } = await setup(page, true, { draftBooking: true });
    await page.setViewportSize({ width, height: 850 });
    await page.addInitScript(() => {
      localStorage.setItem(
        'estate-preferences-v1',
        JSON.stringify({ state: { language: 'en', theme: 'dark' }, version: 0 }),
      );
    });
    await page.goto('/bookings');
    async function openConfirmation() {
      await page.getByRole('button', { name: 'Actions for BK-001', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Confirm booking', exact: true }).click();
    }
    await openConfirmation();
    const dialog = page.getByRole('dialog', { name: 'Confirm booking', exact: true });
    for (const text of ['BK-001', customer.name, unit.number, 'Full Payment', 'PKR 1,000,000.00'])
      await expect(dialog.locator('.review-values')).toContainText(text);
    await expect(dialog.locator('form')).toHaveCount(0);
    await expect(
      dialog.getByRole('button', { name: /Review changes|Back to details|Confirm & submit/ }),
    ).toHaveCount(0);
    expect(writes).toHaveLength(0);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Discard unsaved changes?' })).toHaveCount(0);
    expect(writes).toHaveLength(0);
    await openConfirmation();
    const bounds = (await dialog.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.height).toBeLessThan(650);
    await page.screenshot({ path: `test-results/portal/booking-confirmation-${width}.png` });
    await dialog.getByRole('button', { name: 'Confirm booking', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Booking confirmed', exact: true }),
    ).toBeVisible();
    const confirmations = writes.filter((w) => w.path.endsWith('/confirm'));
    expect(confirmations).toHaveLength(1);
    expect(confirmations[0]!.body).toEqual({});
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Actions for BK-001', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Confirm booking', exact: true })).toHaveCount(
      0,
    );
  });

test('a rejected booking confirmation retains its details and can be cancelled', async ({
  page,
}) => {
  await setup(page, true, { draftBooking: true });
  let attempts = 0;
  await page.route('**/bookings/*/confirm', async (route) => {
    attempts++;
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: { code: 'CONFLICT', message: 'This booking has changed. Refresh and try again.' },
      }),
    });
  });
  await page.goto('/bookings');
  await page.getByRole('button', { name: 'Actions for BK-001', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Confirm booking', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm booking', exact: true });
  await dialog.getByRole('button', { name: 'Confirm booking', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.locator('.review-values')).toContainText('BK-001');
  expect(attempts).toBe(1);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Booking confirmed', exact: true })).toHaveCount(
    0,
  );
});
for (const width of [1280, 847, 390])
  test(`table actions at ${width}px escape the last row's scroll area and remain usable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await setup(page, true, { customerCount: 10 });
    await page.goto('/customers');
    // Reproduce a table inside a bounded scrolling panel as well as mobile horizontal overflow.
    const scroll = page.locator('.table-scroll');
    await scroll.evaluate((element) => {
      element.style.maxHeight = '200px';
    });
    const trigger = page.getByRole('button', { name: 'Actions for Buyer 10', exact: true });
    await trigger.scrollIntoViewIfNeeded();
    const scrollHeight = await scroll.evaluate((element) => element.scrollHeight);
    await trigger.click();
    const menu = page.getByRole('menu');
    const item = menu.getByRole('menuitem', { name: 'Add nominee', exact: true });
    await expect(item).toBeVisible();
    const bounds = (await menu.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
    // Portfolio filters can push the table down enough that the menu correctly flips upward.
    expect(await menu.evaluate((element) => element.closest('.table-scroll') === null)).toBe(true);
    // A clipped menu still passes toBeVisible: hit-test its actual visible position.
    expect(
      await item.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(box.x + box.width / 2, box.bottom - 2));
      }),
    ).toBe(true);
    expect(await scroll.evaluate((element) => element.scrollHeight)).toBe(scrollHeight);
    await page.screenshot({
      path: `test-results/portal/table-actions-${width}.png`,
      fullPage: true,
    });
    await page.getByRole('heading', { name: 'Customers', exact: true }).click();
    await expect(menu).toHaveCount(0);
    await trigger.focus();
    await trigger.press('ArrowDown');
    await expect(item).toBeFocused();
    await item.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await item.click();
    await expect(menu).toHaveCount(0);
    const dialog = page.getByRole('dialog', { name: 'Add nominee', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Close dialog' }).click();
    await expect(dialog).toHaveCount(0);
  });

test('table actions flip above a viewport edge and support dark RTL menus', async ({ page }) => {
  await setup(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      'estate-preferences-v1',
      JSON.stringify({ state: { language: 'ur', theme: 'dark' }, version: 0 }),
    );
  });
  await page.goto('/inventory');
  const trigger = page.locator('.row-actions button[aria-haspopup="menu"]');
  await expect(trigger).toBeVisible();
  // Keep the trigger visible but leave too little room below for the full property action list.
  const box = (await trigger.boundingBox())!;
  await page.setViewportSize({ width: 1280, height: Math.ceil(box.y + box.height + 12) });
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toHaveAttribute('data-side', 'top');
  await expect(menu).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const bounds = (await menu.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual((await trigger.boundingBox())!.y);
  await trigger.press('ArrowDown');
  await page.keyboard.press('End');
  await expect(menu.getByRole('menuitem').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(menu.getByRole('menuitem').first()).toBeFocused();
  await page.screenshot({ path: 'test-results/portal/table-actions-dark-rtl.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

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
  await d.getByRole('button', { name: 'Review changes' }).click();
  await expect(d.getByRole('button', { name: 'Confirm & submit' })).toBeVisible();
});
test('employee photos are required, roles explain permissions, and project pictures are optional', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/users');
  await page.getByRole('button', { name: 'Add employee' }).click();
  const d = page.getByRole('dialog');
  await expect(d.getByText('Photo *', { exact: true })).toBeVisible();
  await d.getByRole('button', { name: 'Add Roles and responsibilities' }).click();
  await selectRecord(d, 'Roles and responsibilities 1', id(6));
  await expect(d.getByText('Adds customers and prepares bookings.')).toBeVisible();
  await d.getByText('View current permissions').click();
  await expect(d.getByText('customers — create', { exact: true })).toBeVisible();
  await d.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  await expect(d.getByLabel('Project photos', { exact: true })).toBeVisible();
  await expect(d.getByText('Photo *', { exact: true })).toHaveCount(0);
});
for (const width of [1280, 390]) {
  test(`booking is editable without holds and confirms full payment at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { writes, requests } = await setup(page, true, { bookingChoices: true });
    await page.goto('/bookings/new');
    await selectRecord(page, 'Customer', customer.id);
    await selectRecord(page, 'Property', unit.id);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByLabel('Discount amount')).toHaveCount(0);
    await page.getByLabel('Apply Discount').check();
    await page.getByLabel('Discount amount').fill('100');
    await page.getByLabel('Apply Discount').uncheck();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await selectRecord(page, 'Customer', id(12));
    await selectRecord(page, 'Property', id(11));
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByLabel('Number of installments')).toHaveCount(0);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(
      page.locator('.booking-editor').getByText('Second Buyer', { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/booking-review-${width}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Confirm Booking', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Booking Created Successfully' })).toBeVisible();
    const body = writes.find((w) => w.path.endsWith('/bookings'))!.body;
    expect(body).toMatchObject({
      customerId: id(12),
      unitId: id(11),
      discount: '0.00',
      paymentType: 'FULL_PAYMENT',
      confirm: true,
    });
    expect(body).not.toHaveProperty('reservationId');
    expect(requests.some((url) => /reservations|approvals|dealers/.test(url))).toBe(false);
    await expect(page.locator('.booking-complete')).not.toContainText(id(32));
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}
test('installment preview reconciles totals and minimum payment is validated', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/bookings/new');
  await selectRecord(page, 'Customer', customer.id);
  await selectRecord(page, 'Property', unit.id);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await chooseOption(page.getByLabel('How will the customer pay?'), 'INSTALLMENTS');
  await page.getByLabel('Down payment', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Down payment must');
  await page.getByLabel('Down payment', { exact: true }).fill('202000');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByLabel('Number of installments').fill('3');
  await page.getByLabel('First installment date').fill('2090-01-31');
  await expect(page.locator('.schedule-preview')).toContainText('269,333.34');
  await page.getByRole('heading', { name: 'Create booking', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/portal/installment-preview.png', fullPage: true });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm Booking', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Booking Created Successfully' })).toBeVisible();
  expect(writes.find((w) => w.path.endsWith('/bookings'))!.body).toMatchObject({
    downPayment: '202000',
    installmentCount: 3,
    paymentType: 'INSTALLMENTS',
  });
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
test('project creation uses a backend code, location and currency dropdowns', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Project code')).toHaveCount(0);
  await dialog.getByLabel('Name', { exact: false }).first().fill('Garden Homes');
  await dialog.getByLabel('Location').fill('Lahore');
  await chooseOption(dialog.getByLabel('Currency'), 'AED');
  await chooseOption(dialog.getByLabel('Timezone'), 'Asia/Dubai');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByRole('link', { name: 'Continue project setup' })).toBeVisible();
  expect(writes.find((w) => w.path === '/projects')?.body).toMatchObject({
    name: 'Garden Homes',
    location: 'Lahore',
    currency: 'AED',
    timezone: 'Asia/Dubai',
  });
  expect(writes.find((w) => w.path === '/projects')?.body).not.toHaveProperty('code');
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

for (const width of [1440, 390])
  test(`account statements are readable with empty history and print styles at ${width}px`, async ({
    page,
  }) => {
    await setup(page);
    await page.setViewportSize({ width, height: 980 });
    await page.addInitScript(() =>
      localStorage.setItem(
        'estate-preferences-v1',
        JSON.stringify({ state: { theme: 'dark', language: 'en' }, version: 0 }),
      ),
    );
    let reportRequests = 0;
    await page.route('**/api/v1/projects/*/reports?**', async (route) => {
      reportRequests++;
      const from = new URL(route.request().url()).searchParams.get('from');
      await route.fulfill({
        json: {
          success: true,
          data: {
            rows: [],
            summary: {},
            currency: 'PKR',
            statement: {
              project,
              customer: { ...customer, email: 'ahmed@example.com' },
              generatedAt: '2026-10-16T10:30:00Z',
              from: from || undefined,
              metrics: [
                { label: 'Contract value', amount: '3500000.00' },
                { label: 'Verified payments', amount: '1250000.00' },
                { label: 'Scheduled balance', amount: '2250000.00', emphasis: true },
              ],
              notes: [
                'Balances are current and cover complete confirmed bookings under current ownership, including joint ownership.',
                "Date filters apply to payment history only. Payment history lists this customer's verified and reversed payments; reversed payments do not reduce balances.",
                'Overdue installments: PKR 0.00. Unallocated advance credit: PKR 0.00.',
              ],
              sections: [
                {
                  title: 'Booking overview',
                  description:
                    'Current and historical property bookings. Cancelled bookings and previous ownership are excluded from the balance summary.',
                  columns: [
                    { key: 'date', label: 'Booked on', type: 'date', width: 65 },
                    { key: 'reference', label: 'Booking / property', width: 125 },
                    { key: 'ownership', label: 'Ownership', width: 64 },
                    { key: 'status', label: 'Status', type: 'status', width: 82 },
                    { key: 'amount', label: 'Contract value', type: 'money', width: 110 },
                  ],
                  rows: [
                    {
                      date: '2026-09-01',
                      reference: 'BKG-0000042\nProperty A-104',
                      ownership: 'Current',
                      status: 'CONFIRMED',
                      amount: '3500000.00',
                    },
                  ],
                },
                {
                  title: 'Payment history',
                  description: 'Payments recorded for this customer in the selected period.',
                  columns: [
                    { key: 'date', label: 'Date', type: 'date', width: 65 },
                    { key: 'reference', label: 'Receipt / booking', width: 125 },
                    { key: 'method', label: 'Method', width: 64 },
                    { key: 'status', label: 'Status', type: 'status', width: 82 },
                    { key: 'amount', label: 'Amount', type: 'money', width: 110 },
                  ],
                  rows: from
                    ? []
                    : [
                        {
                          date: '2026-10-01',
                          reference: 'RCT-0000145\nBKG-0000042 / A-104',
                          method: 'Bank transfer',
                          status: 'CLEARED',
                          amount: '700000.00',
                        },
                        {
                          date: '2026-10-06',
                          reference: 'RCT-0000146\nBKG-0000042 / A-104',
                          method: 'Cash',
                          status: 'CLEARED',
                          amount: '550000.00',
                        },
                        {
                          date: '2026-10-08',
                          reference: 'RCT-0000147\nBKG-0000042 / A-104',
                          method: 'Cheque',
                          status: 'REVERSED',
                          amount: '100000.00',
                        },
                      ],
                },
              ],
            },
          },
        },
      });
    });
    await page.goto('/reports?kind=customer-statement');
    await expect(page.getByRole('heading', { name: 'Choose a customer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeDisabled();
    expect(reportRequests).toBe(0);
    await selectRecord(page, 'Customer', customer.id);
    await page.getByRole('button', { name: 'Apply filters' }).click();
    const statement = page.getByRole('article', { name: 'Customer account statement' });
    await expect(statement.getByRole('heading', { name: 'Ahmed Buyer' })).toBeVisible();
    await expect(statement.locator('.statement-metric-emphasis')).toContainText('PKR 2,250,000.00');
    await expect(statement.getByText('Verified', { exact: true })).toHaveCount(2);
    await expect(statement.getByText('Reversed', { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/portal/account-statement-${width}-dark.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
    await page.screenshot({
      path: `test-results/portal/account-statement-${width}-light.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.report-filters')).toBeHidden();
    await expect(statement).toBeVisible();
    await expect(statement.locator('.brand-logo-light')).toBeVisible();
    await expect(statement.locator('.brand-logo-dark')).toBeHidden();
    await page.emulateMedia({ media: 'screen' });
    await page.getByLabel('From date').fill('2090-01-01');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(statement.getByText('No entries for this period.')).toBeVisible();
    await expect(statement.locator('.statement-metric-emphasis')).toContainText('PKR 2,250,000.00');
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
  await dialog
    .locator('.image-upload')
    .filter({ has: dialog.getByLabel('Project photos', { exact: true }) })
    .dispatchEvent('drop', { dataTransfer: transfer });
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
  await d
    .locator('.image-upload')
    .filter({ has: page.getByLabel('Project photos', { exact: true }) })
    .dispatchEvent('drop', { dataTransfer: transfer });
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
  await expect(d.locator('.image-gallery')).toHaveAttribute('aria-busy', 'false');
  await d.getByRole('button', { name: 'Make cover', exact: true }).last().click();
  await d.getByLabel('Name', { exact: false }).first().fill('Five-photo project');
  await d.getByLabel('Location').fill('Lahore');
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
  await d.getByLabel('Location').fill('Lahore');
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
    await detail
      .getByRole('button', {
        name: resource === 'project' ? 'Edit overview & features' : `Edit ${resource}`,
        exact: true,
      })
      .click();
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
      .getByRole('button', {
        name: resource === 'project' ? 'Edit overview & features' : `Edit ${resource}`,
        exact: true,
      })
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
    await booking.click();
    await expect(d.getByRole('option', { name: /BK-001/ })).toBeVisible();
    const bounds = await d.locator('.select-popover').boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(911);
    await d.locator('.select-popover input').press('Escape');
    await expect(d).toBeVisible();
  });

for (const width of [1600, 847, 390])
  test(`project directory shows useful details without stretching rows at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await setup(page);
    const records = [
      {
        ...project,
        features: ['Park', 'Gym', 'Security'],
        photoIds: [id(60), id(61)],
        createdAt: '2026-10-11T09:00:00Z',
      },
      {
        ...project,
        id: id(80),
        name: 'Marina Business Centre',
        code: 'MBC',
        location: 'Dubai Marina, Dubai',
        description: 'Commercial offices and retail spaces beside the waterfront.',
        currency: 'AED',
        timezone: 'Asia/Dubai',
        features: ['Covered parking'],
        downPaymentPercent: '15.50',
        ndcValidityDays: 45,
        createdAt: '2026-10-13T09:00:00Z',
      },
      {
        ...project,
        id: id(81),
        name: 'New Development',
        code: 'PRJ-003',
        location: '',
        description: '',
        features: [],
        downPaymentPercent: '0',
        createdAt: '2026-10-15T09:00:00Z',
      },
    ];
    await page.route('**/api/v1/projects?*', (route) =>
      route.fulfill({ json: { success: true, data: list(records) } }),
    );
    await page.goto('/projects');
    const panel = page.locator('.projects-panel');
    await expect(panel.getByRole('heading', { name: 'Project directory' })).toBeVisible();
    if (width === 1600)
      expect(
        await panel.locator('.table-scroll').evaluate((el) => el.scrollWidth - el.clientWidth),
      ).toBeLessThanOrEqual(1);
    for (const label of [
      'Project',
      'Location',
      'Amenities',
      'Payment rules',
      'Currency & timezone',
      'Created at',
      'Actions',
    ])
      await expect(panel.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
    const rows = panel.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.first().locator('[data-column="name"]')).toContainText('GH');
    await expect(rows.first().locator('[data-column="location"]')).toContainText(
      'Garden community',
    );
    await expect(rows.first().locator('[data-column="features"]')).toContainText('+2 more');
    await expect(rows.nth(1).locator('[data-column="paymentRules"]')).toContainText('15.5%');
    await expect(rows.nth(1).locator('[data-column="paymentRules"]')).toContainText(
      'Clearance: 45 days',
    );
    await expect(rows.nth(1).locator('[data-column="regionalSettings"]')).toContainText('AED');
    await expect(rows.nth(1).locator('[data-column="regionalSettings"]')).toContainText(
      'Asia/Dubai',
    );
    await expect(rows.last().locator('[data-column="paymentRules"]')).toContainText('0%');
    await expect(rows.last().locator('[data-column="features"]')).toHaveText('Not added yet');
    expect(
      await rows.evaluateAll((els) => els.every((el) => el.getBoundingClientRect().height < 80)),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `test-results/portal/project-directory-${width}-light.png`,
      animations: 'disabled',
    });
    await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
    await page.screenshot({
      path: `test-results/portal/project-directory-${width}-dark.png`,
      animations: 'disabled',
    });
    await panel.locator('.column-picker summary').click();
    await panel.locator('.column-picker').getByLabel('Amenities', { exact: true }).uncheck();
    await expect(panel.getByRole('columnheader', { name: 'Amenities', exact: true })).toHaveCount(
      0,
    );
    await panel.locator('.column-picker summary').click();
    await rows.first().getByRole('button', { name: 'Actions for Garden Homes' }).click();
    await page.getByRole('menuitem', { name: 'Edit project', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Edit project', exact: true })).toBeVisible();
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

for (const width of [1280, 847, 390]) {
  test(`nested dialogs stay narrower and preserve the parent at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.addInitScript(() => {
      document.addEventListener('animationend', (event) => {
        if (event.target instanceof Element && event.target.matches('.modal'))
          document.documentElement.dataset.modalAnimations =
            (document.documentElement.dataset.modalAnimations ?? '') + ',' + event.animationName;
      });
    });
    await setup(page);
    await page.goto('/projects?record=' + project.id);
    const parent = page.locator('.project-workspace-modal');
    const editButton = parent.getByRole('button', { name: 'Edit overview & features' });
    await editButton.click();
    const edit = page.locator('.modal[data-modal-depth="1"]');
    await expect(edit.getByLabel('Name', { exact: false }).first()).toHaveValue('Garden Homes');
    await edit.getByLabel('Name', { exact: false }).first().fill('Unsaved garden project');

    // Escape in a dropdown must not close its dialog or open a discard prompt.
    await edit.getByLabel('Currency', { exact: true }).click();
    await expect(edit.getByRole('option', { name: /PKR/ })).toBeVisible();
    await edit.locator('.select-popover input').press('Escape');
    await expect(edit.locator('.select-popover')).toHaveCount(0);
    await expect(page.locator('.modal[data-modal-depth="2"]')).toHaveCount(0);

    await edit.getByRole('button', { name: 'Close dialog' }).click();
    const prompt = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    await expect(prompt).toHaveAttribute('data-modal-depth', '2');
    await prompt.evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
    const dimensions = await page.locator('.modal').evaluateAll((elements) =>
      elements
        .map((el) => ({
          depth: Number((el as HTMLElement).dataset.modalDepth),
          width: (el as HTMLElement).offsetWidth,
          overflow: el.scrollWidth > el.clientWidth,
          z: Number(getComputedStyle(el).zIndex),
        }))
        .sort((a, b) => a.depth - b.depth),
    );
    expect(dimensions).toHaveLength(3);
    expect(dimensions[1]!.width).toBeLessThanOrEqual(dimensions[0]!.width - 24);
    expect(dimensions[2]!.width).toBeLessThanOrEqual(dimensions[1]!.width - 24);
    expect(dimensions.every((item) => !item.overflow)).toBe(true);
    expect(dimensions[2]!.z).toBeGreaterThan(dimensions[1]!.z);
    expect(dimensions[1]!.z).toBeGreaterThan(dimensions[0]!.z);
    if (width === 847) await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
    await page.screenshot({
      path: `test-results/portal/nested-dialogs-${width}.png`,
      animations: 'disabled',
    });
    await prompt.getByRole('button', { name: 'Keep editing' }).click();
    await expect(prompt).toHaveCount(0);
    await expect(edit.getByLabel('Name', { exact: false }).first()).toHaveValue(
      'Unsaved garden project',
    );
    await expect(edit.getByRole('button', { name: 'Close dialog' })).toBeFocused();

    // Re-measure a live stack after a viewport change.
    await page.setViewportSize({ width: width === 390 ? 847 : 390, height: 850 });
    await expect
      .poll(async () => {
        const parentWidth = await parent.evaluate((el) => (el as HTMLElement).offsetWidth);
        return (await edit.evaluate((el) => (el as HTMLElement).offsetWidth)) <= parentWidth - 24;
      })
      .toBe(true);
    await edit.getByRole('button', { name: 'Close dialog' }).click();
    await prompt.getByRole('button', { name: 'Discard changes', exact: true }).click();
    await expect(edit).toHaveCount(0);
    await expect(prompt).toHaveCount(0);
    await expect(editButton).toBeFocused();
    await expect(parent.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-modal-animations', /modal-in/);
    await expect(page.locator('html')).toHaveAttribute('data-modal-animations', /modal-out/);
    await parent.getByRole('button', { name: 'Close dialog' }).click();
    await expect(parent).toHaveCount(0);

    // A fresh root dialog must not inherit the previous stack's width/depth.
    await page.getByRole('button', { name: 'Add project', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveAttribute('data-modal-depth', '0');
    await expect(page.getByRole('dialog')).toHaveCSS('max-width', 'none');
  });

  test(`project detail and compact customer form fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await setup(page);
    await page.goto('/projects?record=' + project.id);
    const d = page.getByRole('dialog');
    await expect(d.getByText('Lahore', { exact: true })).toBeVisible();
    const footer = d.locator('.project-workspace-footer');
    const initialFooter = (await footer.boundingBox())!;
    await expect(d.getByRole('navigation', { name: 'Project setup' })).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/project-overview-${width}-light.png`,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Edit overview & features' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit project', exact: true });
    await expect(edit.getByLabel('Name', { exact: false }).first()).toHaveValue('Garden Homes');
    await edit.getByRole('button', { name: 'Close dialog' }).click();
    await expect(d.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
    await page.screenshot({
      path: `test-results/portal/project-overview-${width}-dark.png`,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(d.getByRole('heading', { name: 'Project settings', exact: true })).toBeVisible();
    await expect(d.locator('.project-rule-value').first()).toHaveText('20%');
    await page.screenshot({
      path: `test-results/portal/project-rules-${width}.png`,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(d.getByText('A-104', { exact: true })).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/project-setup-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(d.getByRole('heading', { name: 'Pricing & plans', exact: true })).toBeVisible();
    await expect(d.getByRole('button', { name: 'Change price' })).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/project-pricing-${width}.png`,
      animations: 'disabled',
    });
    await d.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(d.getByRole('heading', { name: 'Your project is ready' })).toBeVisible();
    await expect(d.getByRole('link', { name: 'Create booking' })).toHaveAttribute(
      'href',
      '/bookings/new',
    );
    const finalFooter = (await footer.boundingBox())!;
    expect(Math.abs(finalFooter.y - initialFooter.y)).toBeLessThan(35);
    expect(finalFooter.y + finalFooter.height).toBeLessThanOrEqual(850);
    expect(await d.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({
      path: `test-results/portal/project-ready-${width}.png`,
      animations: 'disabled',
    });
    await page.goto('/customers');
    await page.getByRole('button', { name: 'Add customer', exact: true }).click();
    const bounds = (await page.getByRole('dialog').boundingBox())!;
    expect(bounds.width).toBeLessThanOrEqual(Math.min(width, 700));
    expect(bounds.height).toBeLessThanOrEqual(850);
    await expect(
      page.getByRole('dialog').getByLabel('Phone', { exact: false }).first(),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/portal/compact-customer-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
}
test('project setup explains missing details and offers a route to each section', async ({
  page,
}) => {
  await setup(page);
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.route(`**/api/v1/projects/${project.id}`, (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          ...project,
          name: 'Hamza',
          code: '012',
          location: '',
          description: '',
          features: [],
          availableProperties: 0,
          _count: { units: 2 },
        },
      },
    }),
  );
  await page.goto('/projects?record=' + project.id);
  const d = page.getByRole('dialog', { name: 'Hamza', exact: true });
  await expect(d.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await expect(d.getByText('Add a location in Overview to continue.')).toBeVisible();
  await expect(
    d.getByText('No amenities added yet. Add the facilities that make this project stand out.'),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/portal/project-hamza-overview.png',
    animations: 'disabled',
  });
  await d
    .getByRole('navigation')
    .getByRole('button', { name: '5. Ready for booking', exact: true })
    .click();
  await expect(d.getByRole('heading', { name: 'A few details are missing' })).toBeVisible();
  await expect(d.getByRole('link', { name: 'Create booking' })).toHaveCount(0);
  await d.getByRole('button', { name: 'Overview', exact: true }).click();
  await expect(d.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
});
test('payment plan changes preview exact totals and save in one action', async ({ page }) => {
  const { writes } = await setup(page);
  await page.goto('/payment-plans?booking=' + id(7));
  await expect(page.getByRole('heading', { name: 'BK-001' })).toBeVisible();
  await page.getByRole('button', { name: 'Change remaining installments' }).click();
  await page.getByLabel('Number of installments').fill('3');
  await page.getByLabel('First installment date').fill('2091-01-31');
  await page.getByLabel('Reason for change').fill('Agreed revised dates');
  await expect(page.getByText('PKR 266.68', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save Payment Plan', exact: true }).click();
  await expect(page.getByLabel('Reason for change')).toHaveCount(0);
  expect(writes.find((w) => w.path.endsWith('/reschedule'))?.body).toMatchObject({
    installmentCount: 3,
    intervalMonths: 1,
    firstInstallmentDate: '2091-01-31',
    reason: 'Agreed revised dates',
  });
});
