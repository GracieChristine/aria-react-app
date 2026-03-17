import { test, expect } from '@playwright/test'

const ts = Date.now()
const email       = `profile-user-${ts}@aria.com`
const newEmail    = `updated-profile-user-${ts}@aria.com`
const password    = 'Password123!'
const newPassword = 'NewPassword123!'

test.describe('Profile', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/register', {
      data: { firstName: 'Profile', lastName: 'User', email, password },
    })
  })

  test.describe('Access control', () => {
    test('should redirect unauthenticated users from /profile to /login @smoke', async ({ page }) => {
      await page.evaluate(() => localStorage.clear())
      await page.goto('/profile')
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => localStorage.clear())
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(email)
      await page.locator('input[name="password"]').fill(password)
      await page.locator('button[type="submit"]').click()
      await expect(page).toHaveURL('/')
    })

    test('should navigate to /profile when clicking the navbar name link @smoke', async ({ page }) => {
      await page.locator('nav a', { hasText: 'Profile User' }).click()
      await expect(page).toHaveURL('/profile')
    })
  })

  test.describe('Profile section', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => localStorage.clear())
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(email)
      await page.locator('input[name="password"]').fill(password)
      await page.locator('button[type="submit"]').click()
      await page.goto('/profile')
    })

    test('should display profile in read-only view by default @smoke', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.locator('form')).toBeHidden()
      await expect(page.locator('span:has-text("Profile User")')).toBeVisible()
      await expect(page.locator(`span:has-text("${email}")`)).toBeVisible()
    })

    test('should switch to edit mode when Edit is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()

      await expect(page.locator('form')).toBeVisible()
      await expect(page.getByLabel('First name')).toHaveValue('Profile')
      await expect(page.getByLabel('Last name')).toHaveValue('User')
      await expect(page.getByLabel('Email address')).toHaveValue(email)
    })

    // NOTE: the following 4 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    test('should show an error if first name is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('First name').clear()
      await page.getByRole('button', { name: 'Save changes' }).click()
      await expect(page.getByText('First name is required.')).toBeVisible()
    })

    test('should show an error if last name is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('Last name').clear()
      await page.getByRole('button', { name: 'Save changes' }).click()
      await expect(page.getByText('Last name is required.')).toBeVisible()
    })

    test('should show an error if email is empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('Email address').clear()
      await page.getByRole('button', { name: 'Save changes' }).click()
      await expect(page.getByText('Email is required.')).toBeVisible()
    })

    test('should show an error if email is invalid', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('Email address').fill('notanemail')
      await page.getByRole('button', { name: 'Save changes' }).click()
      await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
    })

    test('should return to read-only view when Cancel is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('First name').fill('Changed')
      await page.getByRole('button', { name: 'Cancel' }).click()

      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.locator('form')).toBeHidden()
      await expect(page.locator('span:has-text("Profile User")')).toBeVisible()
    })

    test('should save profile changes and update the navbar name @smoke', async ({ page }) => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await page.getByLabel('First name').fill('Updated')
      await page.getByLabel('Email address').fill(newEmail)
      await page.getByLabel('Phone').fill('555-555-5555')
      await page.getByLabel('Bio').fill("I'm just a test user.")
      await page.getByRole('button', { name: 'Save changes' }).click()

      await expect(page.locator('form')).toBeHidden()
      await expect(page.locator('span:has-text("Updated User")')).toBeVisible()
      await expect(page.locator(`span:has-text("${newEmail}")`)).toBeVisible()
      await expect(page.locator('span:has-text("555-555-5555")')).toBeVisible()
      await expect(page.locator('nav a:has-text("Hi, Updated User")')).toBeVisible()

      await page.getByRole('button', { name: 'Logout' }).click()
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(newEmail)
      await page.locator('input[name="password"]').fill(password)
      await page.locator('button[type="submit"]').click()
      await expect(page).toHaveURL('/')
      await expect(page.locator('nav a:has-text("Hi, Updated User")')).toBeVisible()
    })
  })

  test.describe('Password section', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => localStorage.clear())
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(newEmail)
      await page.locator('input[name="password"]').fill(password)
      await page.locator('button[type="submit"]').click()
      await page.goto('/profile')
      await page.getByRole('button', { name: 'Password' }).click()
    })

    // NOTE: the following 4 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    test('should show an error if current password is empty', async ({ page }) => {
      await page.getByLabel('New password').fill(newPassword)
      await page.getByLabel('Confirm new password').fill(newPassword)
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('Current password is required.')).toBeVisible()
    })

    test('should show an error if new password is empty', async ({ page }) => {
      await page.getByLabel('Current password').fill(password)
      await page.getByLabel('Confirm new password').fill(newPassword)
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('New password is required.')).toBeVisible()
    })

    test('should show an error if new password is less than 8 characters', async ({ page }) => {
      await page.getByLabel('Current password').fill(password)
      await page.getByLabel('New password').fill('short')
      await page.getByLabel('Confirm new password').fill('short')
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible()
    })

    test('should show an error if confirm password is empty', async ({ page }) => {
      await page.getByLabel('Current password').fill(password)
      await page.getByLabel('New password').fill(newPassword)
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('Please confirm your new password.')).toBeVisible()
    })

    test('should show an error if new passwords do not match', async ({ page }) => {
      await page.getByLabel('Current password').fill(password)
      await page.getByLabel('New password').fill(newPassword)
      await page.getByLabel('Confirm new password').fill('123NewPassword!')
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('New passwords do not match.')).toBeVisible()
    })

    test('should show an error if current password is incorrect @smoke', async ({ page }) => {
      await page.getByLabel('Current password').fill('123Password!')
      await page.getByLabel('New password').fill(newPassword)
      await page.getByLabel('Confirm new password').fill(newPassword)
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('Current password is incorrect.')).toBeVisible()
    })

    test('should successfully update the password @smoke', async ({ page }) => {
      await page.getByLabel('Current password').fill(password)
      await page.getByLabel('New password').fill(newPassword)
      await page.getByLabel('Confirm new password').fill(newPassword)
      await page.getByRole('button', { name: 'Update password' }).click()
      await expect(page.getByText('Password updated successfully.')).toBeVisible()

      await page.getByRole('button', { name: 'Logout' }).click()
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(newEmail)
      await page.locator('input[name="password"]').fill(newPassword)
      await page.locator('button[type="submit"]').click()
      await expect(page).toHaveURL('/')
      await expect(page.locator('nav a:has-text("Hi, Updated User")')).toBeVisible()
    })
  })

  // NOTE: the following needs to be implemented first before this can be tested.
  test.describe('Become a host section', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => localStorage.clear())
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(newEmail)
      await page.locator('input[name="password"]').fill(newPassword)
      await page.locator('button[type="submit"]').click()
      await page.goto('/profile')
      await page.getByRole('button', { name: 'Become a host' }).click()
    })

    test('', async ({ page }) => {})
  })
})
