import { test, expect } from '@playwright/test';

const user = {
  id: 1,
  name: 'Test User',
  email: 'user@example.com',
  role: 'user',
};

test.describe('Services booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((authUser) => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(authUser));
    }, user);

    await page.route('**/api/services**', async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get('search') || '';
      const allServices = [
        {
          id: 1,
          name: 'Home Cleaning',
          description: 'Complete deep cleaning for your home.',
          price: 49.99,
          duration: '2 hours',
        },
        {
          id: 2,
          name: 'Plumbing Repair',
          description: 'Reliable plumbing fixes and maintenance.',
          price: 79.5,
          duration: '1 hour',
        },
      ];
      const services = allServices.filter((service) =>
        service.name.toLowerCase().includes(search.toLowerCase())
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          services,
          pagination: {
            total: services.length,
            page: 1,
            limit: 6,
            totalPages: 1,
          },
        }),
      });
    });
  });

  test('should list services for an authenticated user', async ({ page }) => {
    await page.goto('/services');

    await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Home Cleaning' })).toBeVisible();
    await expect(page.getByText('$49.99')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Book Now' }).first()).toBeVisible();
  });

  test('should filter services by search text', async ({ page }) => {
    await page.goto('/services');

    await page.getByPlaceholder('Search services...').fill('plumbing');

    await expect(page.getByRole('heading', { name: 'Plumbing Repair' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Home Cleaning' })).toBeHidden();
  });
});
