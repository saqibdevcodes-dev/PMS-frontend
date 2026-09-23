import { test, expect, _electron } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

test('Windows desktop signs in, restores its encrypted session and signs out', async () => {
  test.setTimeout(120000);
  const fixture = JSON.parse(await readFile('test-results/fixture.json', 'utf8'));
  const profile = path.resolve('test-results/electron-profile');
  await mkdir(profile, { recursive: true });
  const launch = () =>
    _electron.launch({
      args: ['.'],
      env: {
        ...process.env,
        PMS_DESKTOP_SMOKE: '1',
        PMS_DESKTOP_API_URL: 'http://127.0.0.1:4100/api/v1',
      },
      cwd: process.cwd(),
    });
  let application = await launch();
  try {
    let page = await application.firstWindow();
    await page.getByLabel('Email address', { exact: true }).fill('manager@frontend.test');
    await page.getByLabel('Password', { exact: true }).fill(fixture.password);
    await page.getByRole('button', { name: 'Sign in to workspace' }).click();
    await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toMatch(
      /refreshToken|accessToken|eyJ/,
    );
    const encrypted = await readFile(path.join(profile, 'session.encrypted'));
    expect(encrypted.length).toBeGreaterThan(40);
    expect(encrypted.toString('utf8')).not.toContain('eyJ');
    expect(await page.evaluate(() => 'require' in window || 'process' in window)).toBe(false);
    await page.screenshot({ path: 'test-results/overview-windows.png' });
    await application.close();
    application = await launch();
    page = await application.firstWindow();
    await expect(page.getByRole('heading', { name: 'Portfolio overview' })).toBeVisible();
    await page.getByRole('button', { name: /My account & sessions/ }).click();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign in to workspace' })).toBeVisible();
    await expect
      .poll(async () =>
        readFile(path.join(profile, 'session.encrypted')).then(
          () => true,
          () => false,
        ),
      )
      .toBe(false);
  } finally {
    await application.close();
  }
});
