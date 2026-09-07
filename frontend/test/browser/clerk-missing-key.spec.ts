import { expect, test } from '@playwright/test'

test.describe('Clerk missing-key fallback', () => {
  test.skip(Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY), 'requires missing Clerk key')

  test('keeps public pages available without Clerk keys', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBe(200)
  })

  test('fails closed for admin routes without Clerk keys', async ({ page }) => {
    for (const path of ['/admin', '/admin/settings']) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })

      expect(response?.status()).toBe(503)
    }
  })

  test('fails closed for admin API reads and mutations without Clerk keys', async ({ request }) => {
    for (const response of [
      await request.get('http://127.0.0.1:3100/api/admin/gallery'),
      await request.post('http://127.0.0.1:3100/api/admin/gallery', { data: {} }),
    ]) {
      expect(response.status()).toBe(503)
    }

  })
})
