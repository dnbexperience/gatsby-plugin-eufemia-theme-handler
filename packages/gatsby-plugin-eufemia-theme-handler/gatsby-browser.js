import './load-eufemia-styles'
export { wrapRootElement } from './themeHandler.js'

export const onPreRouteUpdate = ({ prevLocation }, pluginOptions) => {
  if (
    prevLocation &&
    !pluginOptions?.omitScrollBehavior &&
    !globalThis.IS_TEST
  ) {
    // Omit scrolling on page changes
    document.documentElement.style.scrollBehavior = 'auto'
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = ''
    }, 800)
  }
}
