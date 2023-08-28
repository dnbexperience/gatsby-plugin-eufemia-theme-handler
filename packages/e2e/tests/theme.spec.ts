import { test, expect, Page, Locator } from '@playwright/test'

async function clearStorage(page: Page) {
  await page.evaluate(() => window.localStorage.clear())
  await page.evaluate(() => window.sessionStorage.clear())
}

test.afterEach(async ({ page }) => {
  await clearStorage(page)
})

test.describe('default theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Check if app is mounted
    await page.waitForSelector('html[data-remote-mounted]', {
      state: 'attached',
    })
  })

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
      expect(await page.locator('style[data-href^="/ui."]').count()).toEqual(1)
    } else {
      expect(elem).toHaveCount(0)
    }
  })
})

test.describe('change theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Check if app is mounted
    await page.waitForSelector('html[data-remote-mounted]', {
      state: 'attached',
    })
  })

  test('should load css file', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    await page.waitForSelector('link[href^="/sbanken."]', {
      state: 'attached',
    })

    await page.waitForSelector('style[data-href^="/ui."]', {
      state: 'detached',
    })

    expect(await page.locator('link[href^="/sbanken."]').count()).toEqual(1)

    expect(await page.locator('style[data-href^="/ui."]').count()).toEqual(0)
  })

  test('should set local storage', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    const localStorageData = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('eufemia-theme') || '{}')
    })

    expect(localStorageData.name).toBe('sbanken')
  })

  test('should switch back and forth', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:first-child')

    await page.waitForSelector('link[href^="/ui."][rel="stylesheet"]', {
      state: 'attached',
    })
    const uiCssFileCount = await page.$$eval(
      'link[href^="/ui."][rel="stylesheet"]',
      (elements) => elements.length
    )
    expect(uiCssFileCount).toBe(1)

    const uiStyleElementExists = await page.$('style[data-href^="/ui."]')
    expect(uiStyleElementExists).toBeNull()
  })

  test('should load css file after template', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    const sbankenCssAfterTemplateExists = await page.$(
      '#eufemia-style-theme + link[href^="/sbanken."][rel="stylesheet"]'
    )
    expect(sbankenCssAfterTemplateExists).toBeTruthy()

    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:first-child')

    const uiCssAfterTemplateExists = await page.$(
      '#eufemia-style-theme + link[href^="/ui."][rel="stylesheet"]'
    )
    expect(uiCssAfterTemplateExists).toBeTruthy()
  })
})
