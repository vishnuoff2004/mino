import { test, expect } from '@playwright/test';

test.describe('Authentication and Navigation E2E tests', () => {
  test('should redirect unauthenticated users from dashboard to login page', async ({ page }) => {
    // Attempt to access protected dashboard page
    await page.goto('/dashboard');

    // Should be automatically redirected to the login route
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify login page elements are visible
    const loginHeader = page.locator('h2', { hasText: 'Welcome back' });
    await expect(loginHeader).toBeVisible();

    const emailInput = page.locator('input[placeholder="you@example.com"]');
    await expect(emailInput).toBeVisible();
  });

  test('should show validation errors on login form submission with empty fields', async ({ page }) => {
    await page.goto('/login');

    // Submit the form empty
    await page.click('button[type="submit"]');

    // Check react-hook-form/yup error messages
    const emailError = page.locator('p.error-text', { hasText: 'Email is required' });
    const passwordError = page.locator('p.error-text', { hasText: 'Password must be at least 6 characters' });
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });
});
