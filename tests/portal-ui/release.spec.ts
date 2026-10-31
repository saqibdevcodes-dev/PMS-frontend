import { test, expect, type Page } from '@playwright/test';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const project = {
  id: id(1),
  name: 'Audit project',
  code: 'AUDIT',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
};
const unit = {
  id: id(2),
  number: 'AUD-1',
  type: 'RESIDENTIAL_PLOT',
  size: '5',
  measurementUnit: 'marla',
  price: '1000',
  status: 'BLOCKED',
};
const seller = { id: id(3), name: 'Audit seller', phone: '03001234567', category: 'SELLER' };
const purchase = {
  id: id(4),
  reference: 'PUR-AUDIT',
  title: 'Audit property',
  location: 'Lahore',
  fileReference: 'FILE-AUDIT',
  purchaseDate: '2026-10-20',
  price: '500',
  taxes: '0',
  legalFees: '0',
  brokerage: '0',
  otherCosts: '0',
  expenseItems: [],
  total: '500',
  unitId: unit.id,
  unit,
  vendorId: seller.id,
  vendor: seller,
  status: 'POSTED',
  notes: 'Preserve this original agreement note',
  updatedAt: '2026-10-20T00:00:00Z',
};
const list = (items: unknown[]) => ({
  items,
  pagination: { page: 1, limit: 25, total: items.length, totalPages: 1 },
});
async function setup(page: Page, draft = false) {
  const writes: { path: string; body: Record<string, unknown> }[] = [];
  await page.addInitScript(
    (p) =>
      localStorage.setItem(
        'estate-preferences-v1',
        JSON.stringify({
          state: {
            projectId: p.id,
            projectName: p.name,
            currency: p.currency,
            timezone: p.timezone,
            language: 'en',
          },
          version: 0,
        }),
      ),
    project,
  );
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname.replace('/api/v1', '');
    let data: unknown = {};
    if (req.method() !== 'GET' && path !== '/auth/refresh')
      writes.push({ path, body: req.postDataJSON() });
    if (path === '/auth/refresh') data = { accessToken: 'audit-token' };
    else if (path === '/auth/me')
      data = {
        id: id(9),
        name: 'Audit administrator',
        email: 'audit@example.invalid',
        accountType: 'STAFF',
        permissions: [
          'projects.read',
          'inventory.read',
          'inventory.create',
          'finance.read',
          'finance.post',
          'finance.reverse',
          'reports.read',
          'reports.export',
          'bookings.create',
        ],
        projects: [{ projectId: project.id }],
      };
    else if (path === '/projects') data = list([project]);
    else if (path.endsWith('/property-purchases/' + purchase.id))
      data = { ...purchase, status: draft ? 'DRAFT' : 'POSTED' };
    else if (path.endsWith('/property-purchases')) data = list([purchase]);
    else if (path.endsWith('/units')) data = list([unit]);
    else if (path.endsWith('/vendors')) data = list([seller]);
    else if (path.endsWith('/dealers') || path === '/notifications') data = list([]);
    else if (path.endsWith('/deal-profitability'))
      data = {
        currency: 'PKR',
        deals: [
          {
            id: purchase.id,
            reference: purchase.reference,
            title: purchase.title,
            location: purchase.location,
            purchaseDate: purchase.purchaseDate,
            fileReference: purchase.fileReference,
            status: 'DRAFT',
            seller,
            buyPrice: '500',
            expenses: {
              taxes: '0',
              legalFees: '0',
              brokerage: '0',
              otherCosts: '0',
              items: [],
              total: '0',
            },
            totalCost: '500',
            unit: { ...unit, listedPrice: '1000' },
            dealStatus: 'DRAFT',
            collected: '0',
            buyer: null,
            salePrice: null,
            netProfit: null,
            profitMarginPercent: null,
          },
        ],
      };
    await route.fulfill({ json: { success: true, data } });
  });
  return writes;
}
test('Void purchase opens the reversal form and never the edit wizard', async ({ page }) => {
  await setup(page);
  await page.goto('/property-purchases');
  await page.getByRole('button', { name: 'Actions for PUR-AUDIT' }).click();
  await page.getByRole('menuitem', { name: 'Void purchase' }).click();
  await expect(page.getByRole('dialog', { name: 'Void purchase', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog').locator('.pw-wizard')).toHaveCount(0);
  await expect(page.getByRole('dialog').getByLabel(/Reason/)).toBeVisible();
});

test('List for sale has its own named asking-price form and submits the listing operation', async ({
  page,
}) => {
  const writes = await setup(page);
  await page.goto('/property-purchases');
  await page.getByRole('button', { name: 'Actions for PUR-AUDIT' }).click();
  await page.getByRole('menuitem', { name: 'List for sale', exact: true }).click();
  const d = page.getByRole('dialog', { name: 'List for sale', exact: true });
  await expect(d.locator('.pw-wizard')).toHaveCount(0);
  await d.getByLabel(/Asking price/).fill('1500.25');
  await d.getByRole('button', { name: 'Review changes' }).click();
  await d.getByRole('button', { name: 'Confirm & submit' }).click();
  await expect
    .poll(() => writes.find((w) => w.path.endsWith('/list-for-sale'))?.body.askingPrice)
    .toBe('1500.25');
});
test('lifecycle editing fetches and preserves full purchase metadata', async ({ page }) => {
  const writes = await setup(page, true);
  await page.goto('/property-lifecycle');
  await page.getByRole('button', { name: 'Edit purchase & costs' }).click();
  const d = page.getByRole('dialog');
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await d.getByRole('button', { name: 'Continue to Next Step' }).click();
  await expect(d.locator('textarea')).toHaveValue(purchase.notes);
  await d.getByRole('button', { name: 'Update Draft Acquisition' }).click();
  await expect
    .poll(
      () => writes.find((w) => w.path.endsWith('/property-purchases/' + purchase.id))?.body.notes,
    )
    .toBe(purchase.notes);
});
