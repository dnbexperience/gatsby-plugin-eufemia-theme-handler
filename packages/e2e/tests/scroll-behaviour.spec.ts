import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/', {
    timeout: 5000,
    waitUntil: 'commit',
  })

  await page.locator('html[data-remote-mounted]').waitFor({
    state: 'attached',
    timeout: 5000,
  })
})

test.describe('html', () => {
  test('should have style with scrollBehavior of auto', async ({
    page,
  }) => {
    const anchorElement = page.locator('a')
    await anchorElement.click()

    await page.waitForURL('/page-b/#bottom')

    await page.locator('#bottom').waitFor()

    const htmlElement = await page.locator('html')
    const style = await htmlElement.getAttribute('style')

    expect(style).toBe('scroll-behavior: auto;')
  })
})
