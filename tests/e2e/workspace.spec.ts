import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { chooseOption } from '../support/select';
type Fixture = {
  projectId: string;
  customerId: string;
  unitId: string;
  planVersionId: string;
  cashId: string;
  vendorId: string;
  password: string;
};
let fixture: Fixture;
test.beforeAll(async () => {
  test.setTimeout(120000);
  await expect
    .poll(
      async () => {
        try {
          return (
            await fetch('http://127.0.0.1:4100/__frontend_test_ready', {
              signal: AbortSignal.timeout(2000),
            })
          ).status;
        } catch {
          return 0;
        }
      },
      { timeout: 110000 },
    )
    .toBe(200);
  fixture = JSON.parse(await readFile('test-results/fixture.json', 'utf8'));
});
async function login(page: Page, email = 'manager@frontend.test') {
  await page.goto('/login');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(fixture.password);
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();
  await expect(page.getByTitle('Switch project')).toBeVisible();
  await page.getByTitle('Switch project').click();
  await page.getByRole('option', { name: /Parkside Residences/ }).click();
  await expect(page.getByTitle('Switch project')).toContainText('Parkside Residences');
}
async function submit(page: Page) {
  const current = page.getByRole('dialog').last();
  const depth = await current.getAttribute('data-modal-depth');
  const dialog = page.locator(`.modal[data-modal-depth="${depth}"]`);
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect
    .poll(
      async () =>
        !(await dialog.count()) || (await dialog.getByText('Saved to your project').isVisible()),
    )
    .toBe(true);
  if (await dialog.count()) await dialog.getByRole('button', { name: 'Done', exact: true }).click();
}
test('sign-in, refresh, permission-aware navigation, responsive layout and theme', async ({
  page,
  context,
}) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await login(page);
  await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
  const cookie = (await context.cookies()).find((c) => c.name === 'pms_refresh');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.path).toBe('/api/v1/auth/refresh');
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toMatch(/accessToken|refreshToken|Bearer|eyJ/);
  await expect(page.getByRole('status', { name: 'Loading records' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/overview-desktop.png', fullPage: true });
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading records' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/overview-dark.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.screenshot({ path: 'test-results/overview-mobile.png', fullPage: true });
  expect(failures).toEqual([]);
});
test('inventory supports real search, pagination, detail, cards and CSV imports', async ({
  page,
}) => {
  await login(page);
  await page.goto('/inventory');
  await expect(page.getByText('A-032', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('A-001', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search Properties' }).fill('A-005');
  await expect(page.getByText('A-005', { exact: true })).toBeVisible();
  await expect(page.getByText('A-001', { exact: true })).toHaveCount(0);
  await page.getByText('A-005', { exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Card view' }).click();
  await expect(page.locator('.unit-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Import properties from CSV' }).click();
  await page
    .getByRole('dialog')
    .locator('.csv-import input[type=file]')
    .setInputFiles({
      name: 'units.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'number,type,size,measurementUnit,price\nUI-CSV-001,RESIDENTIAL_PLOT,5,marla,123456.78\n',
      ),
    });
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(page.getByRole('dialog').getByText('Saved to your project')).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search Properties' }).fill('UI-CSV-001');
  await expect(page.getByText('UI-CSV-001', { exact: true })).toBeVisible();
});
test('customer registration validates and saves an actual profile with a working QR deep link', async ({
  page,
}) => {
  await login(page);
  await page.goto('/members/register');
  await page.getByRole('button', { name: 'Register customer', exact: true }).click();
  await expect(page.locator('input:invalid').first()).toBeVisible();
  await page.getByLabel('Full name', { exact: true }).fill('Browser Test Customer');
  await page.getByLabel('Mobile phone', { exact: true }).fill('03001239999');
  await page.getByLabel('National ID or passport number').fill('3520212345671');
  await page.getByLabel('Email address', { exact: true }).fill('browser-customer@example.test');
  await page.getByRole('button', { name: 'Register customer', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Customer Registered Successfully' }),
  ).toBeVisible();
  const qr = page.getByRole('link', { name: 'View QR pass', exact: true });
  await expect(qr).toHaveAttribute('href', /customerId=/);
  await qr.click();
  await expect(page.locator('.id-card-name')).toHaveText('Browser Test Customer');
  await expect(page.locator('.id-card-role')).toHaveText('Registered customer');
});

test('property deep link, confirmed booking and separate-person cash verification work end to end', async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  await login(page);
  await page.goto('/bookings/new?unitId=' + fixture.unitId);
  await expect(page.getByLabel('Property', { exact: true })).toContainText('A-032');
  await chooseOption(page.getByLabel('Customer', { exact: true }), fixture.customerId);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const created = page.waitForResponse(
    (r) => r.url().endsWith('/bookings') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Confirm Booking', exact: true }).click();
  const result = (await (await created).json()).data;
  expect(result.booking.status).toBe('CONFIRMED');
  await expect(page.getByRole('heading', { name: 'Booking Created Successfully' })).toBeVisible();
  await page.goto('/collections');
  await page.getByRole('button', { name: 'Add payment', exact: true }).click();
  const d = page.getByRole('dialog');
  await chooseOption(d.getByLabel('Booking *', { exact: true }), result.booking.id);
  await d.getByLabel('Payment amount').fill('1000.01');
  await chooseOption(d.getByLabel('Payment method *', { exact: true }), 'CASH');
  await d
    .getByLabel('Payment date and time')
    .fill(new Date(Date.now() - 86400000).toISOString().slice(0, 16));
  const received = page.waitForResponse(
    (r) => r.url().endsWith('/payments') && r.request().method() === 'POST',
  );
  await submit(page);
  const payment = (await (await received).json()).data;
  expect(payment.status).toBe('PENDING');
  const approverContext = await browser.newContext({ baseURL: 'http://localhost:3100' });
  const approver = await approverContext.newPage();
  await login(approver, 'approver@frontend.test');
  await approver.goto('/collections?record=' + payment.id);
  await approver.getByRole('button', { name: 'Verify payment', exact: true }).click();
  const review = approver.getByRole('dialog').last();
  await chooseOption(review.getByLabel(/^Decision/), 'CLEARED');
  await review.getByLabel(/^Reason/).fill('Cash counted and checked');
  await submit(approver);
  await expect(approver.getByRole('dialog').getByText('Cleared', { exact: true })).toBeVisible();
  await approverContext.close();
  await page.goto('/bookings?record=' + result.booking.id);
  await page.getByRole('button', { name: 'Retract booking', exact: true }).click();
  const retract = page.getByRole('dialog', {
    name: 'Unassign Property & Retract Booking',
    exact: true,
  });
  await expect(retract).toContainText('1,000.01');
  await retract.getByRole('button', { name: 'Custom Return Price Bracket', exact: false }).click();
  await retract.getByLabel('Customer Return Amount').fill('900.01');
  const cancelled = page.waitForResponse(
    (r) => r.url().endsWith('/unassign') && r.request().method() === 'POST',
  );
  await retract.getByRole('button', { name: 'Confirm Unassign & Retract' }).click();
  expect((await cancelled).ok()).toBe(true);
  await expect(retract).toHaveCount(0);
  await expect(
    page.getByRole('dialog').getByText('Cancelled', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retract booking', exact: true })).toHaveCount(0);
});

test('reports produce a real downloadable export and documents accept a real upload', async ({
  page,
}) => {
  await login(page);
  await page.goto('/reports?kind=inventory');
  await expect(page.getByRole('heading', { name: 'Reporting center' })).toBeVisible();
  const download = page.waitForEvent('download', { timeout: 45000 });
  await page.getByRole('button', { name: 'Export PDF' }).click();
  expect((await download).suggestedFilename()).toMatch(/pdf/i);
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload document', exact: true }).click();
  await page
    .getByRole('dialog')
    .locator('input[type=file]')
    .setInputFiles({
      name: 'test-record.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7S8AAAAASUVORK5CYII=',
        'base64',
      ),
    });
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Upload document', exact: true })
    .click();
  await expect(page.getByText('test-record.png', { exact: true })).toBeVisible();
});
test('limited users cannot see write actions or open financial workspaces', async ({ page }) => {
  await login(page, 'reader@frontend.test');
  await page.goto('/inventory');
  await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add property', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Finance', exact: true })).toHaveCount(0);
  await page.goto('/journals');
  await expect(page.getByText(/Your role does not have access/)).toBeVisible();
});

test('acquisition draft edits retain notes, post investment, list inventory and reverse safely', async ({
  page,
}) => {
  test.setTimeout(120000);
  await login(page);
  await page.goto('/property-purchases');
  await page.getByRole('button', { name: 'Add property purchase', exact: true }).click();
  let d = page.getByRole('dialog');
  await d.getByText('Custom / Unlisted Land Parcel', { exact: true }).click();
  await d.getByLabel('Property Title / Description').fill('Browser acquisition');
  await d.getByLabel('Location / Site Details').fill('Lahore');
  await d.getByLabel('Agreement / File Reference').fill('BROWSER-DEED-' + Date.now());
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await d.getByLabel('Seller / Landowner').selectOption(fixture.vendorId);
  await d.getByLabel('Agreed Purchase Price').fill('123456.78');
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await d.locator('textarea').fill('Keep this original agreement note');
  const created = page.waitForResponse(
    (r) => r.url().endsWith('/property-purchases') && r.request().method() === 'POST',
  );
  await d.getByRole('button', { name: 'Save Draft Acquisition' }).click();
  const purchase = (await (await created).json()).data;
  expect(purchase.total).toBe('123456.78');
  await page.goto('/property-purchases?record=' + purchase.id);
  await page.getByRole('button', { name: 'Edit property purchase', exact: true }).click();
  d = page.getByRole('dialog', { name: 'Edit Property Purchase Draft', exact: true });
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await d.getByLabel('Acquisition brokerage').fill('0.22');
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await expect(d.locator('textarea')).toHaveValue('Keep this original agreement note');
  await d.getByRole('button', { name: 'Update Draft Acquisition' }).click();
  await expect(d).toHaveCount(0);
  await page.goto('/property-purchases?record=' + purchase.id);
  await page.getByRole('button', { name: 'Post purchase', exact: true }).click();
  d = page.getByRole('dialog', { name: 'Post purchase', exact: true });
  await expect(d).toContainText('123,457.00');
  await d.getByRole('button', { name: 'Post purchase', exact: true }).click();
  await expect(d).toHaveCount(0);
  await page.goto('/property-purchases?record=' + purchase.id);
  await page.getByRole('button', { name: 'List for sale', exact: true }).click();
  d = page.getByRole('dialog').last();
  await d.getByLabel(/Asking price/).fill('150000.01');
  await submit(page);
  await page.goto('/property-purchases?record=' + purchase.id);
  await page.getByRole('button', { name: 'Void purchase', exact: true }).click();
  d = page.getByRole('dialog').last();
  await expect(d.locator('.pw-wizard')).toHaveCount(0);
  await d.getByLabel(/Reason/).fill('Reverse test acquisition before any sale');
  await submit(page);
  await expect(page.getByRole('dialog').getByText('Voided', { exact: true })).toBeVisible();
});

test('finance users can create, review and permanently close an accounting period', async ({
  page,
}) => {
  await login(page);
  await page.goto('/accounting-periods');
  await page.getByRole('button', { name: 'Add accounting period', exact: true }).click();
  let d = page.getByRole('dialog');
  await d.getByLabel(/Start date/i).fill('2091-01-01');
  await d.getByLabel(/End date/i).fill('2091-12-31');
  await submit(page);
  await page
    .getByRole('button', { name: /Actions for/ })
    .first()
    .click();
  await page.getByRole('menuitem', { name: 'Lock period' }).click();
  d = page.getByRole('dialog');
  await expect(d).toContainText('Closing this accounting period is permanent.');
  await d.getByRole('button', { name: 'Lock period', exact: true }).click();
  await expect(d.getByText('Saved to your project')).toBeVisible();
});
