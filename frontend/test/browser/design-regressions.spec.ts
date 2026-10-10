import { expect, test } from '@playwright/test'
import { allPackagesFlat, ceramicServices, isCeramicEligible } from '../../src/components/booking/booking-data'

test('home advertises a ceramic total that can be booked', async ({ page }) => {
  const packagePrice = Math.min(...allPackagesFlat.filter(isCeramicEligible).map((pkg) => pkg.basePrice))
  const coatingPrice = ceramicServices.find((service) => service.id === 'graphene-coating')!.price
  await page.goto('/')

  const coating = page.getByRole('link').filter({ hasText: 'Ceramic coating' })
  await expect(coating).toContainText(`$${packagePrice + coatingPrice}`)
  await expect(coating).toContainText('eligible detail package')
  await expect(page.getByRole('link').filter({ hasText: 'Interior only' })).not.toContainText('shampoo')
  await expect(page.getByRole('link').filter({ hasText: 'Exterior only' })).not.toContainText('decontamination')
  await expect(page.getByText('Any booking deposit goes toward your total.', { exact: false })).toBeVisible()
})

test('booking step scroll accounts for the nav safe area', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/booking')
  await page.addStyleTag({ content: ':root { --nav-safe-offset: 44px; }' })
  await expect(page.getByRole('heading', { level: 2, name: 'Design your detail' })).toHaveCount(1)
  await page.getByRole('button', { name: 'Continue to package' }).click()
  await expect(page.getByRole('heading', { name: 'Choose a package' })).toBeVisible()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'What are we detailing?' })).toBeVisible()

  const gap = await page.evaluate(() => {
    const wizard = document.querySelector('#design-your-detail nav[aria-label="Booking progress"]')!
    const nav = document.querySelector('nav[aria-label="Primary"]')!
    return wizard.getBoundingClientRect().top - nav.getBoundingClientRect().bottom
  })
  expect(gap).toBeGreaterThanOrEqual(15)
})

test('booking recalculates a pricing deep link when vehicle size changes', async ({ page }) => {
  await page.goto('/pricing')
  await page.getByRole('tab', { name: 'Exterior Only' }).click()
  await page.getByRole('link', { name: 'Book Prestige Exterior', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'What are we detailing?' })).toBeVisible()
  const summary = page.getByRole('complementary', { name: 'Booking summary' })
  const mobileSummary = page.getByRole('region', { name: 'Booking summary' })
  const visibleSummary = await summary.isVisible() ? summary : mobileSummary
  await expect(visibleSummary).toContainText('$150')
  await page.getByRole('radio', { name: 'Truck / Van' }).locator('..').click()
  await expect(visibleSummary).toContainText('$205')
  await page.getByRole('button', { name: 'Continue to package' }).click()
  await expect(page.locator('input[name="selectedPackage"]:checked').locator('..')).toContainText('Prestige Exterior')
  await page.getByRole('button', { name: 'Continue to add-ons' }).click()
  await page.getByRole('button', { name: 'Continue to paint protection' }).click()
  await page.getByRole('checkbox', { name: '5-7 Year Graphene Ceramic Coating' }).locator('..').click()
  await expect(visibleSummary).toContainText('$1055')
})
