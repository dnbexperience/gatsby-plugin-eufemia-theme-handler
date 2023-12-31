import { test, expect } from '@playwright/test'
import { clearStorage } from './utils'

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

test.afterEach(async ({ page }) => {
  await clearStorage(page)
})

test.describe('default theme', () => {
  test('should have no preload link', async ({ page }) => {
    const elem = page.locator('#gatsby-chunk-mapping')

    if ((await elem.count()) > 0) {
      expect(
        await page.locator('link[href^="/ui."][rel="preload"]').count()
      ).toEqual(0)
    } else {
      expect(elem).toHaveCount(0)
    }
  })

  test('should have one default theme loaded', async ({ page }) => {
    const elem = page.locator('#gatsby-chunk-mapping')

    if ((await elem.count()) > 0) {
      expect(
        await page.locator('style[data-href^="/ui."]').count()
      ).toEqual(1)
    } else {
      expect(elem).toHaveCount(0)
    }
  })
})
