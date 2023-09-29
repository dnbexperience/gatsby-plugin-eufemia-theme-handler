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

test.describe('change theme', () => {
  test('should load css file', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    const sbanken = page.locator('link[href^="/sbanken."]')
    await sbanken.waitFor({
      state: 'attached',
    })

    const ui = page.locator('style[data-href^="/ui."]')
    await ui.waitFor({
      state: 'detached',
    })

    expect(await page.locator('link[href^="/sbanken."]').count()).toEqual(
      1
    )

    expect(await page.locator('style[data-href^="/ui."]').count()).toEqual(
      0
    )
  })

  test('should set local storage', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    const localStorageData = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('eufemia-ui') || '{}')
    })

    expect(localStorageData.name).toBe('sbanken')
  })

  test('should switch back and forth', async ({ page }) => {
    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:nth-child(2)')

    await page.click('#change-theme')
    await page.click('#change-theme-portal ul li:first-child')

    const stylesheet = page.locator('link[href^="/ui."][rel="stylesheet"]')
    await stylesheet.waitFor({
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
