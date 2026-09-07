import { expect, test } from '@playwright/test'

test.describe('review items 8-12', () => {
  test('booking renders its metadata and keeps Cal out of the initial route', async ({ page }) => {
    await page.goto('/booking', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveTitle('Book a detail | QuikSpit Auto Detailing')
    await expect(page.getByRole('heading', { name: 'Book your detail' })).toBeVisible()
    await expect(page.locator('iframe[src*="cal.com"]')).toHaveCount(0)
  })

  test('gallery comparison keeps slider keys and restores the opener after closing', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' })

    const opener = page.getByRole('button', { name: 'Enlarge Exterior Detail' })
    await expect(opener).toBeVisible()
    await opener.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const slider = dialog.getByRole('slider')
    await slider.focus()
    await expect(slider).toHaveValue('50')
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('51')

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
  })

  test('hero keeps a poster and defers video for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByAltText('Hero background')).toBeVisible()
    await expect(page.locator('video')).toHaveCount(0)
  })

  test('social providers share one script each and expose links if providers fail', async ({ page }) => {
    await page.route('https://www.instagram.com/embed.js', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.instgrm={Embeds:{process(){}}}' }),
    )
    await page.route('https://www.tiktok.com/embed.js', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
    )

    await page.goto('/gallery', { waitUntil: 'domcontentloaded' })
    await page.getByText('Follow the work').scrollIntoViewIfNeeded()

    await expect(page.locator('script[data-quikspit-instagram-embed]')).toHaveCount(1)
    await expect(page.locator('script[data-quikspit-tiktok-embed]')).toHaveCount(1)
  })
})
