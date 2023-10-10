const presets = [
  '@babel/preset-react',
  [
    '@babel/preset-typescript',
    {
      isTSX: true,
      allExtensions: true,
    },
  ],
  [
    '@babel/preset-env',
    {
      modules: process.env.GATSBY_FILES ? false : 'auto',
      targets: { node: 'current' },
    },
  ],
]

const gatsbyFiles = ['**/gatsby-browser.ts', '**/gatsby-ssr.ts']

module.exports = {
  ignore: process.env.GATSBY_FILES ? ['**/*.d.ts'] : gatsbyFiles,
  only: process.env.GATSBY_FILES ? gatsbyFiles : undefined,
  presets,
}
