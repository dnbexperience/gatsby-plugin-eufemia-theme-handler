import path from 'path'
import fs from 'fs'
import globby from 'globby'
import micromatch from 'micromatch'
import { slash } from 'gatsby-core-utils'

/**
 * We want to run this in sync,
 * because we need to create a import file,
 * before Gatsby does import our app source.
 *
 * @param {object} param0 Options
 * @property {object} reporter Gatsby Reporter
 * @property {object} pluginOptions Gatsby pluginOptions
 */
export function createThemesImport({
  reporter,
  programDirectory,
  pluginOptions,
}) {
  const includeFiles = pluginOptions.includeFiles

  const limitThemes = Object.keys(pluginOptions.themes || [])
  const packageRoot = path.dirname(
    require.resolve('@dnb/eufemia', { paths: [programDirectory] })
  )
  const globbyPaths = pluginOptions.filesGlobs.map((glob) => {
    return slash(path.join(packageRoot, glob))
  })

  if (pluginOptions.verbose) {
    reporter.info(
      `gatsby-plugin-eufemia-theme-handler > globbyPaths:\n${globbyPaths.join(
        '\n'
      )}`
    )
  }

  const importFiles = globby
    .sync(globbyPaths)
    .map((file) => {
      return slash(file)
    })
    .filter((file) => {
      if (/\/(es|cjs)\/style\//.test(file)) {
        return false
      }

      if (includeFiles.length > 0) {
        return includeFiles.some((glob) =>
          micromatch.isMatch(file, '**/' + glob)
        )
      }

      return true
    })

  if (pluginOptions.verbose) {
    reporter.info(
      `gatsby-plugin-eufemia-theme-handler > importFiles:\n${importFiles.join(
        '\n'
      )}`
    )
  }

  type File = string
  const sortedImportFiles: Array<{ file: File; themeName?: string }> =
    importFiles
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
          includeFiles.findIndex((glob) =>
            micromatch.isMatch(a.file, glob)
          ) -
          includeFiles.findIndex((glob) =>
            micromatch.isMatch(b.file, glob)
          )
        )
      })

  if (pluginOptions.coreStyleName) {
    const coreFile = importFiles.find((file) =>
      file.includes(pluginOptions.coreStyleName)
    )
    if (coreFile) {
      sortedImportFiles.unshift({ file: coreFile })
    }
  }

  if (pluginOptions.verbose) {
    reporter.info(
      `sortedImportFiles:\n${sortedImportFiles
        .map(({ file }) => file)
        .join('\n')}`
    )
  }

  const writeThemesImports = () => {
    const imports = sortedImportFiles.map(({ file }) => {
      return `import '${file}'`
    })

    fs.writeFileSync(
      path.resolve(__dirname, 'load-eufemia-styles.js'),
      imports.join('\n')
    )
  }

  writeThemesImports()

  const showReports = () => {
    const themeNames = sortedImportFiles.reduce((acc, { themeName }) => {
      if (themeName && !acc.includes(themeName)) {
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
