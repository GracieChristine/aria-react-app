import { test, expect } from '@playwright/test'

const ts = Date.now()

test.describe('Auth', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Register', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Sign up' }).click()
      await expect(page).toHaveURL('/register')
    })

    // Required field missing input
    test('should error out if required full name missing', async ({ page }) => {
      await page.locator('input[name="name"]').clear()
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Name is required.')).toBeVisible()
    })

    test('should error out if required email missing', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').clear()
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Email is required.')).toBeVisible()
    })

    test('should error out if required password missing', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').clear()
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Password is required.')).toBeVisible()
    })

    test('should error out if required confirm password missing', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').clear()
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Please confirm your password.')).toBeVisible()
    })

    // Required field with invalid input
    test('should error out if email is invalid', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
    })

    test('should error out if password is less than 8 characters', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('short')
      await page.locator('input[name="confirmPassword"]').fill('short')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible()
    })

    test('should error out if confirm password not matching', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('123Password!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Passwords do not match.')).toBeVisible()
    })

    // User is registered
    test('should register a new user and redirect to home @smoke', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Hi, New User')).toBeVisible()
    })

    // User already exists
    test('should error out if user is already registered @smoke', async ({ page }) => {
      await page.locator('input[name="name"]').fill('New User')
      await page.locator('input[name="email"]').fill(`new-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/register')
      await expect(page.getByText('Hi, New User')).not.toBeVisible()
      await expect(page.getByText('Email already registered. Try logging in.')).toBeVisible()
    })
  })

  test.describe('Login', () => {
    test.beforeAll(async ({ request }) => {
      await request.post('/api/auth/register', {
        data: {
          firstName: 'Register',
          lastName: 'User',
          email: `register-user-${ts}@example.com`,
          password: 'Password123!',
        }
      })
    })

    test.beforeEach(async ({ page }) => {
      await page.getByRole('link', { name: 'Log in' }).click()
      await expect(page).toHaveURL('/login')
    })

    // Required field missing input
    test('should error out if required email missing', async ({ page }) => {
      await page.locator('input[name="email"]').clear()
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Hi, Register User')).not.toBeVisible()
      await expect(page.getByText('Email is required.')).toBeVisible()
    })

    test('should error out if required password missing', async ({ page }) => {
      await page.locator('input[name="email"]').fill(`register-user-${ts}@example.com`)
      await page.locator('input[name="password"]').clear()
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Hi, Register User')).not.toBeVisible()
      await expect(page.getByText('Password is required.')).toBeVisible()
    })

    // Required field with invalid input
    test('should error out if email is invalid', async ({ page }) => {
      await page.locator('input[name="email"]').fill(`register-user-${ts}@`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Hi, Register User')).not.toBeVisible()
      await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
    })

    test('should error out if password is incorrect @smoke', async ({ page }) => {
      await page.locator('input[name="email"]').fill(`register-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('123Password!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Hi, Register User')).not.toBeVisible()
      await expect(page.getByText('Incorrect password. Please try again.')).toBeVisible()
    })

    // User isn't registered yet
    test("should error out if user isn't registered yet", async ({ page }) => {
      await page.locator('input[name="email"]').fill(`unregister-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/login')
      await expect(page.getByText('Hi, Unregister User')).not.toBeVisible()
      await expect(page.getByText('No account found with this email. Try registering.')).toBeVisible()
    })

    // User is logged in
    test('should login as a user and redirect to home @smoke', async ({ page }) => {
      await page.locator('input[name="email"]').fill(`register-user-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Hi, Register User')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('should logout as a login user and redirect to home @smoke', async ({ page }) => {
      await page.goto('/register')

      await page.locator('input[name="name"]').fill('Test User 1')
      await page.locator('input[name="email"]').fill(`test-user-1-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Test User 1')).toBeVisible()

      await page.getByRole('button', { name: 'Logout' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Log in')).toBeVisible()
      await expect(page.getByText('Sign up')).toBeVisible()
    })

    test('should logout as a new registered user and redirect to home', async ({ page }) => {
      await page.goto('/register')

      await page.locator('input[name="name"]').fill('Test User 2')
      await page.locator('input[name="email"]').fill(`test-user-2-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('input[name="confirmPassword"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Test User 2')).toBeVisible()

      await page.getByRole('button', { name: 'Logout' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Log in')).toBeVisible()
      await expect(page.getByText('Sign up')).toBeVisible()

      await page.goto('/login')

      await page.locator('input[name="email"]').fill(`test-user-2-${ts}@example.com`)
      await page.locator('input[name="password"]').fill('Password123!')
      await page.locator('button[type="submit"]').click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Test User 2')).toBeVisible()

      await page.getByRole('button', { name: 'Logout' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByText('Log in')).toBeVisible()
      await expect(page.getByText('Sign up')).toBeVisible()
    })
  })
})
