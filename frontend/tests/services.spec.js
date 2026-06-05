import { test, expect } from '@playwright/test';

test.describe('Services Page Access tests', () => {
  test('should protect the services page and redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
