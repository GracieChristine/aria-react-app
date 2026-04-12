import { test, expect } from '@playwright/test';

const ts = Date.now();
const email = `profile-user-${ts}@aria.com`;
const newEmail = `updated-profile-user-${ts}@aria.com`;
const password = 'Password123!';
const newPassword = 'NewPassword123!';

test.describe('Profile', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/register', {
      data: { firstName: 'Profile', lastName: 'User', email, password },
    });
  });

  test.describe('Access control', () => {
    test('should redirect unauthenticated users from /profile to /login @smoke', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/profile');
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
    });

    test('should navigate to /profile when clicking the navbar name link @smoke', async ({ page }) => {
      await page.locator('nav button', { hasText: 'Profile User' }).click();
      await page.locator('nav a', { hasText: 'Profile' }).click();
      await expect(page).toHaveURL('/profile');
    });
  });

  test.describe('Profile section', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
      await page.goto('/profile');
    });

    test('should display profile in read-only view by default @smoke', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(page.locator('form')).toBeHidden();
      await expect(page.locator('span:has-text("Profile User")')).toBeVisible();
      await expect(page.locator(`span:has-text("${email}")`)).toBeVisible();
    });

    test('should switch to edit mode when Edit is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();

      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('label:has-text("First name") + input')).toHaveValue('Profile');
      await expect(page.locator('label:has-text("Last name") + input')).toHaveValue('User');
      await expect(page.locator('label:has-text("Email address") + input')).toHaveValue(email);
    });

    // NOTE: the following 4 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    test('should show an error if first name is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("First name") + input').clear();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.getByText('First name is required.')).toBeVisible();
    });

    test('should show an error if last name is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("Last name") + input').clear();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.getByText('Last name is required.')).toBeVisible();
    });

    test('should show an error if email is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("Email address") + input').clear();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.getByText('Email is required.')).toBeVisible();
    });

    test('should show an error if email is invalid', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("Email address") + input').fill('notanemail');
      await page.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    });

    test('should return to read-only view when Cancel is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("First name") + input').fill('Changed');
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(page.locator('form')).toBeHidden();
      await expect(page.locator('span:has-text("Profile User")')).toBeVisible();
    });

    test('should save profile changes and update the navbar name @smoke', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.locator('label:has-text("First name") + input').fill('Updated');
      await page.locator('label:has-text("Email address") + input').fill(newEmail);
      await page.locator('label:has-text("Phone") + input').fill('555-555-5555');
      await page.locator('label:has-text("Bio") + textarea').fill("I'm just a test user.");
      await page.getByRole('button', { name: 'Save changes' }).click();

      await expect(page.locator('form')).toBeHidden();
      await expect(page.locator('span:has-text("Updated User")')).toBeVisible();
      await expect(page.locator(`span:has-text("${newEmail}")`)).toBeVisible();
      await expect(page.locator('span:has-text("555-555-5555")')).toBeVisible();
      await expect(page.locator('nav button:has-text("Updated User")')).toBeVisible();

      await page.getByRole('button', { name: 'Logout' }).click();
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(newEmail);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
      await expect(page.locator('nav button:has-text("Updated User")')).toBeVisible();
    });
  });

  test.describe('Password section', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(newEmail);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
      await page.goto('/profile');
      await page.getByRole('button', { name: 'Password' }).click();
    });

    // NOTE: the following 4 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    test('should show an error if current password is empty', async ({ page }) => {
      await page.locator('label:text-is("New password") + input').fill(newPassword);
      await page.locator('label:has-text("Confirm new password") + input').fill(newPassword);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Current password is required.')).toBeVisible();
    });

    test('should show an error if new password is empty', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill(password);
      await page.locator('label:has-text("Confirm new password") + input').fill(newPassword);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('New password is required.')).toBeVisible();
    });

    test('should show an error if new password is less than 8 characters', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill(password);
      await page.locator('label:text-is("New password") + input').fill('short');
      await page.locator('label:has-text("Confirm new password") + input').fill('short');
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
    });

    test('should show an error if confirm password is empty', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill(password);
      await page.locator('label:text-is("New password") + input').fill(newPassword);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Please confirm your new password.')).toBeVisible();
    });

    test('should show an error if new passwords do not match', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill(password);
      await page.locator('label:text-is("New password") + input').fill(newPassword);
      await page.locator('label:has-text("Confirm new password") + input').fill('123NewPassword!');
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('New passwords do not match.')).toBeVisible();
    });

    test('should show an error if current password is incorrect @smoke', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill('123Password!');
      await page.locator('label:text-is("New password") + input').fill(newPassword);
      await page.locator('label:has-text("Confirm new password") + input').fill(newPassword);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Current password is incorrect.')).toBeVisible();
    });

    test('should successfully update the password @smoke', async ({ page }) => {
      await page.locator('label:has-text("Current password") + input').fill(password);
      await page.locator('label:text-is("New password") + input').fill(newPassword);
      await page.locator('label:has-text("Confirm new password") + input').fill(newPassword);
      await page.getByRole('button', { name: 'Update password' }).click();
      await expect(page.getByText('Password updated successfully.')).toBeVisible();

      await page.getByRole('button', { name: 'Logout' }).click();
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(newEmail);
      await page.locator('input[name="password"]').fill(newPassword);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
      await expect(page.locator('nav button:has-text("Updated User")')).toBeVisible();
    });
  });

  // NOTE: the following needs to be implemented first before this can be tested.
  test.describe('Become a host section', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(newEmail);
      await page.locator('input[name="password"]').fill(newPassword);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/');
      await page.goto('/profile');
      await page.getByRole('button', { name: 'Become a host' }).click();
    });

    test('', async () => { });
  });
});
