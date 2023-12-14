if (typeof window !== 'undefined') {
  globalThis.__updateEufemiaThemeFile = (
    themeName,
    reload = false,
    callback = null
  ) => {
    try {
      const headElement = document.head
      const styleElement = document.getElementById('eufemia-style-theme')
      const themes = globalThis.availableThemes
      const theme = themes[themeName]

      if (!theme) {
        console.error('No theme found:', themeName)
        return // stop here
      }

      const href = theme.file + (reload ? '?' + Date.now() : '')

      /**
       * To avoid flicker during change
       */
      document
        .getElementById('current-theme')
        ?.setAttribute('id', 'previous-theme')
      const clonedElem = styleElement.cloneNode(false)
      clonedElem.setAttribute('href', href)
      clonedElem.setAttribute('id', 'current-theme')

      const isDefaultTheme = themeName === globalThis.defaultTheme

      if (
        globalThis.isDev ||
        reload ||
        !globalThis.inlineDefaultTheme ||
        (globalThis.inlineDefaultTheme && !isDefaultTheme)
      ) {
        if (!reload) {
          // Preload
          const elem = styleElement.cloneNode(false)
          elem.removeAttribute('id')
          elem.setAttribute('href', href)
          elem.setAttribute('rel', 'preload')
          styleElement.after(elem)
        }

        // Remove existing styles, if needed
        clonedElem.addEventListener(
          'load',
          () => {
            try {
              // Remove existing inline styles
              const inlineStyleElement = document.querySelector(
                '[data-href^="' + theme.file + '"]'
              )
              if (inlineStyleElement) {
                headElement.removeChild(inlineStyleElement)
              }

              const defaultStyleElement = document.querySelector(
                '[data-href^="' +
                  themes[globalThis.defaultTheme].file +
                  '"]'
              )
              if (defaultStyleElement) {
                headElement.removeChild(defaultStyleElement)
              }

              const previousElem =
                document.getElementById('previous-theme')
              if (previousElem) {
                headElement.removeChild(previousElem)
              }

              reorderStyles()
            } catch (e) {
              console.error(e)
            }

            callback?.(theme)
          },
          { once: true }
        )

        // Set the new style
        styleElement.after(clonedElem)
      }
    } catch (e) {
      console.error(e)
    }
  }

  globalThis.__getEufemiaThemeName = () => {
    try {
      const storageId = globalThis.storageId || 'eufemia-theme'
      const urlParams = new URLSearchParams(window.location.search)
      const themeName = urlParams.get(storageId)

      if (themeName) {
        return themeName
      }

      const data = window.localStorage.getItem(storageId)
      const theme = JSON.parse(data?.startsWith('{') ? data : '{}')

      return theme?.name || globalThis.defaultTheme
    } catch (e) {
      console.error(e)
    }
  }

  const themeName = globalThis.__getEufemiaThemeName()
  const isDefaultTheme = themeName === globalThis.defaultTheme
  if (!isDefaultTheme) {
    globalThis.__updateEufemiaThemeFile(themeName)
  }
}

function reorderStyles() {
  const commonsElement = getCommonsElement()
  if (commonsElement) {
    moveElementBelow(
      document.getElementById('current-theme'),
      commonsElement
    )
    moveElementBelow(
      document.getElementById('eufemia-style-theme'),
      commonsElement
    )
  }
}

function getCommonsElement() {
  const elements = Array.from(document.head.querySelectorAll('link[href]'))
  return elements.find(({ href }) => {
    return href.includes('commons')
  })
}

function moveElementBelow(elementToMove, targetElement) {
  const parentElement = targetElement.parentNode
  parentElement.insertBefore(elementToMove, targetElement.nextSibling)
}
