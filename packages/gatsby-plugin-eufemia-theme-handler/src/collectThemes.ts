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
  const { filesGlobs, includeFiles } = pluginOptions

  if (pluginOptions.includeLocalStyles) {
    filesGlobs.push('./**/styles/themes/**/*')
    includeFiles.push('**/styles/themes/**/*')
  }

  const packageRoot = path.dirname(
    require.resolve('@dnb/eufemia', { paths: [programDirectory] })
  )
  const globbyPaths = filesGlobs.map((glob) => {
    if (glob.startsWith('./')) {
      return slash(path.join(programDirectory, glob))
    }
    return slash(path.join(packageRoot, glob))
  })

  if (pluginOptions.verbose) {
    reporter.info(
      `gatsby-plugin-eufemia-theme-handler > globbyPaths:\n${globbyPaths.join(
        '\n'
      )}`
    )
  }

  const importFiles = globby.sync(globbyPaths).filter((file) => {
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
      .filter(({ file }) => {
        return !/\/(cjs|es|esm)\//.test(file)
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

  if (pluginOptions.verbose) {
    reporter.info(
      `sortedImportFiles:\n${sortedImportFiles
        .map(({ file }) => file)
        .join('\n')}`
    )
  }

  /**
   * Report about what Eufemia versions are found and used
   */
  if (pluginOptions.verbose) {
    const roots = {}
    const versions = {}

    sortedImportFiles.forEach(({ file }) => {
      const rootPath = findNearestPackageJson(file)
      roots[rootPath] = [...(roots[rootPath] || []), file]
    })

    Object.entries(roots).forEach(([file, info]) => {
      const content = fs.readFileSync(file, 'utf-8')
      const json = JSON.parse(content)
      const { name, version, dependencies, devDependencies } = json

      const collection = [
        name !== '@dnb/eufemia' ? 'local' : version,
        dependencies?.['@dnb/eufemia'],
        devDependencies?.['@dnb/eufemia'],
      ].filter(Boolean)

      collection.forEach((version) => {
        versions[version] = [...(versions[version] || []), info]
      })
    })

    const listOfVersions = Object.keys(versions).filter(
      (version) => version !== 'local'
    )

    if (listOfVersions.length > 1) {
      reporter.warn(
        `gatsby-plugin-eufemia-theme-handler > @dnb/eufemia versions:\n${JSON.stringify(
          versions,
          null,
          2
        )}`
      )
    } else {
      reporter.info(
        `gatsby-plugin-eufemia-theme-handler > @dnb/eufemia version: ${listOfVersions.join(
          ', '
        )}`
      )
    }
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

function findNearestPackageJson(filePath) {
  let currentDir = path.dirname(filePath)

  while (currentDir !== '/') {
    const packageJsonPath = path.join(currentDir, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath
    }

    // Move up one level in the directory tree
    currentDir = path.dirname(currentDir)
  }

  return null // No package.json found
}
