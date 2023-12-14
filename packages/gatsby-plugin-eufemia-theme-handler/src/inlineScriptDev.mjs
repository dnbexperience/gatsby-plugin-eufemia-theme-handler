if (typeof window !== 'undefined') {
  if (!window.__hasEufemiaObserver) {
    window.__hasEufemiaObserver = true
    onElementInsertion('[href="/commons.css"]', () => {
      const themeName = globalThis.__getEufemiaThemeName()
      globalThis.__updateEufemiaThemeFile(themeName, true)
    })
  }
}

function onElementInsertion(targetSelector, callback) {
  const headElement = document.head

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const addedNodes = Array.from(mutation.addedNodes)

      const targetElementAdded = addedNodes.find((node) => {
        return (
          node.nodeType === Node.ELEMENT_NODE &&
          node.matches(targetSelector)
        )
      })

      if (targetElementAdded) {
        callback(targetElementAdded, observer)
      }
    })
  })

  observer.observe(headElement, {
    childList: true,
  })
}
