/**
 * Gatsby Node setup
 *
 */

import path from 'path'
import micromatch from 'micromatch'
import { slash } from 'gatsby-core-utils'
import { createThemesImport } from './collectThemes'
import {
  filesGlobsFallback,
  includeFilesFallback,
  themeMatchersFallback,
} from './config'

global.themeNames = []
global.reportMatches = []

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    themes: Joi.object().required(),
    defaultTheme: Joi.string().required(),
    storageId: Joi.string().optional().default('eufemia-theme'),
    filesGlobs: Joi.array().optional().default(filesGlobsFallback),
    includeFiles: Joi.array().optional().default(includeFilesFallback),
    themeMatchers: Joi.array().optional().default(themeMatchersFallback),
    inlineDefaultTheme: Joi.boolean().optional().default(true),
    wrapWithThemeProvider: Joi.boolean().optional().default(true),
    omitScrollBehavior: Joi.boolean().optional().default(false),
    verbose: Joi.boolean().optional().default(false),
  })
}

exports.onPreBootstrap = ({ reporter, store }, pluginOptions) => {
  const state = store.getState()
  const programDirectory = state.program.directory

  // ensure to run this after the main app has run onPreInit
  createThemesImport({ reporter, programDirectory, pluginOptions })
}

exports.onPostBuild = ({ reporter }) => {
  if (global.themeNames.length > 0) {
    reporter.success(
      `Eufemia themes successfully extracted: ${global.themeNames.join(
        ', '
      )}`
    )
  } else {
    reporter.warn('No Eufemia themes found!')
  }
}

exports.onCreateWebpackConfig = (
  { stage, reporter, actions, plugins, getConfig },
  pluginOptions
) => {
  const config = getConfig()

  config.plugins.push(
    plugins.define({
      'globalThis.EUFEMIA_THEME_defaultTheme': JSON.stringify(
        pluginOptions.defaultTheme
      ),
      'globalThis.EUFEMIA_THEME_themes': JSON.stringify(
        pluginOptions.themes
      ),
      'globalThis.EUFEMIA_THEME_storageId': JSON.stringify(
        pluginOptions.storageId
      ),
    })
  )

  if (stage === 'develop' || stage === 'build-javascript') {
    const includeFilesMatcher = (file) => {
      return pluginOptions.includeFiles.some((glob) =>
        micromatch.isMatch(file, path.dirname(glob))
      )
    }

    const themeMatcher = (file) => {
      let match = null
      pluginOptions.themeMatchers.some(
        (regexp) => (match = file.match(regexp)?.[1])
      )
      if (match) {
        return match
      }
      return match
    }

    const themes = Object.keys(pluginOptions.themes)

    config.optimization.splitChunks.cacheGroups.styles = {
      ...config.optimization.splitChunks.cacheGroups.styles,
      name(module) {
        const file = slash(module._identifier.replace(/.*\]!(.*)/, '$1'))

        if (includeFilesMatcher(file)) {
          const themeName = themeMatcher(file)
          const match = themes.includes(themeName)

          if (pluginOptions.verbose) {
            reporter.info(
              `gatsby-plugin-eufemia-theme-handler > themeMatchers: ${JSON.stringify(
                { themeName, match, file }
              )}`
            )
          }

          if (match) {
            if (themeName && !global.themeNames.includes(themeName)) {
              global.themeNames.push(themeName)
            }

            return themeName
          }
        }

        return 'commons'
      },
    }
  }

  actions.replaceWebpackConfig(config)
}
