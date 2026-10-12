import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { chooseOption } from '../support/select';
type Fixture = {
  projectId: string;
  customerId: string;
  unitId: string;
  planVersionId: string;
  cashId: string;
  password: string;
};
let fixture: Fixture;
test.beforeAll(async () => {
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
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await dialog.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect(dialog.getByText('Saved to your project')).toBeVisible();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
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
  await page.getByRole('textbox', { name: 'Search Inventory' }).fill('A-005');
  await expect(page.getByText('A-005', { exact: true })).toBeVisible();
  await expect(page.getByText('A-001', { exact: true })).toHaveCount(0);
  await page.getByText('A-005', { exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Card view' }).click();
  await expect(page.locator('.unit-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Bulk import units' }).click();
  await page
    .getByRole('dialog')
    .locator('input[type=file]')
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
  await page.getByRole('textbox', { name: 'Search Inventory' }).fill('UI-CSV-001');
  await expect(page.getByText('UI-CSV-001', { exact: true })).toBeVisible();
});
test('customer creation validates required fields and saves an actual record', async ({ page }) => {
  await login(page);
  await page.goto('/customers');
  await page.getByRole('button', { name: 'New customer', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Review changes' }).click();
  await expect(dialog.locator('.field-error').first()).toBeVisible();
  await dialog.getByLabel(/^Name/).fill('Browser Test Customer');
  await dialog.getByLabel(/^Phone/).fill('+923001239999');
  await dialog.getByLabel(/^Identity/).fill('TEST-CUSTOMER-0001');
  await submit(page);
  await expect(page.getByText('Browser Test Customer', { exact: true })).toBeVisible();
});
test('booking, separate-person approval, payment verification and confirmation work end to end', async ({
  page,
  browser,
}) => {
  test.setTimeout(150000);
  await login(page);
  await page.goto('/bookings/new');
  await chooseOption(page.getByLabel('Customer *', { exact: true }), fixture.customerId);
  await chooseOption(page.getByLabel('Property *', { exact: true }), fixture.unitId);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Reserve this property' }).click();
  await expect(page.getByText('Property reserved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await chooseOption(
    page.getByLabel('Payment plan version *', { exact: true }),
    fixture.planVersionId,
  );
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('checkbox').check();
  const created = page.waitForResponse(
    (r) => r.url().endsWith('/bookings') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Submit booking for approval' }).click();
  const result = (await (await created).json()).data;
  expect(result.booking.status).toBe('DRAFT');
  await expect(page.getByRole('heading', { name: 'A new chapter, started.' })).toBeVisible();
  await page.goto('/approvals?record=' + result.approval.id);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review approval', exact: true })).toHaveCount(0);
  const approverContext = await browser.newContext({ baseURL: 'http://localhost:3100' });
  const approver = await approverContext.newPage();
  await login(approver, 'approver@frontend.test');
  await approver.goto('/approvals?record=' + result.approval.id);
  await approver.getByRole('button', { name: 'Review approval', exact: true }).click();
  await chooseOption(
    approver
      .getByRole('dialog')
      .last()
      .getByLabel(/^Decision/),
    'APPROVE',
  );
  await approver
    .getByRole('dialog')
    .last()
    .getByLabel(/^Comment/)
    .fill('Reviewed the customer and booking terms');
  await submit(approver);
  await page.goto('/collections');
  await page.getByRole('button', { name: 'New payment', exact: true }).click();
  const form = page.getByRole('dialog');
  await chooseOption(form.getByLabel(/^Booking id/), result.booking.id);
  await form.getByLabel(/^Amount/).fill(result.booking.downPayment);
  await chooseOption(form.getByLabel(/^Method/), 'CASH');
  await form.getByLabel(/^Paid at/).fill('2026-09-23T10:00');
  await chooseOption(form.getByLabel(/^Receiving account id/), fixture.cashId);
  const paymentResponse = page.waitForResponse(
    (r) => r.url().endsWith('/payments') && r.request().method() === 'POST',
  );
  await submit(page);
  const payment = (await (await paymentResponse).json()).data;
  await approver.goto('/collections?record=' + payment.id);
  await approver.getByRole('button', { name: 'Verify payment', exact: true }).click();
  await chooseOption(
    approver
      .getByRole('dialog')
      .last()
      .getByLabel(/^Decision/),
    'CLEARED',
  );
  await approver
    .getByRole('dialog')
    .last()
    .getByLabel(/^Reason/)
    .fill('Cash counted and checked');
  await submit(approver);
  await page.goto('/bookings?record=' + result.booking.id);
  await page.getByRole('button', { name: 'Confirm booking', exact: true }).click();
  await chooseOption(
    page
      .getByRole('dialog')
      .last()
      .getByLabel(/^Approval id/),
    result.approval.id,
  );
  await submit(page);
  await expect(page.getByRole('dialog').getByText('Confirmed', { exact: true })).toBeVisible();
  await approverContext.close();
});
test('reports produce a real downloadable export and documents accept a real upload', async ({
  page,
}) => {
  await login(page);
  await page.goto('/reports?kind=inventory');
  await expect(page.getByRole('heading', { name: 'Reporting center' })).toBeVisible();
  await page.getByRole('button', { name: 'Export PDF' }).click();
  await expect(page.getByRole('button', { name: 'Download', exact: true })).toBeEnabled({
    timeout: 45000,
  });
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/pdf/i);
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload document', exact: true }).click();
  await page.getByLabel('Choose document').setInputFiles({
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
  await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New unit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Finance', exact: true })).toHaveCount(0);
  await page.goto('/finance');
  await expect(page.getByText(/Your role does not have access/)).toBeVisible();
});
