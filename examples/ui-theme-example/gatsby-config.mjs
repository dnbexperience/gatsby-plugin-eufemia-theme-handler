import {
  filesGlobsFallback,
  includeFilesFallback,
} from 'gatsby-plugin-eufemia-theme-handler/config.js'

export default {
  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-eufemia-theme-handler',
      options: {
        verbose: true,
        defaultTheme: 'ui',
        storageId: 'eufemia-ui',
        filesGlobs: [
          // Eufemia Styles
          ...filesGlobsFallback,

          // Local styles
          './**/styles/themes/**/*',
        ],
        includeFiles: [
          // Eufemia Styles
          ...includeFilesFallback,

          // Local styles
          '**/styles/themes/**/*',
        ],
        themes: {
          ui: { name: 'DNB Eufemia' },
          sbanken: { name: 'Sbanken' },
        },
      },
    },
  ],
}
