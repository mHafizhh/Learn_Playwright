// npx playwright test tests/login.test.js
const { test, expect } = require('@playwright/test');

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://mystoryapp-dicoding.netlify.app/');
    await page.getByRole('link', { name: 'Login', exact: true }).first().click();
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('Login page should contain login form', async ({ page }) => {
    const emailField = page.getByLabel('Email');
    await expect(emailField).toBeVisible();

    const passwordField = page.getByLabel('Password');
    await expect(passwordField).toBeVisible();

    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeVisible();
  });

  test('Should not submit when email is empty', async ({ page }) => {
    await page.getByLabel('Email').fill('');
    await page.getByLabel('Password').fill('validpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('Should not submit when password is empty', async ({ page }) => {
    await page.getByLabel('Email').fill('valid@gmail.com');
    await page.getByLabel('Password').fill('');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('Login should show validation for invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Format email tidak valid')).toBeVisible();
  });

  test('Login should validate short password', async ({ page }) => {
    await page.getByLabel('Email').fill('user@mail.com');
    await page.getByLabel('Password').fill('123'); // terlalu pendek
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Password minimal 8 karakter')).toBeVisible();
  });

  test('Should login successfully with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('sewarasajk90@gmail.com');
    await page.getByLabel('Password').fill('24242424');
    await page.getByRole('button', { name: 'Login' }).click();

    const loginError = await page.locator('text=Email atau password salah').isVisible({ timeout: 5000 });
    if (loginError) {
      throw new Error('Login gagal: kredensial salah atau server bermasalah');
    }

    await page.waitForURL('**/#/');
    await expect(page.locator('text=Selamat Datang')).toBeVisible();
  });

  test('Should logout successfully and return to landing page', async ({ page }) => {
  await page.getByRole('link', { name: 'Login', exact: true }).first().click();
  await expect(page).toHaveURL(/#\/login$/);

  // Login terlebih dahulu
  await page.getByLabel('Email').fill('sewarasajk90@gmail.com');
  await page.getByLabel('Password').fill('24242424');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/#\/$/, { timeout: 15000 });
  await expect(page.locator('text=Selamat Datang')).toBeVisible();

  // Klik tombol logout
  await page.waitForSelector('text=Logout');
  await page.click('text=Logout');

  // ✅ Verifikasi bahwa kita kembali ke landing page, bukan login
  await page.waitForURL(/#\/$/, { timeout: 15000 });
  await expect(page.locator('text=Selamat Datang')).toBeVisible();

  // ✅ Tambahan verifikasi: tombol login muncul kembali
  await expect(page.locator('.login-link')).toBeVisible();
});
});
