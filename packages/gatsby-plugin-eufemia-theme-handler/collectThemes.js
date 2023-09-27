const path = require('path')
const fs = require('fs')
const globby = require('globby')
const micromatch = require('micromatch')
const { slash } = require('gatsby-core-utils')

/**
 * We want to run this in sync,
 * because we need to create a import file,
 * before Gatsby does import our app source.
 *
 * @param {object} param0 Options
 * @property {object} reporter Gatsby Reporter
 * @property {object} pluginOptions Gatsby pluginOptions
 */
function createThemesImport({
  reporter,
  programDirectory,
  pluginOptions,
}) {
  const filesOrder = pluginOptions.filesOrder

  const limitThemes = Object.keys(pluginOptions.themes || [])
  const packageRoot = path.dirname(
    require.resolve('@dnb/eufemia', { paths: [programDirectory] })
  )
  const globbyPaths = pluginOptions.filesGlobs.map((glob) => {
    return slash(path.join(packageRoot, glob))
  })

  if (pluginOptions.coreStyleName) {
    globbyPaths.push(`**/style/${pluginOptions.coreStyleName}.min.css`)
  }

  const themesFiles = globby
    .sync(globbyPaths)
    .map((file) => {
      return slash(file)
    })
    .filter((file) => {
      if (/\/(es|cjs)\/style\//.test(file)) {
        return false
      }

      return true
    })

  const sortedThemesFiles = themesFiles
    .map((file) => {
      const themeName = (file.match(new RegExp('/theme-([^/]*)/')) ||
        [])?.[1]

      return { file, themeName }
    })
    .filter(({ themeName }) => {
      return limitThemes.length === 0 || limitThemes.includes(themeName)
    })
    .sort((a, b) => {
      return (
        filesOrder.findIndex((glob) => micromatch.isMatch(a.file, glob)) -
        filesOrder.findIndex((glob) => micromatch.isMatch(b.file, glob))
      )
    })

  if (pluginOptions.coreStyleName) {
    const coreFile = themesFiles.find((file) =>
      file.includes(pluginOptions.coreStyleName)
    )
    if (coreFile) {
      sortedThemesFiles.unshift({ file: coreFile })
    }
  }

  const writeThemesImports = () => {
    const imports = sortedThemesFiles.map(({ file }) => {
      return `import '${file}'`
    })

    fs.writeFileSync(
      path.resolve(__dirname, 'load-eufemia-themes.js'),
      imports.join('\n')
    )
  }

  writeThemesImports()

  const showReports = () => {
    const themeNames = sortedThemesFiles.reduce((acc, { themeName }) => {
      if (!acc.includes(themeName)) {
        acc.push(themeName)
      }
      return acc
    }, [])

    if (themeNames.length > 0) {
      reporter.success(`✨ Eufemia themes: ${themeNames.join(', ')}`)
    } else {
      reporter.warn('Could not find any Eufemia themes!')
    }
  }

  showReports()
}

exports.createThemesImport = createThemesImport
