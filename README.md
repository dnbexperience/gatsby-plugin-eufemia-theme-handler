# Gatsby Plugin to load Eufemia Themes

This plugin is a easy to use drop-in solution to load different DNB Eufemia Themes. It also support changing a theme in production runtime.

It looks for `@dnb/eufemia` – nearest located from where this plugin is used (node_modules).

## Features

- The current theme used is stored in the Browsers localStorage under the key `eufemia-theme`
- You can define a theme in the URL: `https://eufemia.dnb.no/?eufemia-theme=sbanken`
- Automatically splits theme styles into separate Webpack chunks, not matter if you have imported them already in your app or not
- Supports both build an dev mode with fast refresh and hot module replacement
- Loads only one theme package at a time. When the user switches to another theme, a new CSS theme file will be downloaded.
- Wraps your app with the Eufemia `<Theme>` provider.
- Loads the core styles by default.

## How to use

1. Remove theme imports, but keep the core:

```diff
- import '@dnb/eufemia/style/core'
- import '@dnb/eufemia/style/themes/ui'
```

2. This plugin also wraps your application with the [`<Theme>`](https://eufemia.dnb.no/uilib/usage/customisation/theming/theme/) provider. If you want to wrap your apps by yourself, you can disable this by using this option: `wrapWithThemeProvider: false`. You could make your own wrapper like so:

```jsx
import { Theme } from '@dnb/eufemia/shared'
import { useThemeHandler } from 'gatsby-plugin-eufemia-theme-handler'

function ThemeProvider({ children }) {
  const theme = useThemeHandler()

  return <Theme {...theme}>{children}</Theme>
}
```

3. Install `yarn add gatsby-plugin-eufemia-theme-handler` and add it to your `gatsby-config.js` file:

```js
// gatsby-config.js
{
  plugins: [
    {
      resolve: 'gatsby-plugin-eufemia-theme-handler',
      options: {
        // (required) define your default theme
        defaultTheme: 'ui',

        // (required) define your themes
        themes: {
          ui: { name: 'DNB Eufemia' },
          sbanken: { name: 'DNB Sbanken', hide: true },
        },

        // (optional) defaults to "eufemia-theme" (localStorage)
        storageId: 'your-custom-id',

        // (optional) Definfes with a glob where the styles are placed inside of @dnb/eufemia/...
        filesGlobs: [
          '**/style/themes/**/*-theme-{basis,components,extensions}.min.css',
        ],

        // (optional) The file order does matter. Define a glob inside an array.
        filesOrder: [
          '**/*-theme-extensions.*',
          '**/*-theme-components.*',
          '**/*-theme-basis.*',
        ],

        // (optional) when set to false, all theme styles will be loaded as separate files.
        inlineDefaultTheme: true,

        // (optional) when set to false, your will not be wrapped with the needed `<Theme>` provider.
        wrapWithThemeProvider: true,

        // (optional) when set to false, your will have to import the core styles (dnb-ui-core) by yourself.
        coreStyleName: 'dnb-ui-core',
      },
    },
  ]
}
```

You can also use the interceptor methods from inside your components:

```js
// Your React Component
import {
  getThemes,
  getTheme,
  setTheme,
  useThemeHandler,
} from 'gatsby-plugin-eufemia-theme-handler'

// Example usage
setTheme({ name })
const { name } = getTheme()
const themes = getThemes() // Same as in the plugin config

function Component() {
  const { name } = useThemeHandler()
}
```

## How it works

Gatsby bundles all styles into one single Webpack chunk (commons.css) and inlines it into every HTML page as inline styles with the attribute `data-identity="gatsby-global-css"`.

What this plugin does is:

- Collect all `eufemia-theme` files (`{scss,css}`) – also check if they are located in `/src` or needs to be collected from `/build`. Both are used by the Eufemia repo/portal.
- After we have collected all available theme files, we create or update a static import `load-eufemia-themes.js`, which is git-ignored.
- Split theme styles into separate CSS files (Webpack chunks) inside `gatsby-node.js`
- Inserts some JavaScript in the HTML head in order to handle what theme file should be shown (`inlineScriptProd` and `inlineScriptDev`)
- Load these inline scripts via Webpack inline module loaders: `!raw-loader!terser-loader!`
- By using localStorage, we block the HTML rendering, this way we do avoid flickering of a default theme

### In prod

- Leave the default theme style as a separate inline style, but move it after `commons.css` – this is how the styles should be imported in the first place (theme files after all other css packages) – if not, visual tests will fail, as we get wrong CSS specificity
- Remove all other themes styles to be inlined, but keep track on the CSS files, defined in `data-href`
- Only set the link href if the current theme is not the default one

### In dev

During dev, we do not get any inline styles from Gatsby – they are handled by Webpack only via the hot module replacement.

- Now, that we have split out the themes styles in separate CSS files `/${key}.css`, we simply need to load them as plain css files via a link with href inside the head element.
- During runtime, we need to ensure that our link with the id `eufemia-style-theme` is placed after `commons.css`. We do that with `headElement.appendChild(styleElement)`
- Use `uniqueId` to reload css files as there is not unique build hash, unlike we get during production
- Use `MutationObserver` to reload the current theme file, because Webpack uses hot module replacement, so we need to reload as well

## Releases

Releases are made with [semantic-release](https://github.com/semantic-release/semantic-release).

Decorate your pull requests with either `fix: your release message` or `feat: your release message`.

When a pull request is merged into the `main` branch, a new release will be published.
