export default {
  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-eufemia-theme-handler',
      options: {
        verbose: true,
        defaultTheme: 'ui',
        storageId: 'eufemia-ui',
        includeLocalStyles: true,
        themes: {
          ui: { name: 'DNB Eufemia' },
          sbanken: { name: 'Sbanken' },
        },
      },
    },
  ],
}
