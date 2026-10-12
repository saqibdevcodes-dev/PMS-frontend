import { test, expect, type Page } from '@playwright/test';
import { chooseOption } from '../support/select';
const originalPhotoId = '00000000-0000-4000-8000-000000000080';
const updatedPhotoId = '00000000-0000-4000-8000-000000000081';
const portrait =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="#dce7f1"/><circle cx="64" cy="47" r="23" fill="#647c92"/><path d="M20 128v-15a44 44 0 0 1 88 0v15" fill="#647c92"/></svg>',
  );
const profilePhoto = {
  name: 'profile.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1cAAAAASUVORK5CYII=',
    'base64',
  ),
};
const project = {
  id: 'project-a',
  name: 'Etihad Garden',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
};
const position = {
  bookings: 1,
  total: '4500000.00',
  paid: '1250000.00',
  outstanding: '3250000.00',
  overdue: '0.00',
  advanceCredit: '0.00',
};
const booking = {
  id: 'booking-a',
  reference: 'BK-000042',
  status: 'CONFIRMED',
  total: '4500000.00',
  downPayment: '900000.00',
  createdAt: '2026-01-01T00:00:00Z',
  confirmedAt: '2026-01-03T00:00:00Z',
  unit: {
    number: 'A-104',
    type: 'RESIDENTIAL_PLOT',
    phase: 'Phase 1',
    block: 'A',
    floor: null,
    size: '125',
    measurementUnit: 'sq yd',
    status: 'BOOKED',
    project,
  },
  position,
};
const list = (items: unknown[]) => ({
  items,
  pagination: { page: 1, limit: 12, total: items.length, totalPages: 1 },
});
async function mockApi(
  page: Page,
  options: { authenticated?: boolean; staff?: boolean; photo?: boolean; failPhoto?: boolean } = {
    authenticated: true,
  },
) {
  const requests: string[] = [];
  let photoId: string | null = options.photo ? originalPhotoId : null;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    requests.push(path);
    let data: unknown = {};
    let status = 200;
    if (path === '/auth/refresh') {
      if (options.authenticated) data = { accessToken: 'fixture-token' };
      else status = 401;
    } else if (path === '/auth/me')
      data = {
        id: 'customer-user',
        name: 'Ayesha Ahmed',
        email: 'ayesha@example.invalid',
        accountType: options.staff ? 'STAFF' : 'CUSTOMER',
        permissions: options.staff
          ? ['projects.read', 'customers.read', 'customers.portal.manage']
          : [],
        projects: options.staff ? [{ projectId: 'project-a' }] : [],
      };
    else if (path === '/portal/account')
      data = {
        id: 'customer-user',
        name: 'Ayesha Ahmed',
        email: 'ayesha@example.invalid',
        photoId,
      };
    else if (path === '/portal/profile/photo') {
      if (options.failPhoto) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'STORAGE_UNAVAILABLE',
              message: 'Photo storage is temporarily unavailable. Please try again.',
            },
          }),
        });
        return;
      }
      expect(route.request().postData()).not.toContain('name="userId"');
      expect(route.request().postData()).not.toContain('name="purpose"');
      photoId = updatedPhotoId;
      data = { id: photoId, name: 'profile.png', mime: 'image/png', size: 68 };
    } else if (path.startsWith('/images/'))
      data = { url: portrait, name: 'profile.png', expiresIn: 120 };
    else if (path === '/portal/dashboard')
      data = {
        accounts: [{ project, ...position }],
        asOf: '2026-10-03T10:00:00Z',
        upcoming: [
          {
            id: 'inst-a',
            bookingId: booking.id,
            reference: booking.reference,
            label: 'October installment',
            dueDate: '2026-10-15T00:00:00Z',
            outstanding: '125000.00',
            currency: 'PKR',
            projectName: project.name,
          },
        ],
      };
    else if (path === '/portal/bookings') data = list([booking]);
    else if (path === '/portal/bookings/booking-a') data = booking;
    else if (path === '/portal/installments')
      data = list([
        {
          id: 'inst-a',
          label: 'October installment',
          dueDate: '2026-10-15T00:00:00Z',
          amount: '125000.00',
          paid: '0.00',
          outstanding: '125000.00',
          booking,
        },
      ]);
    else if (path === '/portal/payments')
      data = list([
        {
          id: 'pay-a',
          amount: '125000.00',
          method: 'BANK_TRANSFER',
          paidAt: '2026-09-15T10:00:00Z',
          status: 'CLEARED',
          booking,
          receipt: { reference: 'RCP-00102', createdAt: '2026-09-16T00:00:00Z', reversedAt: null },
        },
      ]);
    else if (path === '/portal/documents')
      data = list([
        {
          id: 'doc-a',
          name: 'Booking confirmation.pdf',
          mime: 'application/pdf',
          size: 54000,
          createdAt: '2026-01-03T00:00:00Z',
          project,
        },
      ]);
    else if (path === '/portal/requests')
      data = list([{ id: 'request-a', reference: 'NDC-001', status: 'PENDING', booking }]);
    else if (path === '/portal/notifications')
      data = list([
        {
          id: 'notice-a',
          title: 'Payment receipt',
          body: 'Your payment was verified.',
          createdAt: '2026-09-16T00:00:00Z',
          readAt: null,
        },
      ]);
    else if (path === '/portal/profile')
      data = list([
        {
          id: 'customer-a',
          name: 'Ayesha Ahmed',
          reference: 'CUST-001',
          phone: '03001234567',
          email: 'ayesha@example.invalid',
          address: 'Lahore',
          project,
        },
      ]);
    else if (path === '/auth/sessions') data = [];
    else if (path === '/portal/activate') {
      const body = route.request().postDataJSON();
      expect(body.token).toBe('i'.repeat(64));
      data = { activated: true, email: 'ayesha@example.invalid' };
    } else if (path.endsWith('/portal/invite')) data = { status: 'PENDING' };
    else if (path.endsWith('/portal'))
      data = { status: 'NOT_ACTIVE', email: 'ayesha@example.invalid', expiresAt: null };
    else if (path === '/projects') data = list([project]);
    else if (path === '/projects/project-a/customers')
      data = list([
        {
          id: 'customer-a',
          name: 'Ayesha Ahmed',
          reference: 'CUST-001',
          email: 'ayesha@example.invalid',
          phone: '03001234567',
        },
      ]);
    else if (path === '/projects/project-a/customers/customer-a')
      data = {
        id: 'customer-a',
        name: 'Ayesha Ahmed',
        reference: 'CUST-001',
        email: 'ayesha@example.invalid',
      };
    else if (path === '/compatibility')
      data = { apiVersion: 'v1', minimumClientVersion: '1.0.0', platforms: ['web'] };
    else if (path === '/notifications') data = list([]);
    else if (path.endsWith('/read') || path === '/auth/logout')
      data = { read: true, loggedOut: true };
    else {
      status = 404;
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        status === 200
          ? { success: true, data }
          : {
              success: false,
              error: { code: 'NOT_FOUND', message: 'Fixture endpoint not configured.' },
            },
      ),
    });
  });
  return requests;
}
test('customer dashboard, booking detail, receipts, and navigation', async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto('/portal');
  await expect(page.getByRole('heading', { name: 'Hello, Ayesha.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Etihad Garden', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/portal/desktop-dashboard.png', fullPage: true });
  await page.getByRole('link', { name: 'My properties', exact: true }).click();
  await page
    .getByRole('link')
    .filter({ has: page.getByRole('heading', { name: 'Unit A-104' }) })
    .click();
  await expect(page.getByRole('heading', { name: 'Booking summary' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Account statement' })).toBeVisible();
  await page.getByRole('button', { name: 'Payments', exact: true }).click();
  await page.getByRole('button', { name: 'RCP-00102' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('BANK_TRANSFER', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Print / save PDF' })).toBeVisible();
  expect(requests.some((path) => path.startsWith('/projects'))).toBe(false);
});
test('customer cannot open staff routes and the portal fits a mobile viewport', async ({
  page,
}) => {
  const requests = await mockApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/users');
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByRole('heading', { name: 'Hello, Ayesha.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/portal/mobile-dashboard.png', fullPage: true });
  expect(requests.some((path) => path.startsWith('/projects') || path === '/users')).toBe(false);
});
test('invitation activation removes the secret fragment and validates matching passwords', async ({
  page,
}) => {
  await mockApi(page, { authenticated: false });
  await page.goto('/portal/activate#token=' + 'i'.repeat(64));
  await expect(page.getByLabel('Invitation code')).toHaveValue('i'.repeat(64));
  await expect(page).toHaveURL(/\/portal\/activate$/);
  await page.getByLabel('Password', { exact: true }).fill('Customer-Password-123');
  await page.getByLabel('Confirm password').fill('Different-Password-123');
  await page.getByRole('button', { name: 'Activate customer access' }).click();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();
  await page.getByLabel('Confirm password').fill('Customer-Password-123');
  await page.getByRole('button', { name: 'Activate customer access' }).click();
  await expect(page.getByRole('heading', { name: 'You’re ready to sign in.' })).toBeVisible();
});
test('customer documents, requests, profile, and notifications render', async ({ page }) => {
  await mockApi(page);
  await page.goto('/portal/documents');
  await expect(page.getByRole('heading', { name: 'Booking confirmation.pdf' })).toBeVisible();
  await page.getByRole('link', { name: 'Request status', exact: true }).click();
  await expect(page.getByText('NDC-001')).toBeVisible();
  await page.getByRole('link', { name: 'Notifications', exact: true }).click();
  await page.getByRole('button', { name: 'Mark read' }).click();
  await page.getByRole('link', { name: 'My account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My customer profiles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible();
});

test('staff can invite a customer from their record', async ({ page }) => {
  const requests = await mockApi(page, { authenticated: true, staff: true });
  await page.goto('/customers?record=customer-a');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Customer portal access' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Invite customer' }).click();
  await expect(dialog.getByRole('status')).toHaveText(
    'Invitation queued for email delivery. The customer has 48 hours to activate access.',
  );
  expect(requests).toContain('/projects/project-a/customers/customer-a/portal/invite');
});

test('customers can change language in the header and My Account, with persistent RTL and no sessions panel', async ({
  page,
}) => {
  const requests = await mockApi(page, { authenticated: true, photo: true });
  await page.goto('/portal');
  await expect(page.getByRole('img', { name: 'Profile photo of Ayesha Ahmed' })).toHaveCount(2);
  await expect(page.locator('input[type=file]')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/portal/customer-photo-desktop.png', fullPage: true });
  expect(
    await page
      .locator('.portal-header .portal-avatar')
      .evaluate((el) => getComputedStyle(el).borderRadius),
  ).toBe('50%');
  await chooseOption(page.locator('.portal-header').getByRole('combobox'), 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.goto('/portal/profile');
  await expect(page.getByRole('combobox')).toHaveCount(2);
  await page.screenshot({ path: 'test-results/portal/customer-account-rtl.png', fullPage: true });
  await chooseOption(page.locator('.portal-account-settings').getByRole('combobox'), 'en');
  await expect(page.locator('.portal-header').getByRole('combobox')).toHaveText('English');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Active & recent sessions' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible();
  expect(requests).not.toContain('/auth/sessions');
});

for (const width of [320, 390]) {
  test(`customer sidebar at ${width}px replaces the scrolling menu and closes on Escape or navigation`, async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, photo: true });
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/portal');
    await expect(page.getByRole('heading', { name: 'Hello, Ayesha.' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Profile photo of Ayesha Ahmed' })).toHaveCount(2);
    await expect(page.getByRole('navigation', { name: 'Customer portal' })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `test-results/portal/customer-header-${width}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Customer portal' });
    await expect(menu).toBeVisible();
    const first = await menu.getByRole('link', { name: 'Overview', exact: true }).boundingBox();
    const second = await menu
      .getByRole('link', { name: 'My properties', exact: true })
      .boundingBox();
    expect(second!.y).toBeGreaterThan(first!.y + first!.height);
    await page.screenshot({ path: `test-results/portal/customer-sidebar-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await menu.getByRole('link', { name: 'My account', exact: true }).click();
    await expect(page).toHaveURL(/\/portal\/profile$/);
    await expect(menu).toHaveCount(0);
    await expect(page.getByLabel('Profile photo', { exact: true })).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('customer portal keeps its sidebar and rounded photos on tablet, with a right-side mobile drawer in Arabic', async ({
  page,
}) => {
  await mockApi(page, { authenticated: true, photo: true });
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/portal');
  await expect(page.getByRole('navigation', { name: 'Customer portal' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Profile photo of Ayesha Ahmed' })).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/portal/customer-tablet.png', fullPage: true });
  await chooseOption(page.locator('.portal-header').getByRole('combobox'), 'ar');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'افتح القائمة' }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  const box = await drawer.boundingBox();
  expect(box!.x + box!.width).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/portal/customer-sidebar-rtl.png' });
  await page.mouse.click(20, 400);
  await expect(drawer).toHaveCount(0);
});

test('customer updates their photo only from My Account and sees it in the header and dashboard', async ({
  page,
}) => {
  const requests = await mockApi(page, { authenticated: true, photo: true });
  await page.goto('/portal/profile');
  await page
    .getByLabel('Profile photo', { exact: true })
    .setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') });
  await expect(page.getByRole('alert')).toContainText(
    'Choose a JPEG, PNG or WebP image up to 5 MiB.',
  );
  expect(requests).not.toContain('/portal/profile/photo');
  await page.getByLabel('Profile photo', { exact: true }).setInputFiles(profilePhoto);
  await expect(page.getByText('Profile photo updated', { exact: true })).toBeVisible();
  await expect.poll(() => requests.includes('/images/' + updatedPhotoId)).toBe(true);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Profile photo of Ayesha Ahmed' })).toHaveCount(2);
  await expect(page.locator('input[type=file]')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('img', { name: 'Profile photo of Ayesha Ahmed' })).toHaveCount(2);
  expect(requests.filter((path) => path === '/portal/profile/photo')).toHaveLength(1);
});

test('a failed customer photo upload retains the saved photo', async ({ page }) => {
  const requests = await mockApi(page, { authenticated: true, photo: true, failPhoto: true });
  await page.goto('/portal/profile');
  await page.getByLabel('Profile photo', { exact: true }).setInputFiles(profilePhoto);
  await expect(page.getByRole('alert')).toContainText(
    'Photo storage is temporarily unavailable. Please try again.',
  );
  await expect(page.locator('.portal-header').getByRole('img')).toBeVisible();
  expect(requests).toContain('/images/' + originalPhotoId);
  expect(requests).not.toContain('/images/' + updatedPhotoId);
});
