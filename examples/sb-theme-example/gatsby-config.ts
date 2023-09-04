export default {
  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-eufemia-theme-handler',
      options: {
        defaultTheme: 'sbanken',
        storageId: 'eufemia-sbanken',
        themes: {
          ui: { name: 'DNB Eufemia' },
          sbanken: { name: 'Sbanken' },
        },
      },
    },
  ],
}
